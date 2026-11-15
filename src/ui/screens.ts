import { audio } from '../audio/audioManager';
import { backend } from '../backend';
import { AuthError } from '../backend/types';
import { CHARACTERS, type CharacterDef, MAX_STAGE, npcCharacterFor, RULES, STAGES, type ThemeId, VISUAL } from '../data/gameData';
import {
  BOUNCE_CUE_MAX,
  BOUNCE_CUE_ORDER,
  type BounceCueId,
  toggleBounceCue,
} from '../core/bounceCues';
import { type BallSpeedSide, settings } from '../core/settings';
import { PLAY_LEVELS } from '../game/match/matchModel';
import { type StringKey, t } from '../i18n/i18n';
import type { App, Screen } from './app';
import { btn, clear, h, icon, tx } from './dom';
import { artBackground, ASSET, assetVideo, screenBackground } from './assets';
import { openHowToPlay } from './modals';
import { layout } from '../core/layout';
import { phoneField } from './phoneField';

const charKey = (c: CharacterDef) => c.name.toLowerCase();

const orientation = () => (layout.profile === 'mobile-portrait' ? 'portrait' : 'landscape');

/** Menu screens share the menu key art behind their content. */
function withMenuArt(el: HTMLElement): HTMLElement {
  screenBackground(el, [ASSET.menuBackground(orientation())]);
  return el;
}

function logo(): HTMLElement {
  return h('div.logo', {}, h('span.logo-ball'), h('span.logo-text', {}, 'Real Court ', h('b', {}, 'Tennis')));
}

/** Small home control + tip bubble inside auth cards (first-time guidance). */
function authHomeChip(app: App, withTip: boolean): HTMLElement {
  const wrap = h('div.auth-home');
  const home = h('button.auth-home-btn', {
    type: 'button',
    'data-i18n-aria': 'sys.home',
    'aria-label': t('sys.home'),
    onclick: () => app.home(),
  });
  home.append(icon('home'));
  wrap.append(home);
  if (withTip) wrap.append(tx('div.auth-home-tip', 'sys.homeTip'));
  return wrap;
}

function authCardHead(app: App, titleKey: StringKey, showTip: boolean): HTMLElement {
  return h('div.auth-head', {},
    h('div.auth-head-text', {}, tx('p.auth-welcome', 'auth.welcome'), tx('h2', titleKey)),
    authHomeChip(app, showTip),
  );
}

// ---------------------------------------------------------------- Intro (6 s video or fallback card)

export function introScreen(app: App): Screen {
  const el = h('div');
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    app.go('title');
  };
  const fallback = h('div.intro-card', {}, h('div.court-silhouette', { html: COURT_SVG }), logo(), tx('p.tagline', 'title.tagline'));
  let videoPlaying = false;
  const intro = assetVideo(ASSET.introVideo, () => {
    if (videoPlaying) finish();
  });
  intro.video.addEventListener('loadeddata', () => {
    videoPlaying = true;
    fallback.remove();
  });
  el.append(fallback, intro.el, btn('skip', 'common.skip', finish));
  const timer = window.setTimeout(() => {
    if (videoPlaying && !intro.video.ended) return;
    finish();
  }, 6000);
  return { el, ctx: { home: false, lang: false, myPage: false, logout: false, music: null }, dispose: () => { window.clearTimeout(timer); intro.stop(); } };
}

// ---------------------------------------------------------------- Title (Start only)

export function titleScreen(app: App): Screen {
  const el = h('div.title-wrap', {}, h('div.court-silhouette.dim', { html: COURT_SVG }), logo(), tx('p.tagline', 'title.tagline'));
  const start = btn('primary.big', 'title.start', async () => {
    start.disabled = true;
    const u = app.user ?? (await backend.restoreSession().catch(() => null));
    if (u) await app.afterLogin(u);
    else app.go('login');
  });
  el.append(start);
  artBackground(el, ASSET.titleImage(orientation()));
  return { el, ctx: { home: false, lang: false, myPage: false, logout: false, music: 'bgm_main_theme' } };
}

// ---------------------------------------------------------------- Login

function errText(e: unknown): string {
  return t(`auth.err.${e instanceof AuthError ? e.code : 'network'}` as StringKey);
}

