import './styles.css';
import { audio } from './audio/audioManager';
import { layout } from './core/layout';
import { pause } from './core/pause';
import { settings } from './core/settings';
import { setLang } from './i18n/i18n';
import { App } from './ui/app';
import { matchScreen } from './ui/matchScreen';
import { introScreen, loginScreen, scoreScreen, setupScreen, signupScreen, titleScreen } from './ui/screens';

/** The only click / touch targets on the gameplay screen. */
const MATCH_INPUT_TARGETS = '.match.playing .pad, .match.playing .cluster, .match-overlay button, .sys-btn.sound, .sys-btn.home, .sys-btn.lang, .modal-root';

function boot(): void {
  document.documentElement.dataset.hand = settings.hand;
  setLang(settings.lang);
  document.documentElement.lang = settings.lang;
  layout.init();
  audio.init();
  pause.onChange((p) => audio.setPaused(p));

  const root = document.getElementById('app');
  if (!root) throw new Error('#app missing');
  const app = new App(root);
  app.register('intro', introScreen);
  app.register('title', titleScreen);
  app.register('login', loginScreen);
  app.register('signup', signupScreen);
  app.register('setup', setupScreen);
  app.register('match', matchScreen);
  app.register('score', scoreScreen);

  // Block browser gestures that would steal gameplay touches (pinch zoom, double-tap zoom, context menu).
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('contextmenu', (e) => {
    if ((e.target as HTMLElement).closest('.match')) e.preventDefault();
  });
  // Gameplay screen: touches / clicks outside the game controls and UI keys do nothing (no focus, selection or zoom).
  const blockOutsideControls = (e: Event) => {
    if (document.documentElement.dataset.screen !== 'match') return;
    const t = e.target;
    if (t instanceof Element && t.closest(MATCH_INPUT_TARGETS)) return;
    e.preventDefault();
    e.stopPropagation();
  };
  for (const type of ['pointerdown', 'touchstart', 'mousedown', 'click', 'dblclick'] as const) {
    document.addEventListener(type, blockOutsideControls, { capture: true, passive: false });
  }

  app.go('intro');
}

boot();
