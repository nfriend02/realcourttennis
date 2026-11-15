import {
  type AiLevelDef,
  type CharacterDef,
  HIT_QUALITY,
  type HitQualityConfig,
  PHYSICS,
  type PhysicsConfig,
  RULES,
  type RulesConfig,
} from '../../data/gameData';
import { type NpcContactPlan, type NpcContext, npcReturnChance, planNpcContact, planNpcError, planNpcReturn, planNpcServe } from '../ai/npcBrain';
import { type IRandom, SeededRandom } from '../core/random';
import {
  applySlow,
  type BallState,
  createBall,
  createPrediction,
  type FlightEvent,
  findPlaneCrossing,
  type Prediction,
  predict,
  stepBall,
} from '../physics/ballFlight';
import { clampToBounds, type CourtSide, inCourt, inServiceBox, type MoveBounds, movementBounds, sideOfZ } from '../physics/court';
import { type JudgeContext, judgeHit, judgeServe, reachStageFor } from '../physics/hitJudge';
import { planPlayerServe, planPlayerShot } from '../physics/shotPlanner';
import { type ContactSample, type Hand, type HitJudgment, type ShotResult, type StrokeHeight, type StrokeId, makeStroke, sideDir, sideForScreen, strokeHeight, strokeSide } from '../physics/types';
import { type Actor, type ActorState, createActor, moveActor, setState } from './actor';
import type { BounceCueId } from '../../core/bounceCues';
import { applyDeadZone, type ContactPlan, heightBandOf, type Intent, planContact } from './positioning';
import { reboundPreview, type ReboundPreview } from './reboundPreview';
import { emptyStats, type MatchStats, recordQuality } from './score';

export type MatchPhase = 'serve_wait' | 'toss' | 'npc_serve_wait' | 'rally' | 'fault' | 'point_over' | 'match_over';
export type PointEndReason = 'winner' | 'ace' | 'npc_error' | 'player_fault' | 'player_miss' | 'npc_winner' | 'double_fault';

export type MatchEvent =
  | { type: 'serve_toss' }
  | { type: 'player_swing'; stroke: StrokeId; whiff: boolean; serve: boolean }
  | { type: 'player_hit'; judgment: HitJudgment; serve: boolean; speed: number }
  | { type: 'npc_swing'; stroke: StrokeId; whiff: boolean }
  | { type: 'npc_hit'; smash: boolean; serve: boolean; error: boolean; speed: number }
  | { type: 'bounce'; x: number; z: number; valid: boolean }
  | { type: 'net'; x: number }
  | { type: 'fault'; attempt: number; double: boolean; reason: ShotResult }
  | { type: 'point_end'; winner: CourtSide; reason: PointEndReason; playerScore: number; npcScore: number }
  | { type: 'match_end'; winner: CourtSide }
  | { type: 'next_point'; server: CourtSide };

export interface Tuning {
  npcReturnMul: number;
  timingWindowMul: number;
  ballSpeedMul: number;
}

/**
 * Player control level: beginner = auto-move to the ball (pad overrides) + auto facing,
 * middle = manual movement + auto facing, master = movement and facing only from the pad.
 */
export type PlayLevel = 'beginner' | 'middle' | 'master';
export const PLAY_LEVELS: readonly PlayLevel[] = ['beginner', 'middle', 'master'];

export interface MatchSetup {
  player: CharacterDef;
  npc: CharacterDef;
  hand: Hand;
  level: AiLevelDef;
  ballSpeedMul: number;
  seed: number;
  /** Defaults to 'beginner'. */
  playLevel?: PlayLevel;
  /** Bounce-height visual cues active this match (max 2). */
  bounceCues?: readonly BounceCueId[];
  /** Seconds from a hit until the ball reaches the receiver's contact plane, per hitter (Ball Speed setting). */
  flightSec?: { player: number; npc: number };
  tuning?: Partial<Tuning>;
  physics?: PhysicsConfig;
  rules?: RulesConfig;
  quality?: HitQualityConfig;
}

interface HeldStroke {
  stroke: StrokeId;
  pressT: number;
}

interface PendingHit {
  time: number;
  judgment: HitJudgment;
  chargeMul: number;
  serve: boolean;
}

const SERVE_Z = 12.2;
const HEIGHT_RANK: Record<StrokeHeight, number> = { low: 0, middle: 1, high: 2 };

export class MatchModel {
  readonly cfg: PhysicsConfig;
  readonly rules: RulesConfig;
  readonly quality: HitQualityConfig;
  readonly setup: MatchSetup;
  readonly hand: Hand;
  readonly playLevel: PlayLevel;
  readonly bounceCues: readonly BounceCueId[];
  readonly tuning: Tuning;
  readonly rng: IRandom;
  readonly player: Actor;
  readonly npc: Actor;
  readonly stats: MatchStats = emptyStats();
  readonly pred: Prediction = createPrediction();

  t = 0;
  phase: MatchPhase = 'serve_wait';
  phaseTime = 0;
  playerScore = 0;
  npcScore = 0;
  server: CourtSide = 'player';
  serveAttempt = 0;
  rally = 0;
  ball: BallState | null = null;
  /** Rules active for the current ball (false while tossing or after the point is decided). */
  live = false;
  lastHitter: CourtSide = 'player';
  shotIsServe = false;
  serveBoxSign: 1 | -1 = -1;
  lastJudgment: HitJudgment | null = null;
  lastPointReason: PointEndReason | null = null;
  lastPointWinner: CourtSide | null = null;
  winner: CourtSide | null = null;
  intent: Intent = { ix: 0, iy: 0 };
  playerPlan: ContactPlan | null = null;
  npcPlan: NpcContactPlan | null = null;
  held: HeldStroke | null = null;

