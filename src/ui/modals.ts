import { audio } from '../audio/audioManager';
import { backend } from '../backend';
import { AuthError } from '../backend/types';
import { layout } from '../core/layout';
import { settings } from '../core/settings';
import { MAX_STAGE } from '../data/gameData';
import type { Hand } from '../game/physics/types';
import { type StringKey, t } from '../i18n/i18n';
import type { App } from './app';
import { ASSET } from './assets';
import { btn, h, icon, tx } from './dom';

/** MyPage modal (07 §7.2): account, handedness (MyPage only), mileage, progress, password, delete. */
export function openMyPage(app: App): void {
  const u = app.user;
  if (!u) return;
  const body = h('div.mypage');
  let close: () => void = () => undefined;
  const head = h('div.mypage-head');
  head.append(tx('h2', 'sys.myPage'));
  const homeWrap = h('div.auth-home');
  const homeBtn = h('button.auth-home-btn', {
    type: 'button',
    'data-i18n-aria': 'sys.home',
    'aria-label': t('sys.home'),
    onclick: () => {
      close();
      app.home();
    },
  });
  homeBtn.append(icon('home'));
  homeWrap.append(homeBtn, tx('div.auth-home-tip', 'sys.homeTip'));
  head.append(homeWrap);
  body.append(head);

  const info = h('dl.kv');
  const row = (k: StringKey, v: string | HTMLElement) => {
    info.append(tx('dt', k), h('dd', {}, v));
  };
  row('mypage.account', tx('span', `mypage.type.${u.accountType}` as StringKey));
  row('mypage.nickname', u.username);
  if (u.loginId) row('mypage.id', u.loginId);
  if (u.accountType === 'email' || u.accountType === 'phone') {
    row('mypage.password', tx('span.pw-mask', 'mypage.passwordMasked'));
  }
  row('mypage.mileage', u.mileage.toLocaleString());
  const cleared = app.progress.filter((p) => p.cleared).length;
  row('mypage.progress', `${cleared} / ${MAX_STAGE}`);
  const best = Math.max(0, ...app.progress.map((p) => p.bestScore));
  row('mypage.best', best.toLocaleString());
  body.append(info);

  // handedness
  body.append(tx('h3', 'mypage.handedness'));
  const seg = h('div.segmented');
  const mk = (hand: Hand, key: StringKey) => {
    const b = btn(`seg${settings.hand === hand ? '.active' : ''}`, key, async () => {
      settings.hand = hand;
      seg.querySelectorAll('button').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      try {
        app.user = await backend.updateProfile({ handedness: hand });
      } catch {
        /* keep local value; synced next time */
      }
    });
    return b;
  };
  seg.append(mk('right', 'mypage.rightHanded'), mk('left', 'mypage.leftHanded'));
  body.append(seg);

  // password change (Firebase Auth never returns the plaintext password — show mask + editor)
  if (u.accountType === 'email' || u.accountType === 'phone') {
    body.append(tx('h3', 'mypage.changePassword'), tx('p.pw-hint', 'mypage.passwordHint'));
    const pw = h('input.field', { type: 'password', autocomplete: 'new-password', 'data-i18n-ph': 'mypage.newPassword', placeholder: t('mypage.newPassword') });
    const err = h('p.err');
    const form = h('div.inline-form', {}, pw, btn('secondary', 'mypage.save', async () => {
      err.textContent = '';
      try {
        await backend.changePassword(pw.value);
        pw.value = '';
        app.toast('mypage.saved');
      } catch (e) {
        err.textContent = t(`auth.err.${e instanceof AuthError ? e.code : 'network'}` as StringKey);
      }
    }));
    body.append(form, err);
  }

  if (u.accountType === 'guest') body.append(tx('p.warn', 'mypage.guestWarning'));

  const actions = h('div.btn-row');
  actions.append(
    btn('danger', 'mypage.deleteAccount', async () => {
      if (!(await app.confirm('confirm.delete', 'mypage.deleteAccount'))) return;
      await backend.deleteAccount().catch(() => undefined);
      close();
      app.user = null;
      settings.endSession();
      app.go('title');
    }),
    btn('ghost', 'sys.logout', async () => {
      close();
      await app.confirmLogout();
    }, {}, icon('logout')),
  );
  body.append(actions);
  close = app.modal(body);
}

