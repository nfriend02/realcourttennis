import { audio, type MusicId } from '../audio/audioManager';
import { backend } from '../backend';
import type { MatchResultInput, MatchSubmitResult, StageProgress, UserProfile } from '../backend/types';
import { layout } from '../core/layout';
import { pause } from '../core/pause';
import { settings } from '../core/settings';
import type { ThemeId } from '../data/gameData';
import type { ScoreBreakdown, MatchStats } from '../game/match/score';
import { applyI18n, getLang, nextLang, onLangChange, setLang, type StringKey } from '../i18n/i18n';
import { btn, clear, h, icon, tx } from './dom';
import { openMyPage } from './modals';

export type ScreenId = 'intro' | 'title' | 'login' | 'signup' | 'setup' | 'match' | 'score';

export interface ScreenCtx {
  home: boolean;
  lang: boolean;
  myPage: boolean;
  logout: boolean;
  /** null = stop, undefined = keep current music. */
  music?: MusicId | null;
}

export interface Screen {
  el: HTMLElement;
  ctx: ScreenCtx;
  dispose?: () => void;
  /** Overrides the Home button (Gameplay asks for confirmation). */
  onHome?: () => void;
  onLayout?: () => void;
}

export interface Selection {
  mode: 'stage' | 'free';
  characterId: string;
  stageId: number;
  freeLevel: number;
  freeTheme: ThemeId;
}

export interface MatchOutcome {
  input: MatchResultInput;
  breakdown: ScoreBreakdown;
  stats: MatchStats;
  submit: MatchSubmitResult | null;
  playerScore: number;
  npcScore: number;
}

type ScreenFactory = (app: App) => Screen;

/** App FSM + system bar + modal host (07 §6.2, §7.1). */
export class App {
  user: UserProfile | null = null;
  progress: StageProgress[] = [];
  selection: Selection = { mode: 'stage', characterId: 'CHAR_01', stageId: 1, freeLevel: 1, freeTheme: 'day' };
  lastOutcome: MatchOutcome | null = null;
  current: Screen | null = null;
  currentId: ScreenId | null = null;

  private screenRoot: HTMLElement;
  private bar: HTMLElement;
  private modalRoot: HTMLElement;
  private factories = new Map<ScreenId, ScreenFactory>();
  private homeTipShown = false;
  private modalCount = 0;

  constructor(root: HTMLElement) {
    clear(root);
    this.screenRoot = h('div.screen-root');
    this.bar = h('header.sysbar');
    this.modalRoot = h('div.modal-root');
    root.append(this.screenRoot, this.bar, this.modalRoot);
    onLangChange(() => {
      applyI18n(document.body);
      this.renderBar();
    });
    settings.onSound(() => this.renderBar());
    layout.onChange(() => {
      this.current?.onLayout?.();
      requestAnimationFrame(() => layout.measure());
    });
  }

  register(id: ScreenId, f: ScreenFactory): void {
    this.factories.set(id, f);
  }

  go(id: ScreenId): void {
    this.closeAllModals();
    this.current?.dispose?.();
    clear(this.screenRoot);
    const f = this.factories.get(id);
    if (!f) throw new Error(`screen ${id} not registered`);
    this.currentId = id;
    const s = f(this);
    this.current = s;
    s.el.classList.add('screen', `screen-${id}`);
    this.screenRoot.append(s.el);
    document.documentElement.dataset.screen = id;
    if (s.ctx.music !== undefined) audio.playMusic(s.ctx.music);
    this.renderBar();
    requestAnimationFrame(() => layout.measure());
  }

  // ------------------------------------------------------------ system bar