  private events: MatchEvent[] = [];
  private flightEvents: FlightEvent[] = [];
  private judgeCtx: JudgeContext;
  private npcCtx: NpcContext;
  private playerBounds: MoveBounds;
  private npcBounds: MoveBounds;
  private predStart = 0;
  private tossStart = 0;
  private awaitingPlayer = false;
  private pending: PendingHit | null = null;
  private stickySide: 1 | -1 | 0 = 0;
  private recoveryUntil = 0;
  private playerWhiffed = false;
  private npcDecideAt = 0;
  private npcDone = false;
  private npcGaveUp = false;
  private npcRecoverAt = 0;
  private replanTick = 0;
  private phaseUntil = 0;
  private readonly flightSec: { player: number; npc: number };
  /** Match time at which a deferred (bounce-window) swing animation starts; -1 = none. */
  private swingAt = -1;
  /** Stroke chosen before the ball arrived (released early); held strokes count as armed too. */
  private armed: { stroke: StrokeId; chargeMul: number; sure: boolean } | null = null;
  private readonly nowContact: ContactSample = { t: 0, x: 0, y: 0, z: 0, bounced: false };
  private coilState: ActorState = 'idle';
  private coilTime = 0;

  constructor(setup: MatchSetup) {
    this.setup = setup;
    this.cfg = setup.physics ?? PHYSICS;
    this.rules = setup.rules ?? RULES;
    this.quality = setup.quality ?? HIT_QUALITY;
    this.hand = setup.hand;
    this.playLevel = setup.playLevel ?? 'beginner';
    this.bounceCues = setup.bounceCues ?? [];
    this.tuning = { npcReturnMul: 1, timingWindowMul: 1, ballSpeedMul: 1, ...setup.tuning };
    const bf = this.rules.ballFlight;
    const defSec = bf.levelSec[bf.defaultLevel - 1];
    this.flightSec = setup.flightSec ?? { player: defSec, npc: defSec };
    this.rng = new SeededRandom(setup.seed);
    for (let i = 0; i < 4; i++) this.flightEvents.push({ type: 'bounce', x: 0, y: 0, z: 0, dt: 0, bounces: 0 });
    this.playerBounds = movementBounds('player', this.cfg);
    this.npcBounds = movementBounds('npc', this.cfg);
    this.judgeCtx = {
      physics: this.cfg,
      quality: this.quality,
      hand: this.hand,
      reachMul: setup.player.reach / 85,
      windowMul: (1 + (setup.player.control - 85) * 0.005) * this.tuning.timingWindowMul,
    };
    this.npcCtx = {
      physics: this.cfg,
      rules: this.rules,
      quality: this.quality,
      level: setup.level,
      ballSpeedMul: setup.ballSpeedMul * this.tuning.ballSpeedMul,
      returnMul: this.tuning.npcReturnMul,
    };
    this.player = createActor(0.8, -SERVE_Z, this.cfg.baseMoveSpeed * (setup.player.speed / 85));
    this.npc = createActor(0, this.rules.match.npcHomeZ, setup.level.speed);
    this.server = this.rules.match.firstServer === 'npc' ? 'npc' : 'player';
    this.setupPoint();
  }

  // ---------------------------------------------------------------- input

  setIntent(ix: number, iy: number): void {
    this.intent.ix = Math.max(-1, Math.min(1, ix));
    this.intent.iy = Math.max(-1, Math.min(1, iy));
  }

  /** Stroke button pressed (or the thumb slid onto another button). `tm` is match time of the input. */
  pressStroke(stroke: StrokeId, tm: number = this.t): void {
    if (this.phase === 'serve_wait') {
      this.startToss(stroke, tm);
      return;
    }
    if (this.phase === 'toss') {
      if (this.held) this.held.stroke = stroke;
      return;
    }
    if (this.phase !== 'rally' && this.phase !== 'npc_serve_wait') return;
    if (this.pending) return;
    if (this.armed) this.armed.stroke = stroke;
    if (this.held && this.held.stroke === stroke) return;
    this.held = { stroke, pressT: Math.min(tm, this.t) };
    this.replanTick = 0;
    if (this.player.state !== 'swing' && this.player.state !== 'recovery') this.coilTo(stroke);
  }

  /** Ready (take-back) pose for the clicked stroke: its side, not the planned one, drives the pose. */
  private coilTo(stroke: StrokeId): void {
    const p = this.player;
    const dir = sideDir(strokeSide(stroke), this.hand);
    const restart = p.state !== 'backswing' || p.swingDir !== dir;
    p.stroke = stroke;
    p.swingDir = dir;
    if (restart) setState(p, 'backswing', this.t);
  }

  /** Released on a button: swing. */
  releaseStroke(stroke: StrokeId, tm: number = this.t): void {
    const held = this.held;
    this.held = null;
    if (this.phase === 'toss') {
      this.serveRelease(Math.min(tm, this.t));
      return;
    }
    if (!held) return;
    if (this.phase !== 'rally' && this.phase !== 'npc_serve_wait') return;
    if (this.t < this.recoveryUntil || this.pending) return;
    const tRel = Math.min(Math.max(tm, held.pressT), this.t);
    const chargeMul = this.chargeMulFor(tRel - held.pressT);
    if (this.live && this.awaitingPlayer && this.ball) {
      const contact = findPlaneCrossing(this.pred, this.player.z + this.cfg.contactAheadM, -1, this.predStart);
      const sure = this.lowAfterBounce(stroke, tRel);
      if (sure && (!contact || contact.t <= tRel)) {
        // Ball already past the contact plane: hit it where it is.
        this.autoHit(stroke, this.currentContact(), chargeMul, true);
        return;
      }
      if (!contact || contact.t > tRel) {
        // Pre-selected stroke: the character hits on its own when the ball reaches the contact plane.
        this.armed = { stroke, chargeMul, sure };
        return;
      }
    }
    this.swing(stroke, tRel, chargeMul);
  }

