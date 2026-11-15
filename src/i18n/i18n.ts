import { en } from './strings/en';
import { ja } from './strings/ja';
import { ko, type StringKey } from './strings/ko';

export type Lang = 'ko' | 'en' | 'ja';
export const LANGS: readonly Lang[] = ['ko', 'en', 'ja'];
export const STRINGS: Record<Lang, Record<StringKey, string>> = { ko, en, ja };
export type { StringKey };

let current: Lang = 'ko';
const listeners = new Set<(l: Lang) => void>();

export function getLang(): Lang {
  return current;
}

export function setLang(l: Lang): void {
  if (l === current) return;
  current = l;
  document.documentElement.lang = l;
  listeners.forEach((fn) => fn(l));
}

export function nextLang(): Lang {
  return LANGS[(LANGS.indexOf(current) + 1) % LANGS.length];
}

export function onLangChange(fn: (l: Lang) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Fallback chain: current language → ko → key name. */
export function t(key: StringKey, params?: Record<string, string | number>): string {
  let s: string = STRINGS[current][key] ?? ko[key] ?? key;
  if (params) for (const k in params) s = s.split(`{${k}}`).join(String(params[k]));
  return s;
}

/** Re-applies `data-i18n` / `data-i18n-ph` / `data-i18n-title` / `data-i18n-aria` attributes under `root`. */
export function applyI18n(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n as StringKey, parseParams(el.dataset.i18nParams));
  });
  root.querySelectorAll<HTMLInputElement>('[data-i18n-ph]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPh as StringKey);
  });
  root.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach((el) => {
    el.title = t(el.dataset.i18nTitle as StringKey);
  });
  root.querySelectorAll<HTMLElement>('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria as StringKey));
  });
}

function parseParams(raw: string | undefined): Record<string, string> | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return undefined;
  }
}
