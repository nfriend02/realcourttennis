import { describe, expect, it } from 'vitest';
import { HIT_QUALITY, PHYSICS } from '../../data/gameData';
import { SeededRandom } from '../core/random';
import { applySlow, createBall, createPrediction, findPlaneCrossing, type FlightEvent, predict, stepBall } from './ballFlight';
import { inCourt, inServiceBox, netHeight } from './court';
import { classifyFace, judgeHit, judgeServe, nearestFault, zoneOf, type JudgeContext } from './hitJudge';
import { planPlayerShot, solveLaunch } from './shotPlanner';
import type { HitJudgment } from './types';

const ctx: JudgeContext = { physics: PHYSICS, quality: HIT_QUALITY, hand: 'right', reachMul: 1, windowMul: 1 };

describe('court', () => {
  it('net height is 0.914 at center and 1.07 at the posts', () => {
    expect(netHeight(0, PHYSICS)).toBeCloseTo(0.914);
    expect(netHeight(4.57, PHYSICS)).toBeCloseTo(1.07);
    expect(netHeight(-9, PHYSICS)).toBeCloseTo(1.07);
  });
  it('lines are in', () => {
    expect(inCourt(4.115, 11.885, 'npc', PHYSICS)).toBe(true);
    expect(inCourt(4.3, 5, 'npc', PHYSICS)).toBe(false);
    expect(inCourt(0, -5, 'npc', PHYSICS)).toBe(false);
    expect(inServiceBox(-2, 6.4, 'npc', -1, PHYSICS)).toBe(true);
    expect(inServiceBox(2, 3, 'npc', -1, PHYSICS)).toBe(false);
  });
});

