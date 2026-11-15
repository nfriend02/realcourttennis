import {
  type BounceCueId,
  defaultsForPlayLevel,
  parseBounceCues,
  serializeBounceCues,
} from './bounceCues';
import { RULES } from '../data/gameData';
import { PLAY_LEVELS, type PlayLevel } from '../game/match/matchModel';
import type { Hand } from '../game/physics/types';
import { type Lang, LANGS } from '../i18n/i18n';

const LANG_KEY = 'rct.settings.lang';
const BALL_SPEED_KEY = 'rct.settings.ballSpeed.';
const PLAY_LEVEL_KEY = 'rct.settings.playLevel';
const BOUNCE_CUES_KEY = 'rct.settings.bounceCues';
/** Beginner while the game is in development. */
const DEFAULT_PLAY_LEVEL: PlayLevel = 'beginner';
export type BallSpeedSide = 'player' | 'npc';
const ANON = 'anon';

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode) */
  }
}

type Listener = () => void;

/** Device settings (language) + session prefs (sound, per login session) + current handedness. */
class Settings {
  private uid = ANON;
  private soundListeners = new Set<Listener>();
  private handListeners = new Set<Listener>();
  private _hand: Hand = 'right';

  get lang(): Lang {
    const v = read(LANG_KEY) as Lang | null;
    return v && LANGS.includes(v) ? v : 'ko';
  }

  set lang(l: Lang) {
    write(LANG_KEY, l);
  }

  /** Ball Speed level (1 = slowest … 5 = fastest) for shots hit by `side`; device setting. */
  ballSpeed(side: BallSpeedSide): number {
    const n = Number(read(BALL_SPEED_KEY + side));
    const max = RULES.ballFlight.levelSec.length;
    return Number.isInteger(n) && n >= 1 && n <= max ? n : RULES.ballFlight.defaultLevel;
  }

  setBallSpeed(side: BallSpeedSide, level: number): void {
    write(BALL_SPEED_KEY + side, String(level));
  }

  /** Flight seconds from hit to the receiver's racket for the current Ball Speed levels. */
  flightSec(): { player: number; npc: number } {
    const sec = RULES.ballFlight.levelSec;
    return { player: sec[this.ballSpeed('player') - 1], npc: sec[this.ballSpeed('npc') - 1] };
  }

  /** Play level (movement / facing assistance); device setting. */
  playLevel(): PlayLevel {
    const v = read(PLAY_LEVEL_KEY) as PlayLevel | null;
    return v && PLAY_LEVELS.includes(v) ? v : DEFAULT_PLAY_LEVEL;
  }

  setPlayLevel(level: PlayLevel): void {
    write(PLAY_LEVEL_KEY, level);
    // Package A: changing Play Level resets bounce-height cues to that level's defaults.
    this.setBounceCues(defaultsForPlayLevel(level));
  }

  /**
   * Bounce-height visual cues (max 2). Defaults follow Package A for the current Play Level
   * when nothing is stored yet.
   */
  bounceCues(): BounceCueId[] {
    return parseBounceCues(read(BOUNCE_CUES_KEY)) ?? defaultsForPlayLevel(this.playLevel());
  }

  setBounceCues(cues: readonly BounceCueId[]): void {
    write(BOUNCE_CUES_KEY, serializeBounceCues(cues));
  }

  /** Sound is OFF by default and persists for the login session (07 §14.1). */
  get soundOn(): boolean {
    return read(`rct.session.${this.uid}.soundOn`) === '1';
  }

  set soundOn(on: boolean) {
    write(`rct.session.${this.uid}.soundOn`, on ? '1' : '0');
    this.soundListeners.forEach((fn) => fn());
  }

  get hand(): Hand {
    return this._hand;
  }

  set hand(h: Hand) {
    if (h === this._hand) return;
    this._hand = h;
    document.documentElement.dataset.hand = h;
    this.handListeners.forEach((fn) => fn());
  }

  /** Called on login: carries the pre-login (Intro/Title) sound choice into the user session. */
  beginSession(uid: string): void {
    const carry = this.soundOn;
    this.uid = uid;
    if (read(`rct.session.${uid}.soundOn`) === null) write(`rct.session.${uid}.soundOn`, carry ? '1' : '0');
    this.soundListeners.forEach((fn) => fn());
  }

  /** Logout resets sound to OFF. */
  endSession(): void {
    write(`rct.session.${this.uid}.soundOn`, null);
    this.uid = ANON;
    write(`rct.session.${ANON}.soundOn`, '0');
    this.hand = 'right';
    this.soundListeners.forEach((fn) => fn());
  }

  onSound(fn: Listener): () => void {
    this.soundListeners.add(fn);
    return () => this.soundListeners.delete(fn);
  }

  onHand(fn: Listener): () => void {
    this.handListeners.add(fn);
    return () => this.handListeners.delete(fn);
  }
}

export const settings = new Settings();
