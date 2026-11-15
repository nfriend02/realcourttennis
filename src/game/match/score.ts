import type { HitQualityConfig, RulesConfig } from '../../data/gameData';
import type { HitQuality } from '../physics/types';

export interface MatchStats {
  pointsWon: number;
  pointsLost: number;
  perfect: number;
  great: number;
  good: number;
  weak: number;
  miss: number;
  winners: number;
  aces: number;
  npcErrors: number;
  faults: number;
  doubleFaults: number;
  maxRally: number;
  totalHits: number;
}

export function emptyStats(): MatchStats {
  return { pointsWon: 0, pointsLost: 0, perfect: 0, great: 0, good: 0, weak: 0, miss: 0, winners: 0, aces: 0, npcErrors: 0, faults: 0, doubleFaults: 0, maxRally: 0, totalHits: 0 };
}

export function recordQuality(s: MatchStats, q: HitQuality): void {
  if (q === 'perfect') s.perfect++;
  else if (q === 'great') s.great++;
  else if (q === 'good') s.good++;
  else if (q === 'early' || q === 'late') s.weak++;
  else s.miss++;
}

export interface ScoreContext {
  mode: 'stage' | 'free';
  stageId: number;
  freeLevel: number;
  won: boolean;
}

export interface ScoreBreakdown {
  points: number;
  quality: number;
  winners: number;
  aces: number;
  rally: number;
  matchWin: number;
  shutout: number;
  multiplier: number;
  total: number;
}

export function calculateScore(s: MatchStats, ctx: ScoreContext, rules: RulesConfig, hq: HitQualityConfig): ScoreBreakdown {
  const sc = rules.score;
  const bonus = (q: string) => hq.tiers.find((t) => t.quality === q)?.scoreBonus ?? 0;
  const points = s.pointsWon * sc.pointWon;
  const quality = s.perfect * bonus('perfect') + s.great * bonus('great') + s.good * bonus('good');
  const winners = s.winners * sc.winner;
  const aces = s.aces * sc.ace;
  const rally = s.maxRally * sc.rallyPerHit;
  const stageTerm = ctx.mode === 'stage' ? ctx.stageId : 0;
  const matchWin = ctx.won ? sc.matchWinBase + stageTerm * sc.matchWinPerStage : 0;
  const shutout = ctx.won && s.pointsLost === 0 ? sc.shutoutBonus : 0;
  const multiplier = ctx.mode === 'free' ? sc.freeLevelMul[Math.min(Math.max(ctx.freeLevel, 1), sc.freeLevelMul.length) - 1] : 1;
  const total = Math.round((points + quality + winners + aces + rally + matchWin + shutout) * multiplier);
  return { points, quality, winners, aces, rally, matchWin, shutout, multiplier, total };
}