export function loginScreen(app: App): Screen {
  const card = h('div.card.auth-card');
  card.append(authCardHead(app, 'login.title', true));
  const err = h('p.err', { role: 'alert' });

  // Guest — nickname is required for progress / mileage.
  const nick = h('input.field', { maxlength: 12, autocomplete: 'nickname', 'data-i18n-ph': 'login.nickname', placeholder: t('login.nickname'), required: true });
  const guestBox = h('div.guest-box', {}, nick, btn('primary', 'login.guestStart', () => run(() => backend.loginGuest(nick.value.trim()))));
  card.append(tx('h3', 'login.guest'), guestBox);

  card.append(h('div.divider', {}, tx('span', 'login.or')));
  card.append(
    h('div.oauth-stack', {},
      btn('oauth.google', 'login.google', () => run(() => backend.loginOAuth('google')), {}, icon('google')),
      btn('oauth.apple', 'login.apple', () => run(() => backend.loginOAuth('apple')), {}, icon('apple')),
    ),
  );
  card.append(h('div.divider', {}, tx('span', 'login.or')));

  let kind: 'email' | 'phone' = 'email';
  const tabs = h('div.segmented');
  const idSlot = h('div.id-slot');
  const emailId = h('input.field', { type: 'email', inputmode: 'email', autocomplete: 'username', 'data-i18n-ph': 'login.email', placeholder: t('login.email') });
  const phone = phoneField({ autocomplete: 'tel-national' });
  const pw = h('input.field', { type: 'password', autocomplete: 'current-password', 'data-i18n-ph': 'login.password', placeholder: t('login.password') });
  const setKind = (k: 'email' | 'phone') => {
    kind = k;
    tabs.querySelectorAll('button').forEach((b, i) => b.classList.toggle('active', (i === 0) === (k === 'email')));
    clear(idSlot);
    idSlot.append(k === 'email' ? emailId : phone.el);
  };
  tabs.append(btn('seg', 'login.tabEmail', () => setKind('email')), btn('seg', 'login.tabPhone', () => setKind('phone')));
  setKind('email');

  const readId = () => (kind === 'email' ? emailId.value.trim() : phone.value());
  const doLogin = () => run(() => backend.loginWithId(kind, readId(), pw.value));
  const form = h('form.id-form', { onsubmit: (e: Event) => { e.preventDefault(); doLogin(); } }, tabs, idSlot, pw);
  form.append(btn('secondary', 'login.submit', doLogin));
  const toSignup = btn('link.signup-cta', 'login.toSignup', () => app.go('signup'));
  card.append(form, err, h('div.signup-cta-wrap', {}, toSignup));

  let busy = false;
  const run = async (fn: () => Promise<import('../backend/types').UserProfile>) => {
    if (busy) return;
    busy = true;
    err.textContent = '';
    card.classList.add('busy');
    try {
      const u = await fn();
      await app.afterLogin(u);
    } catch (e) {
      err.textContent = errText(e);
      audio.play('ui_cancel');
    } finally {
      busy = false;
      card.classList.remove('busy');
    }
  };

  return { el: withMenuArt(h('div.center-wrap', {}, card)), ctx: { home: true, lang: true, myPage: false, logout: false, music: 'bgm_main_theme' } };
}

// ---------------------------------------------------------------- Signup

