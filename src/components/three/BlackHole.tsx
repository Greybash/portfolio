// ================================================================
// GARGANTUA — Interstellar Black Hole component for R3F
// Ported from standalone HTML with exact GUI values:
//   Bloom Strength: 0.65 | Radius: 0 | Threshold: 0.22
//   Disk Speed: 0.58 | Lensing: 2.2 | Stars: 15000 | Exposure: 0.47
// ================================================================
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface BlackHoleProps {
  position?: [number, number, number];
}

// ── Constants (matching the HTML source) ────────────────────────
const EH_RADIUS     = 1.5;   // Event horizon radius
const DISK_INNER    = 2.5;
const DISK_OUTER    = 10.0;
const PHOTON_SPHERE = 2.3;
const LENSED_RING_R1 = 2.8;
const LENSED_RING_R2 = 3.15;
const DISK_SPEED    = 0.58;  // from GUI

// ── Disk geometry builder (ring with custom attributes) ──────────
function buildDiskGeometry(innerR: number, outerR: number, segments: number, rings: number) {
  const geo = new THREE.BufferGeometry();
  const pos: number[] = [], radii: number[] = [], angles: number[] = [], idx: number[] = [];

  for (let i = 0; i <= rings; i++) {
    const t = i / rings;
    const r = innerR + (outerR - innerR) * t;
    for (let j = 0; j <= segments; j++) {
      const theta = (j / segments) * Math.PI * 2;
      pos.push(r * Math.cos(theta), 0, r * Math.sin(theta));
      radii.push(t);
      angles.push(theta);
    }
  }
  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * (segments + 1) + j;
      const b = a + segments + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  geo.setIndex(idx);
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('aRadius',  new THREE.Float32BufferAttribute(radii, 1));
  geo.setAttribute('aAngle',   new THREE.Float32BufferAttribute(angles, 1));
  return geo;
}

