import * as THREE from 'three';
import { PHYSICS, type ThemeId, VISUAL } from '../data/gameData';
import type { Hand } from '../game/physics/types';
import type { PoseInput } from './mannequin';

type LoopMode = 'loop' | 'pingpong' | 'once';

interface ClipMeta {
  file: string;
  cols: number;
  rows: number;
  frames: number;
  fps: number;
  loop: LoopMode;
  markers: Record<string, number>;
  /** Per-frame horizontal feet offset in meters (stabilized in-place cycles). */
  dx?: number[];
}

export interface MotionManifest {
  version: number;
  charId: string;
  view: 'back' | 'front';
  cellW: number;
  cellH: number;
  frameWidthM: number;
  frameHeightM: number;
  anchorX: number;
  footY: number;
  clips: Record<string, ClipMeta>;
}

interface Clip extends ClipMeta {
  id: string;
  tex: THREE.Texture;
}

const FALLBACK: Record<string, string[]> = {
  fh_high: ['fh_mid'],
  fh_low: ['fh_mid'],
  bh_high: ['bh_mid', 'fh_high', 'fh_mid'],
  bh_mid: ['fh_mid'],
  bh_low: ['bh_mid', 'fh_low', 'fh_mid'],
  serve: ['fh_high', 'fh_mid'],
  serve_ready: ['idle'],
  split: ['idle'],
  run_left: ['run_right', 'idle'],
  run_right: ['run_left', 'idle'],
  victory: ['idle'],
  defeat: ['idle'],
  smash: ['fh_high', 'serve', 'fh_mid'],
  reach_fh: ['fh_mid'],
  reach_bh: ['bh_mid', 'fh_mid'],
  run_forward: ['idle'],
  run_back: ['run_forward', 'idle'],
  point_win: ['victory', 'idle'],
  point_lose: ['defeat', 'idle'],
  walk_in: ['run_forward', 'idle'],
};

const BASE = `${import.meta.env.BASE_URL}assets/motion/`;

/**
 * Camera-facing sprite character driven by AI-video atlases (08 §6, tools/motion/build-motion.ts).
 * Players use the `back` view, NPCs the `front` view; left-handed players are mirrored.
 * Swing clips are re-timed so the clip's `contact` marker lands on the model's contact moment.
 */
export class SpriteCharacter {
  readonly root = new THREE.Group();
  private mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private clips = new Map<string, Clip>();
  private current: Clip | null = null;
  private loopTime = 0;
  private celebrateTime = 0;
  private hand: Hand;
  private camPos = new THREE.Vector3();
  servePose = false;

  private constructor(private readonly manifest: MotionManifest, hand: Hand, private readonly heightM: number, theme: ThemeId) {
    this.hand = hand;
    const geo = new THREE.PlaneGeometry(manifest.frameWidthM, manifest.frameHeightM);
    geo.translate((0.5 - manifest.anchorX) * manifest.frameWidthM, (manifest.footY - 0.5) * manifest.frameHeightM, 0);
    const mat = new THREE.MeshBasicMaterial({ transparent: true, alphaTest: 0.1, depthWrite: true, side: THREE.DoubleSide });
    mat.color.set(VISUAL.motion.tint[theme]);
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.renderOrder = 2;
    this.root.add(this.mesh);
    this.applyMirror();
  }

  /** Loads `{charId}/{view}/manifest.json` and every atlas; resolves null when the set is absent. */
  static async load(charId: string, view: 'back' | 'front', hand: Hand, heightM: number, theme: ThemeId): Promise<SpriteCharacter | null> {
    const dir = `${BASE}${charId.toLowerCase()}/${view}/`;
    let manifest: MotionManifest;
    try {
      const res = await fetch(`${dir}manifest.json`);
      if (!res.ok || !(res.headers.get('content-type') ?? '').includes('json')) return null;
      manifest = (await res.json()) as MotionManifest;
    } catch {
      return null;
    }
    if (!manifest.clips.idle) return null;
    const sc = new SpriteCharacter(manifest, hand, heightM, theme);
    const loader = new THREE.TextureLoader();
    await Promise.all(
      Object.entries(manifest.clips).map(async ([id, meta]) => {
        try {
          const tex = await loader.loadAsync(dir + meta.file);
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.generateMipmaps = false;
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.repeat.set(1 / meta.cols, 1 / meta.rows);
          sc.clips.set(id, { ...meta, id, tex });
        } catch {
          /* missing atlas → fallback chain */
        }
      }),
    );
    return sc.clips.has('idle') ? sc : null;
  }

  setHand(h: Hand): void {
    this.hand = h;
    this.applyMirror();
  }

  /** Left-handed players mirror the (right-handed) back-view set; `flip` mirrors one clip on top of that. */
  private applyMirror(flip = false): void {
    const base = this.mirrored() ? -1 : 1;
    this.mesh.scale.x = flip ? -base : base;
  }

  private mirrored(): boolean {
    return this.manifest.view === 'back' && this.hand === 'left';
  }

  private resolve(id: string): Clip {
    const direct = this.clips.get(id);
    if (direct) return direct;
    for (const alt of FALLBACK[id] ?? []) {
      const c = this.clips.get(alt);
      if (c) return c;
    }
    return this.clips.get('idle')!;
  }