  renderBar(): void {
    const s = this.current;
    if (!s) return;
    clear(this.bar);
    const left = h('div.sys-left');
    const right = h('div.sys-right');
    const soundOn = settings.soundOn;
    const sound = h('button.sys-btn.sound', {
      type: 'button',
      'aria-label': soundOn ? 'Sound On' : 'Sound Off',
      'data-i18n-aria': soundOn ? 'sys.soundOn' : 'sys.soundOff',
      onclick: () => {
        settings.soundOn = !settings.soundOn;
        audio.play('ui_tap');
      },
    });
    sound.classList.toggle('on', soundOn);
    sound.append(icon(soundOn ? 'soundOn' : 'soundOff'));
    left.append(sound);
    if (s.ctx.home) {
      const homeWrap = h('div.sys-home-wrap');
      const home = h('button.sys-btn.home', { type: 'button', 'data-i18n-aria': 'sys.home', onclick: () => this.home() });
      home.append(icon('home'));
      homeWrap.append(home);
      // Tip bubble for first-time guidance (title excluded; auth cards also show an in-card tip).
      if (!this.homeTipShown && this.currentId !== 'title') {
        this.homeTipShown = true;
        const tip = tx('div.home-tip', 'sys.homeTip');
        homeWrap.append(tip);
        window.setTimeout(() => tip.remove(), 4500);
      }
      left.append(homeWrap);
    }
    if (s.ctx.lang) {
      const lang = h('button.sys-btn.lang', {
        type: 'button',
        'data-i18n-aria': 'sys.language',
        onclick: () => {
          audio.play('ui_tap');
          const l = nextLang();
          setLang(l);
          settings.lang = l;
          if (this.user) void backend.updateProfile({ preferredLanguage: l }).catch(() => undefined);
        },
      });
      lang.textContent = getLang().toUpperCase();
      right.append(lang);
    }
    // My Page + Log Out sit side-by-side on the top right (setup / score / menus).
    if (s.ctx.myPage && this.user) {
      const mp = h('button.sys-btn.sys-text', { type: 'button', 'data-i18n-aria': 'sys.myPage', onclick: () => openMyPage(this) });
      mp.append(icon('user'), tx('span.sys-label', 'sys.myPage'));
      right.append(mp);
    }
    if (s.ctx.logout && this.user) {
      const lo = h('button.sys-btn.sys-text', { type: 'button', 'data-i18n-aria': 'sys.logout', onclick: () => void this.confirmLogout() });
      lo.append(icon('logout'), tx('span.sys-label', 'sys.logout'));
      right.append(lo);
    }
    this.bar.append(left, right);
    applyI18n(this.bar);
  }

  home(): void {
    audio.play('ui_tap');
    if (this.current?.onHome) this.current.onHome();
    else this.go('title');
  }

  // ------------------------------------------------------------ session

  async afterLogin(u: UserProfile): Promise<void> {
    this.user = u;
    settings.beginSession(u.id);
    settings.hand = u.handedness;
    this.selection.characterId = u.selectedCharacter;
    if (u.preferredLanguage && u.preferredLanguage !== getLang()) {
      setLang(u.preferredLanguage);
      settings.lang = u.preferredLanguage;
    }
    await this.refreshProgress();
    this.go('setup');
  }

  async refreshProgress(): Promise<void> {
    try {
      this.progress = await backend.getProgress();
    } catch {
      this.progress = [];
    }
  }

  highestUnlocked(): number {
    let s = 1;
    for (const p of this.progress) if (p.cleared) s = Math.max(s, p.stageId + 1);
    return Math.min(s, 10);
  }

  async confirmLogout(): Promise<void> {
    const msg: StringKey = this.user?.accountType === 'guest' ? 'mypage.guestWarning' : 'confirm.logout';
    if (!(await this.confirm(msg, this.user?.accountType === 'guest' ? 'confirm.logout' : undefined))) return;
    await this.logout();
  }

  async logout(): Promise<void> {
    await backend.logout().catch(() => undefined);
    this.user = null;
    this.progress = [];
    settings.endSession();
    this.go('title');
  }

  // ------------------------------------------------------------ modals

  modal(content: HTMLElement, opts: { onClose?: () => void; closable?: boolean } = {}): () => void {
    this.modalCount++;
    if (this.currentId === 'match') pause.set('menu', true);
    const backdrop = h('div.modal-backdrop');
    const card = h('div.modal-card', { role: 'dialog', 'aria-modal': 'true' });
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      backdrop.remove();
      this.modalCount--;
      if (this.modalCount <= 0) {
        this.modalCount = 0;
        pause.set('menu', false);
      }
      opts.onClose?.();
    };
    if (opts.closable !== false) {
      const x = h('button.modal-x', { type: 'button', 'data-i18n-aria': 'common.close', onclick: () => { audio.play('ui_cancel'); close(); } });
      x.append(icon('close'));
      card.append(x);
    }
    card.append(content);
    backdrop.append(card);
    this.modalRoot.append(backdrop);
    applyI18n(card);
    return close;
  }

  confirm(messageKey: StringKey, titleKey?: StringKey): Promise<boolean> {
    return new Promise((resolve) => {
      let result = false;
      const body = h('div.confirm');
      if (titleKey) body.append(tx('h3', titleKey));
      body.append(tx('p', messageKey));
      const row = h('div.btn-row');
      let close: () => void = () => undefined;
      row.append(
        btn('ghost', 'common.cancel', () => { result = false; close(); }),
        btn('primary', 'common.ok', () => { result = true; close(); }),
      );
      body.append(row);
      close = this.modal(body, { onClose: () => resolve(result) });
    });
  }

  closeAllModals(): void {
    clear(this.modalRoot);
    this.modalCount = 0;
    pause.set('menu', false);
  }

  toast(key: StringKey): void {
    const el = tx('div.toast', key);
    document.body.append(el);
    window.setTimeout(() => el.classList.add('out'), 1800);
    window.setTimeout(() => el.remove(), 2300);
  }
}