export function signupScreen(app: App): Screen {
  const card = h('div.card.auth-card');
  card.append(authCardHead(app, 'signup.title', true));
  const err = h('p.err', { role: 'alert' });
  const body = h('div.signup-body');

  const showChoose = () => {
    clear(body);
    err.textContent = '';
    body.append(
      tx('p.signup-hint', 'signup.chooseHint'),
      h('div.choice', {},
        btn('secondary.big', 'signup.byEmail', () => showForm('email')),
        btn('secondary.big', 'signup.byPhone', () => showForm('phone')),
      ),
      h('div.signup-cta-wrap', {}, btn('link', 'signup.toLogin', () => app.go('login'))),
    );
  };

  const showForm = (kind: 'email' | 'phone') => {
    clear(body);
    err.textContent = '';
    const phone = kind === 'phone' ? phoneField({ autocomplete: 'tel-national' }) : null;
    const email = kind === 'email'
      ? h('input.field', { type: 'email', inputmode: 'email', autocomplete: 'username', 'data-i18n-ph': 'login.email', placeholder: t('login.email') })
      : null;
    const pw = h('input.field', { type: 'password', autocomplete: 'new-password', 'data-i18n-ph': 'login.password', placeholder: t('login.password') });
    const pw2 = h('input.field', { type: 'password', autocomplete: 'new-password', 'data-i18n-ph': 'signup.passwordConfirm', placeholder: t('signup.passwordConfirm') });
    const submit = async () => {
      err.textContent = '';
      if (pw.value !== pw2.value) {
        err.textContent = t('auth.err.passwordMismatch');
        audio.play('ui_cancel');
        return;
      }
      try {
        const id = kind === 'email' ? email!.value.trim() : phone!.value();
        const u = await backend.signupWithId(kind, id, pw.value);
        await app.afterLogin(u);
      } catch (e) {
        err.textContent = errText(e);
        audio.play('ui_cancel');
      }
    };
    const form = h('form.id-form', { onsubmit: (e: Event) => { e.preventDefault(); void submit(); } },
      kind === 'email' ? email! : phone!.el,
      pw,
      pw2,
      btn('primary', 'signup.submit', () => void submit()),
    );
    body.append(
      tx('h3', kind === 'email' ? 'signup.byEmail' : 'signup.byPhone'),
      form,
      h('div.signup-cta-wrap', {}, btn('link', 'signup.backChoose', showChoose)),
    );
    (kind === 'email' ? email : null)?.focus();
    phone?.focus();
  };

  showChoose();
  card.append(body, err);
  return { el: withMenuArt(h('div.center-wrap', {}, card)), ctx: { home: true, lang: true, myPage: false, logout: false, music: 'bgm_main_theme' } };
}

// ---------------------------------------------------------------- Match Setup