  /** Low stroke released after the bounce on the player side, on the side the ball comes to: always a hit. */
  private lowAfterBounce(stroke: StrokeId, tRel: number): boolean {
    if (strokeHeight(stroke) !== 'low') return false;
    const fb = this.pred.firstBounce;
    const b = this.ball;
    const bounced = (b !== null && b.bounces >= 1 && b.p.z < 0) || (fb !== null && fb.z < 0 && fb.t <= tRel);
    return bounced && sideDir(strokeSide(stroke), this.hand) === this.expectedSide();
  }

  /** Screen side the incoming ball is expected on (the hint plan, else the ball position). */
  private expectedSide(): 1 | -1 {
    if (this.playerPlan) return this.playerPlan.sideScreen;
    const b = this.ball;
    return b && b.p.x < this.player.x ? -1 : 1;
  }

  private currentContact(): ContactSample {
    const b = this.ball!;
    const s = this.nowContact;
    s.t = this.t;
    s.x = b.p.x;
    s.y = b.p.y;
    s.z = b.p.z;
    s.bounced = b.bounces > 0;
    return s;
  }

  private chargeMulFor(chargeSec: number): number {
    const c = this.cfg;
    const k = Math.min(Math.max(chargeSec / c.chargeFullSec, 0), 1);
    return c.chargeMulMin + (c.chargeMulMax - c.chargeMulMin) * k;
  }

  /** Thumb left the button cluster: cancel the stroke without swinging. */
  cancelStroke(): void {
    this.held = null;
    this.armed = null;
    if (this.player.state === 'backswing') setState(this.player, 'ready', this.t);
  }

  drainEvents(): MatchEvent[] {
    const e = this.events;
    this.events = [];
    return e;
  }

  // ---------------------------------------------------------------- queries

  /** Predicted contact at the player's current contact plane, for hints and bots. */
  predictedPlayerContact(): ContactSample | null {
    if (!this.live || !this.awaitingPlayer || !this.ball) return null;
    return findPlaneCrossing(this.pred, this.player.z + this.cfg.contactAheadM, -1, this.predStart);
  }

  get tossContactTime(): number {
    return this.tossStart + this.cfg.serveToss.perfectFromSec;
  }

  /** End of the perfect serve window (match time). */
  get tossWindowEnd(): number {
    return this.tossStart + this.cfg.serveToss.perfectToSec;
  }

  /**
   * Stroke the button hint (cue 3 / stage hint) should light: same side + height autoHit judges.
   * Height comes from the predicted contact plane (not the post-bounce apex).
   */
  get recommendedStroke(): StrokeId | null {
    if (!this.awaitingPlayer || !this.live) return null;
    const contact = this.predictedPlayerContact();
    if (contact) {
      const side = this.playerPlan?.sideScreen ?? (contact.x >= this.player.x ? 1 : -1);
      return makeStroke(sideForScreen(side, this.hand), heightBandOf(contact.y, this.cfg));
    }
    return this.playerPlan?.stroke ?? null;
  }

  get awaitingPlayerHit(): boolean {
    return this.awaitingPlayer && this.live;
  }

  /** Match time of the queued player hit, or null when none is queued. */
  get pendingHitTime(): number | null {
    return this.pending ? this.pending.time : null;
  }

  get landing(): { x: number; z: number } | null {
    if (!this.live || !this.ball || this.ball.bounces > 0) return null;
    return this.pred.firstBounce;
  }

  /** Predicted rebound after the first bounce (for bounce-height visual cues). */
  get rebound(): ReboundPreview | null {
    if (!this.live || !this.ball || this.lastHitter !== 'npc') return null;
    return reboundPreview(this.pred, this.cfg);
  }

  hasCue(id: BounceCueId): boolean {
    return this.bounceCues.includes(id);
  }

  get timingWindowMul(): number {
    return this.judgeCtx.windowMul;
  }

  get matchOver(): boolean {
    return this.phase === 'match_over';
  }

  // ---------------------------------------------------------------- tick

  tick(dt: number): void {
    this.t += dt;
    const t = this.t;

    if (this.swingAt >= 0 && t >= this.swingAt) {
      this.swingAt = -1;
      if (this.player.state === 'backswing') setState(this.player, 'swing', t);
    }
    if (this.pending && t >= this.pending.time) this.executePlayerHit(this.pending);
    if (!this.pending && this.live && this.awaitingPlayer && (this.armed || this.held)) this.updateArmed();

    switch (this.phase) {
      case 'serve_wait': {
        // The server may slide along the baseline inside its half.
        const p = this.player;
        if (!this.steerManually(p, true)) {
          p.targetX = p.x;
          p.targetZ = p.z;
        }
        const half = Math.sign(p.x) || 1;
        const edge = this.cfg.court.halfWidth;
        const lane = this.cfg.serveToss.laneMinXM;
        p.targetX = half > 0 ? Math.min(Math.max(p.targetX, lane), edge) : Math.max(Math.min(p.targetX, -lane), -edge);
        moveActor(p, dt, this.cfg, this.playerBounds);
        break;
      }
      case 'toss':
        if (!this.pending && t > this.tossWindowEnd + this.cfg.missWindowSec * this.judgeCtx.windowMul + 0.05) {
          this.serveFault('whiff');
        }
        break;
      case 'npc_serve_wait':
        if (t - this.phaseTime >= this.rules.match.npcServeDelaySec) this.npcServe();
        break;
      case 'fault':
        if (t >= this.phaseUntil) this.enterServeWait();
        break;
      case 'point_over':
        if (t >= this.phaseUntil) this.afterPoint();
        break;
      default:
        break;
    }

    if (this.ball) this.stepBallAndRules(dt);
    if (this.phase === 'rally' || this.phase === 'point_over' || this.phase === 'npc_serve_wait') {
      this.updatePlayer(dt);
      this.updateNpc(dt);
    }
    this.updateStates();
  }

