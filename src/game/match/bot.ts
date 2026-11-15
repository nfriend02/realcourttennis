import type { IRandom } from '../core/random';
import { STROKES, type StrokeId } from '../physics/types';
import type { MatchModel } from './matchModel';

export interface BotProfile {
  timingSigmaSec: number;
  strokeAccuracy: number;
}

/** Headless player bot used by tests and the balance simulation (07 §8.13). */
export class PlayerBot {
  private plannedRelease = -1;
  private stroke: StrokeId = 'fh_mid';
  private pressed = false;
  private lastRally = -1;

  constructor(private readonly profile: BotProfile, private readonly rng: IRandom) {}

  update(m: MatchModel): void {
    const t = m.t;
    if (m.phase === 'serve_wait') {
      if (t - m.phaseTime > 0.3) {
        m.pressStroke('fh_high', t);
        this.plannedRelease = (m.tossContactTime + m.tossWindowEnd) / 2 + this.rng.gaussian() * this.profile.timingSigmaSec;
      }
      return;
    }
    if (m.phase === 'toss') {
      if (t >= this.plannedRelease) m.releaseStroke('fh_high', t);
      return;
    }
    if (!m.awaitingPlayerHit) {
      this.pressed = false;
      return;
    }
    if (this.lastRally !== m.rally) {
      this.lastRally = m.rally;
      this.pressed = false;
      this.plannedRelease = -1;
    }
    const contact = m.predictedPlayerContact();
    if (!contact) return;
    if (!this.pressed && contact.t - t < 0.45) {
      const rec = m.recommendedStroke ?? 'fh_mid';
      this.stroke = this.rng.next() < this.profile.strokeAccuracy ? rec : STROKES[Math.floor(this.rng.next() * STROKES.length)];
      m.pressStroke(this.stroke, t);
      this.pressed = true;
      this.plannedRelease = this.rng.gaussian() * this.profile.timingSigmaSec;
    }
    if (this.pressed && t >= contact.t + this.plannedRelease) {
      m.releaseStroke(this.stroke, t);
      this.pressed = false;
      this.lastRally = m.rally;
      this.plannedRelease = 1e9;
    }
  }
}
