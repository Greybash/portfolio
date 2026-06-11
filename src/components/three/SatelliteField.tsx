import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { SkillCategory, SkillTool } from '@/types';

// ── Shared label card style ──────────────────────────────────────
const cardBase: React.CSSProperties = {
  fontFamily: "'Courier New', monospace",
  borderRadius: '6px',
  border: '1px solid',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  pointerEvents: 'none',
  userSelect: 'none',
  whiteSpace: 'nowrap',
};

interface SatelliteFieldProps {
  skills: SkillCategory[];
  hoveredObject: string | null;
  setHoveredObject: (id: string | null) => void;
}

export function SatelliteField({ skills, hoveredObject, setHoveredObject }: SatelliteFieldProps) {
  const containerRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (containerRef.current) {
      containerRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.5;
    }
  });

  return (
    <group ref={containerRef}>
      {(skills || []).map((category, index) => (
        <SkillRelayStation
          key={category.id || index}
          category={category}
          index={index}
          hoveredObject={hoveredObject}
          setHoveredObject={setHoveredObject}
        />
      ))}
    </group>
  );
}

interface SkillRelayStationProps {
  category: SkillCategory;
  index: number;
  hoveredObject: string | null;
  setHoveredObject: (id: string | null) => void;
}

function SkillRelayStation({ category, index, hoveredObject, setHoveredObject }: SkillRelayStationProps) {
  const stationRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Group>(null);

  const zSpacing = 22;
  const startZ = -25;
  const zPosition = startZ - index * zSpacing;

  const side = index % 2 === 0 ? 1 : -1;
  const xPosition = side * 5;
  const height = (index % 3 - 1) * 2;

  useFrame((state, delta) => {
    if (stationRef.current) {
      stationRef.current.position.y = height + Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.4;
    }
    if (coreRef.current) coreRef.current.rotation.y += delta * 0.2;
    if (ringRef.current) {
      ringRef.current.rotation.y -= delta * 0.3;
      ringRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.15;
    }
  });

  const palette = ['#7B61FF', '#00D4FF', '#F5A623', '#FF3366', '#00FF88'];
  const baseColor = palette[index % palette.length];
  const bgColor = `${baseColor}22`;
  const borderColor = `${baseColor}55`;

  return (
    <group ref={stationRef} position={[xPosition, height, zPosition]}>

      {/* ── Core ── */}
      <group ref={coreRef}>
        <mesh>
          <cylinderGeometry args={[0.6, 0.6, 2.0, 12]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.3} emissive={baseColor} emissiveIntensity={0.12} />
        </mesh>
        {([-1.05, 1.05] as number[]).map((y, i) => (
          <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.65, 0.05, 8, 32]} />
            <meshBasicMaterial color={baseColor} />
          </mesh>
        ))}
        <mesh>
          <octahedronGeometry args={[0.7, 0]} />
          <meshStandardMaterial color={baseColor} emissive={baseColor} emissiveIntensity={2.5} metalness={0.4} roughness={0.1} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.5, 8, 8]} />
          <meshBasicMaterial color={baseColor} transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        {([-1, 1] as number[]).map((s) => (
          <group key={s} position={[s * 1.5, 0, 0]}>
            <mesh>
              <boxGeometry args={[1.4, 0.4, 0.06]} />
              <meshStandardMaterial color="#1e1e30" metalness={0.6} roughness={0.4} emissive="#0a0a20" emissiveIntensity={1} />
            </mesh>
            {([-0.4, 0, 0.4] as number[]).map((gx, gi) => (
              <mesh key={gi} position={[gx, 0, 0.04]}>
                <boxGeometry args={[0.08, 0.32, 0.01]} />
                <meshBasicMaterial color={baseColor} transparent opacity={0.85} />
              </mesh>
            ))}
            <mesh position={[-s * 0.75, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
              <meshBasicMaterial color="#4a4a6a" />
            </mesh>
          </group>
        ))}
      </group>

      {/* ── Rings ── */}
      <group ref={ringRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.6, 0.04, 8, 64]} />
          <meshBasicMaterial color={baseColor} transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh rotation={[Math.PI / 5, Math.PI / 4, 0]}>
          <torusGeometry args={[1.9, 0.022, 8, 48]} />
          <meshBasicMaterial color={baseColor} transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>

      {/* ── Tool nodes ── */}
      {(category.tools || []).map((tool, toolIdx) => (
        <OrbitingToolNode
          key={`${tool.name}-${toolIdx}`}
          tool={tool}
          index={toolIdx}
          total={Math.max(1, (category.tools || []).length)}
          baseRadius={2.6}
          baseColor={baseColor}
          hoveredObject={hoveredObject}
          setHoveredObject={setHoveredObject}
        />
      ))}

      {/* ── Station label card ── */}
      <Html position={[0, 3.4, 0]} center distanceFactor={9}>
        <div style={{
          ...cardBase,
          background: `linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(10,10,24,0.92) 100%)`,
          border: `1px solid ${borderColor}`,
          padding: '10px 16px',
          minWidth: '180px',
          textAlign: 'center',
          boxShadow: `0 0 20px ${bgColor}, 0 4px 24px rgba(0,0,0,0.8)`,
        }}>
          {/* Accent bar */}
          <div style={{ height: '2px', background: `linear-gradient(90deg, transparent, ${baseColor}, transparent)`, marginBottom: '8px', borderRadius: '1px' }} />
          {/* Category name */}
          <div style={{
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 'bold',
            letterSpacing: '0.18em',
            textShadow: `0 0 10px ${baseColor}`,
            marginBottom: '4px',
          }}>
            {(category.category || '').toUpperCase()}
          </div>
          {/* Description */}
          <div style={{
            color: baseColor,
            fontSize: '8px',
            letterSpacing: '0.12em',
            opacity: 0.9,
            lineHeight: 1.4,
            maxWidth: '160px',
            whiteSpace: 'normal',
            textAlign: 'center',
          }}>
            {(category.description || '').toUpperCase()}
          </div>
          {/* Proficiency bar */}
          <div style={{ marginTop: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', height: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${category.proficiency || 80}%`, background: `linear-gradient(90deg, ${baseColor}88, ${baseColor})`, borderRadius: '2px' }} />
          </div>
          <div style={{ color: baseColor, fontSize: '7px', marginTop: '3px', opacity: 0.7, letterSpacing: '0.08em' }}>
            PROFICIENCY {category.proficiency || 80}%
          </div>
        </div>
      </Html>
    </group>
  );
}

interface OrbitingToolNodeProps {
  tool: SkillTool;
  index: number;
  total: number;
  baseRadius: number;
  baseColor: string;
  hoveredObject: string | null;
  setHoveredObject: (id: string | null) => void;
}

function OrbitingToolNode({ tool, index, total, baseRadius, baseColor, hoveredObject, setHoveredObject }: OrbitingToolNodeProps) {
  const nodeRef = useRef<THREE.Group>(null);
  const nodeId = `tool-${(tool.name || '').toLowerCase().replace(/\s+/g, '-')}-${index}`;
  const isHovered = hoveredObject === nodeId;
  const orbitSpeed = 0.35 + (index % 3) * 0.12;
  const phaseOffset = (index * Math.PI * 2) / total;

  useFrame((state) => {
    if (nodeRef.current) {
      const time = state.clock.elapsedTime * orbitSpeed + phaseOffset;
      nodeRef.current.position.set(
        Math.cos(time) * baseRadius,
        Math.sin(time * 2) * 0.3,
        Math.sin(time) * baseRadius,
      );
    }
  });

  return (
    <group ref={nodeRef}
      onPointerOver={(e) => { e.stopPropagation(); setHoveredObject(nodeId); }}
      onPointerOut={() => setHoveredObject(null)}
    >
      <mesh>
        <sphereGeometry args={[0.28, 12, 12]} />
        <meshStandardMaterial color={baseColor} emissive={baseColor} emissiveIntensity={isHovered ? 4.0 : 1.8} metalness={0.5} roughness={0.1} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.42, 8, 8]} />
        <meshBasicMaterial color={baseColor} transparent opacity={isHovered ? 0.4 : 0.18} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.44, 0.022, 4, 16]} />
        <meshBasicMaterial color={baseColor} transparent opacity={isHovered ? 1 : 0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Tool label — only shown on hover or as small dot otherwise */}
      <Html position={[0, 0.65, 0]} center distanceFactor={5}>
        <div style={{
          ...cardBase,
          background: isHovered
            ? `linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(10,10,24,0.95) 100%)`
            : `rgba(0,0,0,0.75)`,
          border: `1px solid ${isHovered ? baseColor + 'aa' : baseColor + '33'}`,
          padding: isHovered ? '6px 10px' : '3px 7px',
          textAlign: 'center',
          boxShadow: isHovered ? `0 0 16px ${baseColor}44` : 'none',
          transition: 'all 0.2s ease',
          minWidth: '60px',
        }}>
          <div style={{ color: '#ffffff', fontSize: isHovered ? '9px' : '8px', fontWeight: 'bold', letterSpacing: '0.1em' }}>
            {(tool.name || '').toUpperCase()}
          </div>
          {isHovered && (
            <>
              <div style={{ height: '1px', background: `${baseColor}66`, margin: '3px 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: '1px', height: '3px' }}>
                  <div style={{ height: '100%', width: `${tool.level}%`, background: baseColor, borderRadius: '1px' }} />
                </div>
                <div style={{ color: baseColor, fontSize: '7px', fontWeight: 'bold' }}>{tool.level}%</div>
              </div>
            </>
          )}
        </div>
      </Html>
    </group>
  );
}