  // ---------------------------------------------------------------- point flow

  private setupPoint(): void {
    const total = this.playerScore + this.npcScore;
    const first: CourtSide = this.rules.match.firstServer === 'npc' ? 'npc' : 'player';
    this.server = total % 2 === 0 ? first : first === 'player' ? 'npc' : 'player';
    this.serveAttempt = 0;
    this.rally = 0;
    this.lastJudgment = null;
    this.resetBallState();
    if (this.server === 'player') {
      this.enterServeWait();
    } else {
      const deuce = total % 2 === 0;
      const npcX = deuce ? -0.8 : 0.8;
      const box: 1 | -1 = npcX > 0 ? -1 : 1;
      this.placeActor(this.npc, npcX, SERVE_Z);
      this.placeActor(this.player, box * 1.4, this.rules.match.playerHomeZ);
      setState(this.npc, 'serve_ready', this.t);
      setState(this.player, 'ready', this.t);
      this.serveBoxSign = box;
      this.enterPhase('npc_serve_wait');
    }
    this.events.push({ type: 'next_point', server: this.server });
  }

  private enterServeWait(): void {
    const total = this.playerScore + this.npcScore;
    const deuce = total % 2 === 0;
    const sx = deuce ? 0.8 : -0.8;
    this.serveBoxSign = sx > 0 ? -1 : 1;
    this.resetBallState();
    this.placeActor(this.player, sx, -SERVE_Z);
    this.placeActor(this.npc, this.serveBoxSign * 1.4, this.rules.match.npcHomeZ);
    setState(this.player, 'serve_ready', this.t);
    setState(this.npc, 'ready', this.t);
    this.enterPhase('serve_wait');
  }

  private resetBallState(): void {
    this.ball = null;
    this.live = false;
    this.pending = null;
    this.swingAt = -1;
    this.awaitingPlayer = false;
    this.playerPlan = null;
    this.npcPlan = null;
    this.npcDone = false;
    this.npcGaveUp = false;
    this.playerWhiffed = false;
    this.stickySide = 0;
    this.held = null;
    this.armed = null;
  }

  private placeActor(a: Actor, x: number, z: number): void {
    a.x = x;
    a.z = z;
    a.vx = 0;
    a.vz = 0;
    a.targetX = x;
    a.targetZ = z;
  }

  private enterPhase(p: MatchPhase): void {
    this.phase = p;
    this.phaseTime = this.t;
  }

  private endPoint(winner: CourtSide, reason: PointEndReason): void {
    if (this.phase === 'point_over' || this.phase === 'match_over') return;
    this.live = false;
    this.awaitingPlayer = false;
    this.pending = null;
    if (winner === 'player') {
      this.playerScore++;
      this.stats.pointsWon++;
    } else {
      this.npcScore++;
      this.stats.pointsLost++;
    }
    if (reason === 'winner') this.stats.winners++;
    else if (reason === 'ace') this.stats.aces++;
    else if (reason === 'npc_error') this.stats.npcErrors++;
    else if (reason === 'double_fault') this.stats.doubleFaults++;
    this.stats.maxRally = Math.max(this.stats.maxRally, this.rally);
    this.lastPointReason = reason;
    this.lastPointWinner = winner;
    this.events.push({ type: 'point_end', winner, reason, playerScore: this.playerScore, npcScore: this.npcScore });
    this.enterPhase('point_over');
    this.phaseUntil = this.t + this.rules.match.pointPauseSec;
  }

  private afterPoint(): void {
    const target = this.rules.match.pointsToWin;
    if (this.playerScore >= target || this.npcScore >= target) {
      this.winner = this.playerScore > this.npcScore ? 'player' : 'npc';
      this.enterPhase('match_over');
      this.ball = null;
      this.events.push({ type: 'match_end', winner: this.winner });
      return;
    }
    this.setupPoint();
  }

  // ---------------------------------------------------------------- serve

  private startToss(stroke: StrokeId, tm: number): void {
    const st = this.cfg.serveToss;
    const tPress = Math.min(Math.max(tm, this.t - 0.1), this.t);
    this.tossStart = tPress;
    this.held = { stroke, pressT: tPress };
    const fh = sideDir('forehand', this.hand);
    const elapsed = this.t - tPress;
    const up = (2 * st.riseM) / st.apexSec;
    const g = up / st.apexSec;
    this.ball = createBall(
      { x: this.player.x + fh * st.handOffsetM, y: st.startHeight + up * elapsed - 0.5 * g * elapsed * elapsed, z: this.player.z + this.cfg.contactAheadM },
      { x: 0, y: up - g * elapsed, z: 0 },
      'flat',
      this.cfg,
    );
    this.ball.gMul = g / this.cfg.gravity;
    this.live = false;
    this.player.stroke = 'fh_high';
    this.player.swingDir = fh;
    setState(this.player, 'toss', this.t);
    this.enterPhase('toss');
    this.events.push({ type: 'serve_toss' });
  }

  private serveRelease(tRel: number): void {
    if (this.pending) return;
    const st = this.cfg.serveToss;
    // Any release inside [perfectFromSec, perfectToSec] after the press is a perfect serve.
    const rel = tRel - this.tossStart;
    const dt = rel < st.perfectFromSec ? rel - st.perfectFromSec : rel > st.perfectToSec ? rel - st.perfectToSec : 0;
    const j = judgeServe(dt, this.hand, this.judgeCtx);
    this.lastJudgment = j;
    const serveStroke: StrokeId = 'fh_high';
    this.player.stroke = serveStroke;
    setState(this.player, 'swing', this.t);
    if (j.quality === 'miss' || j.quality === 'early' || j.quality === 'late') {
      recordQuality(this.stats, j.quality);
      this.events.push({ type: 'player_swing', stroke: serveStroke, whiff: j.quality === 'miss', serve: true });
      this.serveFault(j.result === 'whiff' ? 'whiff' : j.result);
      return;
    }
    this.events.push({ type: 'player_swing', stroke: serveStroke, whiff: false, serve: true });
    this.pending = { time: Math.max(tRel, this.tossContactTime), judgment: j, chargeMul: 1, serve: true };
  }

