import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export function TransmissionGateway() {
  const groupRef    = useRef<THREE.Group>(null);
  const ringOuterRef = useRef<THREE.Group>(null);
  const ringInnerRef = useRef<THREE.Group>(null);
  const portalCoreRef = useRef<THREE.Mesh>(null);
  const vortexRef   = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z += delta * 0.05;

    if (ringOuterRef.current) ringOuterRef.current.rotation.y += delta * 0.15;
    if (ringInnerRef.current) {
      ringInnerRef.current.rotation.y -= delta * 0.3;
      ringInnerRef.current.rotation.x += delta * 0.1;
    }
    if (portalCoreRef.current) {
      const time = state.clock.elapsedTime;
      const scale = 1.0 + Math.sin(time * 4) * 0.06;
      portalCoreRef.current.scale.setScalar(scale);
      const mat = portalCoreRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.7 + Math.sin(time * 8) * 0.1;
    }
    if (vortexRef.current) vortexRef.current.rotation.y += delta * 0.5;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>

      {/* ── Outer arch ring ── */}
      <group ref={ringOuterRef}>
        <mesh>
          <torusGeometry args={[18, 1.2, 16, 64]} />
          <meshStandardMaterial
            color="#1c1c2e"
            metalness={0.9}
            roughness={0.2}
            emissive="#ff0055"
            emissiveIntensity={0.08}
          />
        </mesh>
        {/* Energy pillars */}
        {[0, 1, 2, 3, 4, 5].map((idx) => {
          const angle = (idx * Math.PI * 2) / 6;
          const r = 18;
          return (
            <group key={idx} position={[Math.cos(angle) * r, Math.sin(angle) * r, 0]} rotation={[0, 0, angle]}>
              <mesh>
                <boxGeometry args={[1.5, 3.2, 1.8]} />
                <meshStandardMaterial color="#252535" metalness={0.8} roughness={0.3} />
              </mesh>
              <mesh position={[0, 0, 1.0]}>
                <cylinderGeometry args={[0.1, 0.1, 2.5, 8]} />
                <meshBasicMaterial color="#ff0055" />
              </mesh>
              <mesh position={[0, 1.8, 0]}>
                <sphereGeometry args={[0.2, 8, 8]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* ── Inner corona frame ── */}
      <group ref={ringInnerRef}>
        <mesh>
          <torusGeometry args={[13, 0.4, 8, 48]} />
          <meshStandardMaterial color="#ff0055" metalness={0.7} emissive="#ff0055" emissiveIntensity={0.8} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[14, 0.2, 8, 48]} />
          <meshStandardMaterial color="#00ffcc" metalness={0.9} emissive="#00ffcc" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {/* ── Swirling portal core ── */}
      <group>
        <mesh ref={portalCoreRef}>
          <sphereGeometry args={[7.8, 32, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[8.4, 32, 32]} />
          <meshBasicMaterial color="#ff0055" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        {[1, 2, 3].map((rIdx) => (
          <mesh key={rIdx} rotation={[0, 0, rIdx * 0.5]}>
            <torusGeometry args={[8.5 + rIdx * 0.8, 0.05, 4, 32]} />
            <meshBasicMaterial color="#00ffcc" transparent opacity={0.5 / rIdx} />
          </mesh>
        ))}
      </group>

      {/* ── Transmission vortex beam ── */}
      <mesh ref={vortexRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 30]}>
        <cylinderGeometry args={[4, 1.2, 60, 24, 1, true]} />
        <meshBasicMaterial color="#ff0055" transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 45]}>
        <cylinderGeometry args={[2.5, 0.5, 90, 16, 1, true]} />
        <meshBasicMaterial color="#00ffcc" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* ── Gateway label — Html, no font loading ── */}
      <Html position={[0, -22, 0]} center distanceFactor={20}>
        <div style={{
          fontFamily: "'Courier New', monospace",
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(0,0,0,0.92) 0%, rgba(18,0,10,0.95) 100%)',
          border: '1px solid #ff005566',
          borderRadius: '8px',
          backdropFilter: 'blur(16px)',
          padding: '12px 20px',
          minWidth: '220px',
          pointerEvents: 'none',
          userSelect: 'none',
          boxShadow: '0 0 30px #ff005522, 0 8px 32px rgba(0,0,0,0.95)',
        }}>
          <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #ff0055, transparent)', marginBottom: '10px' }} />
          <div style={{ color: '#ffffff', fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.2em', marginBottom: '5px' }}>
            TRANSMISSION GATEWAY
          </div>
          <div style={{ color: '#ff0055', fontSize: '9px', letterSpacing: '0.15em', opacity: 0.9 }}>
            READY FOR SECURE COMMS LINK
          </div>
        </div>
      </Html>
    </group>
  );
}

export default TransmissionGateway;