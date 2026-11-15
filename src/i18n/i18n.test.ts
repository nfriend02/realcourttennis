import { describe, expect, it } from 'vitest';
import { detectLayout } from '../core/layout';
import { STRINGS } from './i18n';

const params = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');

describe('localization parity', () => {
  const base = STRINGS.ko as Record<string, string>;
  for (const lang of ['en', 'ja'] as const) {
    it(`${lang} has the same keys, no empty values and matching params`, () => {
      const table = STRINGS[lang] as Record<string, string>;
      expect(Object.keys(table).sort()).toEqual(Object.keys(base).sort());
      for (const k of Object.keys(base)) {
        expect(table[k].trim().length, k).toBeGreaterThan(0);
        expect(params(table[k]), k).toBe(params(base[k]));
      }
    });
  }
});

describe('layout detection', () => {
  it('portrait / mobile landscape / desktop', () => {
    expect(detectLayout(390, 844, true)).toBe('mobile-portrait');
    expect(detectLayout(844, 390, true)).toBe('mobile-landscape');
    expect(detectLayout(1920, 1080, false)).toBe('desktop');
    expect(detectLayout(1366, 1024, true)).toBe('desktop');
  });
});