  private serveFault(reason: ShotResult): void {
    this.live = false;
    this.pending = null;
    this.stats.faults++;
    this.serveAttempt++;
    const double = this.serveAttempt >= this.rules.match.serveAttempts;
    this.events.push({ type: 'fault', attempt: this.serveAttempt, double, reason });
    if (double) {
      this.phase = 'fault';
      this.endPoint('npc', 'double_fault');
      return;
    }
    this.enterPhase('fault');
    this.phaseUntil = this.t + 1.1;
  }

  private npcServe(): void {
    const from = { x: this.npc.x - 0.3, y: 2.55, z: this.npc.z - 0.3 };
    const plan = planNpcServe(from, this.serveBoxSign, this.npcCtx, this.rng);
    this.npc.stroke = 'fh_high';
    setState(this.npc, 'swing', this.t);
    this.launch(from, plan.velocity, plan.spin, 'npc', true);
    this.events.push({ type: 'npc_hit', smash: false, serve: true, error: false, speed: Math.hypot(plan.velocity.x, plan.velocity.z) });
  }

  // ---------------------------------------------------------------- ball

  private launch(from: { x: number; y: number; z: number }, v: { x: number; y: number; z: number }, spin: BallState['spin'], hitter: CourtSide, serve: boolean): void {
    this.ball = createBall(from, v, spin, this.cfg);
    this.lastHitter = hitter;
    this.shotIsServe = serve;
    this.live = true;
    this.predStart = this.t;
    predict(this.ball, this.t, this.cfg, this.pred);
    this.applyFlightTime(this.ball, hitter);
    this.rally++;
    if (hitter === 'npc') {
      this.awaitingPlayer = true;
      this.playerPlan = null;
      this.stickySide = 0;
      this.playerWhiffed = false;
      this.replanTick = 0;
      if (this.player.state !== 'swing' && this.player.state !== 'recovery' && this.player.state !== 'backswing') setState(this.player, 'split', this.t);
    } else {
      this.awaitingPlayer = false;
      this.playerPlan = null;
      this.npcPlan = null;
      this.npcDone = false;
      this.npcGaveUp = false;
      this.npcDecideAt = this.t + this.setup.level.reactionDelaySec;
    }
    if (this.phase !== 'point_over') this.enterPhase('rally');
  }

  /**
   * Slows (or speeds up) the shot on the same path so it reaches the receiver's contact plane
   * after the hitter's configured flight time. Expects `this.pred` to hold the unscaled flight.
   */
  private applyFlightTime(b: BallState, hitter: CourtSide): void {
    const target = hitter === 'player' ? this.flightSec.player : this.flightSec.npc;
    const bf = this.rules.ballFlight;
    const toNpc = hitter === 'player';
    const plane = toNpc
      ? Math.max(bf.minPlaneDistM, this.npc.z - this.cfg.contactAheadM)
      : Math.min(-bf.minPlaneDistM, this.player.z + this.cfg.contactAheadM);
    const cross = findPlaneCrossing(this.pred, plane, toNpc ? 1 : -1, this.t);
    const p = this.pred;
    const end = cross?.t ?? p.secondBounce?.t ?? p.firstBounce?.t ?? p.samples[p.count - 1].t;
    const natural = end - this.t;
    if (natural <= 1e-3) return;
    const k = Math.min(Math.max(target / natural, bf.scaleMin), bf.scaleMax);
    applySlow(b, k);
    predict(b, this.t, this.cfg, this.pred);
  }

  private stepBallAndRules(dt: number): void {
    const b = this.ball;
    if (!b) return;
    const n = stepBall(b, dt, this.cfg, this.flightEvents);
    if (!this.live) return;
    for (let i = 0; i < n && i < this.flightEvents.length && this.live; i++) {
      const e = this.flightEvents[i];
      if (e.type === 'net') {
        this.events.push({ type: 'net', x: e.x });
        this.hitterLoses('net');
      } else {
        this.onBounce(e);
      }
    }
    if (!this.live) return;
    const c = this.cfg.court;
    const m = this.cfg.movementMarginM + 0.5;
    if (Math.abs(b.p.x) > c.halfWidth + m || Math.abs(b.p.z) > c.halfLength + m) {
      if (b.bounces >= 1) this.receiverLoses();
      else this.hitterLoses(Math.abs(b.p.z) > c.halfLength + m ? 'long' : b.p.x < 0 ? 'left' : 'right');
    }
  }

  private onBounce(e: FlightEvent): void {
    const receiver: CourtSide = this.lastHitter === 'player' ? 'npc' : 'player';
    if (e.bounces === 1) {
      const side = sideOfZ(e.z);
      const valid =
        side === receiver &&
        (this.shotIsServe ? inServiceBox(e.x, e.z, receiver, this.serveBoxSign, this.cfg) : inCourt(e.x, e.z, receiver, this.cfg));
      this.events.push({ type: 'bounce', x: e.x, z: e.z, valid });
      if (!valid) {
        const c = this.cfg.court;
        const reason: ShotResult = side !== receiver ? 'net' : Math.abs(e.z) > (this.shotIsServe ? c.serviceLine : c.halfLength) ? 'long' : e.x < 0 ? 'left' : 'right';
        this.hitterLoses(reason);
      }
    } else if (e.bounces === 2) {
      this.events.push({ type: 'bounce', x: e.x, z: e.z, valid: true });
      this.receiverLoses();
    }
  }

