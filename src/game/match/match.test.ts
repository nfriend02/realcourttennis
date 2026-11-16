import { describe, expect, it } from 'vitest';
import { aiLevel, CHARACTERS, HIT_QUALITY, PHYSICS, RULES } from '../../data/gameData';
import { npcComebackMul } from '../ai/npcBrain';
import { SeededRandom } from '../core/random';
import { findPlaneCrossing } from '../physics/ballFlight';
import { type StrokeId, sideDir, strokeHeight, strokeSide } from '../physics/types';
import { PlayerBot } from './bot';
import { MatchModel, type PlayLevel } from './matchModel';
import { heightBandOf } from './positioning';
import { calculateScore, emptyStats } from './score';

function runMatch(level: number, sigma: number, acc: number, seed: number) {
  const m = new MatchModel({ player: CHARACTERS[0], npc: CHARACTERS[1], hand: 'right', level: aiLevel(level), ballSpeedMul: 1, seed });
  const bot = new PlayerBot({ timingSigmaSec: sigma, strokeAccuracy: acc }, new SeededRandom(seed * 31 + 1));
  const dt = 1 / 120;
  for (let i = 0; i < 120 * 600 && !m.matchOver; i++) {
    bot.update(m);
    m.tick(dt);
  }
  return m;
}

