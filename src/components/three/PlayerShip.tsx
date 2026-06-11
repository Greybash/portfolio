// ================================================================
// PLAYER SHIP — Interstellar Heavy Fighter (Realistic Model)
// PROCEDURAL GEOMETRY & PHYSICS-BASED MATERIALS
// Ported from high-fidelity reference design.
// Orientation: nose = -Z (forward), tail = +Z (rear), up = +Y
// ================================================================

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { positionCurve } from './CameraController';

/* ─────────────────────────────────────────────────────────────
   ENGINE CORE SHADER (radial falloff + shimmer)
───────────────────────────────────────────────────────────── */
function makeEngineShaderMat() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 1.0 },
      uColor: { value: new THREE.Color(0x00c8ff) },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vView;
      void main(){
        vUv    = uv;
        vNormal= normalize(normalMatrix * normal);
        vec4 mv= modelViewMatrix * vec4(position, 1.0);
        vView  = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uIntensity;
      uniform vec3  uColor;
      varying vec2  vUv;
      varying vec3  vNormal;
      varying vec3  vView;
      float hash(vec2 p){return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);}
      void main(){
        float d     = length(vUv - 0.5) * 2.0;
        float glow  = pow(1.0 - smoothstep(0.0, 1.0, d), 1.8);
        float rim   = pow(1.0 - abs(dot(vNormal, vView)), 2.5);
        float flick = 0.93 + 0.07 * sin(uTime * 5.1 + hash(vUv) * 6.28);
        float total = (glow * 0.8 + rim * 0.3) * flick * uIntensity;
        gl_FragColor= vec4(uColor * total * 2.5, total * 0.98 + 0.02);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
}