  private hitterLoses(reason: ShotResult): void {
    if (this.lastHitter === 'player') {
      if (this.shotIsServe) this.serveFault(reason);
      else this.endPoint('npc', 'player_fault');
    } else {
      this.endPoint('player', 'npc_error');
    }
  }

  private receiverLoses(): void {
    if (this.lastHitter === 'player') this.endPoint('player', this.shotIsServe ? 'ace' : 'winner');
    else this.endPoint('npc', this.playerWhiffed ? 'player_miss' : 'npc_winner');
  }

  // ---------------------------------------------------------------- player

  private swing(stroke: StrokeId, tRel: number, chargeMul: number): void {
    const p = this.player;
    p.stroke = stroke;
    p.swingDir = sideDir(strokeSide(stroke), this.hand);
    this.coilState = p.state;
    this.coilTime = p.stateTime;
    setState(p, 'swing', this.t);
    this.recoveryUntil = this.t + this.cfg.recoverySec;

    if (!this.awaitingPlayer || !this.live || !this.ball) {
      this.events.push({ type: 'player_swing', stroke, whiff: true, serve: false });
      return;
    }
    const contact = findPlaneCrossing(this.pred, p.z + this.cfg.contactAheadM, -1, this.predStart);
    const win = this.cfg.missWindowSec * this.judgeCtx.windowMul;
    if (!contact) {
      this.whiff(stroke, tRel - this.t);
      return;
    }
    const fb = this.pred.firstBounce;
    const bw = this.cfg.bounceWindow;
    if (fb && fb.z < 0 && contact.bounced && contact.t >= tRel - bw.lateGraceSec) {
      const since = tRel - fb.t;
      if (since >= bw.fromSec && since <= bw.toSec) {
        this.bounceWindowSwing(stroke, tRel, contact, chargeMul);
        return;
      }
    }
    const dt = tRel - contact.t;
    if (dt < -win) {
      // Early release before the judgment window: whiff + recovery only, the ball can still be played.
      this.events.push({ type: 'player_swing', stroke, whiff: true, serve: false });
      this.lastJudgment = { quality: 'miss', tier: -1, timingDeltaSec: dt, x: 0, y: 0, zone: 'none', result: 'whiff', spin: 'flat' };
      this.stats.miss++;
      this.playerWhiffed = true;
      return;
    }
    const j = judgeHit({ stroke, impactTime: tRel, playerX: p.x }, contact, this.judgeCtx, this.rng);
    p.reach = reachStageFor(Math.abs((contact.x - p.x) * p.swingDir - this.cfg.shoulderOffsetM));
    this.lastJudgment = j;
    if (j.result === 'whiff') {
      this.whiff(stroke, dt);
      return;
    }
    recordQuality(this.stats, j.quality);
    this.events.push({ type: 'player_swing', stroke, whiff: false, serve: false });
    this.awaitingPlayer = false;
    this.schedulePlayerHit(Math.max(tRel, contact.t), j, chargeMul);
  }

  /**
   * Swing released 0.3–1.5 s after the bounce on the player side: timing no longer matters, only side and height.
   * Right side + right height = perfect. One band off: stroke under the ball = long, over it = net.
   * Two bands off, wrong side or out of reach = whiff.
   */
  private bounceWindowSwing(stroke: StrokeId, tRel: number, contact: ContactSample, chargeMul: number): void {
    const p = this.player;
    const bw = this.cfg.bounceWindow;
    const dt = tRel - contact.t;
    const offset = (contact.x - p.x) * p.swingDir;
    const reachMax = this.cfg.reachMaxBaseM * this.judgeCtx.reachMul;
    if (offset < -bw.sideDeadZoneM || offset - this.cfg.shoulderOffsetM > reachMax + bw.reachToleranceM) {
      this.whiff(stroke, dt);
      return;
    }
    const diff = HEIGHT_RANK[strokeHeight(stroke)] - HEIGHT_RANK[heightBandOf(contact.y, this.cfg)];
    if (Math.abs(diff) >= 2) {
      this.whiff(stroke, dt);
      return;
    }
    const weak = this.quality.tiers.length - 1;
    const j: HitJudgment =
      diff === 0
        ? { quality: 'perfect', tier: 0, timingDeltaSec: dt, x: 0, y: 0, zone: 'B2', result: 'in', spin: 'flat' }
        : diff < 0
          ? { quality: 'late', tier: weak, timingDeltaSec: dt, x: 0, y: bw.missHitFaceY, zone: 'none', result: 'long', spin: 'flat', heightError: 'low' }
          : { quality: 'early', tier: weak, timingDeltaSec: dt, x: 0, y: -bw.missHitFaceY, zone: 'none', result: 'net', spin: 'flat', heightError: 'high' };
    p.reach = reachStageFor(Math.abs(offset - this.cfg.shoulderOffsetM));
    this.lastJudgment = j;
    recordQuality(this.stats, j.quality);
    this.events.push({ type: 'player_swing', stroke, whiff: false, serve: false });
    this.awaitingPlayer = false;
    this.schedulePlayerHit(Math.max(tRel, contact.t), j, chargeMul);
  }

  /** Queues the hit; if it is later than the swing lead, holds the coiled pose so the animation reaches contact on time. */
  private schedulePlayerHit(hitT: number, j: HitJudgment, chargeMul: number): void {
    const p = this.player;
    this.pending = { time: hitT, judgment: j, chargeMul, serve: false };
    const swingAt = hitT - this.cfg.swingLeadSec;
    if (swingAt > this.t) {
      p.state = 'backswing';
      p.stateTime = this.coilState === 'backswing' ? this.coilTime : this.t;
      this.swingAt = swingAt;
      this.recoveryUntil = swingAt + this.cfg.recoverySec;
    }
  }

