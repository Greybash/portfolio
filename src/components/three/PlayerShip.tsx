// ================================================================
// PLAYER SHIP — Interstellar Heavy Fighter
// Theme: obsidian-black hull with cyan energy conduits,
//        deep-space battlecruiser silhouette, 4-engine array,
//        swept delta wings with heat-sink fins, glowing sensor dome.
// All geometry procedural (no external assets needed).
// ================================================================

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { positionCurve } from './CameraController';

// ── Shared materials (created once) ─────────────────────────────
const MAT = {
  hull:    new THREE.MeshStandardMaterial({ color: '#0a0a0f', metalness: 0.98, roughness: 0.12, envMapIntensity: 3.0 }),
  hullMid: new THREE.MeshStandardMaterial({ color: '#111118', metalness: 0.95, roughness: 0.20, envMapIntensity: 2.5 }),
  panel:   new THREE.MeshStandardMaterial({ color: '#16161e', metalness: 0.90, roughness: 0.30, envMapIntensity: 2.0 }),
  accent:  new THREE.MeshStandardMaterial({ color: '#1a1a28', metalness: 0.85, roughness: 0.35, envMapIntensity: 1.8 }),
  glass:   new THREE.MeshStandardMaterial({ color: '#001c2e', metalness: 1.00, roughness: 0.02, envMapIntensity: 5.0, transparent: true, opacity: 0.85 }),
  chrome:  new THREE.MeshStandardMaterial({ color: '#2a2a35', metalness: 1.00, roughness: 0.05, envMapIntensity: 4.0 }),
  nozzle:  new THREE.MeshStandardMaterial({ color: '#0d0d12', metalness: 0.95, roughness: 0.45, envMapIntensity: 2.0 }),
  heat:    new THREE.MeshStandardMaterial({ color: '#0b1220', metalness: 0.80, roughness: 0.60 }),
};

// Cyan energy glow — used for conduits, sensor ring, panel edges
const CYAN  = '#00d4ff';
const CYAN2 = '#00ffff';
const RED_L = '#ff2244';
const GRN_L = '#00ff88';

// ── Custom hull cone (nose tip) ──────────────────────────────────
function NoseCone() {
  const geo = useMemo(() => {
    // Long pointed cone: r0 tip, r1 base, 8-sided for faceted look
    const g = new THREE.ConeGeometry(0.01, 1.6, 8, 1);
    g.rotateX(Math.PI / 2);  // point toward -Z (forward)
    return g;
  }, []);
  return <mesh geometry={geo} material={MAT.chrome} castShadow position={[0, -0.04, -3.8]} />;
}

// ── Tapered hull section ─────────────────────────────────────────
function HullTaper({ from, to, rFront, rBack, segs = 8 }: {
  from: number; to: number; rFront: number; rBack: number; segs?: number;
}) {
  const geo = useMemo(() => {
    const g = new THREE.CylinderGeometry(rFront, rBack, to - from, segs, 1);
    g.rotateX(Math.PI / 2);
    return g;
  }, [from, to, rFront, rBack, segs]);
  const z = (from + to) / 2;
  return <mesh geometry={geo} material={MAT.hull} castShadow position={[0, 0, z]} />;
}

// ── Engine nozzle assembly ───────────────────────────────────────
interface NozzleProps {
  x: number; y: number;
  engineMatRef: (el: THREE.MeshBasicMaterial | null) => void;
  innerMatRef:  (el: THREE.MeshBasicMaterial | null) => void;
  size?: number;
}

