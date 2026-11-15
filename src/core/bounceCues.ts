import type { StrokeHeight } from '../game/physics/types';

/**
 * Bounce-height visual cues (research packages A–H).
 * UI order is fixed: landing ring → button hint → bounce FX → shadow gauge → rebound arc.
 */
export type BounceCueId = '2' | '3' | '5' | '4' | '1';

/** Setup-screen button order. */
export const BOUNCE_CUE_ORDER: readonly BounceCueId[] = ['2', '3', '5', '4', '1'];

export const BOUNCE_CUE_MAX = 2;

/**
 * Package A defaults by Play Level:
 * Beginner 2+3, Middle 2+5, Master 5.
 */
export const PACKAGE_A_DEFAULTS = {
  beginner: ['2', '3'],
  middle: ['2', '5'],
  master: ['5'],
} as const satisfies Record<string, readonly BounceCueId[]>;

export function defaultsForPlayLevel(level: keyof typeof PACKAGE_A_DEFAULTS): BounceCueId[] {
  return [...PACKAGE_A_DEFAULTS[level]];
}

export function parseBounceCues(raw: string | null): BounceCueId[] | null {
  if (!raw) return null;
  const out: BounceCueId[] = [];
  for (const part of raw.split(',')) {
    const id = part.trim() as BounceCueId;
    if (!BOUNCE_CUE_ORDER.includes(id) || out.includes(id)) continue;
    out.push(id);
  }
  out.sort((a, b) => BOUNCE_CUE_ORDER.indexOf(a) - BOUNCE_CUE_ORDER.indexOf(b));
  return out.length ? out.slice(0, BOUNCE_CUE_MAX) : null;
}

export function serializeBounceCues(cues: readonly BounceCueId[]): string {
  const uniq = cues.filter((id, i, a) => BOUNCE_CUE_ORDER.includes(id) && a.indexOf(id) === i);
  uniq.sort((a, b) => BOUNCE_CUE_ORDER.indexOf(a) - BOUNCE_CUE_ORDER.indexOf(b));
  return uniq.slice(0, BOUNCE_CUE_MAX).join(',');
}

/** Keep UI order when toggling; refuse a third selection. */
export function toggleBounceCue(current: readonly BounceCueId[], id: BounceCueId): BounceCueId[] {
  if (current.includes(id)) return current.filter((c) => c !== id);
  if (current.length >= BOUNCE_CUE_MAX) return [...current];
  const next = [...current, id];
  next.sort((a, b) => BOUNCE_CUE_ORDER.indexOf(a) - BOUNCE_CUE_ORDER.indexOf(b));
  return next;
}

export function hasBounceCue(cues: readonly BounceCueId[], id: BounceCueId): boolean {
  return cues.includes(id);
}

export type ReboundBand = StrokeHeight;

export const BAND_TO_H: Record<ReboundBand, 'high' | 'mid' | 'low'> = {
  high: 'high',
  middle: 'mid',
  low: 'low',
};