export function setupScreen(app: App): Screen {
  const sel = app.selection;
  const el = h('div.setup');
  const head = h('div.setup-head', {}, tx('h2', 'setup.title'));
  const modeTabs = h('div.segmented.mode');
  const charRow = h('div.char-row');
  /** One right scrollbar for the whole menu (settings + stage pick). */
  const pickTitle = h('h3.pick-title');
  const pickArea = h('div.pick-area');
  const top = h('div.setup-top', {},
    h('section.sec-chars', {}, tx('h3', 'setup.character'), charRow, playLevelSection(), bounceCueSection(), ballSpeedSection()),
  );
  const main = h('div.setup-main', {}, top, pickTitle, pickArea);

  const renderChars = () => {
    clear(charRow);
    for (const c of CHARACTERS) {
      const card = h('button.char-card', { type: 'button', style: `--c:${c.color}` });
      card.classList.toggle('active', c.id === sel.characterId);
      const portrait = h('div.char-portrait', { html: portraitSvg(c) });
      artBackground(portrait, ASSET.characterPortrait(c.id));
      card.append(
        portrait,
        h('div.char-meta', {},
          tx('div.char-name', `char.${charKey(c)}.name` as StringKey),
          tx('div.char-type', `char.${charKey(c)}.type` as StringKey),
          statBar('stat.speed', c.speed), statBar('stat.power', c.power), statBar('stat.reach', c.reach), statBar('stat.control', c.control),
        ),
      );
      card.addEventListener('click', () => {
        audio.play('ui_tap');
        sel.characterId = c.id;
        void backend.updateProfile({ selectedCharacter: c.id }).catch(() => undefined);
        renderChars();
        renderPick();
      });
      charRow.append(card);
    }
  };

  const setPickTitle = (key: StringKey) => {
    pickTitle.dataset.i18n = key;
    pickTitle.textContent = t(key);
  };

  const renderPick = () => {
    clear(pickArea);
    if (sel.mode === 'stage') {
      setPickTitle('setup.stage');
      const grid = h('div.stage-grid');
      const unlocked = app.highestUnlocked();
      if (sel.stageId > unlocked) sel.stageId = unlocked;
      for (const s of STAGES) {
        const prog = app.progress.find((p) => p.stageId === s.stageId);
        const locked = s.stageId > unlocked;
        const theme = VISUAL.themes[s.courtTheme];
        const npc = npcCharacterFor(sel.characterId, s.npcSlot);
        const b = h('button.stage-tile', { type: 'button', disabled: locked, style: `--sky1:${theme.sky[0]};--sky2:${theme.sky[1]};--court:${theme.court}` });
        b.classList.toggle('active', s.stageId === sel.stageId);
        if (!locked) artBackground(b, ASSET.stageImage(s.stageId));
        b.append(h('div.stage-num', {}, String(s.stageId)));
        b.append(tx('div.stage-theme', theme.nameKey as StringKey));
        if (locked) b.append(h('div.stage-lock', {}, icon('lock')));
        else {
          b.append(h('div.stage-npc', {}, tx('span', 'setup.opponent'), ' ', tx('b', `char.${charKey(npc)}.name` as StringKey), h('i.lv', {}, ` Lv.${s.npcLevel}`)));
          if (prog?.cleared) b.append(h('div.stage-clear', {}, icon('check'), tx('span', 'setup.cleared')));
          if (prog?.bestScore) b.append(h('div.stage-best', {}, prog.bestScore.toLocaleString()));
        }
        b.addEventListener('click', () => {
          if (locked) return;
          audio.play('ui_tap');
          sel.stageId = s.stageId;
          renderPick();
        });
        grid.append(b);
      }
      pickArea.append(grid);
    } else {
      setPickTitle('setup.difficulty');
      const lv = h('div.segmented.levels');
      for (let i = 1; i <= 5; i++) {
        const b = btn(`seg${sel.freeLevel === i ? '.active' : ''}`, 'setup.levelN', () => { sel.freeLevel = i; renderPick(); });
        b.querySelector('span')!.dataset.i18nParams = JSON.stringify({ n: i });
        b.querySelector('span')!.textContent = t('setup.levelN', { n: i });
        lv.append(b);
      }
      pickArea.append(lv, tx('h3.setup-subhead', 'setup.court'));
      const themes = h('div.theme-row');
      for (const id of Object.keys(VISUAL.themes) as ThemeId[]) {
        const th = VISUAL.themes[id];
        const b = h('button.theme-tile', { type: 'button', style: `--sky1:${th.sky[0]};--sky2:${th.sky[1]};--court:${th.court}` }, tx('span', th.nameKey as StringKey));
        b.classList.toggle('active', sel.freeTheme === id);
        b.addEventListener('click', () => { audio.play('ui_tap'); sel.freeTheme = id; renderPick(); });
        themes.append(b);
      }
      pickArea.append(themes);
    }
  };

  const setMode = (m: 'stage' | 'free') => {
    sel.mode = m;
    modeTabs.querySelectorAll('button').forEach((b, i) => b.classList.toggle('active', (i === 0) === (m === 'stage')));
    renderPick();
  };
  modeTabs.append(btn('seg', 'setup.modeStage', () => setMode('stage')), btn('seg', 'setup.modeFree', () => setMode('free')));
  head.append(modeTabs);

  const foot = h('div.setup-foot', {},
    btn('ghost', 'setup.howToPlay', () => openHowToPlay(app), {}, icon('help')),
    btn('primary.big', 'setup.startMatch', () => app.go('match')),
  );
  el.append(head, main, foot);
  renderChars();
  setMode(sel.mode);
  withMenuArt(el);
  return { el, ctx: { home: true, lang: true, myPage: true, logout: true, music: 'bgm_main_theme' } };
}

/** "Play Level" setting (Beginner / Middle / Master movement assistance), saved on the device. */
function playLevelSection(): HTMLElement {
  const seg = h('div.segmented.play-level');
  const hint = h('p.play-level-hint');
  const render = () => {
    const cur = settings.playLevel();
    seg.querySelectorAll('button').forEach((b, i) => b.classList.toggle('active', PLAY_LEVELS[i] === cur));
    const key = `setup.playLevelHint.${cur}` as StringKey;
    hint.dataset.i18n = key;
    hint.textContent = t(key);
  };
  for (const lv of PLAY_LEVELS) {
    seg.append(btn('seg', `setup.playLevel.${lv}` as StringKey, () => {
      settings.setPlayLevel(lv);
      render();
      document.querySelectorAll<HTMLElement>('[data-bounce-cues]').forEach((el) => el.dispatchEvent(new Event('rct-refresh')));
    }));
  }
  render();
  return h('div.play-level-sec', {}, tx('h3', 'setup.playLevel'), seg, hint);
}

/**
 * Bounce-height visual cues: pick up to 2 of 2 / 3 / 5 / 4 / 1.
 * Defaults follow Package A for the current Play Level.
 */