describe('match model', () => {
  it('finishes a match with first to 3 points', () => {
    const m = runMatch(1, 0.04, 0.95, 1);
    expect(m.matchOver).toBe(true);
    expect(Math.max(m.playerScore, m.npcScore)).toBe(RULES.match.pointsToWin);
  });

  it('is deterministic with the same seed', () => {
    const a = runMatch(3, 0.07, 0.85, 42);
    const b = runMatch(3, 0.07, 0.85, 42);
    expect(a.playerScore).toBe(b.playerScore);
    expect(a.npcScore).toBe(b.npcScore);
    expect(a.t).toBeCloseTo(b.t, 9);
  });

  it('player serve without release is a fault, twice is a double fault', () => {
    const m = new MatchModel({ player: CHARACTERS[0], npc: CHARACTERS[1], hand: 'right', level: aiLevel(1), ballSpeedMul: 1, seed: 5 });
    const faults: number[] = [];
    let reason = '';
    for (let k = 0; k < 2; k++) {
      m.pressStroke('fh_high', m.t);
      for (let i = 0; i < 600; i++) {
        m.tick(1 / 120);
        for (const e of m.drainEvents()) {
          if (e.type === 'fault') faults.push(e.attempt);
          if (e.type === 'point_end') reason = e.reason;
        }
      }
    }
    expect(faults).toEqual([1, 2]);
    expect(reason).toBe('double_fault');
    expect(m.npcScore).toBe(1);
  });

  it('serve toss peaks at 1 s and any release between 1 s and 2 s is a perfect serve', () => {
    for (const relSec of [1.0, 1.5, 2.0]) {
      const m = new MatchModel({ player: CHARACTERS[0], npc: CHARACTERS[1], hand: 'right', level: aiLevel(1), ballSpeedMul: 1, seed: 7 });
      const stroke = relSec === 1.5 ? 'bh_low' : 'fh_high';
      const t0 = m.t;
      m.pressStroke(stroke, t0);
      let apexY = 0;
      let apexT = 0;
      while (m.t - t0 < relSec - 1e-9) {
        m.tick(1 / 120);
        const y = m.ball?.p.y ?? 0;
        if (y > apexY) {
          apexY = y;
          apexT = m.t - t0;
        }
      }
      expect(apexT).toBeCloseTo(1.0, 1);
      m.releaseStroke(stroke, m.t);
      expect(m.lastJudgment?.quality).toBe('perfect');
      expect(m.lastJudgment?.result).toBe('in');
    }
  });

  it('ball speed setting sets the flight time from the hit to the receiver racket', () => {
    for (const sec of [3, 5]) {
      const m = new MatchModel({ player: CHARACTERS[0], npc: CHARACTERS[1], hand: 'right', level: aiLevel(1), ballSpeedMul: 1, seed: 9, flightSec: { player: sec, npc: 2 } });
      const t0 = m.t;
      m.pressStroke('fh_high', t0);
      while (m.t - t0 < 1.5) m.tick(1 / 120);
      m.releaseStroke('fh_high', m.t);
      m.tick(1 / 120);
      expect(m.lastHitter).toBe('player');
      const hitT = m.pred.samples[0].t;
      const c = findPlaneCrossing(m.pred, m.npc.z - PHYSICS.contactAheadM, 1, hitT);
      expect(c).not.toBeNull();
      expect(c!.t - hitT).toBeCloseTo(sec, 1);
    }
  });

  it('pad / WASD intent moves the player directly (lateral only while waiting to serve)', () => {
    const m = new MatchModel({ player: CHARACTERS[0], npc: CHARACTERS[1], hand: 'right', level: aiLevel(1), ballSpeedMul: 1, seed: 3 });
    expect(m.phase).toBe('serve_wait');
    const x0 = m.player.x;
    const z0 = m.player.z;
    m.setIntent(1, 1);
    for (let i = 0; i < 60; i++) m.tick(1 / 120);
    expect(m.player.x).toBeGreaterThan(x0 + 0.3);
    expect(m.player.z).toBeCloseTo(z0, 5);
    m.setIntent(0, 0);
    for (let i = 0; i < 90; i++) m.tick(1 / 120);
    const x1 = m.player.x;
    for (let i = 0; i < 60; i++) m.tick(1 / 120);
    expect(m.player.x).toBeCloseTo(x1, 3);
  });

  it('a held stroke never steers the planned side (the button must match the incoming ball)', () => {
    const m = new MatchModel({ player: CHARACTERS[0], npc: CHARACTERS[1], hand: 'right', level: aiLevel(1), ballSpeedMul: 1, seed: 11, flightSec: { player: 1, npc: 3 } });
    const bot = new PlayerBot({ timingSigmaSec: 0, strokeAccuracy: 1 }, new SeededRandom(2));
    for (let i = 0; i < 120 * 20 && !m.awaitingPlayerHit; i++) {
      bot.update(m);
      m.tick(1 / 120);
    }
    expect(m.awaitingPlayerHit).toBe(true);
    for (let i = 0; i < 6; i++) m.tick(1 / 120);
    const side = m.playerPlan!.sideScreen;
    m.pressStroke(side > 0 ? 'bh_mid' : 'fh_mid', m.t);
    for (let i = 0; i < 6; i++) m.tick(1 / 120);
    expect(m.playerPlan!.sideScreen).toBe(side);
  });

  it('recommendedStroke height matches the contact-plane band (not the rebound apex)', () => {
    const seeds = rallySeeds(4);
    expect(seeds.length).toBeGreaterThan(0);
    let compared = 0;
    for (const seed of seeds) {
      const m = toNpcReturn(seed)!;
      for (let i = 0; i < 90 && m.awaitingPlayerHit; i++) {
        m.tick(1 / 120);
        const contact = m.predictedPlayerContact();
        const rec = m.recommendedStroke;
        if (!contact || !rec) continue;
        expect(strokeHeight(rec)).toBe(heightBandOf(contact.y, PHYSICS));
        compared++;
      }
    }
    expect(compared).toBeGreaterThan(0);
  });

  it('pre-selected stroke auto-hits: matching side + height = perfect, one band off = long / net, else whiff', () => {
    // Stops 0.3 s after the NPC return is struck, long before it reaches the player.
    const atNpcShot = (seed: number) => {
      const m = new MatchModel({ player: CHARACTERS[0], npc: CHARACTERS[1], hand: 'right', level: aiLevel(1), ballSpeedMul: 1, seed, flightSec: { player: 2, npc: 3 } });
      const bot = new PlayerBot({ timingSigmaSec: 0, strokeAccuracy: 1 }, new SeededRandom(seed));
      let since = -1;
      for (let i = 0; i < 120 * 30; i++) {
        if (m.awaitingPlayerHit && m.lastHitter === 'npc' && !m.shotIsServe) {
          if (since < 0) since = m.t;
          if (m.t >= since + 0.3) break;
        } else bot.update(m);
        m.tick(1 / 120);
      }
      const fb = m.pred.firstBounce;
      const c = PHYSICS.court;
      const landsIn = !!fb && fb.z < 0 && fb.z > -c.halfLength && Math.abs(fb.x) < c.halfWidth;
      return m.awaitingPlayerHit && m.playerPlan && landsIn ? m : null;
    };
    // Clicks (press + release) one stroke, then plays until the auto hit; returns the judgment and the hinted stroke.
    const click = (seed: number, pick: (rec: StrokeId) => StrokeId) => {
      const m = atNpcShot(seed)!;
      let rec = m.recommendedStroke!;
      const stroke = pick(rec);
      m.pressStroke(stroke, m.t);
      m.releaseStroke(stroke, m.t);
      expect(m.player.state).toBe('backswing');
      const before = m.lastJudgment;
      let swingStart = -1;
      for (let i = 0; i < 120 * 6 && m.lastJudgment === before; i++) {
        rec = m.recommendedStroke ?? rec;
        m.tick(1 / 120);
        if (swingStart < 0 && m.player.state === 'swing') swingStart = m.t;
      }
      return { j: m.lastJudgment!, rec, stroke, swingStart, hitT: m.t };
    };
    const seeds: number[] = [];
    for (let s = 1; s < 40 && seeds.length < 4; s++) if (atNpcShot(s)) seeds.push(s);
    expect(seeds.length).toBeGreaterThan(0);
    const rank = { low: 0, middle: 1, high: 2 } as const;
    const H = ['low', 'mid', 'high'] as const;
    let perfect = 0;
    for (const seed of seeds) {
      const exact = click(seed, (rec) => rec);
      if (exact.j.quality === 'perfect') perfect++;
      expect(exact.hitT - exact.swingStart).toBeCloseTo(PHYSICS.swingLeadSec, 1);
      for (const side of ['fh', 'bh'] as const) {
        for (const hgt of H) {
          const { j, rec } = click(seed, () => `${side}_${hgt}`);
          const d = rank[strokeHeight(`${side}_${hgt}`)] - rank[strokeHeight(rec)];
          if (strokeSide(rec) !== strokeSide(`${side}_${hgt}`) || Math.abs(d) >= 2) expect(j.result).toBe('whiff');
          else if (d === 0) expect(j).toMatchObject({ quality: 'perfect', result: 'in' });
          else if (d < 0) expect(j).toMatchObject({ result: 'long', heightError: 'low' });
          else expect(j).toMatchObject({ result: 'net', heightError: 'high' });
        }
      }
    }
    expect(perfect).toBe(seeds.length);
  });

  // Plays until the NPC rally return is in flight toward the player and lands in.
  const toNpcReturn = (seed: number, playLevel: PlayLevel = 'beginner') => {
    const m = new MatchModel({ player: CHARACTERS[0], npc: CHARACTERS[1], hand: 'right', level: aiLevel(1), ballSpeedMul: 1, seed, flightSec: { player: 2, npc: 3 }, playLevel });
    const bot = new PlayerBot({ timingSigmaSec: 0, strokeAccuracy: 1 }, new SeededRandom(seed));
    for (let i = 0; i < 120 * 30; i++) {
      if (m.awaitingPlayerHit && m.lastHitter === 'npc' && !m.shotIsServe) break;
      bot.update(m);
      m.tick(1 / 120);
    }
    m.cancelStroke();
    m.setIntent(0, 0);
    const fb = m.pred.firstBounce;
    const c = PHYSICS.court;
    const landsIn = !!fb && fb.z < 0 && fb.z > -c.halfLength && Math.abs(fb.x) < c.halfWidth;
    return m.awaitingPlayerHit && landsIn ? m : null;
  };
  const rallySeeds = (n: number) => {
    const seeds: number[] = [];
    for (let s = 1; s < 40 && seeds.length < n; s++) if (toNpcReturn(s)) seeds.push(s);
    return seeds;
  };

  it('the ready pose follows the clicked stroke side, also while the NPC return is struck', () => {
    const m = toNpcReturn(rallySeeds(1)[0])!;
    for (const stroke of ['bh_mid', 'fh_low', 'bh_high', 'fh_mid'] as const) {
      m.pressStroke(stroke, m.t);
      m.tick(1 / 120);
      expect(m.player.state).toBe('backswing');
      expect(m.player.swingDir).toBe(sideDir(strokeSide(stroke), 'right'));
      expect(m.player.stroke).toBe(stroke);
    }
  });

  it('a low stroke released after the bounce on the incoming side always hits; matching height = perfect', () => {
    const seeds = rallySeeds(4);
    expect(seeds.length).toBeGreaterThan(0);
    let hits = 0;
    for (const seed of seeds) {
      for (const lag of [0.05, 0.4]) {
        const m = toNpcReturn(seed)!;
        while (m.awaitingPlayerHit && !(m.ball && m.ball.bounces >= 1)) m.tick(1 / 120);
        for (let i = 0; i < lag * 120 && m.awaitingPlayerHit; i++) m.tick(1 / 120);
        if (!m.awaitingPlayerHit) continue;
        const side = m.playerPlan ? m.playerPlan.sideScreen : 1;
        const stroke: StrokeId = side === sideDir('forehand', 'right') ? 'fh_low' : 'bh_low';
        const before = m.lastJudgment;
        m.pressStroke(stroke, m.t);
        m.releaseStroke(stroke, m.t);
        for (let i = 0; i < 120 * 3 && m.lastJudgment === before; i++) m.tick(1 / 120);
        const j = m.lastJudgment!;
        expect(j.result).toBe('in');
        expect(['perfect', HIT_QUALITY.tiers[PHYSICS.bounceWindow.lowSureTier].quality]).toContain(j.quality);
        hits++;
      }
    }
    expect(hits).toBeGreaterThanOrEqual(seeds.length);
  });

  it('beginner auto-moves to the ball; middle / master stay put without pad input', () => {
    const seed = rallySeeds(1)[0];
    const moved = (lv: PlayLevel) => {
      const m = toNpcReturn(seed, lv)!;
      const x0 = m.player.x;
      const z0 = m.player.z;
      for (let i = 0; i < 60; i++) m.tick(1 / 120);
      return Math.hypot(m.player.x - x0, m.player.z - z0);
    };
    expect(moved('middle')).toBeLessThan(0.05);
    expect(moved('master')).toBeLessThan(0.05);
    const m = toNpcReturn(seed, 'master')!;
    m.setIntent(1, 0);
    for (let i = 0; i < 30; i++) m.tick(1 / 120);
    expect(m.player.vx).toBeGreaterThan(0.5);
  });

  it('middle turns toward the incoming ball; master turns only with the pad', () => {
    for (const seed of rallySeeds(4)) {
      const mid = toNpcReturn(seed, 'middle')!;
      for (let i = 0; i < 12; i++) mid.tick(1 / 120);
      if (mid.playerPlan) expect(mid.player.swingDir).toBe(mid.playerPlan.sideScreen);
      const mas = toNpcReturn(seed, 'master')!;
      const dir0 = mas.player.swingDir;
      for (let i = 0; i < 12; i++) mas.tick(1 / 120);
      expect(mas.player.swingDir).toBe(dir0);
      mas.setIntent(-dir0, 0);
      mas.tick(1 / 120);
      expect(mas.player.swingDir).toBe(-dir0);
    }
  });

  it('skilled bot beats level 1 most of the time', () => {
    let wins = 0;
    for (let s = 0; s < 30; s++) if (runMatch(1, 0.04, 0.95, 100 + s).winner === 'player') wins++;
    expect(wins).toBeGreaterThanOrEqual(24);
  });
});

