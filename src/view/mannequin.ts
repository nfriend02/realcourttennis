import * as THREE from 'three';
import type { CharacterDef } from '../data/gameData';
import type { ActorState } from '../game/match/actor';
import type { Hand, ReachStage, StrokeId } from '../game/physics/types';
import { part, toonMat } from './toon';

export interface PoseInput {
  x: number;
  z: number;
  vx: number;
  vz: number;
  state: ActorState;
  stateAge: number;
  stroke: StrokeId;
  /** World-x side of the racket (+1 = screen right). */
  swingDir: 1 | -1;
  reach: ReachStage;
  dt: number;
  celebrate?: 'win' | 'lose' | null;
  /** Short non-gameplay reaction shown while standing (sprite characters only). */
  react?: 'point_win' | 'point_lose' | 'walk_in' | null;
  reactAge?: number;
  /** Overhead smash instead of a high forehand. */
  smash?: boolean;
  /** Unit turn toward `swingDir` while waiting for the ball (sprite characters only). */
  prep?: boolean;
}

interface Limb {
  shoulder: THREE.Group;
  elbow: THREE.Group;
  hand: THREE.Group;
}

interface Leg {
  hip: THREE.Group;
  knee: THREE.Group;
}

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Code-built placeholder character (07 §10.3): toon primitives + inverted-hull outline,
 * procedural locomotion and swing (shoulder yaw + abduction, elbow bend = reach stage).
 */
export class Mannequin {
  readonly root = new THREE.Group();
  private body = new THREE.Group();
  private hips = new THREE.Group();
  private spine = new THREE.Group();
  private head = new THREE.Group();
  private armL: Limb;
  private armR: Limb;
  private legL: Leg;
  private legR: Leg;
  private racket = new THREE.Group();
  private runPhase = 0;
  private hand: Hand;
  /** +1: the character faces three.js -z (player), -1: faces +z (NPC). */
  private readonly faceSign: 1 | -1;
  private yaw = 0;

  constructor(def: CharacterDef, hand: Hand, facesAway: boolean) {
    this.hand = hand;
    this.faceSign = facesAway ? 1 : -1;
    const s = def.heightM / 1.8;
    this.root.scale.setScalar(s);
    this.root.add(this.body);
    this.body.add(this.hips);
    this.hips.position.y = 0.95;
    this.hips.add(this.spine);

    const shirt = def.color;
    const skin = def.skin;
    const bottom = def.bottom;
    const female = def.gender === 'female';

    // pelvis / shorts
    const pelvis = part(new THREE.CapsuleGeometry(0.15, 0.08, 4, 10), bottom);
    pelvis.scale.set(1.15, 0.9, 0.8);
    pelvis.position.y = -0.02;
    this.hips.add(pelvis);
    if (female) {
      const skirt = part(new THREE.ConeGeometry(0.26, 0.24, 14, 1, true), bottom);
      skirt.position.y = -0.1;
      this.hips.add(skirt);
    }

    // torso
    const torso = part(new THREE.CapsuleGeometry(0.15, 0.3, 4, 12), shirt);
    torso.scale.set(1.2, 1, 0.75);
    torso.position.y = 0.3;
    this.spine.add(torso);
    const collar = part(new THREE.CylinderGeometry(0.06, 0.07, 0.08, 10), skin, false);
    collar.position.y = 0.55;
    this.spine.add(collar);

    // head
    this.head.position.y = 0.7;
    this.spine.add(this.head);
    const skull = part(new THREE.SphereGeometry(0.115, 18, 14), skin);
    skull.scale.set(0.95, 1.08, 1);
    this.head.add(skull);
    const hair = part(new THREE.SphereGeometry(0.122, 18, 12, 0, Math.PI * 2, 0, Math.PI * (female ? 0.62 : 0.5)), def.hair, false);
    hair.position.y = 0.015;
    hair.rotation.x = -0.25;
    this.head.add(hair);
    if (female) {
      const tail = part(new THREE.CapsuleGeometry(0.04, 0.16, 4, 8), def.hair, false);
      tail.position.set(0, -0.02, -0.13);
      tail.rotation.x = 0.4;
      this.head.add(tail);
    } else {
      const cap = part(new THREE.CylinderGeometry(0.125, 0.125, 0.05, 16), '#FFFFFF', false);
      cap.position.y = 0.07;
      this.head.add(cap);
      const brim = part(new THREE.BoxGeometry(0.16, 0.012, 0.1), '#FFFFFF', false);
      brim.position.set(0, 0.055, 0.12);
      this.head.add(brim);
    }

    this.armL = this.makeArm(1, shirt, skin);
    this.armR = this.makeArm(-1, shirt, skin);
    this.legL = this.makeLeg(1, skin, bottom);
    this.legR = this.makeLeg(-1, skin, bottom);

    // racket (0.685 m)
    const handle = part(new THREE.CylinderGeometry(0.014, 0.016, 0.2, 8), '#222831', false);
    handle.position.y = -0.1;
    this.racket.add(handle);
    const throat = part(new THREE.CylinderGeometry(0.01, 0.01, 0.12, 6), '#E8EDF2', false);
    throat.position.y = -0.24;
    this.racket.add(throat);
    const frame = part(new THREE.TorusGeometry(0.13, 0.012, 6, 24), '#D7263D', false);
    frame.scale.set(1, 1.25, 1);
    frame.position.y = -0.45;
    frame.rotation.y = Math.PI / 2;
    this.racket.add(frame);
    const strings = new THREE.Mesh(
      new THREE.CircleGeometry(0.125, 20),
      new THREE.MeshBasicMaterial({ color: 0xf6f7d8, transparent: true, opacity: 0.45, side: THREE.DoubleSide }),
    );
    strings.scale.set(1, 1.25, 1);
    strings.position.y = -0.45;
    strings.rotation.y = Math.PI / 2;
    this.racket.add(strings);
    this.racketArm().hand.add(this.racket);

    this.root.traverse((o) => {
      if (o instanceof THREE.Mesh) o.castShadow = true;
    });
  }

