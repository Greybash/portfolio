import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { ExperienceItem, CertificationItem } from '@/types';
import { usePortfolioStore } from '@/store/usePortfolioStore';

interface OrbitalStationProps {
  experience: ExperienceItem[];
  certifications: CertificationItem[];
}

export function OrbitalStation({ experience, certifications }: OrbitalStationProps) {
  const { hoveredObject, setHoveredObject } = usePortfolioStore();
  const stationRef = useRef<THREE.Group>(null);
  const reactorRef = useRef<THREE.Mesh>(null);
  
  useFrame((_, delta) => {
    if (stationRef.current) {
      // Slow majestic rotation of the entire Endurance-like ring structure
      stationRef.current.rotation.z += delta * 0.04;
    }
    if (reactorRef.current) {
      reactorRef.current.rotation.y -= delta * 0.15;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. CENTRAL MAJESTIC REACTOR HUB */}
      <group>
        {/* Central Cylindrical Core */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[2.5, 2.5, 6, 24]} />
          <meshStandardMaterial color="#0b0b0e" metalness={0.95} roughness={0.15} />
        </mesh>

        {/* Glowing Fusion Reactor Core Ring */}
        <mesh ref={reactorRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.8, 0.22, 16, 48]} />
          <meshBasicMaterial color="#00ffcc" toneMapped={false} />
        </mesh>

        {/* Magnetic containment shield bands */}
        {[-2, 0, 2].map((yOffset) => (
          <mesh key={yOffset} position={[0, yOffset, 0]}>
            <cylinderGeometry args={[2.65, 2.65, 0.2, 24]} />
            <meshStandardMaterial color="#2d2d35" metalness={0.8} roughness={0.4} />
          </mesh>
        ))}

        {/* Volumetric Reactor Light */}
        <pointLight position={[0, 0, 0]} intensity={1.5} color="#00ffcc" distance={20} />
      </group>

      {/* 2. THE ROTATING STATION STRUCTURE */}
      <group ref={stationRef}>
        {/* Heavy structural spokes linking central hub to outer ring */}
        {[0, 1, 2, 3].map((idx) => {
          const angle = (idx * Math.PI) / 2;
          return (
            <group key={idx} rotation={[0, 0, angle]}>
              {/* Spoke truss structure */}
              <mesh position={[0, 7.5, 0]}>
                <boxGeometry args={[0.3, 11, 0.3]} />
                <meshStandardMaterial color="#1a1a24" metalness={0.9} roughness={0.3} />
              </mesh>
              {/* Outer reinforcing panel */}
              <mesh position={[0, 7.5, 0]}>
                <boxGeometry args={[0.08, 9, 0.6]} />
                <meshStandardMaterial color="#2d2d38" metalness={0.8} roughness={0.2} />
              </mesh>
            </group>
          );
        })}

        {/* Outer Circular Ring */}
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[13, 0.25, 8, 64]} />
          <meshStandardMaterial color="#2a2a38" metalness={0.9} roughness={0.3} emissive="#0a0a18" emissiveIntensity={1} />
        </mesh>

        {/* 3. EXPERIENCE HABITAT MODULES */}
        {(experience || []).map((exp, index) => {
          const angle = (index / Math.max(1, experience.length)) * Math.PI * 2;
          const radius = 13;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <ExperienceModule
              key={exp.id || index}
              exp={exp}
              position={[x, y, 0]}
              angle={angle}
              hoveredObject={hoveredObject}
              setHoveredObject={setHoveredObject}
            />
          );
        })}

        {/* 4. CERTIFICATION STORAGE SATELLITES */}
        {(certifications || []).map((cert, index) => {
          const angle = ((index + 0.5) / Math.max(1, certifications.length)) * Math.PI * 2;
          const radius = 18; // wider orbit than experience
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <CertificationSatellite
              key={cert.id || index}
              cert={cert}
              position={[x, y, 0]}
              angle={angle}
              hoveredObject={hoveredObject}
              setHoveredObject={setHoveredObject}
            />
          );
        })}
      </group>
    </group>
  );
}

interface ExperienceModuleProps {
  exp: ExperienceItem;
  position: [number, number, number];
  angle: number;
  hoveredObject: string | null;
  setHoveredObject: (id: string | null) => void;
}

