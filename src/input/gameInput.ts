import { layout } from '../core/layout';
import { settings } from '../core/settings';
import { type StrokeHeight, type StrokeId, makeStroke, sideForScreen } from '../game/physics/types';

const EDGE_MARGIN_PX = 6;
const STICKY_MARGIN_PX = 12;

export interface InputSink {
  setIntent(ix: number, iy: number): void;
  press(stroke: StrokeId, tMatch: number): void;
  release(stroke: StrokeId, tMatch: number): void;
  cancel(): void;
  /** Converts an input event timestamp (performance.now() base) to match time. */
  toMatchTime(eventTimeStamp: number): number;
}

/**
 * Multi-touch gameplay input (07 §11): the pad and the stroke cluster each capture their own pointer,
 * so both thumbs work at once. Release on a button swings; release outside the cluster cancels.
 */
export class GameInput {
  private padPointer: number | null = null;
  private clusterPointer: number | null = null;
  private hovered: StrokeId | null = null;
  private keys = new Set<string>();
  private keyStroke: StrokeId | null = null;
  private spaceHeld = false;
  private padIntent = { x: 0, y: 0 };
  private disposers: (() => void)[] = [];

  constructor(private readonly pad: HTMLElement, private readonly cluster: HTMLElement, private readonly sink: InputSink) {
    this.bindPad();
    this.bindCluster();
    this.bindKeys();
  }

  private listen<K extends keyof HTMLElementEventMap>(el: HTMLElement | Window, type: K, fn: (e: HTMLElementEventMap[K]) => void, opts?: AddEventListenerOptions): void {
    el.addEventListener(type, fn as EventListener, opts);
    this.disposers.push(() => el.removeEventListener(type, fn as EventListener, opts));
  }

  // ------------------------------------------------------------ pad

  private bindPad(): void {
    const knob = this.pad.querySelector<HTMLElement>('.pad-knob');
    const update = (e: PointerEvent) => {
      const r = this.pad.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const ix = Math.max(-1, Math.min(1, (e.clientX - cx) / (r.width / 2)));
      const iy = Math.max(-1, Math.min(1, (cy - e.clientY) / (r.height / 2)));
      this.padIntent = { x: ix, y: iy };
      if (knob) knob.style.transform = `translate(calc(-50% + ${ix * r.width * 0.36}px), calc(-50% + ${-iy * r.height * 0.36}px))`;
      this.pushIntent();
    };
    this.listen(this.pad, 'pointerdown', (e) => {
      if (layout.inputLocked || this.padPointer !== null) return;
      e.preventDefault();
      this.padPointer = e.pointerId;
      this.pad.setPointerCapture(e.pointerId);
      this.pad.classList.add('active');
      update(e);
    });
    this.listen(this.pad, 'pointermove', (e) => {
      if (e.pointerId === this.padPointer) update(e);
    });
    const end = (e: PointerEvent) => {
      if (e.pointerId !== this.padPointer) return;
      this.padPointer = null;
      this.pad.classList.remove('active');
      this.padIntent = { x: 0, y: 0 };
      if (knob) knob.style.transform = 'translate(-50%, -50%)';
      this.pushIntent();
    };
    this.listen(this.pad, 'pointerup', end);
    this.listen(this.pad, 'pointercancel', end);
  }

  private pushIntent(): void {
    let x = this.padIntent.x;
    let y = this.padIntent.y;
    if (this.padPointer === null) {
      x = (this.keys.has('KeyD') ? 1 : 0) - (this.keys.has('KeyA') ? 1 : 0);
      y = (this.keys.has('KeyW') ? 1 : 0) - (this.keys.has('KeyS') ? 1 : 0);
    }
    this.sink.setIntent(x, y);
  }

  // ------------------------------------------------------------ cluster

