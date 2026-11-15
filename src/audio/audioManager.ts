import { settings } from '../core/settings';

export type SfxId =
  | 'sfx_hit_perfect'
  | 'sfx_hit_great'
  | 'sfx_hit_good'
  | 'sfx_hit_weak'
  | 'sfx_swing_whiff'
  | 'sfx_ball_bounce'
  | 'sfx_net_bounce'
  | 'sfx_out_whistle'
  | 'sfx_score_win'
  | 'sfx_score_lose'
  | 'sfx_serve_toss'
  | 'sfx_crowd_cheer'
  | 'ui_tap'
  | 'ui_confirm'
  | 'ui_cancel'
  | 'bgm_victory'
  | 'bgm_defeat';

export type MusicId = 'bgm_main_theme' | 'bgm_court_day' | 'bgm_court_night';

interface MusicStyle {
  bpm: number;
  root: number;
  chords: number[][];
  hat: boolean;
  bassOct: number;
  lead: number[];
}

const STYLES: Record<MusicId, MusicStyle> = {
  bgm_main_theme: { bpm: 112, root: 57, chords: [[0, 4, 7], [-3, 0, 4], [5, 9, 12], [7, 11, 14]], hat: true, bassOct: -24, lead: [12, 14, 16, 19, 16, 14, 12, 7] },
  bgm_court_day: { bpm: 124, root: 60, chords: [[0, 4, 7], [5, 9, 12], [-3, 0, 4], [7, 11, 14]], hat: true, bassOct: -24, lead: [7, 9, 12, 9, 14, 12, 9, 7] },
  bgm_court_night: { bpm: 132, root: 52, chords: [[0, 3, 7], [-4, 0, 3], [-2, 2, 5], [-5, -1, 2]], hat: true, bassOct: -24, lead: [12, 10, 7, 10, 15, 14, 12, 10] },
};

const midi = (n: number) => 440 * 2 ** ((n - 69) / 12);

/** Procedural audio (Asset-Optional): Master → BGM 0.6 / SFX 0.8 / UI 0.7. Sound OFF by default. */
class AudioManager {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private bgm!: GainNode;
  private sfx!: GainNode;
  private ui!: GainNode;
  private noise!: AudioBuffer;
  private lastPlay = new Map<string, number>();
  private music: { id: MusicId; gain: GainNode; timer: number; step: number; next: number } | null = null;
  private wantedMusic: MusicId | null = null;
  private paused = false;

  init(): void {
    settings.onSound(() => this.applyEnabled());
    const unlock = () => {
      if (settings.soundOn) this.ensure();
      void this.ctx?.resume();
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock);
  }

  get enabled(): boolean {
    return settings.soundOn;
  }

  private ensure(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = settings.soundOn ? 1 : 0;
    this.master.connect(ctx.destination);
    const bus = (v: number) => {
      const g = ctx.createGain();
      g.gain.value = v;
      g.connect(this.master);
      return g;
    };
    this.bgm = bus(0.6 * 0.35);
    this.sfx = bus(0.8);
    this.ui = bus(0.7 * 0.6);
    const len = ctx.sampleRate;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    let seed = 12345;
    for (let i = 0; i < len; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      d[i] = (seed / 0x7fffffff) * 2 - 1;
    }
    if (this.wantedMusic) this.startMusic(this.wantedMusic);
    return ctx;
  }

  private applyEnabled(): void {
    const on = settings.soundOn;
    if (on) this.ensure();
    if (!this.ctx) return;
    void this.ctx.resume();
    this.master.gain.setTargetAtTime(on && !this.paused ? 1 : 0, this.ctx.currentTime, 0.03);
  }

  setPaused(p: boolean): void {
    this.paused = p;
    if (!this.ctx) return;
    this.master.gain.setTargetAtTime(settings.soundOn && !p ? 1 : 0, this.ctx.currentTime, 0.03);
  }

  // ------------------------------------------------------------ music