  /** Forehand / backhand from the ball side, so NPC (fh-only strokes) still shows backhands. */
  private strokeClip(p: PoseInput): string {
    const facesCamera = this.manifest.view === 'front';
    const rightHanded = this.hand === 'right';
    const fhSign = (facesCamera ? -1 : 1) * (rightHanded ? 1 : -1);
    const side = p.swingDir === fhSign ? 'fh' : 'bh';
    const height = p.stroke.endsWith('high') ? 'high' : p.stroke.endsWith('low') ? 'low' : 'mid';
    if (p.smash && side === 'fh' && this.clips.has('smash')) return 'smash';
    if (p.reach === 'extended' && this.clips.has(`reach_${side}`)) return `reach_${side}`;
    return `${side}_${height}`;
  }

  private show(clip: Clip, t: number): void {
    if (this.current !== clip) {
      this.current = clip;
      this.mesh.material.map = clip.tex;
      this.mesh.material.needsUpdate = true;
    }
    const n = clip.frames;
    let f = Math.floor(t * clip.fps);
    if (clip.loop === 'loop') f = ((f % n) + n) % n;
    else if (clip.loop === 'pingpong') {
      const period = Math.max(1, 2 * n - 2);
      const k = ((f % period) + period) % period;
      f = k < n ? k : period - k;
    } else f = Math.min(n - 1, Math.max(0, f));
    const col = f % clip.cols;
    const row = Math.floor(f / clip.cols);
    clip.tex.offset.set(col / clip.cols, 1 - (row + 1) / clip.rows);
    this.mesh.position.x = -(clip.dx?.[f] ?? 0) * this.mesh.scale.x;
  }

  update(p: PoseInput, camera: THREE.Camera): void {
    const mo = VISUAL.motion;
    this.root.position.set(p.x, 0, -p.z);
    camera.getWorldPosition(this.camPos);
    this.root.rotation.y = Math.atan2(this.camPos.x - p.x, this.camPos.z + p.z);
    this.loopTime += p.dt;
    this.applyMirror();

    if (p.celebrate) {
      this.celebrateTime += p.dt;
      this.show(this.resolve(p.celebrate === 'win' ? 'victory' : 'defeat'), this.celebrateTime);
      return;
    }
    this.celebrateTime = 0;

    // Ready (coiled) pose = at most maxDownswingSec of source before contact, so long take-back loops
    // (backhands) are not squeezed into the short model swing lead.
    const coil = (c: Clip) => {
      const bs = c.markers.backswing ?? c.markers.toss ?? 0;
      const ct = c.markers.contact ?? bs;
      return Math.max(bs, ct - mo.maxDownswingSec);
    };
    const swingTime = (c: Clip, age: number) => {
      const bs = coil(c);
      const ct = c.markers.contact ?? bs;
      const lead = PHYSICS.swingLeadSec;
      return age < lead ? bs + (age / lead) * (ct - bs) : ct + (age - lead);
    };

    switch (p.state) {
      case 'backswing': {
        // The take-back always completes within backswingSec, so short NPC windups reach the top too.
        const c = this.resolve(this.strokeClip(p));
        this.show(c, coil(c) * Math.min(1, p.stateAge / mo.backswingSec));
        return;
      }
      case 'swing':
      case 'recovery': {
        const serve = this.servePose && p.stroke === 'fh_high';
        const c = this.resolve(serve ? 'serve' : this.strokeClip(p));
        const age = p.state === 'recovery' ? p.stateAge + PHYSICS.recoverySec : p.stateAge;
        if (serve && c.id === 'serve') {
          const ct = c.markers.contact ?? 0;
          this.show(c, ct + age);
        } else this.show(c, swingTime(c, age));
        return;
      }
      case 'toss': {
        const c = this.resolve('serve');
        const toss = c.markers.toss ?? c.markers.backswing ?? 0;
        const ct = c.markers.contact ?? toss;
        const k = Math.min(1, p.stateAge / PHYSICS.serveToss.perfectFromSec);
        this.show(c, toss + k * (ct - toss - PHYSICS.swingLeadSec));
        return;
      }
      case 'serve_ready':
        this.show(this.resolve('serve_ready'), this.loopTime);
        return;
      case 'split':
        this.show(this.resolve('split'), p.stateAge);
        return;
      default:
        break;
    }

    const speed = Math.hypot(p.vx, p.vz);
    if (p.react && speed < mo.reactionMaxSpeed) {
      const c = this.clips.get(p.react) ?? (p.react === 'walk_in' ? null : this.resolve(p.react));
      if (c) {
        this.show(c, p.reactAge ?? 0);
        return;
      }
    }
    if (speed > mo.runSpeedMin) {
      let dir: string;
      if (Math.abs(p.vz) > Math.abs(p.vx) && this.clips.has('run_forward')) {
        dir = p.vz < 0 ? 'run_forward' : 'run_back';
      } else {
        dir = p.vx >= 0 ? 'run_right' : 'run_left';
        if (this.mirrored()) dir = dir === 'run_right' ? 'run_left' : 'run_right';
        // A missing (or rejected) side run is the opposite one mirrored, so the body faces the movement.
        const other = dir === 'run_right' ? 'run_left' : 'run_right';
        if (!this.clips.has(dir) && this.clips.has(other)) {
          this.applyMirror(true);
          this.show(this.clips.get(other)!, this.loopTime * (mo.runRateBase + speed * mo.runRatePerMps));
          return;
        }
      }
      this.show(this.resolve(dir), this.loopTime * (mo.runRateBase + speed * mo.runRatePerMps));
    } else if (p.prep) {
      const c = this.resolve(this.strokeClip(p));
      this.show(c, coil(c) * mo.prepTurnCoil * Math.min(1, p.stateAge / mo.backswingSec));
    } else this.show(this.resolve('idle'), this.loopTime);
  }

  headWorld(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.root.position.x, this.heightM + 0.25, this.root.position.z);
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    for (const c of this.clips.values()) c.tex.dispose();
  }
}