  /**
   * Button under the pointer. The held button keeps the pointer within a sticky margin (it is drawn scaled down
   * while pressed), then a button that contains the point wins, then the nearest one within the edge margin.
   */
  private buttonAt(x: number, y: number): HTMLElement | null {
    const buttons = this.cluster.querySelectorAll<HTMLElement>('[data-stroke]');
    const dist = (r: DOMRect) => Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom));
    let nearest: HTMLElement | null = null;
    let nearestD = EDGE_MARGIN_PX;
    for (const b of buttons) {
      const d = dist(b.getBoundingClientRect());
      if (b.dataset.stroke === this.hovered && d <= STICKY_MARGIN_PX) return b;
      if (d === 0) return b;
      if (d <= nearestD) {
        nearestD = d;
        nearest = b;
      }
    }
    return nearest;
  }

  private setHover(stroke: StrokeId | null): void {
    this.cluster.querySelectorAll<HTMLElement>('[data-stroke]').forEach((b) => b.classList.toggle('pressed', b.dataset.stroke === stroke));
  }

  private bindCluster(): void {
    this.listen(this.cluster, 'pointerdown', (e) => {
      if (layout.inputLocked || this.clusterPointer !== null) return;
      const b = this.buttonAt(e.clientX, e.clientY);
      if (!b) return;
      e.preventDefault();
      this.clusterPointer = e.pointerId;
      this.cluster.setPointerCapture(e.pointerId);
      this.cluster.classList.add('active');
      this.hovered = b.dataset.stroke as StrokeId;
      this.setHover(this.hovered);
      this.sink.press(this.hovered, this.sink.toMatchTime(e.timeStamp));
    });
    this.listen(this.cluster, 'pointermove', (e) => {
      if (e.pointerId !== this.clusterPointer) return;
      const b = this.buttonAt(e.clientX, e.clientY);
      const s = (b?.dataset.stroke as StrokeId | undefined) ?? null;
      if (s !== this.hovered) {
        this.hovered = s;
        this.setHover(s);
        if (s) this.sink.press(s, this.sink.toMatchTime(e.timeStamp));
      }
    });
    const end = (e: PointerEvent, cancelled: boolean) => {
      if (e.pointerId !== this.clusterPointer) return;
      this.clusterPointer = null;
      this.cluster.classList.remove('active');
      const s = cancelled ? null : this.hovered;
      this.hovered = null;
      this.setHover(null);
      if (s) this.sink.release(s, this.sink.toMatchTime(e.timeStamp));
      else this.sink.cancel();
    };
    this.listen(this.cluster, 'pointerup', (e) => end(e, false));
    this.listen(this.cluster, 'pointercancel', (e) => end(e, true));
  }

  // ------------------------------------------------------------ keyboard (07 §11.4)

  private keyHeight(): StrokeHeight {
    if (this.keys.has('ArrowUp')) return 'high';
    if (this.keys.has('ArrowDown')) return 'low';
    return 'middle';
  }

  private keyStrokeFor(code: string): StrokeId {
    const screen: 1 | -1 = code === 'ArrowRight' ? 1 : -1;
    return makeStroke(sideForScreen(screen, settings.hand), this.keyHeight());
  }

  private bindKeys(): void {
    this.listen(window, 'keydown', (e: KeyboardEvent) => {
      if (e.repeat) {
        if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
        return;
      }
      const tm = this.sink.toMatchTime(e.timeStamp);
      this.keys.add(e.code);
      switch (e.code) {
        case 'KeyW':
        case 'KeyA':
        case 'KeyS':
        case 'KeyD':
          this.pushIntent();
          break;
        case 'ArrowLeft':
        case 'ArrowRight':
          e.preventDefault();
          this.keyStroke = this.keyStrokeFor(e.code);
          this.setHover(this.keyStroke);
          this.sink.press(this.keyStroke, tm);
          break;
        case 'ArrowUp':
        case 'ArrowDown':
          e.preventDefault();
          if (this.keyStroke) {
            const side = this.keys.has('ArrowRight') ? 'ArrowRight' : 'ArrowLeft';
            this.keyStroke = this.keyStrokeFor(side);
            this.setHover(this.keyStroke);
            this.sink.press(this.keyStroke, tm);
          }
          break;
        case 'Space':
          e.preventDefault();
          this.spaceHeld = true;
          this.sink.press('fh_high', tm);
          break;
        default:
          break;
      }
    });
    this.listen(window, 'keyup', (e: KeyboardEvent) => {
      const tm = this.sink.toMatchTime(e.timeStamp);
      this.keys.delete(e.code);
      switch (e.code) {
        case 'KeyW':
        case 'KeyA':
        case 'KeyS':
        case 'KeyD':
          this.pushIntent();
          break;
        case 'ArrowLeft':
        case 'ArrowRight':
          if (this.keyStroke) {
            const s = this.keyStroke;
            this.keyStroke = null;
            this.setHover(null);
            this.sink.release(s, tm);
          }
          break;
        case 'ArrowUp':
        case 'ArrowDown':
          // Keep the chosen height: letting go of ↑/↓ a moment before ←/→ must not turn the stroke into a middle one.
          break;
        case 'Space':
          if (this.spaceHeld) {
            this.spaceHeld = false;
            this.sink.release('fh_high', tm);
          }
          break;
        default:
          break;
      }
    });
    this.listen(window, 'blur', () => {
      this.keys.clear();
      this.keyStroke = null;
      this.spaceHeld = false;
      this.pushIntent();
      this.sink.cancel();
    });
  }

  /** Highlights the recommended stroke (Stroke Hint, stages 1–2). */
  hint(stroke: StrokeId | null): void {
    this.cluster.querySelectorAll<HTMLElement>('[data-stroke]').forEach((b) => b.classList.toggle('hint', b.dataset.stroke === stroke));
  }

  /**
   * Optional height-only glow (legacy). Cue 3 now uses `hint(recommendedStroke)` so side + height match.
   */
  hintHeight(h: 'high' | 'mid' | 'low' | null): void {
    this.cluster.querySelectorAll<HTMLElement>('[data-stroke]').forEach((b) => {
      const on = h !== null && b.dataset.h === h;
      b.classList.toggle('hint-height', on);
    });
  }

  dispose(): void {
    this.disposers.forEach((d) => d());
    this.disposers = [];
  }
}
