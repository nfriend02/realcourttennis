/** Localization parity check (07 §13.2): same key set, no empty values, matching {params}. */
import { STRINGS, type Lang } from '../src/i18n/i18n';

const base = STRINGS.ko;
const params = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');
let errors = 0;
for (const lang of Object.keys(STRINGS) as Lang[]) {
  const table = STRINGS[lang] as Record<string, string>;
  for (const key of Object.keys(base)) {
    const v = table[key];
    if (v === undefined) { console.error(`[${lang}] missing key ${key}`); errors++; continue; }
    if (!v.trim()) { console.error(`[${lang}] empty value ${key}`); errors++; }
    if (params(v) !== params((base as Record<string, string>)[key])) { console.error(`[${lang}] param mismatch ${key}`); errors++; }
  }
  for (const key of Object.keys(table)) if (!(key in base)) { console.error(`[${lang}] extra key ${key}`); errors++; }
}
if (errors) {
  console.error(`i18n check failed: ${errors} issue(s)`);
  process.exit(1);
}
console.log(`i18n OK: ${Object.keys(base).length} keys x ${Object.keys(STRINGS).length} languages`);