// ── Disk vertex shader ───────────────────────────────────────────
const DISK_VERT = /* glsl */`
  attribute float aRadius;
  attribute float aAngle;
  varying float vRadius;
  varying float vAngle;

  void main() {
    vRadius = aRadius;
    vAngle  = aAngle;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ── Disk fragment shader: FBM plasma + Keplerian rotation ────────
const DISK_FRAG = /* glsl */`
  precision highp float;

  uniform float uTime;
  uniform float uDiskSpeed;

  varying float vRadius;
  varying float vAngle;

  // Simplex 2D noise
  vec2 hash22(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float snoise(vec2 p) {
    const float K1 = 0.366025404;
    const float K2 = 0.211324865;
    vec2 i = floor(p + (p.x + p.y) * K1);
    vec2 a = p - i + (i.x + i.y) * K2;
    float m = step(a.y, a.x);
    vec2 o = vec2(m, 1.0 - m);
    vec2 b = a - o + K2;
    vec2 c = a - 1.0 + 2.0 * K2;
    vec3 h = max(0.5 - vec3(dot(a,a), dot(b,b), dot(c,c)), 0.0);
    vec3 n = h*h*h*h * vec3(
      dot(a, hash22(i)),
      dot(b, hash22(i + o)),
      dot(c, hash22(i + 1.0))
    );
    return dot(n, vec3(70.0));
  }

  // FBM — 5 octaves
  float fbm(vec2 p) {
    float f = 0.0, w = 0.5;
    for (int i = 0; i < 5; i++) {
      f += w * snoise(p);
      p *= 2.03; w *= 0.48;
    }
    return f;
  }

  void main() {
    float r = vRadius;

    // Keplerian rotation: inner orbits faster
    float kepSpeed = 1.0 / pow(r * 3.0 + 1.0, 1.5);
    float angle = vAngle + uTime * uDiskSpeed * kepSpeed * 3.0;

    vec2 nc = vec2(cos(angle), sin(angle)) * (r * 6.0 + 1.0);

    float turb = fbm(nc + uTime * 0.04 * uDiskSpeed);
    float fine = snoise(nc * 3.5 + uTime * 0.08) * 0.25;
    float turbulence = turb + fine;

    // Three spiral arms
    float spiral = 0.82 + 0.18 * sin(angle * 3.0 - r * 14.0 + uTime * uDiskSpeed * 0.4);

    float temp = 1.0 - r;

    vec3 whiteHot     = vec3(1.0, 0.97, 0.88);
    vec3 brightOrange = vec3(1.0, 0.58, 0.10);
    vec3 deepOrange   = vec3(0.88, 0.28, 0.04);
    vec3 coolBlue     = vec3(0.10, 0.18, 0.62);

    vec3 color;
    if (temp > 0.7) {
      color = mix(brightOrange, whiteHot,    (temp - 0.7) / 0.3);
    } else if (temp > 0.4) {
      color = mix(deepOrange,   brightOrange, (temp - 0.4) / 0.3);
    } else if (temp > 0.12) {
      color = mix(coolBlue,     deepOrange,   (temp - 0.12) / 0.28);
    } else {
      color = coolBlue;
    }

    color *= (0.65 + 0.35 * turbulence) * spiral;

    // Doppler beaming
    float doppler = 1.0 + 0.5 * sin(angle);
    color *= doppler;

    // Photon ring spike at inner edge
    float photonRing = exp(-r * 28.0) * 5.0;

    float brightness = (0.3 + 0.7 * temp) * (0.75 + 0.25 * turbulence) + photonRing;
    brightness *= 2.2;

    float aInner = smoothstep(0.0, 0.035, r);
    float aOuter = smoothstep(1.0, 0.72, r);
    float alpha  = aInner * aOuter;

    gl_FragColor = vec4(color * brightness, alpha);
  }
`;

// ── Star vertex shader ───────────────────────────────────────────
const STAR_VERT = /* glsl */`
  attribute float aSize;
  attribute float aBrightness;
  attribute float aDistToCenter;
  varying float vBrightness;
  varying float vRedshift;

  void main() {
    vBrightness = aBrightness;
    vRedshift = smoothstep(18.0, 3.0, aDistToCenter);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (220.0 / -mvPos.z);
    gl_PointSize = max(gl_PointSize, 0.5);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const STAR_FRAG = /* glsl */`
  varying float vBrightness;
  varying float vRedshift;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.05, d) * vBrightness;
    vec3 col = vec3(0.85, 0.9, 1.0);
    col = mix(col, vec3(1.0, 0.45, 0.15), vRedshift * 0.75);
    col *= vBrightness;
    gl_FragColor = vec4(col, alpha);
  }
`;

// ── Nebula vertex / fragment shaders ────────────────────────────
const NEB_VERT = /* glsl */`
  attribute float aSize;
  attribute vec3 aNebulaColor;
  attribute float aAlpha;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aNebulaColor;
    vAlpha = aAlpha;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (300.0 / -mvPos.z);
    gl_PointSize = max(gl_PointSize, 1.0);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const NEB_FRAG = /* glsl */`
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float alpha = exp(-d * d * 8.0) * vAlpha;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

export function BlackHole({ position = [0, 0, -350] }: BlackHoleProps) {
  const diskMatRef  = useRef<THREE.ShaderMaterial>(null);
  const nebulaRef   = useRef<THREE.Points>(null);

  // ── Accretion disk geometry (256 segments, 80 rings) ──────────
  const diskGeo = useMemo(() => buildDiskGeometry(DISK_INNER, DISK_OUTER, 256, 80), []);

  const diskUniforms = useMemo(() => ({
    uTime:      { value: 0 },
    uDiskSpeed: { value: DISK_SPEED },
  }), []);

  // ── Star geometry (15 000 stars, matching GUI value) ──────────
  const starGeo = useMemo(() => {
    const COUNT = 15000;
    const positions    = new Float32Array(COUNT * 3);
    const sizes        = new Float32Array(COUNT);
    const brightness   = new Float32Array(COUNT);
    const distToCenter = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      let x, y, z, dist;
      do {
        x = (Math.random() - 0.5) * 2;
        y = (Math.random() - 0.5) * 2;
        z = (Math.random() - 0.5) * 2;
        dist = Math.sqrt(x * x + y * y + z * z);
      } while (dist < 0.08);

      const radius = 120 + Math.random() * 380;
      positions[i * 3]     = (x / dist) * radius;
      positions[i * 3 + 1] = (y / dist) * radius;
      positions[i * 3 + 2] = (z / dist) * radius;
      sizes[i]        = Math.pow(Math.random(), 2.5) * 3.5 + 0.4;
      brightness[i]   = Math.pow(Math.random(), 3) * 0.85 + 0.15;
      distToCenter[i] = radius;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position',      new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('aSize',         new THREE.Float32BufferAttribute(sizes, 1));
    geo.setAttribute('aBrightness',   new THREE.Float32BufferAttribute(brightness, 1));
    geo.setAttribute('aDistToCenter', new THREE.Float32BufferAttribute(distToCenter, 1));
    return geo;
  }, []);

  // ── Nebula geometry ───────────────────────────────────────────
  const nebulaGeo = useMemo(() => {
    const COUNT = 800;
    const positions = new Float32Array(COUNT * 3);
    const sizes     = new Float32Array(COUNT);
    const colors    = new Float32Array(COUNT * 3);
    const alphas    = new Float32Array(COUNT);

    const palette = [
      [0.06, 0.10, 0.35],
      [0.10, 0.06, 0.30],
      [0.04, 0.14, 0.40],
      [0.18, 0.06, 0.12],
      [0.25, 0.12, 0.04],
    ];

    for (let i = 0; i < COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const rXZ   = 6 + Math.random() * 50;
      positions[i * 3]     = Math.cos(angle) * rXZ;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = Math.sin(angle) * rXZ;
      sizes[i] = 15 + Math.random() * 60;
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c[0]; colors[i * 3 + 1] = c[1]; colors[i * 3 + 2] = c[2];
      alphas[i] = 0.008 + Math.random() * 0.035;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position',    new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('aSize',       new THREE.Float32BufferAttribute(sizes, 1));
    geo.setAttribute('aNebulaColor',new THREE.Float32BufferAttribute(colors, 3));
    geo.setAttribute('aAlpha',      new THREE.Float32BufferAttribute(alphas, 1));
    return geo;
  }, []);

  // ── Animation ─────────────────────────────────────────────────
  useFrame((state) => {
    if (diskMatRef.current) {
      diskMatRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    if (nebulaRef.current) {
      nebulaRef.current.rotation.y = state.clock.elapsedTime * 0.003;
    }
  });

  return (
    <group position={position}>

      {/* ── Starfield ──────────────────────────────────────── */}
      <points geometry={starGeo} renderOrder={0}>
        <shaderMaterial
          vertexShader={STAR_VERT}
          fragmentShader={STAR_FRAG}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* ── Nebula particles ───────────────────────────────── */}
      <points ref={nebulaRef} geometry={nebulaGeo} renderOrder={1}>
        <shaderMaterial
          vertexShader={NEB_VERT}
          fragmentShader={NEB_FRAG}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* ── Event Horizon — writes depth + paints black, occludes all ── */}
      {/* renderOrder 1: renders before disk/rings so depth is set first */}
      <mesh renderOrder={1} onUpdate={self => { self.material.depthWrite = true; }}>
        <sphereGeometry args={[EH_RADIUS, 64, 64]} />
        <meshBasicMaterial color="#000000" depthWrite={true} />
      </mesh>

      {/* ── Shadow cap — slightly larger black sphere to cover lensing artifacts ── */}
      <mesh renderOrder={1}>
        <sphereGeometry args={[EH_RADIUS * 1.15, 32, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={1} depthWrite={false} />
      </mesh>

      {/* ── Accretion disk — full FBM plasma shader ──────────── */}
      <mesh renderOrder={3}>
        <primitive object={diskGeo} />
        <shaderMaterial
          ref={diskMatRef}
          vertexShader={DISK_VERT}
          fragmentShader={DISK_FRAG}
          uniforms={diskUniforms}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Photon ring — ultra-bright white-gold ─────────────── */}
      <mesh renderOrder={4}>
        <torusGeometry args={[PHOTON_SPHERE, 0.018, 12, 180]} />
        <meshBasicMaterial
          color={new THREE.Color(4.0, 3.2, 1.8)}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Primary lensed Einstein ring ─────────────────────── */}
      <mesh renderOrder={5}>
        <torusGeometry args={[LENSED_RING_R1, 0.045, 12, 180]} />
        <meshBasicMaterial
          color={new THREE.Color(2.5, 1.4, 0.35)}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Secondary lensed ring ─────────────────────────────── */}
      <mesh renderOrder={6}>
        <torusGeometry args={[LENSED_RING_R2, 0.028, 12, 180]} />
        <meshBasicMaterial
          color={new THREE.Color(1.8, 0.9, 0.25)}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

    </group>
  );
}

export default BlackHole;
