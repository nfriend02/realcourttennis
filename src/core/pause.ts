export type PauseReason = 'menu' | 'hidden' | 'admin' | 'rotation';

/** Reason-based pause: paused while any reason is active; reasons never overwrite each other. */
export class PauseController {
  private reasons = new Set<PauseReason>();
  private listeners = new Set<(paused: boolean) => void>();

  get paused(): boolean {
    return this.reasons.size > 0;
  }

  has(r: PauseReason): boolean {
    return this.reasons.has(r);
  }

  set(r: PauseReason, on: boolean): void {
    const before = this.paused;
    if (on) this.reasons.add(r);
    else this.reasons.delete(r);
    if (before !== this.paused) this.listeners.forEach((fn) => fn(this.paused));
  }

  clear(): void {
    const before = this.paused;
    this.reasons.clear();
    if (before) this.listeners.forEach((fn) => fn(false));
  }

  onChange(fn: (paused: boolean) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}

export const pause = new PauseController();