describe('ball flight', () => {
  it('free fall bounces with spin restitution and resets gravity multiplier', () => {
    const b = createBall({ x: 0, y: 2, z: -5 }, { x: 0, y: 0, z: 0 }, 'topspin', PHYSICS);
    let bounces = 0;
    for (let i = 0; i < 240 && bounces === 0; i++) bounces += stepBall(b, 1 / 120, PHYSICS);
    expect(b.bounces).toBe(1);
    expect(b.gMul).toBe(1);
    const vImpact = Math.sqrt(2 * PHYSICS.gravity * 1.3 * (2 - PHYSICS.ballRadiusM));
    expect(b.v.y).toBeGreaterThan(vImpact * 0.75 - 0.6);
  });

  it('low ball hits the net and drops on the hitter side', () => {
    const b = createBall({ x: 0, y: 0.5, z: -6 }, { x: 0, y: 0, z: 20 }, 'flat', PHYSICS);
    let net = false;
    const ev: FlightEvent[] = [{ type: 'bounce', x: 0, y: 0, z: 0, dt: 0, bounces: 0 }, { type: 'bounce', x: 0, y: 0, z: 0, dt: 0, bounces: 0 }];
    for (let i = 0; i < 120; i++) {
      const n = stepBall(b, 1 / 120, PHYSICS, ev);
      for (let k = 0; k < n; k++) if (ev[k].type === 'net') net = true;
    }
    expect(net).toBe(true);
    expect(b.p.z).toBeLessThan(0);
  });

  it('solved launch lands on target and clears the net', () => {
    for (const spin of ['flat', 'topspin', 'slice'] as const) {
      const from = { x: 1, y: 1.0, z: -12 };
      const v = solveLaunch(from, -2, 9, 18, spin, 1, true, PHYSICS);
      const b = createBall(from, v, spin, PHYSICS);
      const pred = predict(b, 0, PHYSICS, createPrediction());
      expect(pred.netHit).toBe(false);
      expect(pred.firstBounce).not.toBeNull();
      expect(pred.firstBounce!.x).toBeCloseTo(-2, 1);
      expect(pred.firstBounce!.z).toBeCloseTo(9, 1);
    }
  });

  it('shot apex stays at or below maxApexM', () => {
    for (const [vh, apexMul, spin] of [[12, 1.25, 'topspin'], [18, 1.25, 'topspin'], [10, 1, 'flat'], [16, 0.85, 'slice']] as const) {
      const from = { x: 0, y: 1.0, z: -12 };
      const v = solveLaunch(from, 1, 10, vh, spin, apexMul, true, PHYSICS);
      const pred = predict(createBall(from, v, spin, PHYSICS), 0, PHYSICS, createPrediction());
      let top = 0;
      for (let i = 0; i < pred.count && pred.samples[i].bounces === 0; i++) top = Math.max(top, pred.samples[i].y);
      expect(top).toBeLessThanOrEqual(PHYSICS.maxApexM + 0.02);
      expect(pred.netHit).toBe(false);
      expect(pred.firstBounce!.z).toBeCloseTo(10, 1);
    }
  });

  it('slowed ball keeps the same path and takes k times longer', () => {
    const from = { x: 1, y: 1.0, z: -12 };
    const v = solveLaunch(from, -2, 9, 18, 'topspin', 1, true, PHYSICS);
    const a = predict(createBall(from, v, 'topspin', PHYSICS), 0, PHYSICS, createPrediction());
    const slow = createBall(from, v, 'topspin', PHYSICS);
    applySlow(slow, 2.5);
    const b = predict(slow, 0, PHYSICS, createPrediction());
    expect(b.firstBounce!.x).toBeCloseTo(a.firstBounce!.x, 1);
    expect(b.firstBounce!.z).toBeCloseTo(a.firstBounce!.z, 1);
    expect(b.firstBounce!.t).toBeCloseTo(a.firstBounce!.t * 2.5, 1);
    const ca = findPlaneCrossing(a, 12, 1, 0)!;
    const cb = findPlaneCrossing(b, 12, 1, 0)!;
    expect(cb.t).toBeCloseTo(ca.t * 2.5, 1);
    expect(cb.y).toBeCloseTo(ca.y, 1);
  });

  it('plane crossing interpolates contact', () => {
    const from = { x: 0, y: 1.2, z: 10 };
    const b = createBall(from, solveLaunch(from, 0, -8, 18, 'flat', 1, true, PHYSICS), 'flat', PHYSICS);
    const pred = predict(b, 0, PHYSICS, createPrediction());
    const c = findPlaneCrossing(pred, -12, -1, 0);
    expect(c).not.toBeNull();
    expect(c!.t).toBeGreaterThan(1);
    expect(c!.z).toBe(-12);
  });
});

