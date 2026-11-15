import * as THREE from 'three';
import { PHYSICS, VISUAL } from '../data/gameData';
import type { StrokeHeight } from '../game/physics/types';

const TRAIL = 14;
const BC = VISUAL.bounceCues;
const ARC_N = BC.arc.maxDots;

export interface BounceCueFrame {
  /** Cue 2: color / scale landing ring by rebound band. */
  cue2: boolean;
  /** Cue 1: post-bounce rebound arc + apex. */
  cue1: boolean;
  /** Cue 4: exaggerated shadow + height gauge. */
  cue4: boolean;
  band: StrokeHeight | null;
  arc: { x: number; y: number; z: number }[] | null;
  apexY: number | null;
  /** Cue 5 lingering trail tint (hex), or null. */
  trailTint: number | null;
}

const EMPTY_CUES: BounceCueFrame = {
  cue2: false,
  cue1: false,
  cue4: false,
  band: null,
  arc: null,
  apexY: null,
  trailTint: null,
};

function bandHex(band: StrokeHeight): number {
  return Number.parseInt(BC.band[band].hex.slice(1), 16);
}

/** Ball + distance-based visual scale + trail + contact shadow + landing marker (07 §9.1). */
export class BallView {
  readonly group = new THREE.Group();
  private ball: THREE.Mesh;
  private shadow: THREE.Mesh;
  private marker: THREE.Mesh;
  private markerInner: THREE.Mesh;
  private trail: THREE.Mesh;
  private trailPos = new Float32Array(TRAIL * 2 * 3);
  private history: THREE.Vector3[] = [];
  private pulse = 0;
  private ring: THREE.Mesh;
  private arcDots: THREE.Mesh[] = [];
  private apexDot: THREE.Mesh;
  private gaugeStem: THREE.Mesh;
  private gaugeFill: THREE.Mesh;
  private gaugeKnob: THREE.Mesh;
  private tmp = new THREE.Vector3();
  private camDir = new THREE.Vector3();
  private side = new THREE.Vector3();
  private dir = new THREE.Vector3();

