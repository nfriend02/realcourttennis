import * as THREE from 'three';
import { PHYSICS, type ThemeId, VISUAL } from '../data/gameData';
import { netHeight } from '../game/physics/court';
import { ASSET } from '../ui/assets';
import { toonMat } from './toon';

type Theme = (typeof VISUAL.themes)[ThemeId];

function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function skyTexture(top: string, bottom: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 256;
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, top);
  grad.addColorStop(0.55, bottom);
  grad.addColorStop(1, bottom);
  g.fillStyle = grad;
  g.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function netTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const g = c.getContext('2d')!;
  g.clearRect(0, 0, 64, 64);
  g.strokeStyle = 'rgba(20,24,30,0.85)';
  g.lineWidth = 3;
  for (let i = 0; i <= 64; i += 16) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i, 64);
    g.stroke();
    g.beginPath();
    g.moveTo(0, i);
    g.lineTo(64, i);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Code-built court with exact ITF dimensions (07 §15.2 CourtBuilder). Coordinates: three (x, y, -z). */
export class CourtBuilder {
  readonly group = new THREE.Group();
  readonly sun: THREE.DirectionalLight;
  readonly hemi: THREE.HemisphereLight;
  private crowd: THREE.InstancedMesh | null = null;
  private crowdBase: Float32Array | null = null;
  private cheer = 0;
  private crowdSprites: THREE.ShaderMaterial | null = null;
  private m4 = new THREE.Matrix4();
  private disposed = false;

  constructor(readonly theme: Theme, readonly themeId: ThemeId, scene: THREE.Scene) {
    scene.background = skyTexture(theme.sky[0], theme.sky[1]);
    scene.fog = new THREE.Fog(theme.fog, 70, 200);

    this.hemi = new THREE.HemisphereLight(theme.sky[1], theme.outer, theme.ambient);
    this.group.add(this.hemi);
    this.sun = new THREE.DirectionalLight(theme.sun, theme.sunIntensity);
    const night = themeId === 'night' || themeId === 'indoor';
    this.sun.position.set(night ? 4 : 14, night ? 30 : 22, night ? 6 : 10);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    const sc = this.sun.shadow.camera;
    sc.left = -14;
    sc.right = 14;
    sc.top = 22;
    sc.bottom = -22;
    sc.near = 1;
    sc.far = 70;
    this.sun.shadow.bias = -0.0005;
    this.group.add(this.sun);
    this.group.add(this.sun.target);

    this.buildGround(theme);
    this.buildLines(theme);
    this.buildNet();
    this.buildSurroundings(theme, themeId);
  }

  private buildGround(theme: Theme): void {
    const outer = new THREE.Mesh(new THREE.PlaneGeometry(90, 130), new THREE.MeshLambertMaterial({ color: theme.outer }));
    outer.rotation.x = -Math.PI / 2;
    outer.receiveShadow = true;
    this.group.add(outer);
    const c = PHYSICS.court;
    const court = new THREE.Mesh(new THREE.PlaneGeometry(5.485 * 2 + 0.6, c.halfLength * 2 + 0.6), new THREE.MeshLambertMaterial({ color: theme.court }));
    court.rotation.x = -Math.PI / 2;
    court.position.y = 0.002;
    court.receiveShadow = true;
    this.group.add(court);
  }

