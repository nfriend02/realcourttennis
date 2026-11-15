import * as THREE from 'three';
import { VISUAL } from '../data/gameData';
import type { LayoutProfile } from '../core/layout';

export type CameraMode = 'follow' | 'flyin' | 'orbit' | 'replay';

const DEG = Math.PI / 180;
/** Balls closer to the camera plane than this are ignored for framing. */
const MIN_BALL_DEPTH_M = 2;

/** Ball position in game coordinates (z toward the NPC side). */
export interface BallFrame {
  x: number;
  y: number;
  z: number;
}

/**
 * Eye-level telephoto rig (07 §9.1): 12 m behind the player, 2.1 m high, vertical FOV 13° (landscape)
 * or horizontal FOV 22.8° (portrait). Pitch auto-corrects so the player's feet sit at the bottom edge.
 */
export class CameraRig {
  readonly camera = new THREE.PerspectiveCamera(13, 16 / 9, 0.1, 300);
  mode: CameraMode = 'follow';
  private profile: LayoutProfile = 'desktop';
  private aspect = 16 / 9;
  private pos = new THREE.Vector3(0, 2.1, 25);
  private yaw = 0;
  private pitch = 0;
  private followFov = 13;
  private modeTime = 0;
  private modeDur = 4;
  private orbitTarget = new THREE.Vector3();
  private orbitWin = true;
  private shakeT = 0;
  private shakeAmp = 0;

  constructor() {
    this.camera.rotation.order = 'YXZ';
  }

