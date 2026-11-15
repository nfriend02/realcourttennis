import * as THREE from 'three';

let gradient: THREE.DataTexture | null = null;

/** 2-ramp cell shading gradient (07 §15.1). */
export function toonGradient(): THREE.DataTexture {
  if (gradient) return gradient;
  const data = new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]);
  gradient = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  gradient.minFilter = THREE.NearestFilter;
  gradient.magFilter = THREE.NearestFilter;
  gradient.needsUpdate = true;
  return gradient;
}

const toonCache = new Map<string, THREE.MeshToonMaterial>();

export function toonMat(color: string | number, emissive = 0): THREE.MeshToonMaterial {
  const key = `${color}|${emissive}`;
  let m = toonCache.get(key);
  if (!m) {
    m = new THREE.MeshToonMaterial({ color, gradientMap: toonGradient() });
    if (emissive) {
      m.emissive = new THREE.Color(color);
      m.emissiveIntensity = emissive;
    }
    toonCache.set(key, m);
  }
  return m;
}

const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1d26, side: THREE.BackSide });

/** Inverted-hull outline child. */
export function withOutline(mesh: THREE.Mesh, thickness = 0.018): THREE.Mesh {
  const o = new THREE.Mesh(mesh.geometry, outlineMat);
  const g = mesh.geometry;
  g.computeBoundingSphere();
  const r = g.boundingSphere?.radius ?? 0.2;
  o.scale.setScalar(1 + thickness / Math.max(0.03, r));
  o.castShadow = false;
  o.receiveShadow = false;
  mesh.add(o);
  return mesh;
}

export function part(geo: THREE.BufferGeometry, color: string | number, outline = true, thickness = 0.018): THREE.Mesh {
  const m = new THREE.Mesh(geo, toonMat(color));
  m.castShadow = true;
  if (outline) withOutline(m, thickness);
  return m;
}