function bounceCueSection(): HTMLElement {
  const row = h('div.bounce-cue-row');
  const hint = h('p.play-level-hint');
  const buttons = new Map<BounceCueId, HTMLButtonElement>();
  const render = () => {
    const cur = settings.bounceCues();
    for (const id of BOUNCE_CUE_ORDER) {
      buttons.get(id)?.classList.toggle('active', cur.includes(id));
      buttons.get(id)?.classList.toggle('locked', !cur.includes(id) && cur.length >= BOUNCE_CUE_MAX);
    }
    hint.dataset.i18n = 'setup.bounceCueHint';
    hint.dataset.i18nParams = JSON.stringify({ n: BOUNCE_CUE_MAX, list: cur.join('+') || '—' });
    hint.textContent = t('setup.bounceCueHint', { n: BOUNCE_CUE_MAX, list: cur.join('+') || '—' });
  };
  for (const id of BOUNCE_CUE_ORDER) {
    const b = btn('seg.bounce-cue', `setup.bounceCue.${id}` as StringKey, () => {
      settings.setBounceCues(toggleBounceCue(settings.bounceCues(), id));
      render();
    });
    b.dataset.cue = id;
    buttons.set(id, b);
    row.append(b);
  }
  const root = h('div.bounce-cue-sec', { 'data-bounce-cues': '1' }, tx('h3', 'setup.bounceCue'), row, hint);
  root.addEventListener('rct-refresh', render);
  render();
  return root;
}

/** "Ball Speed" setting: one 1–5 bar per hitter, saved on the device. */
function ballSpeedSection(): HTMLElement {
  const levels = RULES.ballFlight.levelSec;
  const row = (side: BallSpeedSide, key: StringKey) => {
    const bar = h('div.speed-bar', { role: 'slider', 'aria-valuemin': '1', 'aria-valuemax': String(levels.length) });
    const value = tx('span.speed-v', 'setup.ballSpeedValue');
    const render = () => {
      const lv = settings.ballSpeed(side);
      bar.setAttribute('aria-valuenow', String(lv));
      bar.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', i < lv));
      const params = { n: lv, sec: levels[lv - 1] };
      value.dataset.i18nParams = JSON.stringify(params);
      value.textContent = t('setup.ballSpeedValue', params);
    };
    for (let i = 1; i <= levels.length; i++) {
      const seg = h('button.speed-seg', { type: 'button', 'aria-label': String(i) });
      seg.addEventListener('click', () => {
        audio.play('ui_tap');
        settings.setBallSpeed(side, i);
        render();
      });
      bar.append(seg);
    }
    render();
    return h('div.speed-row', {}, tx('span.speed-k', key), bar, value);
  };
  return h('div.ball-speed', {},
    tx('h3', 'setup.ballSpeed'),
    row('player', 'setup.ballSpeedPlayer'),
    row('npc', 'setup.ballSpeedNpc'),
    tx('p.speed-hint', 'setup.ballSpeedHint'),
  );
}

function statBar(key: StringKey, v: number): HTMLElement {
  const pct = Math.max(0, Math.min(100, ((v - 60) / 40) * 100));
  return h('div.stat', {}, tx('span.stat-k', key), h('span.stat-bar', {}, h('i', { style: `width:${pct}%` })), h('span.stat-v', {}, String(v)));
}

function portraitSvg(c: CharacterDef): string {
  const female = c.gender === 'female';
  return `<svg viewBox="0 0 80 100"><defs><linearGradient id="g${c.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.color}" stop-opacity=".35"/><stop offset="1" stop-color="${c.color}" stop-opacity=".05"/></linearGradient></defs>
  <rect width="80" height="100" rx="12" fill="url(#g${c.id})"/>
  <path d="M14 100 q4 -34 26 -36 q22 2 26 36z" fill="${c.color}" stroke="#1a1d26" stroke-width="2"/>
  <circle cx="40" cy="40" r="16" fill="${c.skin}" stroke="#1a1d26" stroke-width="2"/>
  ${female ? `<path d="M23 40 q0 -22 17 -22 q17 0 17 22 q-4 -12 -17 -13 q-13 1 -17 13z" fill="${c.hair}"/><path d="M55 34 q10 8 4 24" stroke="${c.hair}" stroke-width="6" fill="none" stroke-linecap="round"/>`
    : `<path d="M24 36 q0 -18 16 -18 q16 0 16 18 z" fill="#fff" stroke="#1a1d26" stroke-width="2"/><path d="M40 30 h22" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`}
  <circle cx="34" cy="42" r="1.8" fill="#1a1d26"/><circle cx="46" cy="42" r="1.8" fill="#1a1d26"/><path d="M35 49 q5 3 10 0" stroke="#1a1d26" stroke-width="1.6" fill="none"/>
  </svg>`;
}