  constructor() {
    const r = PHYSICS.ballRadiusM;
    this.ball = new THREE.Mesh(
      new THREE.SphereGeometry(r, 16, 12),
      new THREE.MeshToonMaterial({ color: 0xe3ff3b, emissive: 0x9fbf00, emissiveIntensity: 0.55 }),
    );
    this.ball.castShadow = true;
    this.group.add(this.ball);

    this.shadow = new THREE.Mesh(new THREE.CircleGeometry(r * 1.4, 16), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45, depthWrite: false }));
    this.shadow.rotation.x = -Math.PI / 2;
    this.group.add(this.shadow);

    this.marker = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.27, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide }));
    this.marker.rotation.x = -Math.PI / 2;
    this.marker.position.y = 0.012;
    this.markerInner = new THREE.Mesh(new THREE.CircleGeometry(0.2, 24), new THREE.MeshBasicMaterial({ color: 0xffef5a, transparent: true, opacity: 0.25, depthWrite: false }));
    this.markerInner.rotation.x = -Math.PI / 2;
    this.markerInner.position.y = 0.011;
    this.group.add(this.marker, this.markerInner);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.trailPos, 3));
    const alpha = new Float32Array(TRAIL * 2);
    for (let i = 0; i < TRAIL; i++) {
      alpha[i * 2] = alpha[i * 2 + 1] = 1 - i / TRAIL;
    }
    geo.setAttribute('alpha', new THREE.BufferAttribute(alpha, 1));
    const idx: number[] = [];
    for (let i = 0; i < TRAIL - 1; i++) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    geo.setIndex(idx);
    this.trail = new THREE.Mesh(
      geo,
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: { color: { value: new THREE.Color(0xf4ff9a) } },
        vertexShader: 'attribute float alpha; varying float vA; void main(){ vA = alpha; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: 'uniform vec3 color; varying float vA; void main(){ gl_FragColor = vec4(color, vA * 0.55); }',
      }),
    );
    this.trail.frustumCulled = false;
    this.group.add(this.trail);

    this.ring = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.2, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false, depthWrite: false }));
    this.ring.renderOrder = 10;
    this.ring.visible = false;
    this.group.add(this.ring);

    const arcMat = () => new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: BC.arc.opacity, depthWrite: false });
    for (let i = 0; i < ARC_N; i++) {
      const d = new THREE.Mesh(new THREE.SphereGeometry(BC.arc.dotRadiusM, 8, 6), arcMat());
      d.visible = false;
      this.arcDots.push(d);
      this.group.add(d);
    }
    this.apexDot = new THREE.Mesh(new THREE.SphereGeometry(BC.arc.apexRadiusM, 10, 8), arcMat());
    this.apexDot.visible = false;
    this.group.add(this.apexDot);

    const gw = BC.shadow.gaugeWidthM;
    const gh = BC.shadow.gaugeHeightM;
    this.gaugeStem = new THREE.Mesh(
      new THREE.BoxGeometry(gw, gh, gw),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, depthWrite: false }),
    );
    this.gaugeFill = new THREE.Mesh(
      new THREE.BoxGeometry(gw * 1.4, gh, gw * 1.4),
      new THREE.MeshBasicMaterial({ color: 0xffef5a, transparent: true, opacity: 0.55, depthWrite: false }),
    );
    this.gaugeKnob = new THREE.Mesh(
      new THREE.SphereGeometry(gw * 2.2, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false }),
    );
    this.gaugeStem.visible = this.gaugeFill.visible = this.gaugeKnob.visible = false;
    this.group.add(this.gaugeStem, this.gaugeFill, this.gaugeKnob);

    this.setVisible(false);
  }

  /**
   * Timing ring at the predicted contact point: shrinks to the ball size exactly at contact time.
   * `remaining` = seconds until contact (null hides it).
   */
  timingRing(x: number, y: number, z: number, remaining: number | null, camera: THREE.Camera): void {
    if (remaining === null || remaining > 0.7 || remaining < -0.12) {
      this.ring.visible = false;
      return;
    }
    this.ring.visible = true;
    this.ring.position.set(x, y, -z);
    this.ring.quaternion.copy(camera.quaternion);
    const s = 1 + Math.max(0, remaining) * 5;
    this.ring.scale.setScalar(s);
    const mat = this.ring.material as THREE.MeshBasicMaterial;
    const close = Math.abs(remaining) < 0.035;
    mat.color.set(close ? 0xe3ff3b : 0xffffff);
    mat.opacity = remaining < 0 ? 0.3 : 0.25 + (1 - remaining / 0.7) * 0.55;
  }

  setVisible(v: boolean): void {
    this.ball.visible = v;
    this.shadow.visible = v;
    this.trail.visible = v;
    if (!v) {
      this.history.length = 0;
      this.hideCueExtras();
    }
  }

  resetTrail(): void {
    this.history.length = 0;
  }

  /** Model coordinates in, three coordinates internally. */
  update(
    x: number,
    y: number,
    z: number,
    camera: THREE.Camera,
    landing: { x: number; z: number } | null,
    dt: number,
    cues: BounceCueFrame = EMPTY_CUES,
  ): void {
    const p = this.tmp.set(x, y, -z);
    this.ball.position.copy(p);
    const d = camera.position.distanceTo(p);
    const k = Math.min(1, Math.max(0, (d - 12) / 24));
    const scale = VISUAL.ballVisualScaleNear + (VISUAL.ballVisualScaleFar - VISUAL.ballVisualScaleNear) * k;
    this.ball.scale.setScalar(scale);

    this.shadow.position.set(x, 0.009, -z);
    let hs = Math.max(0.5, 1.4 - y * 0.25) * scale;
    if (cues.cue4) {
      const sh = BC.shadow;
      hs = Math.min(sh.maxScale, Math.max(sh.minScale, 1.2 - y * sh.heightMul)) * scale;
    }
    this.shadow.scale.setScalar(hs);
    (this.shadow.material as THREE.MeshBasicMaterial).opacity = Math.max(0.15, 0.5 - y * 0.08);

    if (this.history.length < TRAIL) this.history.unshift(p.clone());
    else {
      const recycled = this.history.pop()!;
      recycled.copy(p);
      this.history.unshift(recycled);
    }

    const width = 0.035 * scale;
    for (let i = 0; i < TRAIL; i++) {
      const a = this.history[Math.min(i, this.history.length - 1)] ?? p;
      const b = this.history[Math.min(i + 1, this.history.length - 1)] ?? a;
      this.dir.subVectors(a, b);
      this.camDir.subVectors(camera.position, a);
      this.side.crossVectors(this.dir, this.camDir).normalize().multiplyScalar(width * (1 - i / TRAIL));
      if (!Number.isFinite(this.side.x)) this.side.set(0, 0, 0);
      this.trailPos.set([a.x + this.side.x, a.y + this.side.y, a.z + this.side.z, a.x - this.side.x, a.y - this.side.y, a.z - this.side.z], i * 6);
    }
    this.trail.geometry.attributes.position.needsUpdate = true;
    const trailMat = this.trail.material as THREE.ShaderMaterial;
    if (cues.trailTint !== null) trailMat.uniforms.color.value.setHex(cues.trailTint);
    else trailMat.uniforms.color.value.setHex(0xf4ff9a);

    this.pulse += dt;
    if (landing) {
      this.marker.visible = this.markerInner.visible = true;
      this.marker.position.x = this.markerInner.position.x = landing.x;
      this.marker.position.z = this.markerInner.position.z = -landing.z;
      const band = cues.cue2 && cues.band ? cues.band : null;
      const ringScale = band ? BC.band[band].ringScale : 1;
      const s = (1 + Math.sin(this.pulse * 8) * 0.08) * ringScale;
      this.marker.scale.setScalar(s);
      this.markerInner.scale.setScalar(s);
      const hex = band ? bandHex(band) : 0xffef5a;
      (this.marker.material as THREE.MeshBasicMaterial).color.setHex(band ? hex : 0xffffff);
      (this.markerInner.material as THREE.MeshBasicMaterial).color.setHex(hex);
      (this.markerInner.material as THREE.MeshBasicMaterial).opacity = band ? 0.4 : 0.25;
    } else {
      this.marker.visible = this.markerInner.visible = false;
    }

    this.updateArc(cues);
    this.updateGauge(x, y, z, cues);
  }

  private updateArc(cues: BounceCueFrame): void {
    if (!cues.cue1 || !cues.arc || cues.arc.length === 0) {
      for (const d of this.arcDots) d.visible = false;
      this.apexDot.visible = false;
      return;
    }
    const arc = cues.arc;
    const band = cues.band;
    const hex = band ? bandHex(band) : 0xffffff;
    for (let i = 0; i < this.arcDots.length; i++) {
      const d = this.arcDots[i];
      if (i >= arc.length - 1) {
        d.visible = false;
        continue;
      }
      const p = arc[i];
      d.visible = true;
      d.position.set(p.x, p.y, -p.z);
      (d.material as THREE.MeshBasicMaterial).color.setHex(hex);
    }
    const ap = arc[arc.length - 1];
    this.apexDot.visible = true;
    this.apexDot.position.set(ap.x, ap.y, -ap.z);
    (this.apexDot.material as THREE.MeshBasicMaterial).color.setHex(hex);
  }

  private updateGauge(x: number, y: number, z: number, cues: BounceCueFrame): void {
    if (!cues.cue4) {
      this.gaugeStem.visible = this.gaugeFill.visible = this.gaugeKnob.visible = false;
      return;
    }
    const gh = BC.shadow.gaugeHeightM;
    const ox = x + 0.35;
    const oz = -z;
    this.gaugeStem.visible = this.gaugeFill.visible = this.gaugeKnob.visible = true;
    this.gaugeStem.position.set(ox, gh * 0.5, oz);
    const maxY = PHYSICS.heightBands.high[1];
    const markY = cues.apexY ?? y;
    const k = Math.min(1, Math.max(0.05, markY / maxY));
    this.gaugeFill.scale.set(1, k, 1);
    this.gaugeFill.position.set(ox, (gh * k) * 0.5, oz);
    this.gaugeKnob.position.set(ox, gh * k, oz);
    const band = cues.band;
    const hex = band ? bandHex(band) : 0xffef5a;
    (this.gaugeFill.material as THREE.MeshBasicMaterial).color.setHex(hex);
    (this.gaugeKnob.material as THREE.MeshBasicMaterial).color.setHex(hex);
  }

  hideMarker(): void {
    this.marker.visible = this.markerInner.visible = false;
    this.hideCueExtras();
  }

  private hideCueExtras(): void {
    for (const d of this.arcDots) d.visible = false;
    this.apexDot.visible = false;
    this.gaugeStem.visible = this.gaugeFill.visible = this.gaugeKnob.visible = false;
  }
}