function ExperienceModule({ exp, position, angle, hoveredObject, setHoveredObject }: ExperienceModuleProps) {
  const moduleRef = useRef<THREE.Group>(null);
  const nodeId = `exp-${exp.id}`;
  const isHovered = hoveredObject === nodeId;

  useFrame((state) => {
    if (moduleRef.current) {
      // Small visual bobbing local to the rotating ring coordinate
      moduleRef.current.position.z = Math.sin(state.clock.elapsedTime * 1.5 + angle) * 0.15;
    }
  });

  return (
    <group 
      ref={moduleRef} 
      position={position}
      rotation={[0, 0, angle + Math.PI / 2]} // Align module tangent to ring
      onPointerOver={(e) => {
        e.stopPropagation();
        setHoveredObject(nodeId);
      }}
      onPointerOut={() => {
        setHoveredObject(null);
      }}
    >
      {/* Sci-Fi Research Habitat Capsule Hull */}
      <mesh castShadow>
        <boxGeometry args={[3.2, 1.8, 2.2]} />
        <meshStandardMaterial 
          color={isHovered ? '#1a1a24' : '#0c0c0e'} 
          metalness={0.9} 
          roughness={0.2} 
          envMapIntensity={2.5}
        />
      </mesh>

      {/* High-tech structural rib details */}
      {[-1.4, 0, 1.4].map((xOffset) => (
        <mesh key={xOffset} position={[xOffset, 0, 0]}>
          <boxGeometry args={[0.2, 2.0, 2.3]} />
          <meshStandardMaterial color="#ff8800" metalness={0.8} />
        </mesh>
      ))}

      {/* Observation Window / Glowing Bay */}
      <mesh position={[0, 0, 1.11]}>
        <planeGeometry args={[1.8, 0.6]} />
        <meshBasicMaterial color="#00ffcc" toneMapped={false} />
      </mesh>

      {/* Antennas / Docking Clamps */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#ff0055" toneMapped={false} />
      </mesh>

      {/* Experience card label */}
      <Html position={[0, -2.8, 0]} center distanceFactor={14}>
        <div style={{
          fontFamily: "'Courier New', monospace",
          borderRadius: '8px',
          background: `linear-gradient(135deg, rgba(0,0,0,0.92) 0%, rgba(10,8,18,0.95) 100%)`,
          border: `1px solid ${isHovered ? '#ff880099' : '#ff880033'}`,
          backdropFilter: 'blur(16px)',
          padding: '10px 14px',
          pointerEvents: 'none',
          userSelect: 'none',
          textAlign: 'center',
          minWidth: '170px',
          maxWidth: '210px',
          boxShadow: `0 0 ${isHovered ? '24px' : '8px'} #ff880022, 0 6px 28px rgba(0,0,0,0.95)`,
        }}>
          <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #ff8800, transparent)', marginBottom: '8px' }} />
          <div style={{ color: '#ffffff', fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.15em', marginBottom: '3px', whiteSpace: 'normal', lineHeight: 1.3 }}>
            {(exp.company || '').toUpperCase()}
          </div>
          <div style={{ color: '#ff8800', fontSize: '8px', letterSpacing: '0.12em', marginBottom: '3px', opacity: 0.95 }}>
            {(exp.role || '').toUpperCase()}
          </div>
          <div style={{ color: '#6a7a8a', fontSize: '7px', letterSpacing: '0.08em', marginBottom: isHovered ? '6px' : '0' }}>
            {`${exp.startDate || ''} → ${exp.endDate || ''}`.toUpperCase()}
          </div>
          {isHovered && exp.techStack && (
            <>
              <div style={{ height: '1px', background: '#ff880033', margin: '5px 0' }} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', justifyContent: 'center' }}>
                {(exp.techStack || []).slice(0, 4).map((t, i) => (
                  <span key={i} style={{ background: '#ff88001a', border: '1px solid #ff880033', color: '#ff8800', fontSize: '6px', padding: '1px 4px', borderRadius: '2px', letterSpacing: '0.06em' }}>
                    {t.toUpperCase()}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </Html>
    </group>
  );
}

interface CertificationSatelliteProps {
  cert: CertificationItem;
  position: [number, number, number];
  angle: number;
  hoveredObject: string | null;
  setHoveredObject: (id: string | null) => void;
}

function CertificationSatellite({ cert, position, angle, hoveredObject, setHoveredObject }: CertificationSatelliteProps) {
  const satRef = useRef<THREE.Group>(null);
  const nodeId = `cert-${cert.id}`;
  const isHovered = hoveredObject === nodeId;

  useFrame((state) => {
    if (satRef.current) {
      satRef.current.rotation.y += 0.02;
      satRef.current.position.z = Math.cos(state.clock.elapsedTime * 1.8 + angle) * 0.2;
    }
  });

  return (
    <group 
      ref={satRef} 
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHoveredObject(nodeId);
      }}
      onPointerOut={() => {
        setHoveredObject(null);
      }}
    >
      {/* Crystalline Data Core Satellite */}
      <mesh castShadow>
        <octahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial 
          color={isHovered ? '#ffffff' : '#00aaff'} 
          metalness={0.9} 
          roughness={0.1}
          emissive="#00aaff"
          emissiveIntensity={isHovered ? 1.5 : 0.4}
        />
      </mesh>

      {/* Orbiting ring around the data core */}
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[1.2, 0.04, 8, 24]} />
        <meshStandardMaterial color="#00ffcc" metalness={0.8} />
      </mesh>

      {/* Cert card label */}
      <Html position={[0, -2.2, 0]} center distanceFactor={10}>
        <div style={{
          fontFamily: "'Courier New', monospace",
          borderRadius: '8px',
          background: `linear-gradient(135deg, rgba(0,0,0,0.92) 0%, rgba(8,14,24,0.95) 100%)`,
          border: `1px solid ${isHovered ? '#00aaffaa' : '#00aaff33'}`,
          backdropFilter: 'blur(16px)',
          padding: '8px 12px',
          pointerEvents: 'none',
          userSelect: 'none',
          textAlign: 'center',
          minWidth: '140px',
          maxWidth: '180px',
          boxShadow: `0 0 ${isHovered ? '20px' : '6px'} #00aaff22, 0 4px 20px rgba(0,0,0,0.9)`,
        }}>
          <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #00aaff, transparent)', marginBottom: '7px' }} />
          <div style={{ color: '#ffffff', fontSize: '9px', fontWeight: 'bold', letterSpacing: '0.12em', lineHeight: 1.35, marginBottom: '4px', whiteSpace: 'normal' }}>
            {(cert.title || '').toUpperCase()}
          </div>
          <div style={{ color: '#00aaff', fontSize: '7px', letterSpacing: '0.1em', opacity: 0.9, marginBottom: '3px' }}>
            {(cert.issuer || '').toUpperCase()}
          </div>
          <div style={{ display: 'inline-block', background: '#00aaff1a', border: '1px solid #00aaff33', color: '#00ddff', fontSize: '6px', padding: '1px 6px', borderRadius: '2px', letterSpacing: '0.08em' }}>
            {cert.date ? cert.date.toUpperCase() : 'CERTIFIED'}
          </div>
        </div>
      </Html>
    </group>
  );
}