  /** null = stop. Crossfades 0.6 s. */
  playMusic(id: MusicId | null): void {
    if (this.wantedMusic === id) return;
    this.wantedMusic = id;
    if (!this.ctx) return;
    this.stopMusic();
    if (id) this.startMusic(id);
  }

  private stopMusic(): void {
    const m = this.music;
    if (!m || !this.ctx) return;
    window.clearInterval(m.timer);
    m.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
    const g = m.gain;
    window.setTimeout(() => g.disconnect(), 1500);
    this.music = null;
  }

  private startMusic(id: MusicId): void {
    const ctx = this.ctx!;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.setTargetAtTime(1, ctx.currentTime, 0.2);
    gain.connect(this.bgm);
    const m = { id, gain, timer: 0, step: 0, next: ctx.currentTime + 0.05 };
    this.music = m;
    const style = STYLES[id];
    const stepDur = 60 / style.bpm / 2;
    m.timer = window.setInterval(() => {
      if (this.music !== m) return;
      while (m.next < ctx.currentTime + 0.25) {
        this.scheduleStep(style, m.step, m.next, stepDur, gain);
        m.step = (m.step + 1) % 64;
        m.next += stepDur;
      }
    }, 60);
  }

  private scheduleStep(s: MusicStyle, step: number, t: number, dur: number, out: GainNode): void {
    const bar = Math.floor(step / 16) % s.chords.length;
    const chord = s.chords[bar];
    const beat = step % 16;
    if (beat % 8 === 0) for (const n of chord) this.tone(midi(s.root + n), t, dur * 7, 'triangle', 0.08, out, 0.02);
    if (beat % 4 === 0 || beat === 6 || beat === 14) this.tone(midi(s.root + chord[0] + s.bassOct + 12), t, dur * 1.6, 'sawtooth', 0.09, out, 0.005, 900);
    if (beat % 4 === 0) this.kick(t, out);
    if (s.hat && beat % 2 === 1) this.hat(t, out, beat % 4 === 3 ? 0.05 : 0.03);
    if (beat === 4 || beat === 12) this.snare(t, out);
    if (step >= 32 && beat % 2 === 0) {
      const n = s.lead[(beat / 2 + bar) % s.lead.length];
      this.tone(midi(s.root + n), t, dur * 1.8, 'square', 0.025, out, 0.01, 2400);
    }
  }

  // ------------------------------------------------------------ synth helpers

  private tone(freq: number, t: number, dur: number, type: OscillatorType, vol: number, out: AudioNode, attack = 0.005, lp = 0, slideTo = 0): void {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node: AudioNode = o;
    if (lp) {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = lp;
      o.connect(f);
      node = f;
    }
    node.connect(g);
    g.connect(out);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  private burst(t: number, dur: number, vol: number, out: AudioNode, type: BiquadFilterType, freq: number, q = 1, sweepTo = 0): void {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(out);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.02);
  }

  private kick(t: number, out: AudioNode): void {
    this.tone(140, t, 0.18, 'sine', 0.35, out, 0.002, 0, 45);
  }

  private snare(t: number, out: AudioNode): void {
    this.burst(t, 0.14, 0.12, out, 'bandpass', 1800, 0.8);
  }

  private hat(t: number, out: AudioNode, v: number): void {
    this.burst(t, 0.04, v, out, 'highpass', 7000, 0.7);
  }

  // ------------------------------------------------------------ sfx

