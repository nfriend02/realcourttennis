import * as THREE from 'three';
import { VISUAL } from '../data/gameData';
import { ASSET, type FxId } from '../ui/assets';

interface Sheet {
  tex: THREE.Texture;
  /** Height of one square frame relative to the sheet height (frames sit in a horizontal band). */
  band: number;
}

interface Slot {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  id: FxId | null;
  age: number;
  duration: number;
}

const FX_IDS = Object.keys(VISUAL.fx.items) as FxId[];

/**
 * Pooled camera-facing flipbook effects from the generated VFX sheets (8 frames in a row on black).
 * Alpha is derived from brightness so the black backdrop disappears on any court color.
 * Without a sheet `spawn` returns false and callers keep their procedural effect.
 */
export class FxSprites {
  readonly group = new THREE.Group();
  private sheets = new Map<FxId, Sheet>();
  private slots: Slot[] = [];
  private cursor = 0;

  constructor() {
    const geo = new THREE.PlaneGeometry(1, 1);
    for (let i = 0; i < VISUAL.fx.pool; i++) {
      const mat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { map: { value: null }, uvOffset: { value: new THREE.Vector2() }, uvScale: { value: new THREE.Vector2(1, 1) }, fade: { value: 1 } },
        vertexShader: 'varying vec2 vUv; uniform vec2 uvOffset; uniform vec2 uvScale; void main(){ vUv = uvOffset + uv * uvScale; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader:
          'uniform sampler2D map; uniform float fade; varying vec2 vUv; void main(){ vec3 c = texture2D(map, vUv).rgb; float a = max(c.r, max(c.g, c.b)); if (a < 0.04) discard; gl_FragColor = vec4(c / a, a * fade); }',
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.visible = false;
      mesh.renderOrder = 6;
      mesh.frustumCulled = false;
      this.group.add(mesh);
      this.slots.push({ mesh, id: null, age: 0, duration: 1 });
    }
    const loader = new THREE.TextureLoader();
    for (const id of FX_IDS) {
      loader.load(
        ASSET.fxSheet(id),
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.generateMipmaps = false;
          tex.minFilter = THREE.LinearFilter;
          const img = tex.image as { width: number; height: number };
          this.sheets.set(id, { tex, band: Math.min(1, img.width / VISUAL.fx.cols / img.height) });
        },
        undefined,
        () => undefined,
      );
    }
  }

  has(id: FxId): boolean {
    return this.sheets.has(id);
  }

  /** Model coordinates (three uses -z). */
  spawn(id: FxId, x: number, y: number, z: number, sizeMul = 1): boolean {
    const sheet = this.sheets.get(id);
    if (!sheet) return false;
    const slot = this.slots[this.cursor];
    this.cursor = (this.cursor + 1) % this.slots.length;
    const item = VISUAL.fx.items[id];
    slot.id = id;
    slot.age = 0;
    slot.duration = item.durationSec;
    const u = slot.mesh.material.uniforms;
    u.map.value = sheet.tex;
    u.uvScale.value.set(1 / VISUAL.fx.cols, sheet.band);
    u.fade.value = 1;
    slot.mesh.position.set(x, y, -z);
    slot.mesh.scale.setScalar(item.sizeM * sizeMul);
    slot.mesh.visible = true;
    return true;
  }

  update(dt: number, camera: THREE.Camera): void {
    const cols = VISUAL.fx.cols;
    for (const s of this.slots) {
      if (!s.id) continue;
      s.age += dt;
      const k = s.age / s.duration;
      if (k >= 1) {
        s.id = null;
        s.mesh.visible = false;
        continue;
      }
      const frame = Math.min(cols - 1, Math.floor(k * cols));
      const u = s.mesh.material.uniforms;
      const band = u.uvScale.value.y;
      u.uvOffset.value.set(frame / cols, 0.5 - band / 2);
      u.fade.value = k > 0.8 ? (1 - k) / 0.2 : 1;
      s.mesh.quaternion.copy(camera.quaternion);
    }
  }

  dispose(): void {
    this.slots[0]?.mesh.geometry.dispose();
    for (const s of this.slots) s.mesh.material.dispose();
    for (const sh of this.sheets.values()) sh.tex.dispose();
  }
}