  setViewport(aspect: number, profile: LayoutProfile): void {
    this.aspect = aspect;
    this.profile = profile;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  private cfg() {
    return this.profile === 'mobile-portrait' ? VISUAL.camera.portrait : VISUAL.camera.landscape;
  }

  /** Vertical FOV in degrees for the current profile. */
  verticalFov(): number {
    const c = this.cfg();
    if (c.fovMode === 'horizontal') return (2 * Math.atan(Math.tan((c.fovDeg * DEG) / 2) / this.aspect)) / DEG;
    return c.fovDeg;
  }

  startFlyIn(dur = 4): void {
    this.mode = 'flyin';
    this.modeTime = 0;
    this.modeDur = dur;
  }

  startOrbit(px: number, pz: number, win: boolean, dur = 4): void {
    this.mode = 'orbit';
    this.modeTime = 0;
    this.modeDur = dur;
    this.orbitTarget.set(px, 1.2, -pz);
    this.orbitWin = win;
  }

  startReplay(): void {
    this.mode = 'replay';
    this.modeTime = 0;
  }

  follow(): void {
    this.mode = 'follow';
  }

  shake(amp: number, dur: number): void {
    this.shakeAmp = amp;
    this.shakeT = dur;
  }

  /** Pitch that keeps the player's feet at the bottom edge for a given vertical FOV (degrees). */
  private feetPitch(vfov: number): number {
    const c = this.cfg();
    const feet = Math.atan2(-c.height, c.distanceBehind);
    return feet + (vfov * DEG) / 2 - c.feetViewportY * vfov * DEG;
  }

  /**
   * Follow pose. With a ball, the vertical FOV widens (up to maxFovMul) so the ball stays inside the frame
   * with a margin, while the feet stay at the bottom edge.
   */
  private followPose(px: number, pz: number, ball: BallFrame | null): { pos: THREE.Vector3; yaw: number; fov: number } {
    const c = this.cfg();
    const base = this.verticalFov();
    const camX = px;
    const camZ = -pz + c.distanceBehind;
    const yaw = Math.max(-c.maxYawDeg * DEG, Math.min(c.maxYawDeg * DEG, Math.atan2(camX * 0.35, 24)));
    let fov = base;
    if (ball) {
      const fwd = camZ + ball.z;
      if (fwd > MIN_BALL_DEPTH_M) {
        const feet = Math.atan2(-c.height, c.distanceBehind);
        const up = Math.atan2(ball.y - c.height, fwd) + c.ballTopMarginDeg * DEG;
        const needV = (up - feet) / (1 - c.feetViewportY) / DEG;
        const side = Math.abs(Math.atan2(ball.x - camX, fwd) + yaw) + c.ballSideMarginDeg * DEG;
        const needH = (2 * Math.atan(Math.tan(side) / this.aspect)) / DEG;
        fov = Math.min(Math.max(base, needV, needH), base * c.maxFovMul);
      }
    }
    return { pos: new THREE.Vector3(camX, c.height, camZ), yaw, fov };
  }

  update(dt: number, playerX: number, playerZ: number, ball: BallFrame | null = null): void {
    const c = this.cfg();
    const target = this.followPose(playerX, playerZ, ball);
    this.modeTime += dt;
    const ballX = ball?.x ?? 0;
    const ballZ = ball?.z ?? 0;
    let fov = this.followFov;
    if (this.mode === 'follow') {
      const k = 1 - Math.exp(-dt / c.followDampingSec);
      const kf = 1 - Math.exp(-dt / c.fovDampingSec);
      this.pos.lerp(target.pos, k);
      this.yaw += (target.yaw - this.yaw) * k;
      this.followFov += (target.fov - this.followFov) * kf;
      fov = this.followFov;
      this.pitch = this.feetPitch(fov);
    } else if (this.mode === 'flyin') {
      const u = Math.min(1, this.modeTime / this.modeDur);
      const e = 1 - (1 - u) ** 3;
      const start = new THREE.Vector3(16, 10, 6);
      this.pos.copy(start).lerp(target.pos, e);
      const look = new THREE.Vector3(0, 0.8, 0).lerp(new THREE.Vector3(playerX, 1, -playerZ - 30), e);
      this.lookAt(look);
      fov = 45 + (target.fov - 45) * e;
      if (u >= 1) this.mode = 'follow';
    } else if (this.mode === 'orbit') {
      const u = Math.min(1, this.modeTime / this.modeDur);
      const ang = (this.orbitWin ? 0.15 : 0.6) * Math.PI + u * Math.PI * (this.orbitWin ? 0.85 : 0.25);
      const rad = this.orbitWin ? 4.2 - u * 0.8 : 3.5 + u * 3;
      const t = this.orbitTarget;
      this.pos.set(t.x + Math.sin(ang) * rad, 1.7 + (this.orbitWin ? 0.2 : 1.2 * u), t.z + Math.cos(ang) * rad);
      this.lookAt(t);
      fov = 38;
    } else if (this.mode === 'replay') {
      const tz = -ballZ;
      this.pos.lerp(new THREE.Vector3(15, 3.6, tz * 0.6), this.modeTime < 0.05 ? 1 : 1 - Math.exp(-dt / 0.3));
      this.lookAt(new THREE.Vector3(ballX * 0.3, 0.9, tz * 0.75));
      fov = 34;
    }

    this.camera.position.copy(this.pos);
    if (this.shakeT > 0) {
      this.shakeT -= dt;
      this.camera.position.x += (Math.random() - 0.5) * this.shakeAmp;
      this.camera.position.y += (Math.random() - 0.5) * this.shakeAmp;
    }
    this.camera.rotation.set(this.pitch, this.yaw, 0);
    if (Math.abs(this.camera.fov - fov) > 0.01) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    }
  }

  /** Jump to the follow pose immediately (after layout change / new point). */
  snap(playerX: number, playerZ: number): void {
    const t = this.followPose(playerX, playerZ, null);
    this.pos.copy(t.pos);
    this.yaw = t.yaw;
    this.followFov = t.fov;
    this.pitch = this.feetPitch(t.fov);
  }

  private lookAt(p: THREE.Vector3): void {
    const d = new THREE.Vector3().subVectors(p, this.pos);
    this.yaw = Math.atan2(-d.x, -d.z);
    this.pitch = Math.atan2(d.y, Math.hypot(d.x, d.z));
  }
}
