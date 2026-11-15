import { audio } from '../audio/audioManager';
import { type StringKey, t } from '../i18n/i18n';

type Attrs = Record<string, string | number | boolean | undefined | null | ((e: Event) => void)>;
type Child = Node | string | null | undefined | false;

/** Tiny hyperscript helper: h('button.primary', { onclick }, 'text'). */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K | `${K}.${string}` | `${K}#${string}`, attrs: Attrs = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
  const [base, ...classes] = tag.split('.');
  const [name, id] = base.split('#');
  const el = document.createElement(name as K);
  if (id) el.id = id;
  if (classes.length) el.className = classes.join(' ');
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v as EventListener);
    else if (k === 'class') el.className += ` ${String(v)}`;
    else if (k === 'html') el.innerHTML = String(v);
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, String(v));
  }
  for (const c of children) if (c !== null && c !== undefined && c !== false) el.append(c);
  return el;
}

/** Element whose text follows the current language (re-applied by applyI18n). */
export function tx<K extends keyof HTMLElementTagNameMap>(tag: K | `${K}.${string}`, key: StringKey, params?: Record<string, string | number>, attrs: Attrs = {}): HTMLElementTagNameMap[K] {
  const el = h(tag, { ...attrs, 'data-i18n': key, 'data-i18n-params': params ? JSON.stringify(params) : undefined });
  el.textContent = t(key, params);
  return el;
}

/** Button with tap feedback sound + i18n label. */
export function btn(cls: string, key: StringKey | null, onClick: () => void, extra: Attrs = {}, ...children: Child[]): HTMLButtonElement {
  const b = h(`button.${cls}` as 'button', {
    type: 'button',
    ...extra,
    onclick: (e: Event) => {
      e.preventDefault();
      audio.play(cls.includes('primary') ? 'ui_confirm' : 'ui_tap');
      onClick();
    },
  });
  if (key) b.append(tx('span', key));
  for (const c of children) if (c) b.append(c);
  return b;
}

export function icon(name: keyof typeof ICONS): SVGElement {
  const wrap = document.createElement('span');
  wrap.innerHTML = ICONS[name];
  const svg = wrap.firstElementChild as SVGElement;
  svg.classList.add('ico');
  svg.setAttribute('aria-hidden', 'true');
  return svg;
}

const S = (d: string) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

export const ICONS = {
  soundOn: S('<path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>'),
  soundOff: S('<path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/>'),
  home: S('<path d="M3 11 12 3l9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>'),
  user: S('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  logout: S('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>'),
  lock: S('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
  check: S('<path d="M20 6 9 17l-5-5"/>'),
  help: S('<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>'),
  close: S('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  up: S('<path d="m6 15 6-6 6 6"/>'),
  mid: S('<circle cx="12" cy="12" r="3.5" fill="currentColor"/>'),
  down: S('<path d="m6 9 6 6 6-6"/>'),
  google: '<svg viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.6 2.3 2.3 6.6 2.3 12S6.6 21.7 12 21.7c5.6 0 9.3-3.9 9.3-9.5 0-.6-.1-1.1-.2-1.6H12z"/></svg>',
  apple: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.7-1-2.7-4.1zM13.9 5c.7-.9 1.2-2 1.1-3.2-1 0-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.1 1.1.1 2.3-.6 3-1.5z"/></svg>',
} as const;

export function clear(el: HTMLElement): void {
  while (el.firstChild) el.removeChild(el.firstChild);
}
