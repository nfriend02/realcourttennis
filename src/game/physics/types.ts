import type { SpinType } from '../../data/gameData';

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export type Hand = 'right' | 'left';
export type StrokeSide = 'forehand' | 'backhand';
export type StrokeHeight = 'high' | 'middle' | 'low';
export type StrokeId = 'bh_high' | 'bh_mid' | 'bh_low' | 'fh_high' | 'fh_mid' | 'fh_low';

export const STROKES: readonly StrokeId[] = ['bh_high', 'bh_mid', 'bh_low', 'fh_high', 'fh_mid', 'fh_low'];

export function strokeSide(id: StrokeId): StrokeSide {
  return id.startsWith('fh') ? 'forehand' : 'backhand';
}

export function strokeHeight(id: StrokeId): StrokeHeight {
  if (id.endsWith('high')) return 'high';
  if (id.endsWith('low')) return 'low';
  return 'middle';
}

export function makeStroke(side: StrokeSide, height: StrokeHeight): StrokeId {
  const s = side === 'forehand' ? 'fh' : 'bh';
  const h = height === 'high' ? 'high' : height === 'low' ? 'low' : 'mid';
  return `${s}_${h}` as StrokeId;
}

/** World-x direction (+1 = right of the player's view) of the racket side for a stroke. */
export function sideDir(side: StrokeSide, hand: Hand): 1 | -1 {
  const fh = hand === 'right' ? 1 : -1;
  return (side === 'forehand' ? fh : -fh) as 1 | -1;
}

/** Stroke side whose racket is on the given world-x side. */
export function sideForScreen(screenSide: 1 | -1, hand: Hand): StrokeSide {
  return sideDir('forehand', hand) === screenSide ? 'forehand' : 'backhand';
}

export type HitQuality = 'perfect' | 'great' | 'good' | 'early' | 'late' | 'miss';
export type ShotResult = 'in' | 'long' | 'net' | 'left' | 'right' | 'whiff';
export type ShotZone = 'A1' | 'A2' | 'A3' | 'B1' | 'B2' | 'B3' | 'C1' | 'C2' | 'C3' | 'none';
export type ReachStage = 'bent' | 'slight' | 'extended';

export interface HitJudgment {
  quality: HitQuality;
  /** Index into hit quality tiers (0 perfect .. 3 weak), -1 for miss. */
  tier: number;
  timingDeltaSec: number;
  x: number;
  y: number;
  zone: ShotZone;
  result: ShotResult;
  spin: SpinType;
  /** Bounce-window hit with the stroke one height band off: 'low' = stroke under the ball (long), 'high' = over it (net). */
  heightError?: 'low' | 'high';
}

export interface BallSample {
  t: number;
  x: number;
  y: number;
  z: number;
  vz: number;
  bounces: number;
}

export interface ContactSample {
  t: number;
  x: number;
  y: number;
  z: number;
  bounced: boolean;
}