describe('character passives & comeback', () => {
  it('applies David / Susan / Wolfson passives from data', () => {
    const david = CHARACTERS.find((c) => c.id === 'CHAR_01')!;
    const susan = CHARACTERS.find((c) => c.id === 'CHAR_02')!;
    const wolf = CHARACTERS.find((c) => c.id === 'CHAR_03')!;
    expect(david.passives.perfectWindowMul).toBeCloseTo(1.1);
    expect(susan.passives.moveSpeedMul).toBeCloseTo(1.15);
    expect(wolf.passives.shotSpeedMul).toBeCloseTo(1.1);
    const mSusan = new MatchModel({ player: susan, npc: david, hand: 'right', level: aiLevel(1), ballSpeedMul: 1, seed: 1 });
    const mDavid = new MatchModel({ player: david, npc: susan, hand: 'right', level: aiLevel(1), ballSpeedMul: 1, seed: 1 });
    expect(mSusan.player.maxSpeed).toBeGreaterThan(mDavid.player.maxSpeed);
  });

  it('lowers NPC return chance after long rallies', () => {
    expect(npcComebackMul(4, RULES)).toBe(1);
    expect(npcComebackMul(5, RULES)).toBeCloseTo(0.975);
    expect(npcComebackMul(40, RULES)).toBeCloseTo(RULES.comeback.returnChanceFloorMul);
  });
});

describe('score', () => {
  it('computes stage win score with shutout', () => {
    const s = emptyStats();
    s.pointsWon = 3;
    s.perfect = 2;
    s.winners = 1;
    s.maxRally = 4;
    const r = calculateScore(s, { mode: 'stage', stageId: 2, freeLevel: 1, won: true }, RULES, HIT_QUALITY);
    expect(r.total).toBe(3000 + 600 + 200 + 80 + 3000 + 1000 + 1500);
  });
  it('applies the free match multiplier', () => {
    const s = emptyStats();
    s.pointsWon = 1;
    s.pointsLost = 3;
    const r = calculateScore(s, { mode: 'free', stageId: 0, freeLevel: 5, won: false }, RULES, HIT_QUALITY);
    expect(r.total).toBe(1400);
  });
});