/** Pooled spark particles for Perfect hits and bounce dust. */
export class Sparks {
  readonly points: THREE.Points;
  private pos: Float32Array;
  private vel: Float32Array;
  private life: Float32Array;
  private n = 80;
  private cursor = 0;

  constructor() {
    this.pos = new Float32Array(this.n * 3);
    this.vel = new Float32Array(this.n * 3);
    this.life = new Float32Array(this.n);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    this.points = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xfff27a, size: 0.09, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.points.frustumCulled = false;
    for (let i = 0; i < this.n; i++) this.pos[i * 3 + 1] = -100;
  }

  burst(x: number, y: number, z: number, count: number, speed: number): void {
    for (let k = 0; k < count; k++) {
      const i = this.cursor;
      this.cursor = (this.cursor + 1) % this.n;
      this.pos.set([x, y, -z], i * 3);
      const a = Math.random() * Math.PI * 2;
      const e = Math.random() * Math.PI - Math.PI / 2;
      this.vel.set([Math.cos(a) * Math.cos(e) * speed, Math.abs(Math.sin(e)) * speed + 1, Math.sin(a) * Math.cos(e) * speed], i * 3);
      this.life[i] = 0.5 + Math.random() * 0.3;
    }
  }

  update(dt: number): void {
    for (let i = 0; i < this.n; i++) {
      if (this.life[i] <= 0) continue;
      this.life[i] -= dt;
      const b = i * 3;
      this.vel[b + 1] -= 9 * dt;
      this.pos[b] += this.vel[b] * dt;
      this.pos[b + 1] += this.vel[b + 1] * dt;
      this.pos[b + 2] += this.vel[b + 2] * dt;
      if (this.life[i] <= 0) this.pos[b + 1] = -100;
    }
    this.points.geometry.attributes.position.needsUpdate = true;
  }
}