  /** Armed or held stroke: starts the swing animation swingLeadSec before contact and hits when the ball arrives. */
  private updateArmed(): void {
    const p = this.player;
    const stroke = this.held ? this.held.stroke : this.armed!.stroke;
    const contact = findPlaneCrossing(this.pred, p.z + this.cfg.contactAheadM, -1, this.predStart);
    if (!contact || contact.t - this.t > this.cfg.swingLeadSec) return;
    if (p.state !== 'swing') {
      p.stroke = stroke;
      p.swingDir = sideDir(strokeSide(stroke), this.hand);
      setState(p, 'swing', this.t);
    }
    if (contact.t > this.t) return;
    const chargeMul = this.held ? this.chargeMulFor(this.t - this.held.pressT) : this.armed!.chargeMul;
    // Held low strokes reach contact after the bounce too, so they get the same sure hit as a release.
    const sure = this.held ? contact.bounced && this.lowAfterBounce(stroke, this.t) : this.armed!.sure;
    this.held = null;
    this.armed = null;
    this.autoHit(stroke, contact, chargeMul, sure);
  }

  /**
   * Auto hit of a pre-selected stroke, judged against the expected ball (the plan the hint shows):
   * matching side and height = perfect. One band off: stroke under the ball = long, over it = net.
   * Two bands off, wrong side or out of reach = whiff.
   * `sure` (low stroke after the bounce, matching side): never a whiff; matching height = perfect, else a plain in-court hit.
   */
  private autoHit(stroke: StrokeId, contact: ContactSample, chargeMul: number, sure = false): void {
    const p = this.player;
    const bw = this.cfg.bounceWindow;
    p.stroke = stroke;
    p.swingDir = sideDir(strokeSide(stroke), this.hand);
    setState(p, 'swing', this.t);
    this.recoveryUntil = this.t + this.cfg.recoverySec;
    const plan = this.playerPlan;
    const expectSide = plan ? plan.sideScreen : contact.x >= p.x ? 1 : -1;
    // Height band from the ball at the contact plane — same source as recommendedStroke / cue 3.
    const expectBand = heightBandOf(contact.y, this.cfg);
    const offset = (contact.x - p.x) * p.swingDir;
    const reachMax = this.cfg.reachMaxBaseM * this.judgeCtx.reachMul;
    if (!sure && (p.swingDir !== expectSide || offset - this.cfg.shoulderOffsetM > reachMax + bw.reachToleranceM)) {
      this.whiff(stroke, 0);
      return;
    }
    const diff = HEIGHT_RANK[strokeHeight(stroke)] - HEIGHT_RANK[expectBand];
    if (!sure && Math.abs(diff) >= 2) {
      this.whiff(stroke, 0);
      return;
    }
    const weak = this.quality.tiers.length - 1;
    const safe = bw.lowSureTier;
    const j: HitJudgment =
      diff === 0
        ? { quality: 'perfect', tier: 0, timingDeltaSec: 0, x: 0, y: 0, zone: 'B2', result: 'in', spin: 'flat' }
        : sure
          ? { quality: this.quality.tiers[safe].quality as HitJudgment['quality'], tier: safe, timingDeltaSec: 0, x: 0, y: 0, zone: 'B2', result: 'in', spin: 'flat' }
          : diff < 0
            ? { quality: 'late', tier: weak, timingDeltaSec: 0, x: 0, y: bw.missHitFaceY, zone: 'none', result: 'long', spin: 'flat', heightError: 'low' }
            : { quality: 'early', tier: weak, timingDeltaSec: 0, x: 0, y: -bw.missHitFaceY, zone: 'none', result: 'net', spin: 'flat', heightError: 'high' };
    p.reach = reachStageFor(Math.abs(offset - this.cfg.shoulderOffsetM));
    this.lastJudgment = j;
    recordQuality(this.stats, j.quality);
    this.events.push({ type: 'player_swing', stroke, whiff: false, serve: false });
    this.awaitingPlayer = false;
    this.executePlayerHit({ time: this.t, judgment: j, chargeMul, serve: false });
  }

  private whiff(stroke: StrokeId, dt: number): void {
    this.lastJudgment = { quality: 'miss', tier: -1, timingDeltaSec: dt, x: 0, y: 0, zone: 'none', result: 'whiff', spin: 'flat' };
    this.stats.miss++;
    this.playerWhiffed = true;
    this.events.push({ type: 'player_swing', stroke, whiff: true, serve: false });
  }

  private executePlayerHit(h: PendingHit): void {
    this.pending = null;
    const b = this.ball;
    if (!b) return;
    if (!h.serve && !this.live) return;
    const from = { x: b.p.x, y: Math.max(b.p.y, h.serve ? this.cfg.serveToss.contactMinHeightM : 0.15), z: b.p.z };
    const sp = this.setup.player;
    const speedMul = this.tuning.ballSpeedMul;
    const plan = h.serve
      ? planPlayerServe(h.judgment, from, this.serveBoxSign, sp.power, speedMul, this.cfg, this.quality)
      : planPlayerShot({ judgment: h.judgment, from, powerStat: sp.power, controlStat: sp.control, chargeMul: h.chargeMul, speedMul }, this.cfg, this.quality, this.rng);
    this.stats.totalHits++;
    this.launch(from, plan.velocity, plan.spin, 'player', h.serve);
    this.events.push({ type: 'player_hit', judgment: h.judgment, serve: h.serve, speed: Math.hypot(plan.velocity.x, plan.velocity.z) });
  }

