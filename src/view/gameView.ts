import * as THREE from 'three';
import { type CharacterDef, type ThemeId, VISUAL } from '../data/gameData';
import type { LayoutProfile } from '../core/layout';
import type { Hand } from '../game/physics/types';
import { BallView, type BounceCueFrame, Sparks } from './ballView';
import { CameraRig } from './cameraRig';
import { CourtBuilder } from './court';
import { FxSprites } from './fxSprites';
import { Mannequin, type PoseInput, shadowBlob } from './mannequin';
import { SpriteCharacter } from './spriteCharacter';

export interface ViewFrame {
  dt: number;
  time: number;
  player: PoseInput;
  npc: PoseInput;
  ball: { x: number; y: number; z: number; visible: boolean } | null;
  landing: { x: number; z: number } | null;
  playerServing: boolean;
  npcServing?: boolean;
  timing?: { x: number; y: number; z: number; remaining: number } | null;
  bounceCues?: BounceCueFrame;
}

/** Owns the renderer, scene and all 3D presentation for one match. */
export class GameView {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly rig = new CameraRig();
  readonly court: CourtBuilder;
  readonly playerMan: Mannequin;
  readonly npcMan: Mannequin;
  readonly ballView = new BallView();
  readonly sparks = new Sparks();
  readonly fx = new FxSprites();
  private playerSprite: SpriteCharacter | null = null;
  private npcSprite: SpriteCharacter | null = null;
  private playerShadow = shadowBlob();
  private npcShadow = shadowBlob();
  private resizeObs: ResizeObserver;
  private width = 1;
  private height = 1;
  private profile: LayoutProfile;
  private tmp = new THREE.Vector3();
  private disposed = false;
  /** Follow-camera frames with a visible ball, and how many of them had the ball outside the frame. */
  ballFrames = 0;
  ballOffFrames = 0;

  constructor(private readonly container: HTMLElement, themeId: ThemeId, player: CharacterDef, npc: CharacterDef, hand: Hand, profile: LayoutProfile) {
    this.profile = profile;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.className = 'gl';
    container.appendChild(this.renderer.domElement);

    this.court = new CourtBuilder(VISUAL.themes[themeId], themeId, this.scene);
    this.scene.add(this.court.group);
    this.playerMan = new Mannequin(player, hand, true);
    this.npcMan = new Mannequin(npc, 'right', false);
    this.scene.add(this.playerMan.root, this.npcMan.root, this.playerShadow, this.npcShadow);
    this.scene.add(this.ballView.group, this.sparks.points, this.fx.group);
    this.scene.add(this.rig.camera);

    // AI-motion sprites replace the mannequins (08 §6). Mannequins stay hidden while atlases load
    // (match intro) and only appear when a character has no sprite set, so nothing pops mid-intro.
    this.playerMan.root.visible = false;
    this.npcMan.root.visible = false;
    void SpriteCharacter.load(player.id, 'back', hand, player.heightM, themeId).then((s) => this.attachSprite(s, true));
    void SpriteCharacter.load(npc.id, 'front', 'right', npc.heightM, themeId).then((s) => this.attachSprite(s, false));

    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(container);
    this.resize();
  }

  private attachSprite(s: SpriteCharacter | null, isPlayer: boolean): void {
    if (!s) {
      (isPlayer ? this.playerMan : this.npcMan).root.visible = true;
      return;
    }
    if (this.disposed) {
      s.dispose();
      return;
    }
    this.scene.add(s.root);
    if (isPlayer) {
      this.playerSprite = s;
      this.playerMan.root.visible = false;
    } else {
      this.npcSprite = s;
      this.npcMan.root.visible = false;
    }
  }

  setProfile(p: LayoutProfile): void {
    this.profile = p;
    this.resize();
  }

  setHand(h: Hand): void {
    this.playerMan.setHand(h);
    this.playerSprite?.setHand(h);
  }

  resize(): void {
    const r = this.container.getBoundingClientRect();
    this.width = Math.max(1, Math.round(r.width));
    this.height = Math.max(1, Math.round(r.height));
    this.renderer.setSize(this.width, this.height, false);
    this.rig.setViewport(this.width / this.height, this.profile);
  }

  render(f: ViewFrame): void {
    if (!this.playerSprite) {
      this.playerMan.servePose = f.playerServing;
      this.playerMan.update(f.player);
    }
    if (!this.npcSprite) this.npcMan.update(f.npc);
    this.playerShadow.position.set(f.player.x, 0.012, -f.player.z);
    this.npcShadow.position.set(f.npc.x, 0.012, -f.npc.z);
    this.rig.update(f.dt, f.player.x, f.player.z, f.ball && f.ball.visible ? f.ball : null);
    if (this.playerSprite) {
      this.playerSprite.servePose = f.playerServing;
      this.playerSprite.update(f.player, this.rig.camera);
    }
    if (this.npcSprite) {
      this.npcSprite.servePose = f.npcServing ?? false;
      this.npcSprite.update(f.npc, this.rig.camera);
    }
    if (f.ball && f.ball.visible) {
      this.ballView.setVisible(true);
      this.ballView.update(f.ball.x, f.ball.y, f.ball.z, this.rig.camera, f.landing, f.dt, f.bounceCues);
    } else {
      this.ballView.setVisible(false);
      this.ballView.hideMarker();
    }
    const tm = f.timing;
    this.ballView.timingRing(tm?.x ?? 0, tm?.y ?? 0, tm?.z ?? 0, tm ? tm.remaining : null, this.rig.camera);
    this.sparks.update(f.dt);
    this.fx.update(f.dt, this.rig.camera);
    this.court.update(f.time, f.dt);
    this.renderer.render(this.scene, this.rig.camera);
    if (f.ball && f.ball.visible && this.rig.mode === 'follow') {
      this.ballFrames++;
      const p = this.tmp.set(f.ball.x, f.ball.y, -f.ball.z).project(this.rig.camera);
      if (Math.abs(p.x) > 1 || Math.abs(p.y) > 1) this.ballOffFrames++;
    }
  }

  /** Model-space point → CSS pixels relative to the view container. */
  project(x: number, y: number, z: number): { x: number; y: number; visible: boolean } {
    this.tmp.set(x, y, -z).project(this.rig.camera);
    return { x: ((this.tmp.x + 1) / 2) * this.width, y: ((1 - this.tmp.y) / 2) * this.height, visible: this.tmp.z < 1 };
  }

  playerHeadScreen(): { x: number; y: number } {
    if (this.playerSprite) this.playerSprite.headWorld(this.tmp);
    else this.playerMan.headWorld(this.tmp);
    this.tmp.project(this.rig.camera);
    return { x: ((this.tmp.x + 1) / 2) * this.width, y: ((1 - this.tmp.y) / 2) * this.height };
  }

  dispose(): void {
    this.disposed = true;
    this.resizeObs.disconnect();
    this.court.dispose();
    this.fx.dispose();
    this.playerMan.dispose();
    this.npcMan.dispose();
    this.playerSprite?.dispose();
    this.npcSprite?.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