  setHand(h: Hand): void {
    if (h === this.hand) return;
    this.racketArm().hand.remove(this.racket);
    this.hand = h;
    this.racketArm().hand.add(this.racket);
  }

  private racketArm(): Limb {
    return this.hand === 'right' ? this.armR : this.armL;
  }

  private freeArm(): Limb {
    return this.hand === 'right' ? this.armL : this.armR;
  }

  /** Local x sign of the racket arm (right hand = -1 because the model faces local +z). */
  private racketSide(): 1 | -1 {
    return this.hand === 'right' ? -1 : 1;
  }

  private makeArm(side: 1 | -1, shirt: string, skin: string): Limb {
    const shoulder = new THREE.Group();
    shoulder.position.set(0.2 * side, 0.5, 0);
    shoulder.rotation.order = 'YZX';
    this.spine.add(shoulder);
    const sleeve = part(new THREE.CapsuleGeometry(0.05, 0.08, 4, 8), shirt);
    sleeve.position.y = -0.06;
    shoulder.add(sleeve);
    const upper = part(new THREE.CapsuleGeometry(0.038, 0.22, 4, 8), skin);
    upper.position.y = -0.15;
    shoulder.add(upper);
    const elbow = new THREE.Group();
    elbow.position.y = -0.3;
    shoulder.add(elbow);
    const fore = part(new THREE.CapsuleGeometry(0.034, 0.2, 4, 8), skin);
    fore.position.y = -0.13;
    elbow.add(fore);
    const hand = new THREE.Group();
    hand.position.y = -0.28;
    elbow.add(hand);
    const fist = part(new THREE.SphereGeometry(0.042, 10, 8), skin);
    hand.add(fist);
    const band = part(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 10), '#FFFFFF', false);
    band.position.y = 0.06;
    hand.add(band);
    return { shoulder, elbow, hand };
  }

  private makeLeg(side: 1 | -1, skin: string, bottom: string): Leg {
    const hip = new THREE.Group();
    hip.position.set(0.09 * side, -0.05, 0);
    this.hips.add(hip);
    const short = part(new THREE.CapsuleGeometry(0.07, 0.1, 4, 8), bottom);
    short.position.y = -0.09;
    hip.add(short);
    const thigh = part(new THREE.CapsuleGeometry(0.058, 0.3, 4, 8), skin);
    thigh.position.y = -0.24;
    hip.add(thigh);
    const knee = new THREE.Group();
    knee.position.y = -0.44;
    hip.add(knee);
    const shin = part(new THREE.CapsuleGeometry(0.05, 0.32, 4, 8), skin);
    shin.position.y = -0.22;
    knee.add(shin);
    const sock = part(new THREE.CylinderGeometry(0.048, 0.048, 0.08, 8), '#FFFFFF', false);
    sock.position.y = -0.38;
    knee.add(sock);
    const shoe = part(new THREE.BoxGeometry(0.1, 0.07, 0.24), '#F4F6FA');
    shoe.position.set(0, -0.45, 0.05);
    knee.add(shoe);
    return { hip, knee };
  }

  update(p: PoseInput): void {
    const dt = p.dt;
    this.root.position.set(p.x, 0, -p.z);
    const speed = Math.hypot(p.vx, p.vz);
    const baseYaw = this.faceSign > 0 ? Math.PI : 0;
    this.yaw += (baseYaw - this.yaw) * Math.min(1, dt * 10);
    this.root.rotation.y = this.yaw;

    // Racket side in local space: player is rotated by PI so world +x maps to local -x.
    const q = (p.swingDir * (this.faceSign > 0 ? -1 : 1)) as 1 | -1;
    const r = this.racketSide();
    const heightKind = p.stroke.endsWith('high') ? 'high' : p.stroke.endsWith('low') ? 'low' : 'mid';
    const abduct = heightKind === 'high' ? 2.05 : heightKind === 'low' ? 0.8 : 1.35;
    const elbowBend = p.reach === 'bent' ? 1.0 : p.reach === 'slight' ? 0.5 : 0.12;

    // locomotion
    this.runPhase += dt * (4 + speed * 1.6);
    const run = clamp01(speed / 4);
    const stride = Math.sin(this.runPhase) * 0.75 * run;
    let crouch = 0.04 + 0.05 * run;
    let bob = Math.abs(Math.sin(this.runPhase)) * 0.04 * run;
    this.legL.hip.rotation.x = -stride;
    this.legR.hip.rotation.x = stride;
    this.legL.knee.rotation.x = 0.25 + Math.max(0, Math.sin(this.runPhase)) * 0.9 * run;
    this.legR.knee.rotation.x = 0.25 + Math.max(0, -Math.sin(this.runPhase)) * 0.9 * run;
    // lean into movement direction
    const fwd = (-p.vz * this.faceSign * -1) / 8;
    this.spine.rotation.x = 0.12 + fwd * 0.3;
    this.spine.rotation.z = 0;
    this.head.rotation.set(0, 0, 0);

    const ra = this.racketArm();
    const fa = this.freeArm();
    let spineYaw = 0;
    let raX = 0;
    // default ready pose: racket in front
    let raAbd = r * 0.55;
    let raYaw = -r * 0.9;
    let raElbow = 0.9;
    let faAbd = -r * 0.45;
    let faYaw = r * 0.7;
    let faElbow = 0.9;

    const swingPose = (progress: number, coil: number) => {
      // progress: -1.4 (back) .. +1.4 (follow-through)
      raAbd = q * abduct;
      raYaw = -q * progress;
      raElbow = elbowBend + (q !== r ? 0.25 : 0);
      spineYaw = q * coil;
      faAbd = -q * 0.6;
      faYaw = q * 0.5 + progress * 0.2 * -q;
      faElbow = 1.1;
    };

    switch (p.state) {
      case 'backswing':
        swingPose(-1.35, 0.55);
        crouch += heightKind === 'low' ? 0.12 : 0.03;
        break;
      case 'swing': {
        const k = ease(clamp01(p.stateAge / 0.22));
        swingPose(-1.35 + 2.75 * k, 0.55 - 1.15 * k);
        crouch += heightKind === 'low' ? 0.12 : 0.02;
        break;
      }
      case 'recovery': {
        const k = clamp01(p.stateAge / 0.25);
        swingPose(1.4 - 0.5 * k, -0.6 * (1 - k));
        break;
      }
      case 'split':
        bob = Math.sin(clamp01(p.stateAge / 0.12) * Math.PI) * 0.07;
        crouch = 0.1;
        break;
      case 'serve_ready':
        raAbd = r * 0.4;
        raYaw = -r * 0.4;
        faAbd = -r * 0.3;
        faYaw = r * 0.9;
        break;
      case 'toss': {
        const k = clamp01(p.stateAge / 0.4);
        faAbd = -r * 0.2;
        faYaw = 0;
        this.freeArm().shoulder.rotation.x = 0;
        faElbow = 0.2;
        // toss arm goes up in front, racket arm cocks behind the head
        fa.shoulder.rotation.set(-2.7 * k, 0, -r * 0.2);
        raX = -3.5 * k;
        raAbd = r * 0.3;
        raYaw = 0;
        raElbow = 0.4 + 1.4 * k;
        spineYaw = r * 0.4 * k;
        this.spine.rotation.x = 0.12 - 0.25 * k;
        this.head.rotation.x = -0.5 * k;
        break;
      }
      default:
        break;
    }

    if (p.celebrate === 'win') {
      raAbd = r * 2.7;
      raYaw = 0;
      raElbow = 0.2;
      faAbd = -r * 2.7;
      faYaw = 0;
      faElbow = 0.2;
      bob = Math.abs(Math.sin(this.runPhase * 1.2)) * 0.12;
      crouch = 0.02;
    } else if (p.celebrate === 'lose') {
      raAbd = r * 0.2;
      raYaw = 0;
      faAbd = -r * 0.2;
      faYaw = 0;
      this.spine.rotation.x = 0.45;
      this.head.rotation.x = 0.5;
      crouch = 0.08;
    }

    const serveOverhead = p.state === 'swing' && p.stroke === 'fh_high' && p.stateAge < 0.4 && this.servePose;
    if (serveOverhead) {
      const k = ease(clamp01(p.stateAge / 0.2));
      raX = -3.5 + 2.7 * k;
      raAbd = r * 0.3;
      raYaw = 0;
      raElbow = 1.8 * (1 - k) + 0.1;
      spineYaw = -r * 0.5 * k;
      fa.shoulder.rotation.set(-2.2 * (1 - k), 0, -r * 0.2);
    } else if (p.state !== 'toss') {
      fa.shoulder.rotation.set(0, faYaw, faAbd);
    }

    ra.shoulder.rotation.set(raX, raYaw, raAbd);
    ra.elbow.rotation.x = -raElbow;
    if (p.state !== 'toss' && !serveOverhead) fa.elbow.rotation.x = -faElbow;
    else if (p.state === 'toss') fa.elbow.rotation.x = -faElbow;
    this.racket.rotation.set(0.2, 0, 0);
    this.spine.rotation.y = spineYaw;
    this.body.position.y = bob - crouch;
    this.legL.hip.rotation.x -= crouch * 2.2;
    this.legR.hip.rotation.x -= crouch * 2.2;
    this.legL.knee.rotation.x += crouch * 4.4;
    this.legR.knee.rotation.x += crouch * 4.4;
  }

  /** Set by the view while the current swing is a serve. */
  servePose = false;

  /** World position of the head top (for HUD popups). */
  headWorld(out: THREE.Vector3): THREE.Vector3 {
    this.head.getWorldPosition(out);
    out.y += 0.25;
    return out;
  }

  dispose(): void {
    this.root.traverse((o) => {
      if (o instanceof THREE.Mesh) o.geometry.dispose();
    });
  }
}

export function shadowBlob(): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.CircleGeometry(0.35, 20), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.012;
  return m;
}

export { toonMat };
