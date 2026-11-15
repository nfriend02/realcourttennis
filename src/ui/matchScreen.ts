import { audio, type SfxId } from '../audio/audioManager';
import { backend } from '../backend';
import { layout } from '../core/layout';
import { pause } from '../core/pause';
import { settings } from '../core/settings';
import { aiLevel, characterById, HIT_QUALITY, npcCharacterFor, RULES, stageById, type ThemeId, VISUAL } from '../data/gameData';
import { SeededRandom } from '../game/core/random';
import type { Actor } from '../game/match/actor';
import { PlayerBot } from '../game/match/bot';
import { MatchModel, type MatchEvent } from '../game/match/matchModel';
import { calculateScore } from '../game/match/score';
import type { HitQuality, StrokeHeight, StrokeId } from '../game/physics/types';
import { GameInput } from '../input/gameInput';
import { getLang, type StringKey, t } from '../i18n/i18n';
import type { BounceCueFrame } from '../view/ballView';
import { GameView } from '../view/gameView';
import type { PoseInput } from '../view/mannequin';
import type { App, Screen } from './app';
import { ASSET, overlayVideo } from './assets';
import { btn, h, icon, tx } from './dom';

type Stage = 'intro' | 'play' | 'replay' | 'end' | 'ready';

interface ReplayFrame {
  bx: number; by: number; bz: number; bv: boolean;
  p: Omit<PoseInput, 'dt'>;
  n: Omit<PoseInput, 'dt'>;
}

const TICK = 1 / 120;
const FREE_SPEED = [0.825, 0.925, 1.025, 1.125, 1.26];
const charKey = (name: string) => name.toLowerCase();

