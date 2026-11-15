import { settings } from '../core/settings';
import type { ThemeId } from '../data/gameData';

/** File slots under `public/assets/` (naming: 08_AI Prompt Master Set.md §12). Missing files fall back to procedural visuals. */
const BASE = `${import.meta.env.BASE_URL}assets/`;
const nn = (n: number) => String(n).padStart(2, '0');

export type Orientation = 'landscape' | 'portrait';
export type FxId = 'fx_hit_perfect' | 'fx_hit_great' | 'fx_bounce_dust' | 'fx_net_shake' | 'fx_confetti';

export const ASSET = {
  introVideo: `${BASE}video/intro/intro_6s.mp4`,
  titleImage: (orientation: Orientation) => `${BASE}images/title/title_key_visual_${orientation}.webp`,
  menuBackground: (orientation: Orientation) => `${BASE}images/ui/bg_menu_${orientation}.webp`,
  scoreBackground: (won: boolean) => `${BASE}images/ui/bg_score_${won ? 'win' : 'lose'}.webp`,
  stageImage: (stageId: number) => `${BASE}images/stages/stage_${nn(stageId)}_key.webp`,
  characterPortrait: (characterId: string) => `${BASE}images/characters/${characterId.toLowerCase()}_portrait.webp`,
  characterStill: (characterId: string, won: boolean) => `${BASE}images/characters/${characterId.toLowerCase()}_${won ? 'victory' : 'defeat'}.webp`,
  howTo: (page: number) => `${BASE}images/howto/howto_${nn(page)}.webp`,
  crowdSheet: (theme: ThemeId) => `${BASE}images/crowd/crowd_${theme}.webp`,
  fxSheet: (id: FxId) => `${BASE}images/vfx/${id}.webp`,
  stageIntroVideo: (stageId: number) => `${BASE}video/stages/stage_${nn(stageId)}_intro_4s.mp4`,
  stageEndVideo: (stageId: number, won: boolean) => `${BASE}video/stages/stage_${nn(stageId)}_${won ? 'clear' : 'fail'}_4s.mp4`,
};

/** Applies `url` as a background image only if it actually loads; adds `has-art` so CSS can adapt. */
export function artBackground(el: HTMLElement, url: string): void {
  const img = new Image();
  img.onload = () => {
    el.style.backgroundImage = `url("${url}")`;
    el.classList.add('has-art');
  };
  img.src = url;
}

/**
 * Full-screen background art behind a screen's content. Tries `urls` in order and keeps the first that loads;
 * `onLoad` lets the screen adapt its layout once art is present.
 */
export function screenBackground(screen: HTMLElement, urls: string[], onLoad?: () => void): void {
  const bg = document.createElement('div');
  bg.className = 'screen-bg';
  screen.prepend(bg);
  const tryAt = (i: number) => {
    if (i >= urls.length) return;
    const img = new Image();
    img.onload = () => {
      bg.style.backgroundImage = `url("${urls[i]}")`;
      bg.classList.add('has-art');
      onLoad?.();
    };
    img.onerror = () => tryAt(i + 1);
    img.src = urls[i];
  };
  tryAt(0);
}

export interface VideoHandle {
  /** Root element: blurred full-bleed copy behind the uncropped original (07 §16). */
  el: HTMLElement;
  video: HTMLVideoElement;
  stop: () => void;
}

/**
 * Optional full-bleed video. Stays invisible until the file loads, so the procedural fallback underneath remains.
 * Follows the global sound toggle. `onEnd` fires on end or load error.
 */
export function assetVideo(src: string, onEnd?: () => void): VideoHandle {
  const el = document.createElement('div');
  el.className = 'asset-video';
  const back = document.createElement('video');
  back.className = 'asset-video-blur';
  const video = document.createElement('video');
  video.className = 'asset-video-main';
  for (const v of [back, video]) {
    v.playsInline = true;
    v.preload = 'auto';
    v.setAttribute('playsinline', '');
  }
  back.muted = true;
  back.setAttribute('aria-hidden', 'true');
  video.muted = !settings.soundOn;
  const offSound = settings.onSound(() => (video.muted = !settings.soundOn));
  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    offSound();
    video.pause();
    back.pause();
    el.remove();
  };
  const end = () => {
    stop();
    onEnd?.();
  };
  video.addEventListener('error', end);
  video.addEventListener('ended', end);
  video.addEventListener('loadeddata', () => {
    el.classList.add('show');
    void video.play().catch(() => {
      video.muted = true;
      void video.play().catch(() => undefined);
    });
    void back.play().catch(() => undefined);
  });
  video.addEventListener('timeupdate', () => {
    if (Math.abs(back.currentTime - video.currentTime) > 0.25) back.currentTime = video.currentTime;
  });
  el.append(back, video);
  back.src = src;
  video.src = src;
  return { el, video, stop };
}

/** Plays an optional video layer inside `host`; returns a disposer. */
export function overlayVideo(host: HTMLElement, src: string): () => void {
  const v = assetVideo(src);
  host.append(v.el);
  return v.stop;
}
