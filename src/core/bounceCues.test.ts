import { describe, expect, it } from 'vitest';
import {
  BOUNCE_CUE_MAX,
  BOUNCE_CUE_ORDER,
  defaultsForPlayLevel,
  parseBounceCues,
  serializeBounceCues,
  toggleBounceCue,
} from './bounceCues';

describe('bounce cues', () => {
  it('Package A defaults match Beginner 2+3, Middle 2+5, Master 5', () => {
    expect(defaultsForPlayLevel('beginner')).toEqual(['2', '3']);
    expect(defaultsForPlayLevel('middle')).toEqual(['2', '5']);
    expect(defaultsForPlayLevel('master')).toEqual(['5']);
  });

  it('UI order is 2, 3, 5, 4, 1', () => {
    expect(BOUNCE_CUE_ORDER).toEqual(['2', '3', '5', '4', '1']);
  });

  it('allows at most two cues', () => {
    let cur = toggleBounceCue([], '2');
    cur = toggleBounceCue(cur, '3');
    expect(cur).toEqual(['2', '3']);
    expect(toggleBounceCue(cur, '1')).toEqual(['2', '3']);
    expect(toggleBounceCue(cur, '2')).toEqual(['3']);
  });

  it('round-trips serialize / parse and keeps UI order', () => {
    const s = serializeBounceCues(['1', '2', '2', '9' as '1']);
    expect(parseBounceCues(s)).toEqual(['2', '1']);
    expect(parseBounceCues('5,4,2')!.length).toBeLessThanOrEqual(BOUNCE_CUE_MAX);
  });
});