/** How to Play (07 §7.3): move / stroke / timing / serve pages (+ keyboard page on desktop), with optional art. */
export function openHowToPlay(app: App): void {
  const pages: StringKey[] = ['help.p1', 'help.p2', 'help.p3', 'help.serve'];
  if (layout.profile === 'desktop') pages.push('help.p4');
  const artIndex: Partial<Record<StringKey, number>> = { 'help.p1': 0, 'help.p2': 1, 'help.p3': 2, 'help.serve': 3, 'help.p4': 4 };
  let i = 0;
  const body = h('div.howto');
  const title = tx('h2', 'setup.howToPlay');
  const art = h('div.howto-art');
  const text = h('p.howto-text');
  const dots = h('div.dots');
  const prev = btn('ghost', 'common.prev', () => show(i - 1));
  const next = btn('primary', 'common.next', () => (i < pages.length - 1 ? show(i + 1) : close()));
  const show = (n: number) => {
    i = Math.max(0, Math.min(pages.length - 1, n));
    text.dataset.i18n = pages[i];
    text.textContent = t(pages[i]);
    const a = artIndex[pages[i]] ?? i;
    art.className = `howto-art art-${a + 1}`;
    art.style.backgroundImage = '';
    art.innerHTML = HOWTO_ART[a] ?? '';
    if (a < HOWTO_IMAGES) {
      const url = ASSET.howTo(a + 1);
      const img = new Image();
      img.onload = () => {
        if (art.dataset.page !== String(a)) return;
        art.style.backgroundImage = `url("${url}")`;
        art.classList.add('has-art');
      };
      img.src = url;
    }
    art.dataset.page = String(a);
    dots.innerHTML = pages.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('');
    prev.disabled = i === 0;
    const label = next.querySelector('span')!;
    label.dataset.i18n = i === pages.length - 1 ? 'common.close' : 'common.next';
    label.textContent = t(i === pages.length - 1 ? 'common.close' : 'common.next');
  };
  body.append(title, art, text, dots, h('div.btn-row', {}, prev, next));
  const close = app.modal(body);
  show(0);
  audio.play('ui_tap');
}

/** Pages with generated art (`howto_01..04`); the keyboard page stays a diagram. */
const HOWTO_IMAGES = 4;

const HOWTO_ART = [
  `<svg viewBox="0 0 200 110"><path d="M60 20 L140 20 L180 100 L20 100 Z" fill="rgba(255,255,255,.12)" stroke="#fff" stroke-width="2"/><circle cx="100" cy="62" r="14" fill="#ffd166"/><path d="M100 48 v-20 M100 76 v20 M86 62 h-30 M114 62 h30" stroke="#ffd166" stroke-width="3" stroke-linecap="round"/></svg>`,
  `<svg viewBox="0 0 200 110"><g fill="rgba(255,255,255,.15)" stroke="#fff" stroke-width="2"><rect x="58" y="8" width="38" height="28" rx="8"/><rect x="104" y="8" width="38" height="28" rx="8"/><rect x="58" y="42" width="38" height="28" rx="8"/><rect x="104" y="42" width="38" height="28" rx="8" fill="#ffd166"/><rect x="58" y="76" width="38" height="28" rx="8"/><rect x="104" y="76" width="38" height="28" rx="8"/></g><path d="M160 70 q20 -10 30 10" stroke="#ffd166" stroke-width="3" fill="none"/></svg>`,
  `<svg viewBox="0 0 200 110"><ellipse cx="100" cy="55" rx="44" ry="50" fill="#ef476f"/><ellipse cx="100" cy="55" rx="33" ry="38" fill="#2b2d42"/><rect x="78" y="36" width="44" height="38" fill="#06d6a0" opacity=".85"/><circle cx="100" cy="55" r="7" fill="#e3ff3b"/></svg>`,
  `<svg viewBox="0 0 200 110"><path d="M100 104 v-46" stroke="#fff" stroke-width="3"/><path d="M84 70 q16 -60 34 -50" stroke="#ffd166" stroke-width="3" stroke-dasharray="5 5" fill="none"/><circle cx="118" cy="20" r="7" fill="#e3ff3b"/><circle cx="118" cy="20" r="15" fill="none" stroke="#fff" stroke-width="2"/></svg>`,
  `<svg viewBox="0 0 200 110"><g fill="none" stroke="#fff" stroke-width="2"><rect x="20" y="40" width="26" height="26" rx="5"/><rect x="50" y="40" width="26" height="26" rx="5"/><rect x="80" y="40" width="26" height="26" rx="5"/><rect x="50" y="10" width="26" height="26" rx="5"/><rect x="124" y="70" width="22" height="22" rx="4"/><rect x="150" y="70" width="22" height="22" rx="4"/><rect x="176" y="70" width="22" height="22" rx="4"/><rect x="150" y="44" width="22" height="22" rx="4"/></g><g fill="#fff" font-size="13" font-family="sans-serif" text-anchor="middle"><text x="63" y="28">W</text><text x="33" y="58">A</text><text x="63" y="58">S</text><text x="93" y="58">D</text></g></svg>`,
];