  private updatePlayer(dt: number): void {
    const p = this.player;
    const manual = this.steerManually(p);
    if (this.live && this.awaitingPlayer && this.ball) {
      if (this.replanTick-- <= 0) {
        this.replanTick = 3;
        // The side follows the incoming ball only; a pre-selected stroke must match it, so it never steers the side.
        const plan = planContact(this.pred, p, this.intent, this.hand, this.t, this.stickySide, this.cfg, this.playerBounds);
        if (plan) {
          this.playerPlan = plan;
          if (this.stickySide === 0) this.stickySide = plan.sideScreen;
          if (!manual && !this.pending && this.playLevel === 'beginner') {
            p.targetX = plan.targetX;
            p.targetZ = plan.targetZ;
          }
        }
      }
    }
    if (!manual && (this.pending || !(this.live && this.awaitingPlayer) || this.playLevel !== 'beginner')) {
      p.targetX = p.x;
      p.targetZ = p.z;
    }
    this.updateFacing();
    moveActor(p, dt, this.cfg, this.playerBounds);
  }

  /**
   * Side the player turns to before a stroke is chosen. Beginner / middle follow the incoming ball;
   * master turns only with the pad's lateral input. A chosen stroke or a swing always owns the side.
   */
  private updateFacing(): void {
    const p = this.player;
    if (this.held || this.armed || this.pending || p.state === 'backswing' || p.state === 'swing' || p.state === 'recovery') return;
    if (this.playLevel === 'master') {
      const ix = applyDeadZone(this.intent.ix, this.cfg.intentDeadZone);
      if (ix !== 0) p.swingDir = ix > 0 ? 1 : -1;
      return;
    }
    if (this.live && this.awaitingPlayer && this.playerPlan) p.swingDir = this.playerPlan.sideScreen;
  }

  /**
   * Direct movement from the pad / WASD: the target leads the actor in the intent direction
   * (up = toward the net, right = screen right). Returns false when the intent is inside the dead zone.
   */
  private steerManually(p: Actor, lateralOnly = false): boolean {
    const dz = this.cfg.intentDeadZone;
    const ix = applyDeadZone(this.intent.ix, dz);
    const iy = lateralOnly ? 0 : applyDeadZone(this.intent.iy, dz);
    if (ix === 0 && iy === 0) return false;
    if (this.pending) return false;
    const lead = p.maxSpeed * this.cfg.manualLeadSec;
    const c = clampToBounds(p.x + ix * lead, p.z + iy * lead, this.playerBounds);
    p.targetX = c.x;
    p.targetZ = lateralOnly ? p.z : c.z;
    return true;
  }

  // ---------------------------------------------------------------- npc

  private updateNpc(dt: number): void {
    const n = this.npc;
    const b = this.ball;
    if (this.live && b && this.lastHitter === 'player' && !this.npcDone) {
      if (!this.npcPlan && !this.npcGaveUp && this.t >= this.npcDecideAt) {
        this.npcPlan = planNpcContact(this.pred, n.x, n.z, this.t, this.npcCtx, this.npcBounds);
        if (!this.npcPlan) this.npcGaveUp = true;
        else {
          n.targetX = this.npcPlan.targetX;
          n.targetZ = this.npcPlan.targetZ;
        }
      }
      if (this.npcPlan && this.t >= this.npcPlan.t) this.npcContact(this.npcPlan, b);
    } else if (this.t >= this.npcRecoverAt) {
      const lx = this.awaitingPlayer && this.ball ? this.ball.p.x * 0.25 : 0;
      n.targetX = lx;
      n.targetZ = this.rules.match.npcHomeZ;
    }
    moveActor(n, dt, this.cfg, this.npcBounds);
  }

  private npcContact(plan: NpcContactPlan, b: BallState): void {
    this.npcDone = true;
    const n = this.npc;
    const d = Math.hypot(b.p.x - n.x, b.p.z - n.z);
    const reach = this.setup.npc.reachM;
    n.swingDir = plan.sideScreen;
    n.stroke = plan.smash || b.p.y > 1.3 ? 'fh_high' : b.p.y < 0.75 ? 'fh_low' : 'fh_mid';
    n.reach = reachStageFor(Math.max(0, d - 0.25));
    setState(n, 'swing', this.t);
    this.npcRecoverAt = this.t + 0.45;
    if (d > reach) {
      this.events.push({ type: 'npc_swing', stroke: n.stroke, whiff: true });
      return;
    }
    const tier = this.lastJudgment ? this.lastJudgment.tier : 2;
    const chance = npcReturnChance(tier, this.npcCtx);
    const from = { x: b.p.x, y: Math.max(b.p.y, 0.2), z: b.p.z };
    const ok = this.rng.next() < chance;
    const shot = ok ? planNpcReturn(from, plan.smash, this.player.x, this.npcCtx, this.rng) : planNpcError(from, this.npcCtx, this.rng);
    this.launch(from, shot.velocity, shot.spin, 'npc', false);
    this.events.push({ type: 'npc_hit', smash: shot.smash, serve: false, error: !ok, speed: Math.hypot(shot.velocity.x, shot.velocity.z) });
  }

  // ---------------------------------------------------------------- animation states

  private updateStates(): void {
    for (const a of [this.player, this.npc]) {
      const age = this.t - a.stateTime;
      if (a.state === 'swing' && age > this.cfg.recoverySec) setState(a, 'recovery', this.t);
      else if (a.state === 'recovery' && age > 0.25) setState(a, 'ready', this.t);
      else if (a.state === 'split' && age > 0.12) setState(a, 'run', this.t);
      if (a.state === 'ready' || a.state === 'run' || a.state === 'idle') {
        const sp = Math.hypot(a.vx, a.vz);
        setState(a, sp > 0.4 ? 'run' : 'ready', this.t);
      }
    }
    const p = this.player;
    if (this.held && this.phase !== 'toss' && (p.state === 'ready' || p.state === 'run' || p.state === 'split')) this.coilTo(this.held.stroke);
  }
}