  play(id: SfxId, intensity = 1): void {
    if (!settings.soundOn) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const now = performance.now();
    if (now - (this.lastPlay.get(id) ?? -1e9) < 45) return;
    this.lastPlay.set(id, now);
    const t = ctx.currentTime + 0.005;
    const s = this.sfx;
    const u = this.ui;
    switch (id) {
      case 'sfx_hit_perfect':
        this.burst(t, 0.09, 0.9, s, 'bandpass', 2600, 1.2);
        this.tone(320, t, 0.25, 'triangle', 0.5, s, 0.001, 0, 140);
        this.burst(t + 0.02, 0.5, 0.12, s, 'highpass', 4000, 0.5);
        break;
      case 'sfx_hit_great':
        this.burst(t, 0.07, 0.75, s, 'bandpass', 3000, 1.4);
        this.tone(420, t, 0.15, 'triangle', 0.35, s, 0.001, 0, 200);
        break;
      case 'sfx_hit_good':
        this.burst(t, 0.06, 0.55 * intensity, s, 'bandpass', 2400, 1.6);
        this.tone(360, t, 0.1, 'triangle', 0.25, s, 0.001, 0, 220);
        break;
      case 'sfx_hit_weak':
        this.burst(t, 0.07, 0.4, s, 'bandpass', 1200, 2.5);
        this.tone(220, t, 0.12, 'square', 0.08, s, 0.001, 800, 120);
        break;
      case 'sfx_swing_whiff':
        this.burst(t, 0.22, 0.3, s, 'bandpass', 600, 1.5, 2400);
        break;
      case 'sfx_ball_bounce':
        this.tone(170 * (0.9 + 0.2 * intensity), t, 0.09, 'sine', 0.35 * Math.min(1, intensity), s, 0.001, 0, 90);
        this.burst(t, 0.03, 0.15 * intensity, s, 'lowpass', 1500);
        break;
      case 'sfx_net_bounce':
        this.tone(95, t, 0.25, 'sine', 0.45, s, 0.002, 0, 60);
        this.burst(t, 0.18, 0.25, s, 'lowpass', 600);
        break;
      case 'sfx_out_whistle':
        this.tone(2600, t, 0.32, 'sine', 0.2, s, 0.01);
        this.tone(2750, t + 0.04, 0.28, 'sine', 0.12, s, 0.01);
        break;
      case 'sfx_score_win':
        [0, 4, 7, 12].forEach((n, i) => this.tone(midi(72 + n), t + i * 0.07, 0.25, 'square', 0.09, s, 0.005, 3000));
        this.burst(t, 1.2, 0.12, s, 'bandpass', 1400, 0.4);
        break;
      case 'sfx_score_lose':
        [7, 3, 0].forEach((n, i) => this.tone(midi(62 + n), t + i * 0.11, 0.3, 'triangle', 0.14, s, 0.01));
        break;
      case 'sfx_serve_toss':
        this.tone(900, t, 0.06, 'sine', 0.12, s, 0.002, 0, 1300);
        break;
      case 'sfx_crowd_cheer':
        this.burst(t, 1.8, 0.2 * intensity, s, 'bandpass', 1100, 0.35);
        this.burst(t + 0.1, 1.5, 0.12 * intensity, s, 'bandpass', 2300, 0.4);
        break;
      case 'ui_tap':
        this.tone(1100, t, 0.05, 'sine', 0.25, u, 0.002);
        break;
      case 'ui_confirm':
        this.tone(880, t, 0.07, 'sine', 0.25, u, 0.002);
        this.tone(1320, t + 0.06, 0.1, 'sine', 0.25, u, 0.002);
        break;
      case 'ui_cancel':
        this.tone(660, t, 0.08, 'sine', 0.22, u, 0.002, 0, 440);
        break;
      case 'bgm_victory':
        [0, 4, 7, 12, 16, 19, 24].forEach((n, i) => this.tone(midi(67 + n), t + i * 0.1, 0.5, 'square', 0.08, s, 0.005, 3500));
        [0, 4, 7].forEach((n) => this.tone(midi(55 + n), t + 0.7, 1.4, 'triangle', 0.12, s, 0.02));
        break;
      case 'bgm_defeat':
        [12, 10, 7, 3, 0].forEach((n, i) => this.tone(midi(60 + n), t + i * 0.18, 0.5, 'triangle', 0.12, s, 0.02));
        break;
    }
  }
}

export const audio = new AudioManager();