/* ─────────────────────────────────────────────────────────────
   FUSELAGE GEOMETRY BUILDER
───────────────────────────────────────────────────────────── */
function buildFuselageGeo() {
  const path = [
    // [z,   half-width-X, half-height-Y]
    [ 4.8,  0.08, 0.10 ],   // nose tip
    [ 4.0,  0.22, 0.18 ],
    [ 3.0,  0.45, 0.28 ],
    [ 2.0,  0.72, 0.34 ],
    [ 1.0,  1.05, 0.38 ],
    [ 0.0,  1.42, 0.40 ],
    [-1.0,  1.75, 0.42 ],
    [-2.0,  1.92, 0.42 ],
    [-3.0,  1.88, 0.40 ],  // widest point near engines
    [-3.8,  1.65, 0.36 ],  // tail starts narrowing
    [-4.6,  1.20, 0.30 ],
    [-5.2,  0.70, 0.24 ],
  ];
  const segs = 10; // radial segments per ring
  const verts = []; const norms = []; const uvs = []; const idx = [];

  path.forEach(([z, rX, rY], si) => {
    for (let r = 0; r <= segs; r++) {
      const a = (r / segs) * Math.PI * 2;
      const x = Math.cos(a) * rX;
      const y = Math.sin(a) * rY * (a > Math.PI ? 1.15 : 0.85); // belly down
      verts.push(x, y, z);
      const nx = Math.cos(a) / rX, ny = Math.sin(a) / rY;
      const nl = Math.sqrt(nx * nx + ny * ny);
      norms.push(nx / nl, ny / nl, 0);
      uvs.push(r / segs, si / (path.length - 1));
    }
  });

  const R = segs + 1;
  for (let s = 0; s < path.length - 1; s++) {
    for (let r = 0; r < segs; r++) {
      const a = s * R + r, b = a + 1, c = a + R, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  g.setAttribute('normal',   new THREE.Float32BufferAttribute(norms, 3));
  g.setAttribute('uv',       new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/* ─────────────────────────────────────────────────────────────
   WING SUBCOMPONENT
───────────────────────────────────────────────────────────── */
function Wing({ sign, materials }: { sign: number; materials: any }) {
  const wingGeo = useMemo(() => {
    const s = new THREE.Shape();
    const f = -sign; // sweep flip
    s.moveTo(0,      0    );
    s.lineTo(f * 0.8,  1.5  );
    s.lineTo(f * 2.8,  0.2  );
    s.lineTo(f * 3.0, -1.2  );
    s.lineTo(f * 2.2, -3.2  );
    s.lineTo(f * 0.6, -3.0  );
    s.lineTo(0,     -1.0  );
    s.closePath();
    const eg = new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: false });
    eg.rotateX(-Math.PI / 2);
    eg.rotateY(sign > 0 ? 0 : Math.PI);
    return eg;
  }, [sign]);

  const ribs = [0.0, -0.8, -1.8];

  return (
    <group position={[sign * 0.5, -0.05, -0.5]}>
      {/* Main wing - droops outward */}
      <mesh geometry={wingGeo} material={materials.hull} castShadow receiveShadow rotation={[0, 0, sign * -0.10]} />

      {/* Wing top surface armor slab - flat, non-drooping */}
      <mesh geometry={wingGeo} material={materials.hull2} castShadow position={[0, 0.04, 0]} scale={[0.88, 1, 0.88]} />

      {/* Leading edge bright strip */}
      <mesh position={[sign * 0.6, 0.0, 0.6]} rotation={[0, sign * 0.48, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.05, 0.05, 2.8]} />
        <primitive object={materials.hull} />
      </mesh>

      {/* Wing tip */}
      <mesh position={[sign * 2.85, 0.0, -1.0]} rotation={[0, sign * 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.18, 0.06, 0.45]} />
        <primitive object={materials.hull2} />
      </mesh>

      {/* Trailing edge emissive accent line */}
      <mesh position={[sign * 1.8, 0.0, -2.5]} rotation={[0, sign * -0.22, 0]}>
        <boxGeometry args={[0.035, 0.04, 3.4]} />
        <primitive object={materials.teMat} />
      </mesh>

      {/* Panel grooves on wing surface */}
      {[0.8, 1.6, 2.3].map((xoff, i) => (
        <mesh key={i} position={[sign * xoff, 0.04, -1.0]} castShadow>
          <boxGeometry args={[0.03, 0.04, 2.2]} />
          <primitive object={materials.panel} />
        </mesh>
      ))}

      {/* Underside structural ribs */}
      {ribs.map((xoff, i) => (
        <mesh key={i} position={[sign * 1.0 + xoff, -0.06, xoff * 0.4]} castShadow>
          <boxGeometry args={[Math.abs(2.2), 0.04, 0.08]} />
          <primitive object={materials.struct} />
        </mesh>
      ))}
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   NACELLE SUBCOMPONENT
───────────────────────────────────────────────────────────── */
function Nacelle({
  sign,
  materials,
  engineShaderMatsRef,
  index,
}: {
  sign: number;
  materials: any;
  engineShaderMatsRef: React.MutableRefObject<(THREE.ShaderMaterial | null)[]>;
  index: number;
}) {
  const discMat = useMemo(() => makeEngineShaderMat(), []);

  useEffect(() => {
    engineShaderMatsRef.current[index] = discMat;
    return () => {
      engineShaderMatsRef.current[index] = null;
    };
  }, [discMat, index, engineShaderMatsRef]);

  const NLEN = 2.6;
  const NRAD = 0.62;
  const RING_R = NRAD * 0.88;
  const RING_T = 0.09;
  const zFront = NLEN / 2 + 0.38;

  const geometries = useMemo(() => {
    const body = new THREE.CylinderGeometry(NRAD, NRAD, NLEN, 32, 2);
    body.rotateX(Math.PI / 2);

    const capF = new THREE.CylinderGeometry(NRAD, NRAD * 0.78, 0.45, 32);
    capF.rotateX(-Math.PI / 2);

    const capR = new THREE.CylinderGeometry(NRAD * 0.80, NRAD, 0.4, 32);
    capR.rotateX(Math.PI / 2);

    const frameRg = new THREE.TorusGeometry(RING_R + 0.07, 0.1, 10, 48);
    frameRg.rotateX(Math.PI / 2);

    const glowRg = new THREE.TorusGeometry(RING_R, RING_T, 12, 64);
    glowRg.rotateX(Math.PI / 2);

    const innerRg = new THREE.TorusGeometry(RING_R * 0.65, 0.045, 8, 48);
    innerRg.rotateX(Math.PI / 2);

    const throatG = new THREE.CylinderGeometry(RING_R * 0.62, RING_R * 0.62, 0.5, 32);
    throatG.rotateX(Math.PI / 2);

    const exhaustG = new THREE.CircleGeometry(NRAD * 0.55, 24);
    exhaustG.rotateX(-Math.PI / 2);

    const rearRg = new THREE.TorusGeometry(NRAD * 0.58, 0.04, 8, 32);
    rearRg.rotateX(Math.PI / 2);

    const bandRg = new THREE.TorusGeometry(NRAD + 0.01, 0.025, 6, 36);
    bandRg.rotateX(Math.PI / 2);

    return { body, capF, capR, frameRg, glowRg, innerRg, throatG, exhaustG, rearRg, bandRg };
  }, [NRAD, NLEN, RING_R]);

  const seams = useMemo(() => {
    const items = [];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 8;
      const sx = Math.cos(a) * (NRAD + 0.01);
      const sy = Math.sin(a) * (NRAD + 0.01);
      items.push({ x: sx, y: sy, rz: a });
    }
    return items;
  }, [NRAD]);

  const spokes = useMemo(() => {
    const items = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const sx = Math.cos(a) * RING_R * 0.5;
      const sy = Math.sin(a) * RING_R * 0.5;
      items.push({ x: sx, y: sy, rz: a });
    }
    return items;
  }, [RING_R]);

  return (
    <group position={[sign * 2.45, 0.82, -1.05]}>
      {/* Pylon / Struts */}
      <mesh geometry={new THREE.BoxGeometry(0.72, 0.7, 0.85)} material={materials.hull} position={[sign * -0.85, -0.5, 0]} castShadow receiveShadow />
      <mesh geometry={new THREE.BoxGeometry(0.6, 0.55, 0.55)} material={materials.hull} position={[sign * -0.82, -0.44, 0.3]} castShadow receiveShadow />
      <mesh geometry={new THREE.BoxGeometry(0.55, 0.45, 0.72)} material={materials.struct} position={[sign * -0.80, -0.72, 0]} castShadow receiveShadow />
      <mesh geometry={new THREE.BoxGeometry(0.65, 0.14, 1.0)} material={materials.hull2} position={[sign * -0.88, -0.88, 0]} castShadow receiveShadow />

      {/* Nacelle body tubes */}
      <mesh geometry={geometries.body} material={materials.nacelle} castShadow receiveShadow />
      <mesh geometry={geometries.capF} material={materials.nacelle} position={[0, 0, NLEN / 2 + 0.18]} castShadow receiveShadow />
      <mesh geometry={geometries.capR} material={materials.nacelle} position={[0, 0, -NLEN / 2 - 0.15]} castShadow receiveShadow />

      {/* Seam lines */}
      {seams.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, 0]} rotation={[0, 0, s.rz]} castShadow>
          <boxGeometry args={[0.04, 0.03, NLEN * 0.9]} />
          <primitive object={materials.panel} />
        </mesh>
      ))}

      {/* Circumferential bands */}
      {[-0.6, 0.0, 0.65].map((z, i) => (
        <mesh key={i} geometry={geometries.bandRg} material={materials.panel} position={[0, 0, z]} castShadow />
      ))}

      {/* Top accent stripe */}
      <mesh position={[0, NRAD + 0.01, 0]} castShadow>
        <boxGeometry args={[0.04, 0.03, NLEN * 0.85]} />
        <primitive object={materials.topStrMat} />
      </mesh>

      {/* Forward glowing blue intake ring */}
      <mesh geometry={geometries.frameRg} material={materials.struct} position={[0, 0, zFront]} castShadow />
      <mesh geometry={geometries.glowRg} material={materials.ring} position={[0, 0, zFront]} />
      <mesh geometry={geometries.innerRg} material={materials.ring} position={[0, 0, zFront - 0.02]} />

      {/* Ring spokes */}
      {spokes.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, zFront]} rotation={[0, 0, s.rz]} castShadow>
          <boxGeometry args={[0.04, 0.04, RING_R * 0.9]} />
          <primitive object={materials.panel} />
        </mesh>
      ))}

      {/* Engine core disc with custom shader */}
      <mesh position={[0, 0, zFront - 0.05]} material={discMat}>
        <circleGeometry args={[RING_R * 0.60, 32]} />
      </mesh>

      {/* Dark turbine throat */}
      <mesh geometry={geometries.throatG} material={materials.panel} position={[0, 0, zFront - 0.3]} castShadow />

      {/* Point light emanating forward */}
      <pointLight position={[0, 0, zFront + 0.3]} intensity={4.5} color="#00aaff" distance={6.0} decay={1.5} />

      {/* Rear exhaust */}
      <mesh geometry={geometries.exhaustG} material={materials.exhaustMat} position={[0, 0, -NLEN / 2 - 0.35]} />
      <mesh geometry={geometries.rearRg} material={materials.teMat} position={[0, 0, -NLEN / 2 - 0.34]} />
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PLAYER SHIP EXPORT
───────────────────────────────────────────────────────────── */
export function PlayerShip({ scrollProgress, warpActive = false }: { scrollProgress: number; warpActive?: boolean }) {
  const shipGroup = useRef<THREE.Group>(null);
  const shipModel = useRef<THREE.Group>(null);

  const mouse        = useRef(new THREE.Vector2());
  const currentPos   = useRef(new THREE.Vector3());
  const currentBank  = useRef(0);
  const currentPitch = useRef(0);
  const targetQuat   = useRef(new THREE.Quaternion());
  const currentQuat  = useRef(new THREE.Quaternion());
  const _fwd         = new THREE.Vector3(0, 0, -1);

  // Collect nacelle engine materials to animate in render loop
  const engineShaderMatsRef = useRef<(THREE.ShaderMaterial | null)[]>(Array(2).fill(null));

  // Geometries and materials created once
  const fuselageGeo = useMemo(() => buildFuselageGeo(), []);

  const materials = useMemo(() => {
    // White ceramic-metal hull
    const hull = new THREE.MeshPhysicalMaterial({
      color: 0xdce8f2, metalness: 0.3, roughness: 0.25,
      clearcoat: 0.7, clearcoatRoughness: 0.12,
    });
    // Slightly darker hull for recessed panels
    const hull2 = new THREE.MeshPhysicalMaterial({
      color: 0xb0c4d8, metalness: 0.35, roughness: 0.3,
      clearcoat: 0.5,
    });
    // Dark gunmetal panel gaps / insets
    const panel = new THREE.MeshPhysicalMaterial({
      color: 0x080c10, metalness: 0.85, roughness: 0.5,
    });
    // Mid structural grey
    const struct = new THREE.MeshPhysicalMaterial({
      color: 0x2a3540, metalness: 0.9, roughness: 0.45,
    });
    // Nacelle body
    const nacelle = new THREE.MeshPhysicalMaterial({
      color: 0xc8dae8, metalness: 0.4, roughness: 0.28,
      clearcoat: 0.6, clearcoatRoughness: 0.1,
    });
    // Blue cockpit glass
    const cockpit = new THREE.MeshPhysicalMaterial({
      color: 0x0a1828, emissive: new THREE.Color(0x0a2848), emissiveIntensity: 0.9,
      metalness: 0.0, roughness: 0.05,
      transmission: 0.6, transparent: true, opacity: 0.85,
      ior: 1.5, thickness: 0.1,
    });
    // Emissive blue accent
    const accent = new THREE.MeshStandardMaterial({
      color: 0x000810, emissive: new THREE.Color(0x0077cc), emissiveIntensity: 2.5,
    });
    // Engine glow ring
    const ring = new THREE.MeshStandardMaterial({
      color: 0x001020, emissive: new THREE.Color(0x00aaff), emissiveIntensity: 4.0,
    });

    const teMat = new THREE.MeshStandardMaterial({
      emissive: new THREE.Color(0x004488), emissiveIntensity: 1.5, color: 0x000610,
    });

    const topStrMat = new THREE.MeshStandardMaterial({
      emissive: new THREE.Color(0x0066bb), emissiveIntensity: 1.2, color: 0x000608,
    });

    const exhaustMat = new THREE.MeshStandardMaterial({
      emissive: new THREE.Color(0x003366), emissiveIntensity: 1.8, color: 0x000510,
    });

    const mastTipMat = new THREE.MeshStandardMaterial({
      emissive: new THREE.Color(0x00eeff), emissiveIntensity: 4.0, color: 0x001015,
    });

    return { hull, hull2, panel, struct, nacelle, cockpit, accent, ring, teMat, topStrMat, exhaustMat, mastTipMat };
  }, []);

  const fresnelMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0x0088cc) },
        uStr: { value: 0.55 }
      },
      vertexShader: `
        varying vec3 vN; varying vec3 vV;
        void main(){
          vN=normalize(normalMatrix * normal);
          vec4 mv=modelViewMatrix * vec4(position, 1.0);
          vV=normalize(-mv.xyz);
          gl_Position=projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor; uniform float uStr;
        varying vec3 vN; varying vec3 vV;
        void main(){
          float f=pow(1.0 - abs(dot(vN,vV)), 3.0) * uStr;
          gl_FragColor=vec4(uColor * f, f);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
    });
  }, []);

  useFrame((state) => {
    if (!shipGroup.current || !shipModel.current) return;
    const t   = Math.max(0.001, Math.min(0.999, scrollProgress));
    const pos = positionCurve.getPointAt(t);
    const tan = positionCurve.getTangentAt(t).normalize();

    // Smooth position following
    currentPos.current.lerp(pos, 0.12);
    shipGroup.current.position.copy(currentPos.current);

    // Orientation slerping
    targetQuat.current.setFromUnitVectors(_fwd, tan);
    currentQuat.current.slerp(targetQuat.current, 0.08);
    shipGroup.current.quaternion.copy(currentQuat.current);

    // Banking & pitch dynamics
    currentBank.current  = THREE.MathUtils.lerp(currentBank.current,  -tan.x * 1.2, 0.06);
    currentPitch.current = THREE.MathUtils.lerp(currentPitch.current,   tan.y * 1.0, 0.06);

    // Mouse interactive sway
    mouse.current.x = THREE.MathUtils.lerp(mouse.current.x, state.pointer.x, 0.05);
    mouse.current.y = THREE.MathUtils.lerp(mouse.current.y, state.pointer.y, 0.05);

    shipModel.current.rotation.z = currentBank.current  + (-mouse.current.x * 0.25);
    shipModel.current.rotation.x = currentPitch.current + ( mouse.current.y * 0.25);
    shipModel.current.rotation.y = -mouse.current.x * 0.12;

    // Majestic float/bobbing
    const time = state.clock.elapsedTime;
    shipModel.current.position.y = -0.6 + Math.sin(time * 1.8) * 0.07;
    shipModel.current.position.x = Math.cos(time * 1.2) * 0.03;
    shipModel.current.rotation.z += Math.sin(time * 1.0) * 0.005;

    // Warp engine animation
    engineShaderMatsRef.current.forEach((mat) => {
      if (mat) {
        mat.uniforms.uTime.value = time;
        const multiplier = warpActive ? 2.5 : 1.0;
        const pulse = 0.93 + 0.07 * Math.sin(time * 5.1);
        mat.uniforms.uIntensity.value = multiplier * pulse;
      }
    });
  });

  return (
    <group ref={shipGroup}>
      {/* Position offset ref to handle local rotations/bobbing.
          We add rotation Y = PI (180deg) to turn the +Z HTML model to face -Z. */}
      <group position={[0, -0.6, 3.5]} ref={shipModel} rotation={[0, Math.PI, 0]}>

        {/* ── 1. MAIN FUSELAGE ── */}
        <mesh geometry={fuselageGeo} material={materials.hull} castShadow receiveShadow />
        <mesh geometry={fuselageGeo} material={fresnelMat} />

        {/* Top spine ridge */}
        <mesh position={[0, 0.45, 0.5]} castShadow receiveShadow>
          <boxGeometry args={[0.3, 0.22, 7.0]} />
          <primitive object={materials.hull} />
        </mesh>

        {/* Dorsal raised center panel */}
        <mesh position={[0, 0.5, -0.8]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.18, 2.8]} />
          <primitive object={materials.hull2} />
        </mesh>

        {/* Top armor slabs */}
        <mesh position={[-0.85, 0.36, 0.2]} rotation={[0, 0, 0.18]} castShadow>
          <boxGeometry args={[1.5, 0.1, 3.5]} />
          <primitive object={materials.hull} />
        </mesh>
        <mesh position={[0.85, 0.36, 0.2]} rotation={[0, 0, -0.18]} castShadow>
          <boxGeometry args={[1.5, 0.1, 3.5]} />
          <primitive object={materials.hull} />
        </mesh>

        {/* Nose top slab */}
        <mesh position={[0, 0.32, 2.8]} castShadow>
          <boxGeometry args={[0.55, 0.08, 2.8]} />
          <primitive object={materials.hull} />
        </mesh>

        {/* Underside flat belly plate */}
        <mesh position={[0, -0.34, -0.5]} rotation={[0.04, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 0.12, 6.5]} />
          <primitive object={materials.hull2} />
        </mesh>

        {/* Sharp nose tip */}
        <mesh position={[0, 0.05, 5.2]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <coneGeometry args={[0.14, 1.2, 8]} />
          <primitive object={materials.hull} />
        </mesh>
        <mesh position={[0, 0.05, 5.8]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.03, 0.4, 6]} />
          <primitive object={materials.accent} />
        </mesh>

        {/* Tail rear faces */}
        <mesh position={[0, 0, -5.1]} castShadow>
          <boxGeometry args={[2.4, 0.65, 0.18]} />
          <primitive object={materials.hull2} />
        </mesh>
        <mesh position={[0, 0, -5.2]} castShadow>
          <boxGeometry args={[1.8, 0.4, 0.22]} />
          <primitive object={materials.panel} />
        </mesh>

        {/* ── 2. PANEL DETAILING ── */}
        {/* Center spine groove */}
        <mesh position={[0, 0.52, 0]}>
          <boxGeometry args={[0.06, 0.05, 8.0]} />
          <primitive object={materials.panel} />
        </mesh>

        {/* Lateral seam lines */}
        <mesh position={[-0.6, 0.38, 0.2]}>
          <boxGeometry args={[0.05, 0.06, 5.5]} />
          <primitive object={materials.panel} />
        </mesh>
        <mesh position={[0.6, 0.38, 0.2]}>
          <boxGeometry args={[0.05, 0.06, 5.5]} />
          <primitive object={materials.panel} />
        </mesh>

        {/* Cross-rib panels */}
        {[-2.5, -1.0, 0.5, 1.8].map((z, i) => (
          <mesh key={i} position={[0, 0.42, z]}>
            <boxGeometry args={[2.8, 0.05, 0.07]} />
            <primitive object={materials.panel} />
          </mesh>
        ))}

        {/* Recessed panel squares */}
        {[{ x: -0.9, z: 0.5 }, { x: 0.9, z: 0.5 }, { x: -0.9, z: -0.8 }, { x: 0.9, z: -0.8 }].map((p, i) => (
          <mesh key={i} position={[p.x, 0.46, p.z]}>
            <boxGeometry args={[0.55, 0.06, 0.55]} />
            <primitive object={materials.panel} />
          </mesh>
        ))}

        {/* Dark inset side panels */}
        <mesh position={[-1.35, 0, 0.5]} castShadow>
          <boxGeometry args={[0.08, 0.28, 4.5]} />
          <primitive object={materials.panel} />
        </mesh>
        <mesh position={[1.35, 0, 0.5]} castShadow>
          <boxGeometry args={[0.08, 0.28, 4.5]} />
          <primitive object={materials.panel} />
        </mesh>

        {/* Belly panel gaps */}
        <mesh position={[0, -0.4, -0.4]}>
          <boxGeometry args={[0.06, 0.05, 5.5]} />
          <primitive object={materials.panel} />
        </mesh>
        {[-0.7, 0.7].map((x, i) => (
          <mesh key={i} position={[x, -0.38, -0.4]}>
            <boxGeometry args={[0.05, 0.04, 4.0]} />
            <primitive object={materials.panel} />
          </mesh>
        ))}

        {/* ── 3. COCKPIT CANOPY ── */}
        <group position={[0, 0.5, 1.6]}>
          <mesh castShadow>
            <boxGeometry args={[0.82, 0.12, 1.15]} />
            <primitive object={materials.struct} />
          </mesh>
          {/* 3 cockpit glass panes */}
          {[-1, 0, 1].map((i) => (
            <mesh key={i} position={[i * 0.24, 0.07, 0]} castShadow>
              <boxGeometry args={[0.22, 0.15, 0.85]} />
              <primitive object={materials.cockpit} />
            </mesh>
          ))}
          {/* Frame bars */}
          {[-0.12, 0.12].map((x, i) => (
            <mesh key={i} position={[x, 0.07, 0]}>
              <boxGeometry args={[0.04, 0.16, 0.88]} />
              <primitive object={materials.panel} />
            </mesh>
          ))}
          {/* Lips */}
          <mesh position={[0, 0.07, 0.46]}>
            <boxGeometry args={[0.84, 0.1, 0.06]} />
            <primitive object={materials.struct} />
          </mesh>
          <mesh position={[0, 0.07, -0.46]}>
            <boxGeometry args={[0.84, 0.1, 0.06]} />
            <primitive object={materials.struct} />
          </mesh>
          {/* Glow */}
          <mesh position={[0, -0.02, 0]}>
            <boxGeometry args={[0.7, 0.04, 0.85]} />
            <meshStandardMaterial emissive={new THREE.Color(0x0044aa)} emissiveIntensity={2.0} color={0x000818} />
          </mesh>
        </group>

        {/* ── 4. SWEPT DELTA WINGS ── */}
        <Wing sign={1} materials={materials} />
        <Wing sign={-1} materials={materials} />

        {/* ── 5. ENGINE NACELLES ── */}
        <Nacelle sign={1} materials={materials} engineShaderMatsRef={engineShaderMatsRef} index={0} />
        <Nacelle sign={-1} materials={materials} engineShaderMatsRef={engineShaderMatsRef} index={1} />

        {/* ── 6. ANTENNA MAST ── */}
        <mesh position={[0, 1.35, -0.9]} castShadow>
          <cylinderGeometry args={[0.025, 0.04, 1.4, 6]} />
          <primitive object={materials.struct} />
        </mesh>
        <mesh position={[0, 2.1, -0.9]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <primitive object={materials.mastTipMat} />
        </mesh>
        <mesh position={[0, 1.8, -0.9]}>
          <boxGeometry args={[0.5, 0.025, 0.025]} />
          <primitive object={materials.struct} />
        </mesh>

        {/* ── 7. DORSAL DETAILS ── */}
        {[-0.52, 0.52].map((x, i) => (
          <group key={i}>
            <mesh position={[x, 0.58, 1.0]} castShadow>
              <boxGeometry args={[0.2, 0.12, 0.35]} />
              <primitive object={materials.hull2} />
            </mesh>
            <mesh position={[x, 0.65, 1.0]} castShadow>
              <boxGeometry args={[0.15, 0.06, 0.28]} />
              <primitive object={materials.panel} />
            </mesh>
          </group>
        ))}

        <mesh position={[0, 0.55, 2.5]} castShadow>
          <boxGeometry args={[0.45, 0.16, 0.6]} />
          <primitive object={materials.hull2} />
        </mesh>
        <mesh position={[0, 0.63, 2.5]}>
          <boxGeometry args={[0.3, 0.08, 0.45]} />
          <primitive object={materials.panel} />
        </mesh>

        <mesh position={[0, 0.56, -2.0]} castShadow>
          <boxGeometry args={[0.7, 0.22, 1.0]} />
          <primitive object={materials.hull} />
        </mesh>
        <mesh position={[0, 0.68, -2.0]}>
          <boxGeometry args={[0.55, 0.12, 0.8]} />
          <primitive object={materials.panel} />
        </mesh>

        {/* ── 8. UNDERSIDE DETAILS ── */}
        <mesh position={[0, -0.48, 0.0]} castShadow>
          <boxGeometry args={[0.18, 0.1, 6.5]} />
          <primitive object={materials.struct} />
        </mesh>
        {[-2.5, -1.0, 0.5, 1.8].map((z, i) => (
          <mesh key={i} position={[0, -0.48, z]}>
            <boxGeometry args={[2.2, 0.06, 0.1]} />
            <primitive object={materials.struct} />
          </mesh>
        ))}
        {[-0.6, 0.6].map((x, i) => (
          <group key={i}>
            <mesh position={[x, -0.45, 0.5]} castShadow>
              <boxGeometry args={[0.22, 0.1, 0.55]} />
              <primitive object={materials.panel} />
            </mesh>
            <mesh position={[x, -0.5, 0.5]}>
              <boxGeometry args={[0.14, 0.04, 0.4]} />
              <meshStandardMaterial emissive={new THREE.Color(0x002244)} emissiveIntensity={1.0} color={0x000408} />
            </mesh>
          </group>
        ))}
        {[-0.28, 0.28].map((x, i) => (
          <mesh key={i} position={[x, -0.46, 0.0]}>
            <boxGeometry args={[0.04, 0.02, 5.0]} />
            <meshStandardMaterial emissive={new THREE.Color(0x003355)} emissiveIntensity={1.2} color={0x000408} />
          </mesh>
        ))}

        {/* ── 9. TAIL SECTION THRUSTERS ── */}
        {[-0.8, 0.8].map((x, i) => (
          <group key={i}>
            <mesh position={[x, 0, -5.15]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.18, 0.14, 0.35, 14]} />
              <primitive object={materials.struct} />
            </mesh>
            <mesh position={[x, 0, -5.32]} rotation={[Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.12, 20]} />
              <meshStandardMaterial emissive={new THREE.Color(0x0055aa)} emissiveIntensity={2.2} color={0x000810} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0, -5.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.32, 0.24, 0.5, 20]} />
          <primitive object={materials.struct} />
        </mesh>
        <mesh position={[0, 0, -5.45]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.22, 28]} />
          <meshStandardMaterial emissive={new THREE.Color(0x0077cc)} emissiveIntensity={2.8} color={0x000a14} />
        </mesh>

      </group>
    </group>
  );
}

export default PlayerShip;
