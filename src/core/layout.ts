import { applyHudProfile } from './hudProfiles';

export type LayoutProfile = 'desktop' | 'mobile-landscape' | 'mobile-portrait';

/** 07 §12.1 — portrait wins, touch-primary short side < 900 dp is mobile landscape, otherwise desktop. */
export function detectLayout(widthPx: number, heightPx: number, touchPrimary: boolean): LayoutProfile {
  if (heightPx > widthPx) return 'mobile-portrait';
  if (touchPrimary && Math.min(widthPx, heightPx) < 900) return 'mobile-landscape';
  return 'desktop';
}

type Listener = (p: LayoutProfile) => void;

class LayoutManager {
  profile: LayoutProfile = 'desktop';
  private listeners = new Set<Listener>();
  private timer = 0;
  private lockUntil = 0;

  init(): void {
    this.apply(this.detect());
    const schedule = () => {
      window.clearTimeout(this.timer);
      this.timer = window.setTimeout(() => {
        const p = this.detect();
        this.measure();
        if (p !== this.profile) this.apply(p);
      }, 150);
    };
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);
    window.visualViewport?.addEventListener('resize', schedule);
  }

  /** True during the 200 ms input lock after a layout switch. */
  get inputLocked(): boolean {
    return performance.now() < this.lockUntil;
  }

  onChange(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  /** Publishes the measured system bar height as `--sys-h` (no estimated values). */
  measure(): void {
    const bar = document.querySelector<HTMLElement>('.sysbar');
    const h = bar ? bar.getBoundingClientRect().height : 56;
    document.documentElement.style.setProperty('--sys-h', `${Math.round(h)}px`);
    document.documentElement.style.setProperty('--app-h', `${window.innerHeight}px`);
  }

  private detect(): LayoutProfile {
    const touch = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
    return detectLayout(window.innerWidth, window.innerHeight, touch);
  }

  private apply(p: LayoutProfile): void {
    this.profile = p;
    document.documentElement.dataset.layout = p;
    applyHudProfile(p);
    this.lockUntil = performance.now() + 200;
    this.measure();
    this.listeners.forEach((fn) => fn(p));
  }
}

export const layout = new LayoutManager();