// ---------------------------------------------------------------- Score

export function scoreScreen(app: App): Screen {
  const o = app.lastOutcome;
  const el = h('div.score-wrap');
  if (!o) {
    queueMicrotask(() => app.go('setup'));
    return { el, ctx: { home: true, lang: true, myPage: true, logout: true } };
  }
  const won = o.input.won;
  const card = h('div.card.score-card');
  card.classList.toggle('won', won);
  card.append(tx('h2', 'score.title'));
  card.append(tx('div.result-banner', won ? 'result.win' : 'result.lose'));
  card.append(h('div.final-points', {}, h('b', {}, String(o.playerScore)), h('span', {}, ' : '), h('b', {}, String(o.npcScore))));
  const total = h('div.total', {}, tx('span', 'score.total'), h('b.count-up', {}, '0'));
  card.append(total);
  const counter = total.querySelector('b')!;
  const start = performance.now();
  const step = () => {
    const k = Math.min(1, (performance.now() - start) / 1200);
    counter.textContent = Math.round(o.breakdown.total * (1 - (1 - k) ** 3)).toLocaleString();
    if (k < 1 && counter.isConnected) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  if (o.submit?.newBest) card.append(tx('div.new-best', 'score.newBest'));

  const kv = h('dl.kv.score-kv');
  const row = (k: StringKey, v: string | HTMLElement) => kv.append(tx('dt', k), h('dd', {}, v));
  row('score.best', (o.submit?.best ?? o.breakdown.total).toLocaleString());
  if (o.input.mode === 'stage') {
    const rank = h('span');
    if (o.submit?.rank) rank.append(tx('span', 'score.rankValue', { n: o.submit.rank }));
    else rank.textContent = '-';
    row('score.rank', rank);
  }
  row('score.maxRally', String(o.stats.maxRally));
  card.append(kv);

  card.append(tx('h3', 'score.quality'));
  const q = h('div.quality-row');
  const qItem = (key: StringKey, n: number, cls: string) => q.append(h(`div.q.${cls}` as 'div', {}, tx('span', key), h('b', {}, String(n))));
  qItem('judge.perfect', o.stats.perfect, 'perfect');
  qItem('judge.great', o.stats.great, 'great');
  qItem('judge.good', o.stats.good, 'good');
  qItem('judge.miss', o.stats.miss + o.stats.weak, 'miss');
  card.append(q);

  const isStage = o.input.mode === 'stage';
  const stageId = o.input.stageId ?? 1;
  const allCleared = isStage && won && stageId >= MAX_STAGE;
  if (allCleared) card.append(tx('div.new-best', 'score.allCleared'));
  const actions = h('div.btn-row.score-actions');
  actions.append(btn('ghost', 'score.toSetup', () => app.go('setup')));
  if (isStage && won && !allCleared) {
    actions.append(btn('primary', 'score.nextStage', () => { app.selection.stageId = stageId + 1; app.selection.mode = 'stage'; app.go('match'); }));
  } else {
    actions.append(btn('primary', 'score.retry', () => app.go('match')));
  }
  card.append(actions);
  el.append(card);
  if (won) audio.play('sfx_crowd_cheer', 0.8);
  const root = h('div', {}, el);
  screenBackground(root, [ASSET.characterStill(o.input.characterId, won), ASSET.scoreBackground(won)], () => el.classList.add('has-bg'));
  return { el: root, ctx: { home: true, lang: true, myPage: true, logout: true, music: 'bgm_main_theme' } };
}

const COURT_SVG = `<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMax meet"><g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round">
<path d="M130 40 L270 40 L360 230 L40 230 Z"/><path d="M146 40 L102 230 M254 40 L298 230"/><path d="M118 100 L282 100 M72 170 L328 170"/><path d="M200 100 L200 170"/>
<path d="M96 128 L304 128" stroke-width="4"/><path d="M96 128 L96 108 M304 128 L304 108" /></g></svg>`;