describe('racket face judgment', () => {
  it('outer ring precedence: y before x', () => {
    expect(classifyFace(0.7, 0.7)).toBe('long');
    expect(classifyFace(-0.7, -0.6)).toBe('net');
    expect(classifyFace(-0.6, 0.2)).toBe('left');
    expect(classifyFace(0.6, 0.0)).toBe('right');
    expect(classifyFace(0.4, -0.4)).toBe('in');
  });
  it('3x3 zones', () => {
    expect(zoneOf(0, 0)).toBe('B2');
    expect(zoneOf(-0.4, 0.4)).toBe('A1');
    expect(zoneOf(0.4, -0.4)).toBe('C3');
    expect(zoneOf(0.6, 0)).toBe('none');
    expect(nearestFault(0.2, 0.6)).toBe('long');
  });

  const contact = { t: 1, x: 0.55 + 0.0, y: 1.025, z: -12.6, bounced: true };
  it('perfect timing in the band center is perfect & in', () => {
    const j = judgeHit({ stroke: 'fh_mid', impactTime: 1.0, playerX: 0 }, contact, ctx, new SeededRandom(1));
    expect(j.quality).toBe('perfect');
    expect(j.result).toBe('in');
    expect(j.zone).toBe('B2');
    expect(j.spin).toBe('flat');
  });
  it('timing tiers and early/late sign', () => {
    const r = new SeededRandom(1);
    expect(judgeHit({ stroke: 'fh_mid', impactTime: 1.05, playerX: 0 }, contact, ctx, r).quality).toBe('great');
    expect(judgeHit({ stroke: 'fh_mid', impactTime: 0.9, playerX: 0 }, contact, ctx, r).quality).toBe('good');
    expect(judgeHit({ stroke: 'fh_mid', impactTime: 0.85, playerX: 0 }, contact, ctx, r).quality).toBe('early');
    expect(judgeHit({ stroke: 'fh_mid', impactTime: 1.15, playerX: 0 }, contact, ctx, r).quality).toBe('late');
    expect(judgeHit({ stroke: 'fh_mid', impactTime: 1.2, playerX: 0 }, contact, ctx, r).result).toBe('whiff');
  });
  it('wrong height band faults or misses', () => {
    const r = new SeededRandom(1);
    expect(judgeHit({ stroke: 'fh_high', impactTime: 1, playerX: 0 }, contact, ctx, r).result).toBe('net');
    expect(judgeHit({ stroke: 'fh_low', impactTime: 1, playerX: 0 }, { ...contact, y: 2.2 }, ctx, r).result).toBe('whiff');
  });
  it('wrong side ball is a miss', () => {
    const j = judgeHit({ stroke: 'bh_mid', impactTime: 1, playerX: 0 }, contact, ctx, new SeededRandom(1));
    expect(j.result).toBe('whiff');
  });
  it('serve timing', () => {
    expect(judgeServe(0, 'right', ctx).result).toBe('in');
    expect(judgeServe(-0.15, 'right', ctx).quality).toBe('early');
    expect(judgeServe(0.3, 'right', ctx).quality).toBe('miss');
  });
});

describe('shot planner', () => {
  it('in shots always land inside the NPC court', () => {
    const rng = new SeededRandom(7);
    for (let i = 0; i < 300; i++) {
      const x = rng.range(-0.5, 0.5);
      const y = rng.range(-0.5, 0.5);
      const j: HitJudgment = { quality: 'great', tier: 1, timingDeltaSec: 0, x, y, zone: zoneOf(x, y), result: 'in', spin: y > 0.166 ? 'topspin' : y < -0.166 ? 'slice' : 'flat' };
      const from = { x: rng.range(-4, 4), y: rng.range(0.4, 2.0), z: rng.range(-15, -3) };
      const plan = planPlayerShot({ judgment: j, from, powerStat: 92, controlStat: 78, chargeMul: 1.1, speedMul: 1 }, PHYSICS, HIT_QUALITY, rng);
      const pred = predict(createBall(from, plan.velocity, plan.spin, PHYSICS), 0, PHYSICS, createPrediction());
      expect(pred.netHit).toBe(false);
      expect(inCourt(pred.firstBounce!.x, pred.firstBounce!.z, 'npc', PHYSICS)).toBe(true);
    }
  });
  it('fault shots land out or in the net', () => {
    const rng = new SeededRandom(3);
    const from = { x: 0, y: 1, z: -12 };
    const mk = (result: HitJudgment['result'], x: number, y: number): HitJudgment => ({ quality: 'early', tier: 3, timingDeltaSec: -0.15, x, y, zone: 'none', result, spin: 'flat' });
    const run = (j: HitJudgment) => {
      const plan = planPlayerShot({ judgment: j, from, powerStat: 85, controlStat: 85, chargeMul: 1, speedMul: 1 }, PHYSICS, HIT_QUALITY, rng);
      return predict(createBall(from, plan.velocity, plan.spin, PHYSICS), 0, PHYSICS, createPrediction());
    };
    expect(run(mk('net', 0, -0.7)).netHit).toBe(true);
    const long = run(mk('long', 0, 0.7));
    expect(inCourt(long.firstBounce!.x, long.firstBounce!.z, 'npc', PHYSICS)).toBe(false);
    const left = run(mk('left', -0.7, 0));
    expect(left.firstBounce!.x).toBeLessThan(-4.115);
  });
});