function EngineNozzle({ x, y, engineMatRef, innerMatRef, size = 1 }: NozzleProps) {
  const s = size;
  return (
    <group position={[x, y, 0]}>
      {/* Outer bell housing */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.28 * s, 0.36 * s, 0.55 * s, 20]} />
        <meshStandardMaterial color="#0d0d12" metalness={0.95} roughness={0.45} envMapIntensity={2.0} />
      </mesh>
      {/* Inner thermal ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.05 * s]}>
        <cylinderGeometry args={[0.18 * s, 0.18 * s, 0.15 * s, 20]} />
        <meshStandardMaterial color="#0a1420" metalness={0.90} roughness={0.30} emissive="#001a2e" emissiveIntensity={0.5} />
      </mesh>
      {/* Nozzle rim detail ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.27 * s]}>
        <torusGeometry args={[0.28 * s, 0.025 * s, 8, 24]} />
        <meshStandardMaterial color="#1a1a25" metalness={1.0} roughness={0.1} />
      </mesh>
      {/* Plasma plume — outer */}
      <mesh position={[0, 0, 0.9 * s]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.20 * s, 0.01 * s, 1.6 * s, 16, 1, true]} />
        <meshBasicMaterial
          ref={engineMatRef}
          color={CYAN2}
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Plasma plume — white-hot core */}
      <mesh position={[0, 0, 0.45 * s]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.10 * s, 0.02 * s, 0.85 * s, 12, 1, true]} />
        <meshBasicMaterial
          ref={innerMatRef}
          color="#ffffff"
          transparent
          opacity={0.92}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Point glow at nozzle mouth */}
      <mesh position={[0, 0, 0.05 * s]}>
        <sphereGeometry args={[0.12 * s, 12, 12]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ── Delta wing with heat-sink fins ──────────────────────────────
function DeltaWing({ side }: { side: -1 | 1 }) {
  // Wing is a custom trapezoid flat mesh
  const wingGeo = useMemo(() => {
    // Custom shape: swept delta planform
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);           // root front
    shape.lineTo(0, -3.0);        // root rear
    shape.lineTo(side * 3.4, -2.2); // tip rear
    shape.lineTo(side * 2.8, 0.2);  // tip front
    shape.closePath();

    const geo = new THREE.ShapeGeometry(shape, 4);
    // Rotate flat shape to lie in XZ plane
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, [side]);

  // Panel detail strips on the wing surface
  const panelStrips = [0.3, 0.55, 0.75].map((t) => ({
    x: side * t * 2.8,
    z: -t * 2.6,
    len: 1.4 - t * 0.6,
  }));

  return (
    <group>
      {/* Main wing surface */}
      <mesh geometry={wingGeo} castShadow receiveShadow position={[side * 1.0, -0.05, 0.4]}>
        <meshStandardMaterial color="#0d0d14" metalness={0.95} roughness={0.15} envMapIntensity={2.8} side={THREE.DoubleSide} />
      </mesh>

      {/* Wing underside panel detail */}
      {panelStrips.map((p, i) => (
        <mesh key={i} position={[side * 1.0 + p.x, -0.10, 0.4 + p.z]}>
          <boxGeometry args={[Math.abs(p.len), 0.015, 0.06]} />
          <meshStandardMaterial color="#18182a" metalness={0.9} roughness={0.4} />
        </mesh>
      ))}

      {/* Leading-edge energy conduit strip */}
      <mesh position={[side * 1.0 + side * 1.2, -0.04, -0.3]} rotation={[0, side * 0.38, 0]}>
        <boxGeometry args={[3.2, 0.025, 0.06]} />
        <meshBasicMaterial color={CYAN} toneMapped={false} />
      </mesh>

      {/* Heat-sink fins (5 fins perpendicular to wing upper surface) */}
      {[0, 1, 2, 3, 4].map((i) => {
        const t = 0.2 + i * 0.16;
        return (
          <mesh
            key={i}
            position={[side * 1.0 + side * (t * 2.4), 0.12, 0.4 - t * 2.0]}
            rotation={[0, side * t * 0.15, 0]}
            castShadow
          >
            <boxGeometry args={[0.04, 0.28, 0.55 - i * 0.06]} />
            <meshStandardMaterial color="#0f0f18" metalness={0.92} roughness={0.25} envMapIntensity={2.5} />
          </mesh>
        );
      })}

      {/* Winglet tip stabiliser */}
      <mesh
        position={[side * 1.0 + side * 3.1, 0.22, -1.5]}
        rotation={[0, 0, side * 0.15]}
        castShadow
      >
        <boxGeometry args={[0.06, 0.72, 1.35]} />
        <meshStandardMaterial color="#0c0c14" metalness={0.95} roughness={0.18} envMapIntensity={3.0} />
      </mesh>

      {/* Wingtip nav light */}
      <mesh position={[side * 1.0 + side * 3.15, 0.58, -1.4]}>
        <sphereGeometry args={[0.045, 10, 10]} />
        <meshBasicMaterial color={side === -1 ? RED_L : GRN_L} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ── Main export ──────────────────────────────────────────────────
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

  // Engine material refs (8 slots: 4 outer plumes + 4 inner cores)
  const engineMats = useRef<(THREE.MeshBasicMaterial | null)[]>(Array(8).fill(null));

  useFrame((state) => {
    if (!shipGroup.current || !shipModel.current) return;
    const t   = Math.max(0.001, Math.min(0.999, scrollProgress));
    const pos = positionCurve.getPointAt(t);
    const tan = positionCurve.getTangentAt(t).normalize();

    currentPos.current.lerp(pos, 0.12);
    shipGroup.current.position.copy(currentPos.current);

    targetQuat.current.setFromUnitVectors(_fwd, tan);
    currentQuat.current.slerp(targetQuat.current, 0.08);
    shipGroup.current.quaternion.copy(currentQuat.current);

    // Banking / pitch
    currentBank.current  = THREE.MathUtils.lerp(currentBank.current,  -tan.x * 1.2, 0.06);
    currentPitch.current = THREE.MathUtils.lerp(currentPitch.current,   tan.y * 1.0, 0.06);

    // Mouse sway
    mouse.current.x = THREE.MathUtils.lerp(mouse.current.x, state.pointer.x, 0.05);
    mouse.current.y = THREE.MathUtils.lerp(mouse.current.y, state.pointer.y, 0.05);

    shipModel.current.rotation.z = currentBank.current  + (-mouse.current.x * 0.25);
    shipModel.current.rotation.x = currentPitch.current + ( mouse.current.y * 0.25);
    shipModel.current.rotation.y = -mouse.current.x * 0.12;

    const time = state.clock.elapsedTime;
    shipModel.current.position.y = Math.sin(time * 1.8) * 0.14;

    // Engine animations
    engineMats.current.forEach((mat, i) => {
      if (!mat) return;
      const isInner = i >= 4;
      const flicker  = Math.sin(time * 18 + i * 1.3) * 0.12;
      const breathe  = Math.sin(time * 2.5 + i * 0.8) * 0.08;
      mat.opacity    = (isInner ? 0.88 : 0.70) + flicker + breathe;
      const target   = new THREE.Color(isInner ? '#ffffff' : CYAN2);
      mat.color.lerp(target, 0.06);
    });
  });

  return (
    <group ref={shipGroup}>
      <group position={[0, -0.6, 3.5]} ref={shipModel}>

        {/* ── FUSELAGE ─────────────────────────────────────────── */}

        {/* Nose cone (very pointy) */}
        <NoseCone />

        {/* Forward section — tapered */}
        <HullTaper from={-3.0} to={-1.8} rFront={0.22} rBack={0.40} segs={8} />

        {/* Mid-forward section */}
        <HullTaper from={-1.8} to={-0.4} rFront={0.40} rBack={0.55} segs={10} />

        {/* Main body — widest cross-section */}
        <mesh castShadow receiveShadow position={[0, 0.04, 0.4]}>
          <boxGeometry args={[1.10, 0.48, 2.8]} />
          <meshStandardMaterial color="#0a0a0f" metalness={0.98} roughness={0.12} envMapIntensity={3.0} />
        </mesh>

        {/* Dorsal spine ridge */}
        <mesh castShadow position={[0, 0.30, 0.0]}>
          <boxGeometry args={[0.38, 0.24, 3.6]} />
          <meshStandardMaterial color="#111120" metalness={0.95} roughness={0.20} envMapIntensity={2.5} />
        </mesh>
        <mesh castShadow position={[0, 0.44, -0.6]}>
          <boxGeometry args={[0.22, 0.12, 2.0]} />
          <meshStandardMaterial color="#141422" metalness={0.92} roughness={0.25} />
        </mesh>

        {/* Cockpit module */}
        <mesh castShadow position={[0, 0.42, -1.4]} rotation={[-0.12, 0, 0]}>
          <boxGeometry args={[0.72, 0.30, 1.40]} />
          <meshStandardMaterial color="#001e30" metalness={1.0} roughness={0.03} envMapIntensity={5.5} transparent opacity={0.88} />
        </mesh>
        {/* Cockpit frame edges */}
        {[[-0.36, 0], [0.36, 0]].map(([x], i) => (
          <mesh key={i} castShadow position={[x, 0.42, -1.4]} rotation={[-0.12, 0, 0]}>
            <boxGeometry args={[0.04, 0.32, 1.42]} />
            <meshStandardMaterial color="#1a1a28" metalness={0.95} roughness={0.15} />
          </mesh>
        ))}

        {/* HUD light bar inside cockpit */}
        <mesh position={[0, 0.48, -1.85]}>
          <boxGeometry args={[0.55, 0.028, 0.018]} />
          <meshBasicMaterial color={CYAN} toneMapped={false} />
        </mesh>

        {/* Ventral keel */}
        <mesh castShadow position={[0, -0.30, 0.2]}>
          <boxGeometry args={[0.60, 0.20, 3.0]} />
          <meshStandardMaterial color="#0d0d14" metalness={0.95} roughness={0.22} envMapIntensity={2.5} />
        </mesh>

        {/* Rear body — taper toward engine block */}
        <HullTaper from={1.4} to={2.6} rFront={0.50} rBack={0.38} segs={10} />

        {/* ── PANEL DETAILS ────────────────────────────────────── */}

        {/* Side panel grooves (left & right) */}
        {[-1, 1].map((side) => (
          <group key={side}>
            {/* Hull panel stripe */}
            <mesh position={[side * 0.52, 0.0, 0.2]}>
              <boxGeometry args={[0.015, 0.44, 2.60]} />
              <meshStandardMaterial color="#1e1e2c" metalness={0.90} roughness={0.40} />
            </mesh>
            {/* Energy conduit along lower hull */}
            <mesh position={[side * 0.48, -0.22, 0.2]}>
              <boxGeometry args={[0.022, 0.022, 2.50]} />
              <meshBasicMaterial color={CYAN} toneMapped={false} />
            </mesh>
            {/* Access hatch panels */}
            {[-0.6, 0.4, 1.2].map((z, j) => (
              <mesh key={j} position={[side * 0.54, 0.06, z]}>
                <boxGeometry args={[0.012, 0.30, 0.55]} />
                <meshStandardMaterial color="#161624" metalness={0.88} roughness={0.38} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Dorsal sensor array (flat dish on top) */}
        <mesh castShadow position={[0, 0.54, 0.8]} rotation={[0.08, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.24, 0.06, 12]} />
          <meshStandardMaterial color="#0e0e18" metalness={0.95} roughness={0.18} envMapIntensity={3.0} />
        </mesh>
        <mesh position={[0, 0.58, 0.8]}>
          <sphereGeometry args={[0.06, 10, 10]} />
          <meshBasicMaterial color={CYAN} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>

        {/* Forward sensor ring around nose */}
        <mesh castShadow position={[0, -0.04, -2.35]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.30, 0.035, 6, 24]} />
          <meshStandardMaterial color="#1a1a28" metalness={0.95} roughness={0.15} />
        </mesh>
        <mesh position={[0, -0.04, -2.35]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.28, 0.012, 6, 24]} />
          <meshBasicMaterial color={CYAN} toneMapped={false} />
        </mesh>

        {/* ── WINGS ────────────────────────────────────────────── */}
        <DeltaWing side={-1} />
        <DeltaWing side={1} />

        {/* ── ENGINE BLOCK ─────────────────────────────────────── */}
        <group position={[0, 0, 2.4]}>
          {/* Engine housing slab */}
          <mesh castShadow position={[0, 0, 0.3]}>
            <boxGeometry args={[1.60, 0.58, 0.80]} />
            <meshStandardMaterial color="#0f0f18" metalness={0.95} roughness={0.35} envMapIntensity={2.0} />
          </mesh>

          {/* Cross-beam structure */}
          <mesh castShadow position={[0, 0, 0.3]}>
            <boxGeometry args={[1.62, 0.10, 0.82]} />
            <meshStandardMaterial color="#1a1a28" metalness={0.90} roughness={0.30} />
          </mesh>

          {/* Vertical separator spine */}
          <mesh castShadow position={[0, 0, 0.32]}>
            <boxGeometry args={[0.10, 0.60, 0.84]} />
            <meshStandardMaterial color="#141420" metalness={0.90} roughness={0.30} />
          </mesh>

          {/* Engine conduit — top */}
          <mesh position={[0, 0.30, 0.30]}>
            <boxGeometry args={[1.62, 0.028, 0.030]} />
            <meshBasicMaterial color={CYAN} toneMapped={false} />
          </mesh>

          {/* Four nozzles: 2×2 grid */}
          {[[-0.50, 0.16], [0.50, 0.16], [-0.50, -0.16], [0.50, -0.16]].map(([x, y], i) => (
            <EngineNozzle
              key={i}
              x={x} y={y}
              size={i < 2 ? 0.92 : 0.78}    // outer pair bigger
              engineMatRef={(el) => { engineMats.current[i] = el; }}
              innerMatRef={(el)  => { engineMats.current[i + 4] = el; }}
            />
          ))}

          {/* Heat-sink fins above engine block */}
          {[-0.55, -0.18, 0.18, 0.55].map((x, i) => (
            <mesh key={i} castShadow position={[x, 0.48, 0.28]}>
              <boxGeometry args={[0.06, 0.30, 0.70]} />
              <meshStandardMaterial color="#0d0d16" metalness={0.92} roughness={0.28} envMapIntensity={2.5} />
            </mesh>
          ))}
        </group>

        {/* ── VENTRAL WEAPON PODS (decorative) ─────────────────── */}
        {[-0.62, 0.62].map((x, i) => (
          <group key={i} position={[x, -0.38, -0.4]}>
            <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.10, 0.14, 1.40, 8]} />
              <meshStandardMaterial color="#0d0d14" metalness={0.95} roughness={0.20} envMapIntensity={2.5} />
            </mesh>
            {/* Weapon tip emitter glow */}
            <mesh position={[0, 0, -0.75]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshBasicMaterial color={CYAN} transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
            {/* Pod energy stripe */}
            <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 1.42, 6]} />
              <meshBasicMaterial color={CYAN} toneMapped={false} />
            </mesh>
          </group>
        ))}

      </group>
    </group>
  );
}