export function matchScreen(app: App): Screen {
  const sel = app.selection;
  const player = characterById(sel.characterId);
  const stage = sel.mode === 'stage' ? stageById(sel.stageId) : null;
  const level = stage ? stage.npcLevel : sel.freeLevel;
  const theme: ThemeId = stage ? stage.courtTheme : sel.freeTheme;
  const npc = npcCharacterFor(player.id, stage ? stage.npcSlot : 'a');
  const ballSpeedMul = stage ? stage.ballSpeedMul : FREE_SPEED[level - 1];
  const strokeHint = stage ? stage.strokeHint : false;
  const music = stage ? (stage.bgm === 'court_night' ? 'bgm_court_night' : 'bgm_court_day') : theme === 'night' ? 'bgm_court_night' : 'bgm_court_day';

  const model = new MatchModel({
    player,
    npc,
    hand: settings.hand,
    level: aiLevel(level),
    ballSpeedMul,
    flightSec: settings.flightSec(),
    playLevel: settings.playLevel(),
    bounceCues: settings.bounceCues(),
    seed: (Date.now() & 0x7fffffff) ^ 0x2545f491,
  });
  const cueFrame: BounceCueFrame = {
    cue2: model.hasCue('2'),
    cue1: model.hasCue('1'),
    cue4: model.hasCue('4'),
    band: null,
    arc: null,
    apexY: null,
    trailTint: null,
  };
  let trailTintUntil = 0;
  let trailTintHex = 0;

  // ------------------------------------------------------------ DOM
  const el = h('div.match');
  const viewEl = h('div.view3d');
  const hud = h('div.hud');
  const popLayer = h('div.pop-layer');
  const youName = tx('span.sb-name', `char.${charKey(player.name)}.name` as StringKey);
  const npcName = tx('span.sb-name', `char.${charKey(npc.name)}.name` as StringKey);
  const youScore = h('b.sb-score', {}, '0');
  const npcScore = h('b.sb-score', {}, '0');
  const youServe = h('i.sb-serve');
  const npcServe = h('i.sb-serve');
  const label = stage ? tx('span.sb-stage', 'hud.stage', { n: stage.stageId }) : tx('span.sb-stage', 'hud.free', { n: level });
  const scoreboard = h('div.scoreboard', {},
    h('div.sb-side.you', { style: `--c:${player.color}` }, youServe, tx('span.sb-who', 'hud.you'), youName, youScore),
    h('span.sb-colon', {}, ':'),
    h('div.sb-side.opp', { style: `--c:${npc.color}` }, npcScore, npcName, tx('span.sb-who', 'hud.opponent'), npcServe),
    label,
  );
  const serveHint = h('div.serve-hint');
  const keyHint = tx('div.key-hint', 'hud.keyHint');
  const overlay = h('div.match-overlay');
  hud.append(scoreboard, serveHint, popLayer, keyHint, overlay);

  const pad = h('div.pad', { 'aria-hidden': 'true' }, h('div.pad-shape', {}, h('i.pad-arrow.up'), h('i.pad-arrow.down'), h('i.pad-arrow.left'), h('i.pad-arrow.right')), h('div.pad-knob'));
  const cluster = h('div.cluster');
  const strokeOrder: StrokeId[] = ['bh_high', 'fh_high', 'bh_mid', 'fh_mid', 'bh_low', 'fh_low'];
  for (const s of strokeOrder) {
    const side = s.startsWith('fh') ? 'fh' : 'bh';
    const hgt = s.endsWith('high') ? 'high' : s.endsWith('low') ? 'low' : 'mid';
    const b = h('div.stroke-btn', { 'data-stroke': s, 'data-side': side, 'data-h': hgt, role: 'button', 'aria-label': s });
    b.append(
      icon(hgt === 'high' ? 'up' : hgt === 'low' ? 'down' : 'mid'),
      tx('span.stroke-h', hgt === 'high' ? 'stroke.high' : hgt === 'low' ? 'stroke.low' : 'stroke.mid'),
      tx('span', side === 'fh' ? 'stroke.fh' : 'stroke.bh'),
    );
    cluster.append(b);
  }
  const controls = h('div.controls', {}, pad, cluster);
  const videoLayer = h('div.video-layer');
  el.append(viewEl, videoLayer, hud, controls);
  let stopVideo: (() => void) | null = null;
  const playStageVideo = (src: string | null) => {
    stopVideo?.();
    stopVideo = src ? overlayVideo(videoLayer, src) : null;
  };

  // ------------------------------------------------------------ view / input
  let view: GameView | null = null;
  let input: GameInput | null = null;
  let acc = 0;
  let timeScale = 1;
  let hitStopUntil = 0;
  // Dev-only playtest driver (`?autoplay`): the balance-sim bot plays the player side.
  const autoBot = import.meta.env.DEV && new URLSearchParams(location.search).has('autoplay') ? new PlayerBot({ timingSigmaSec: 0.03, strokeAccuracy: 0.9 }, new SeededRandom(7)) : null;
  let stageState: Stage = 'intro';
  let pointWinner: 'player' | 'npc' | null = null;
  let pointTime = 0;
  let npcSmash = false;
  let stageTime = 0;
  let raf = 0;
  let last = performance.now();
  let realTime = 0;
  let playStart = 0;
  let countdownUntil = 0;
  let replayFrames: ReplayFrame[] = [];
  let replayIdx = 0;
  const history: ReplayFrame[] = [];
  const HISTORY_MAX = Math.round(120 * 2.5);
  let pendingReplay = false;
  let endedWinner: 'player' | 'npc' | null = null;
  let resultPromise: Promise<void> | null = null;
  let disposed = false;

  const sinkPress = (s: StrokeId, tm: number) => {
    if (stageState !== 'play' || pause.paused) return;
    model.pressStroke(s, tm);
  };
  const sinkRelease = (s: StrokeId, tm: number) => {
    if (stageState !== 'play' || pause.paused) return;
    model.releaseStroke(s, tm);
  };

  const init = () => {
    view = new GameView(viewEl, theme, player, npc, settings.hand, layout.profile);
    view.rig.snap(model.player.x, model.player.z);
    view.rig.startFlyIn(4);
    if (autoBot) (window as unknown as { __rctView?: GameView }).__rctView = view;
    input = new GameInput(pad, cluster, {
      setIntent: (x, y) => model.setIntent(x, y),
      press: sinkPress,
      release: sinkRelease,
      cancel: () => model.cancelStroke(),
      toMatchTime: (ts) => model.t + acc - Math.max(0, (performance.now() - ts) / 1000) * timeScale,
    });
    showIntroOverlay();
    playStageVideo(stage ? ASSET.stageIntroVideo(stage.stageId) : null);
    raf = requestAnimationFrame(loop);
  };

  // ------------------------------------------------------------ overlays
  const setOverlay = (...nodes: (Node | null)[]) => {
    overlay.replaceChildren(...nodes.filter((n): n is Node => n !== null));
    overlay.classList.toggle('show', nodes.length > 0);
  };

  const showIntroOverlay = () => {
    const vs = h('div.vs-card', {},
      h('div.vs-side', { style: `--c:${player.color}` }, tx('b', `char.${charKey(player.name)}.name` as StringKey), tx('span', `char.${charKey(player.name)}.type` as StringKey)),
      tx('div.vs', 'start.vs'),
      h('div.vs-side', { style: `--c:${npc.color}` }, tx('b', `char.${charKey(npc.name)}.name` as StringKey), h('span', {}, `Lv.${level}`)),
    );
    const sub = h('div.vs-sub', {}, stage ? tx('span', 'hud.stage', { n: stage.stageId }) : tx('span', 'hud.free', { n: level }), ' · ', tx('span', VISUAL_NAME[theme]), ' · ', tx('span', 'start.firstTo'));
    setOverlay(h('div.intro-overlay', {}, vs, sub), btn('skip', 'common.skip', () => beginPlay()));
  };

  const beginPlay = () => {
    if (stageState !== 'intro') return;
    stageState = 'play';
    stageTime = 0;
    playStart = realTime;
    view?.rig.follow();
    playStageVideo(null);
    setOverlay();
    popup('start.go', 'call big');
    audio.playMusic(music);
    el.classList.add('playing');
  };

  // ------------------------------------------------------------ popups
  const popup = (key: StringKey, cls: string, atHead = false) => {
    const p = tx('div.popup', key);
    p.className = `popup ${cls}`;
    if (atHead && view) {
      const s = view.playerHeadScreen();
      p.style.left = `${s.x}px`;
      p.style.top = `${Math.max(60, s.y - 10)}px`;
      p.classList.add('at-head');
    }
    popLayer.append(p);
    window.setTimeout(() => p.remove(), 1500);
  };

  const qualityKey: Record<HitQuality, StringKey> = {
    perfect: 'judge.perfect', great: 'judge.great', good: 'judge.good', early: 'judge.early', late: 'judge.late', miss: 'judge.miss',
  };
  const qualitySfx: Record<HitQuality, SfxId> = {
    perfect: 'sfx_hit_perfect', great: 'sfx_hit_great', good: 'sfx_hit_good', early: 'sfx_hit_weak', late: 'sfx_hit_weak', miss: 'sfx_swing_whiff',
  };

  // ------------------------------------------------------------ events
  const handle = (e: MatchEvent) => {
    switch (e.type) {
      case 'serve_toss':
        audio.play('sfx_serve_toss');
        break;
      case 'player_swing':
        if (e.whiff) {
          audio.play('sfx_swing_whiff');
          popup('judge.miss', 'judge miss', true);
        }
        break;
      case 'player_hit': {
        const q = e.judgment.quality;
        audio.play(qualitySfx[q]);
        const he = e.judgment.heightError;
        popup(he === 'low' ? 'judge.strokeLow' : he === 'high' ? 'judge.strokeHigh' : qualityKey[q], `judge ${q}`, true);
        if (q === 'perfect') {
          hitStopUntil = realTime + 0.08;
          view?.rig.shake(0.05, 0.15);
          const b = model.ball;
          if (b) {
            view?.sparks.burst(b.p.x, b.p.y, b.p.z, 26, 3.2);
            view?.fx.spawn('fx_hit_perfect', b.p.x, b.p.y, b.p.z);
          }
        } else if (q === 'great' && model.ball) {
          view?.fx.spawn('fx_hit_great', model.ball.p.x, model.ball.p.y, model.ball.p.z);
        }
        break;
      }
      case 'npc_hit':
        audio.play(e.smash ? 'sfx_hit_perfect' : 'sfx_hit_good', 0.8);
        npcSmash = e.smash;
        if (e.smash && model.ball) view?.fx.spawn('fx_hit_great', model.ball.p.x, model.ball.p.y, model.ball.p.z);
        break;
      case 'npc_swing':
        if (e.whiff) audio.play('sfx_swing_whiff');
        break;
      case 'bounce': {
        audio.play('sfx_ball_bounce', Math.min(1.2, 0.5 + Math.abs(model.ball?.v.y ?? 3) / 8));
        const rb = model.rebound;
        const band: StrokeHeight | null = rb?.band ?? null;
        if (model.ball) {
          view?.fx.spawn('fx_bounce_dust', model.ball.p.x, 0.05, model.ball.p.z);
          if (model.hasCue('5') && band && e.valid && model.lastHitter === 'npc') {
            const cfg = VISUAL.bounceCues.band[band];
            view?.fx.spawn('fx_bounce_dust', model.ball.p.x, 0.05, model.ball.p.z);
            view?.sparks.burst(model.ball.p.x, 0.1, model.ball.p.z, Math.round(10 * cfg.dustScale), 2.2 * cfg.dustScale);
            trailTintHex = Number.parseInt(cfg.hex.slice(1), 16);
            trailTintUntil = realTime + VISUAL.bounceCues.trailTintSec;
            popup(
              band === 'high' ? 'cue.bandHigh' : band === 'middle' ? 'cue.bandMiddle' : 'cue.bandLow',
              'call small cue-band',
            );
          }
        }
        if (!e.valid) {
          audio.play('sfx_out_whistle');
          popup('call.out', 'call');
        }
        break;
      }
      case 'net':
        audio.play('sfx_net_bounce');
        if (model.ball) view?.fx.spawn('fx_net_shake', model.ball.p.x, Math.max(0.4, model.ball.p.y), 0);
        popup('call.net', 'call');
        break;
      case 'fault':
        popup(e.double ? 'call.doubleFault' : 'call.fault', 'call');
        break;
      case 'point_end': {
        youScore.textContent = String(e.playerScore);
        npcScore.textContent = String(e.npcScore);
        pointWinner = e.winner;
        pointTime = realTime;
        const sideEl = (e.winner === 'player' ? youScore : npcScore);
        sideEl.classList.remove('bump');
        void sideEl.offsetWidth;
        sideEl.classList.add('bump');
        if (e.winner === 'player') {
          audio.play('sfx_score_win');
          view?.court.excite(theme === 'night' ? 1 : 0.7);
          if (theme === 'night') audio.play('sfx_crowd_cheer', 1);
          if (e.reason === 'ace') popup('call.ace', 'call big result');
          else if (e.reason === 'winner') popup('call.winner', 'call big result');
          else popup('call.point', 'call result');
          if (RULES.replayMode === 'player_winners' && (e.reason === 'ace' || e.reason === 'winner')) pendingReplay = true;
        } else {
          audio.play('sfx_score_lose');
          view?.court.excite(0.25);
          if (e.reason !== 'double_fault') popup('call.lost', 'call dim result');
        }
        break;
      }
      case 'match_end':
        endedWinner = e.winner;
        break;
      case 'next_point': {
        const mp = model.playerScore === RULES.match.pointsToWin - 1 || model.npcScore === RULES.match.pointsToWin - 1;
        if (mp && model.playerScore + model.npcScore > 0) popup('call.matchPoint', 'call small');
        view?.ballView.resetTrail();
        pointWinner = null;
        npcSmash = false;
        break;
      }
    }
  };

  // ------------------------------------------------------------ frame helpers
  const pose = (a: Actor, celebrate: 'win' | 'lose' | null = null): Omit<PoseInput, 'dt'> => {
    const p: Omit<PoseInput, 'dt'> = {
      x: a.x, z: a.z, vx: a.vx, vz: a.vz, state: a.state, stateAge: model.t - a.stateTime, stroke: a.stroke, swingDir: a.swingDir, reach: a.reach, celebrate,
    };
    // NPC windup: the model swings at contact time, so anticipate it from the planned contact.
    const plan = a === model.npc ? model.npcPlan : null;
    const mo = VISUAL.motion;
    if (plan && !celebrate && a.state !== 'swing' && a.state !== 'recovery') {
      const remaining = plan.t - model.t;
      if (remaining > 0 && remaining <= mo.npcWindupSec) {
        p.state = 'backswing';
        p.stateAge = mo.npcWindupSec - remaining;
        p.swingDir = plan.sideScreen;
        p.stroke = plan.smash || plan.y > mo.npcHighContactM ? 'fh_high' : plan.y < mo.npcLowContactM ? 'fh_low' : 'fh_mid';
        p.smash = plan.smash;
      }
    }
    if (a === model.npc && npcSmash && (a.state === 'swing' || a.state === 'recovery')) p.smash = true;
    if (a === model.player && !celebrate && model.awaitingPlayerHit && (a.state === 'ready' || a.state === 'run')) {
      p.prep = true;
      p.stroke = model.recommendedStroke ?? a.stroke;
    }
    if (!celebrate) {
      if (stageState === 'intro') {
        p.react = 'walk_in';
        p.reactAge = stageTime;
      } else if (pointWinner && realTime - pointTime < mo.pointReactionSec) {
        const won = (a === model.player) === (pointWinner === 'player');
        p.react = won ? 'point_win' : 'point_lose';
        p.reactAge = realTime - pointTime;
      }
    }
    return p;
  };

  const record = () => {
    const b = model.ball;
    history.push({ bx: b?.p.x ?? 0, by: b?.p.y ?? 0, bz: b?.p.z ?? 0, bv: !!b, p: pose(model.player), n: pose(model.npc) });
    if (history.length > HISTORY_MAX) history.shift();
  };

  const updateHud = () => {
    youServe.classList.toggle('on', model.server === 'player');
    npcServe.classList.toggle('on', model.server === 'npc');
    let hint: StringKey | null = null;
    if (stageState === 'play') {
      if (model.phase === 'serve_wait') hint = model.serveAttempt > 0 ? 'hud.secondServe' : layout.profile === 'desktop' ? 'hud.serveHintKey' : 'hud.serveHint';
      else if (model.phase === 'npc_serve_wait') hint = 'hud.opponentServe';
    }
    const key = hint ?? '';
    if (serveHint.dataset.i18n !== key) {
      serveHint.dataset.i18n = key;
      serveHint.textContent = hint ? t(hint) : '';
      serveHint.classList.toggle('show', !!hint);
      if (hint === 'hud.secondServe') {
        serveHint.textContent = `${t('hud.secondServe')} · ${t(layout.profile === 'desktop' ? 'hud.serveHintKey' : 'hud.serveHint')}`;
      }
    }
    // Cue 3 and stage stroke hints must light the same stroke autoHit judges (playerPlan),
    // never the rebound-apex band — that was lighting Low while contact was Mid/High (net / long).
    const useStrokeHint =
      stageState === 'play' &&
      (model.phase === 'serve_wait'
        ? strokeHint
        : model.awaitingPlayerHit && (strokeHint || model.hasCue('3')));
    input?.hint(useStrokeHint ? (model.phase === 'serve_wait' ? 'fh_high' : model.recommendedStroke) : null);
    input?.hintHeight(null);
  };

  // ------------------------------------------------------------ main loop
  const loop = (now: number) => {
    if (disposed) return;
    raf = requestAnimationFrame(loop);
    const realDt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (!view) return;

    if (pause.paused) {
      audio.setPaused(true);
      return;
    }
    audio.setPaused(false);
    realTime += realDt;
    if (realTime < countdownUntil) {
      const n = Math.ceil(countdownUntil - realTime);
      const c = overlay.querySelector('.countdown');
      if (c) c.textContent = String(n);
      return;
    } else if (overlay.querySelector('.countdown')) setOverlay();
    stageTime += realDt;

    timeScale = realTime < hitStopUntil ? 0.3 : 1;
    let viewDt = realDt * timeScale;

    if (stageState === 'intro') {
      if (stageTime >= 4) beginPlay();
    } else if (stageState === 'play') {
      acc += realDt * timeScale;
      let steps = 0;
      while (acc >= TICK && steps < 24) {
        autoBot?.update(model);
        model.tick(TICK);
        record();
        acc -= TICK;
        steps++;
        for (const e of model.drainEvents()) handle(e);
        if (pendingReplay && model.phase === 'point_over' && model.t - model.phaseTime > 0.6) {
          pendingReplay = false;
          startReplay();
          break;
        }
        if (model.matchOver && endedWinner) {
          startEnd();
          break;
        }
      }
    } else if (stageState === 'replay') {
      const speed = 0.4;
      replayIdx += realDt * 120 * speed;
      viewDt = realDt * speed;
      if (replayIdx >= replayFrames.length - 1) {
        stageState = 'play';
        el.classList.remove('replaying');
        view.rig.follow();
        view.rig.snap(model.player.x, model.player.z);
        setOverlay();
      }
    } else if (stageState === 'end') {
      if (stageTime >= 4) showReady();
    }

    // render
    if (stageState === 'replay') {
      const f = replayFrames[Math.min(replayFrames.length - 1, Math.floor(replayIdx))];
      view.render({ dt: viewDt, time: realTime, player: { ...f.p, dt: viewDt }, npc: { ...f.n, dt: viewDt }, ball: { x: f.bx, y: f.by, z: f.bz, visible: f.bv }, landing: null, playerServing: false });
    } else {
      const celebrate = stageState === 'end' || stageState === 'ready';
      const pw = endedWinner === 'player';
      const b = model.ball;
      const rb = !celebrate ? model.rebound : null;
      cueFrame.band = rb?.band ?? null;
      cueFrame.arc = model.hasCue('1') && rb ? rb.arc : null;
      cueFrame.apexY = rb?.apexY ?? null;
      cueFrame.trailTint = realTime < trailTintUntil ? trailTintHex : null;
      view.render({
        dt: viewDt,
        time: realTime,
        player: { ...pose(model.player, celebrate ? (pw ? 'win' : 'lose') : null), dt: viewDt },
        npc: { ...pose(model.npc, celebrate ? (pw ? 'lose' : 'win') : null), dt: viewDt },
        ball: b && !celebrate ? { x: b.p.x, y: b.p.y, z: b.p.z, visible: true } : null,
        landing: model.landing,
        playerServing: model.phase === 'toss' || (model.shotIsServe && model.lastHitter === 'player' && model.rally <= 1),
        npcServing: model.shotIsServe && model.lastHitter === 'npc' && model.rally <= 1,
        timing: celebrate ? null : timingCue(),
        bounceCues: celebrate ? undefined : cueFrame,
      });
    }
    updateHud();
  };

  const timingCue = (): { x: number; y: number; z: number; remaining: number } | null => {
    const now = model.t + acc;
    if (model.phase === 'toss' && model.ball) {
      const from = model.tossContactTime;
      const to = model.tossWindowEnd;
      const remaining = now < from ? from - now : now <= to ? 0 : to - now;
      return { x: model.ball.p.x, y: model.ball.p.y, z: model.ball.p.z, remaining };
    }
    const c = model.predictedPlayerContact();
    return c ? { x: c.x, y: c.y, z: c.z, remaining: c.t - now } : null;
  };

  const startReplay = () => {
    replayFrames = history.slice(-240);
    if (replayFrames.length < 30) return;
    replayIdx = 0;
    stageState = 'replay';
    el.classList.add('replaying');
    view?.rig.startReplay();
    setOverlay(h('div.replay-badge', {}, 'REPLAY'));
  };

  const startEnd = () => {
    stageState = 'end';
    stageTime = 0;
    el.classList.remove('playing');
    const won = endedWinner === 'player';
    view?.rig.startOrbit(model.player.x, model.player.z, won, 4);
    playStageVideo(stage ? ASSET.stageEndVideo(stage.stageId, won) : null);
    audio.playMusic(null);
    audio.play(won ? 'bgm_victory' : 'bgm_defeat');
    if (won) {
      audio.play('sfx_crowd_cheer', 1);
      view?.court.excite(1);
      const fx = VISUAL.fx;
      for (let i = 0; i < fx.confettiBursts; i++) {
        const k = fx.confettiBursts > 1 ? i / (fx.confettiBursts - 1) - 0.5 : 0;
        view?.fx.spawn('fx_confetti', model.player.x + k * fx.confettiSpreadM * 2, fx.confettiHeightM, model.player.z + (i % 2) * fx.confettiSpreadM);
      }
    }
    setOverlay(h('div.end-banner', { class: won ? 'win' : 'lose' }, tx('span', won ? 'result.win' : 'result.lose')), btn('skip', 'common.skip', () => showReady()));
    resultPromise = submitResult(won);
  };

  const showReady = () => {
    if (stageState === 'ready') return;
    stageState = 'ready';
    const won = endedWinner === 'player';
    setOverlay(h('div.ready-card', {}, h('div.end-banner.small', { class: won ? 'win' : 'lose' }, tx('span', won ? 'result.win' : 'result.lose')), btn('primary.big', 'result.viewScore', async () => {
      await resultPromise;
      app.go('score');
    })));
  };

  const submitResult = async (won: boolean) => {
    const s = model.stats;
    const breakdown = calculateScore(s, { mode: sel.mode, stageId: stage?.stageId ?? 0, freeLevel: level, won }, RULES, HIT_QUALITY);
    const input = {
      mode: sel.mode,
      stageId: stage?.stageId ?? null,
      npcLevel: level,
      characterId: player.id,
      won,
      pointsFor: model.playerScore,
      pointsAgainst: model.npcScore,
      perfect: s.perfect,
      great: s.great,
      good: s.good,
      miss: s.miss + s.weak,
      maxRally: s.maxRally,
      durationSec: Math.max(1, Math.round(realTime - playStart)),
      score: breakdown.total,
      layout: layout.profile,
      lang: getLang(),
    } as const;
    let submit = null;
    try {
      submit = await backend.submitMatch({ ...input });
      if (app.user) app.user = { ...app.user, mileage: submit.mileage };
      await app.refreshProgress();
    } catch {
      submit = null;
    }
    app.lastOutcome = { input: { ...input }, breakdown, stats: { ...s }, submit, playerScore: model.playerScore, npcScore: model.npcScore };
  };

  // ------------------------------------------------------------ lifecycle
  const onVisibility = () => {
    if (document.hidden) pause.set('hidden', true);
    else if (pause.has('hidden')) {
      pause.set('hidden', false);
      if (stageState === 'play') {
        countdownUntil = realTime + 3;
        setOverlay(h('div.countdown', {}, '3'));
      }
    }
  };
  document.addEventListener('visibilitychange', onVisibility);
  const offPause = pause.onChange((p) => {
    el.classList.toggle('paused', p);
    if (!p) last = performance.now();
  });
  const offHand = settings.onHand(() => view?.setHand(settings.hand));

  requestAnimationFrame(() => {
    if (!disposed) init();
  });

  return {
    el,
    ctx: { home: true, lang: true, myPage: false, logout: false, music: null },
    onHome: async () => {
      if (stageState === 'ready' || stageState === 'end') {
        app.go('title');
        return;
      }
      if (await app.confirm('confirm.home')) app.go('title');
    },
    onLayout: () => {
      view?.setProfile(layout.profile);
      if (stageState === 'play') view?.rig.snap(model.player.x, model.player.z);
    },
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVisibility);
      offPause();
      offHand();
      input?.dispose();
      view?.dispose();
      stopVideo?.();
      pause.clear();
      audio.setPaused(false);
    },
  };
}

const VISUAL_NAME: Record<ThemeId, StringKey> = { day: 'court.day', sunset: 'court.sunset', indoor: 'court.indoor', night: 'court.night' };