  private buildLines(theme: Theme): void {
    const c = PHYSICS.court;
    const mat = new THREE.MeshBasicMaterial({ color: theme.line });
    const w = 0.05;
    const y = 0.006;
    const line = (x0: number, z0: number, x1: number, z1: number) => {
      const len = Math.hypot(x1 - x0, z1 - z0);
      const horizontal = Math.abs(z1 - z0) < 1e-6;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(horizontal ? len + w : w, horizontal ? w : len + w), mat);
      m.rotation.x = -Math.PI / 2;
      m.position.set((x0 + x1) / 2, y, -(z0 + z1) / 2);
      m.receiveShadow = true;
      this.group.add(m);
    };
    const hw = c.halfWidth;
    const dw = 5.485;
    const hl = c.halfLength;
    const sl = c.serviceLine;
    for (const s of [-1, 1]) {
      line(-dw, s * hl, dw, s * hl);
      line(-hw, s * sl, hw, s * sl);
      line(0, s * sl, 0, 0);
      line(0, s * hl, 0, s * (hl - 0.1));
      line(s * hw, -hl, s * hw, hl);
      line(s * dw, -hl, s * dw, hl);
    }
  }

  private buildNet(): void {
    const c = PHYSICS.court;
    const span = 5.485 + 0.3;
    const seg = 40;
    const pos: number[] = [];
    const uv: number[] = [];
    const idx: number[] = [];
    for (let i = 0; i <= seg; i++) {
      const x = -span + (2 * span * i) / seg;
      const h = Math.abs(x) <= c.netPostX ? netHeight(x, PHYSICS) : c.netPostHeight;
      pos.push(x, 0, 0, x, h, 0);
      uv.push((x + span) * 4, 0, (x + span) * 4, h * 4);
      if (i < seg) {
        const a = i * 2;
        idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    const tex = netTexture();
    const net = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false, opacity: 0.9 }));
    net.position.y = 0.01;
    this.group.add(net);

    // white tape following the sag
    const tapeGeo = new THREE.BufferGeometry();
    const tp: number[] = [];
    const ti: number[] = [];
    for (let i = 0; i <= seg; i++) {
      const x = -span + (2 * span * i) / seg;
      const h = Math.abs(x) <= c.netPostX ? netHeight(x, PHYSICS) : c.netPostHeight;
      tp.push(x, h - 0.06, 0, x, h + 0.01, 0);
      if (i < seg) {
        const a = i * 2;
        ti.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      }
    }
    tapeGeo.setAttribute('position', new THREE.Float32BufferAttribute(tp, 3));
    tapeGeo.setIndex(ti);
    const tape = new THREE.Mesh(tapeGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
    this.group.add(tape);

    for (const s of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, c.netPostHeight + 0.05, 10), toonMat('#3B4252'));
      post.position.set(s * span, (c.netPostHeight + 0.05) / 2, 0);
      post.castShadow = true;
      this.group.add(post);
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, c.netPostHeight, 8), toonMat('#E5E9F0'));
      stick.position.set(s * c.netPostX, c.netPostHeight / 2, 0);
      this.group.add(stick);
    }
  }

  private buildSurroundings(theme: Theme, themeId: ThemeId): void {
    const r = rng(themeId.length * 97 + 13);
    // The telephoto camera sits up to ~29 m behind the net, so the end walls must be further out.
    const backZ = PHYSICS.court.halfLength + 18.5;
    const sideX = 5.485 + 5.2;
    const wallMat = toonMat(themeId === 'indoor' ? '#2B3A4F' : '#1F4D3A');
    // windscreens
    for (const s of [-1, 1]) {
      const back = new THREE.Mesh(new THREE.BoxGeometry(sideX * 2, 2.6, 0.2), wallMat);
      back.position.set(0, 1.3, s * backZ);
      back.receiveShadow = true;
      this.group.add(back);
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.4, backZ * 2), wallMat);
      side.position.set(s * sideX, 0.7, 0);
      this.group.add(side);
    }
    // stands (tiers) on both ends and sides
    const standMat = toonMat(theme.stands);
    const tiers = 7;
    const seats: THREE.Vector3[] = [];
    const addStand = (cx: number, cz: number, width: number, alongX: boolean, outward: number) => {
      for (let i = 0; i < tiers; i++) {
        const depth = 0.9;
        const h = 2.6 + i * 0.55;
        const geo = alongX ? new THREE.BoxGeometry(width, 0.5, depth) : new THREE.BoxGeometry(depth, 0.5, width);
        const step = new THREE.Mesh(geo, standMat);
        const off = (i + 0.5) * depth * outward;
        step.position.set(alongX ? cx : cx + off, h, alongX ? cz + off : cz);
        step.receiveShadow = true;
        this.group.add(step);
        const n = Math.floor(width / 0.62);
        for (let k = 0; k < n; k++) {
          if (r() < 0.18) continue;
          const t = -width / 2 + (k + 0.5) * (width / n);
          seats.push(new THREE.Vector3(alongX ? cx + t : cx + off, h + 0.55, alongX ? cz + off : cz + t));
        }
      }
    };
    addStand(0, -(backZ + 0.6), sideX * 2, true, -1);
    addStand(0, backZ + 0.6, sideX * 2, true, 1);
    addStand(-(sideX + 0.6), 0, backZ * 1.6, false, -1);
    addStand(sideX + 0.6, 0, backZ * 1.6, false, 1);

    // crowd (instanced capsules)
    const crowdGeo = new THREE.CapsuleGeometry(0.17, 0.32, 3, 6);
    const crowd = new THREE.InstancedMesh(crowdGeo, new THREE.MeshLambertMaterial(), seats.length);
    const palette = ['#E63946', '#F1FAEE', '#A8DADC', '#457B9D', '#FFB703', '#FB8500', '#8ECAE6', '#2A9D8F', '#E9C46A', '#F4A261', '#9B5DE5', '#00BBF9'];
    const m4 = new THREE.Matrix4();
    const col = new THREE.Color();
    this.crowdBase = new Float32Array(seats.length * 3);
    seats.forEach((p, i) => {
      m4.makeTranslation(p.x, p.y, p.z);
      crowd.setMatrixAt(i, m4);
      col.set(palette[Math.floor(r() * palette.length)]);
      crowd.setColorAt(i, col);
      this.crowdBase![i * 3] = p.x;
      this.crowdBase![i * 3 + 1] = p.y;
      this.crowdBase![i * 3 + 2] = p.z;
    });
    this.crowd = crowd;
    this.group.add(crowd);
    this.loadCrowdSprites(seats, r, themeId);

    // light towers for night / indoor ceiling lights
    if (themeId === 'night') {
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) {
          const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 16, 8), toonMat('#3B4252'));
          pole.position.set(sx * (sideX + 6), 8, sz * (backZ - 2));
          this.group.add(pole);
          const lamp = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 0.4), new THREE.MeshBasicMaterial({ color: 0xfdfcf0 }));
          lamp.position.set(sx * (sideX + 6), 16.2, sz * (backZ - 2));
          lamp.lookAt(0, 0, 0);
          this.group.add(lamp);
        }
      }
    } else if (themeId === 'indoor') {
      const roof = new THREE.Mesh(new THREE.PlaneGeometry(80, 100), new THREE.MeshLambertMaterial({ color: '#1E2430', side: THREE.DoubleSide }));
      roof.rotation.x = Math.PI / 2;
      roof.position.y = 16;
      this.group.add(roof);
      for (let i = -2; i <= 2; i++) {
        const lamp = new THREE.Mesh(new THREE.BoxGeometry(6, 0.15, 0.8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        lamp.position.set(0, 15.8, i * 7);
        this.group.add(lamp);
      }
    } else {
      // distant trees / skyline silhouettes
      const treeMat = toonMat(themeId === 'sunset' ? '#4A2E3F' : '#2F7A4D');
      for (let i = 0; i < 26; i++) {
        const a = (i / 26) * Math.PI * 2;
        const d = 48 + r() * 8;
        const h = 6 + r() * 6;
        const tree = new THREE.Mesh(new THREE.ConeGeometry(2 + r() * 1.5, h, 7), treeMat);
        tree.position.set(Math.cos(a) * d, h / 2, Math.sin(a) * d);
        this.group.add(tree);
      }
    }
  }

  /**
   * Replaces the capsule crowd with camera-facing people from the generated crowd sheet
   * (top row seated, bottom row cheering). Bounce and cheer selection run in the shader.
   */
  private loadCrowdSprites(seats: THREE.Vector3[], r: () => number, themeId: ThemeId): void {
    const cfg = VISUAL.crowd;
    new THREE.TextureLoader().load(
      ASSET.crowdSheet(themeId),
      (tex) => {
        if (this.disposed || !seats.length) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        const img = tex.image as { width: number; height: number };
        const cellAspect = img.width / cfg.cols / (img.height / cfg.rows);
        const geo = new THREE.InstancedBufferGeometry();
        const quad = new THREE.PlaneGeometry(1, 1);
        geo.index = quad.index;
        geo.setAttribute('position', quad.getAttribute('position'));
        geo.setAttribute('uv', quad.getAttribute('uv'));
        const offsets = new Float32Array(seats.length * 3);
        const cells = new Float32Array(seats.length * 2);
        seats.forEach((p, i) => {
          offsets.set([p.x, p.y - cfg.seatDropM, p.z], i * 3);
          cells.set([Math.floor(r() * cfg.cols), r()], i * 2);
        });
        geo.setAttribute('aOffset', new THREE.InstancedBufferAttribute(offsets, 3));
        geo.setAttribute('aCell', new THREE.InstancedBufferAttribute(cells, 2));
        geo.instanceCount = seats.length;
        const mat = new THREE.ShaderMaterial({
          uniforms: {
            map: { value: tex },
            time: { value: 0 },
            cheer: { value: 0 },
            size: { value: new THREE.Vector2(cfg.heightM * cellAspect, cfg.heightM) },
            grid: { value: new THREE.Vector2(cfg.cols, cfg.rows) },
            tint: { value: new THREE.Color(cfg.tint[themeId]) },
            bounce: { value: new THREE.Vector2(cfg.bounceBaseM, cfg.bounceCheerM) },
            threshold: { value: cfg.cheerThreshold },
          },
          vertexShader: `
            attribute vec3 aOffset; attribute vec2 aCell;
            uniform float time; uniform float cheer; uniform vec2 size; uniform vec2 grid; uniform vec2 bounce; uniform float threshold;
            varying vec2 vUv;
            void main(){
              float cheering = cheer > threshold ? step(aCell.y, cheer) : 0.0;
              float hop = max(0.0, sin(time * (6.0 + mod(aCell.x, 5.0)) + aCell.y * 40.0)) * (bounce.x + cheer * bounce.y);
              vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
              vec3 world = aOffset + right * position.x * size.x + vec3(0.0, (position.y + 0.5) * size.y + hop, 0.0);
              vUv = vec2((aCell.x + uv.x) / grid.x, (1.0 - cheering) * (1.0 / grid.y) + uv.y / grid.y);
              gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
            }`,
          fragmentShader: `
            uniform sampler2D map; uniform vec3 tint; varying vec2 vUv;
            void main(){ vec4 c = texture2D(map, vUv); if (c.a < 0.5) discard; gl_FragColor = vec4(c.rgb * tint, 1.0); }`,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.frustumCulled = false;
        this.group.add(mesh);
        this.crowdSprites = mat;
        if (this.crowd) this.crowd.visible = false;
      },
      undefined,
      () => undefined,
    );
  }

  /** Crowd excitement 0..1 (decays). */
  excite(v: number): void {
    this.cheer = Math.max(this.cheer, v);
  }

  update(time: number, dt: number): void {
    this.cheer = Math.max(0, this.cheer - dt * VISUAL.crowd.cheerDecayPerSec);
    if (this.crowdSprites) {
      this.crowdSprites.uniforms.time.value = time;
      this.crowdSprites.uniforms.cheer.value = Math.max(VISUAL.crowd.idleCheer, this.cheer);
      return;
    }
    if (!this.crowd || !this.crowdBase) return;
    const m4 = this.m4;
    const n = this.crowd.count;
    const amp = VISUAL.crowd.bounceBaseM + this.cheer * VISUAL.crowd.bounceCheerM;
    for (let i = 0; i < n; i++) {
      const b = i * 3;
      const j = Math.max(0, Math.sin(time * (6 + (i % 5)) + i * 1.7)) * amp;
      m4.makeTranslation(this.crowdBase[b], this.crowdBase[b + 1] + j, this.crowdBase[b + 2]);
      this.crowd.setMatrixAt(i, m4);
    }
    this.crowd.instanceMatrix.needsUpdate = true;
  }

  dispose(): void {
    this.disposed = true;
    this.group.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
      }
    });
    if (this.crowdSprites) {
      (this.crowdSprites.uniforms.map.value as THREE.Texture).dispose();
      this.crowdSprites.dispose();
    }
  }
}
