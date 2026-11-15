import type { LayoutProfile } from './layout';

/**
 * Per-layout HUD / UX tokens (07 §12). Applied as CSS variables on <html>
 * so screens and match HUD react immediately on orientation change.
 */
export interface HudProfile {
  sysBtnPx: number;
  btnPx: number;
  sysGapPx: number;
  /** System bar row count (1 = single strip; 2 kept for optional stacked layout). */
  sysbarRows: 1 | 2;
  scoreboardScale: number;
  controlPadMaxVw: number;
}

export const HUD_PROFILES: Record<LayoutProfile, HudProfile> = {
  desktop: {
    sysBtnPx: 44,
    btnPx: 52,
    sysGapPx: 8,
    sysbarRows: 1,
    scoreboardScale: 1,
    controlPadMaxVw: 0,
  },
  'mobile-landscape': {
    sysBtnPx: 42,
    btnPx: 64,
    sysGapPx: 6,
    sysbarRows: 1,
    scoreboardScale: 0.95,
    controlPadMaxVw: 28,
  },
  'mobile-portrait': {
    sysBtnPx: 36,
    btnPx: 56,
    sysGapPx: 4,
    sysbarRows: 1,
    scoreboardScale: 0.9,
    controlPadMaxVw: 45,
  },
};

export function applyHudProfile(profile: LayoutProfile): void {
  const h = HUD_PROFILES[profile];
  const root = document.documentElement;
  root.style.setProperty('--sys-btn', `${h.sysBtnPx}px`);
  root.style.setProperty('--btn', `${h.btnPx}px`);
  root.style.setProperty('--sys-gap', `${h.sysGapPx}px`);
  root.style.setProperty('--scoreboard-scale', String(h.scoreboardScale));
  root.dataset.sysbarRows = String(h.sysbarRows);
}
