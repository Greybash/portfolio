import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { ProjectItem } from '@/types';
import { usePortfolioStore } from '@/store/usePortfolioStore';

interface AsteroidBeltProps {
  projects: ProjectItem[];
}

export function AsteroidBelt({ projects }: AsteroidBeltProps) {
  const { hoveredObject, setHoveredObject, setSelectedProject } = usePortfolioStore();

  return (
    <group>
      {/* Background ambient asteroids */}
      <AmbientAsteroids count={100} />

      {/* Hero Spacecraft / Project Modules */}
      {(projects || []).map((project, index) => (
        <ProjectSpacecraft
          key={project.id}
          project={project}
          index={index}
          hoveredObject={hoveredObject}
          setHoveredObject={setHoveredObject}
          setSelectedProject={setSelectedProject}
        />
      ))}
    </group>
  );
}

function AmbientAsteroids({ count }: { count: number }) {
  const meshRef = useRef<THREE.InstancedMesh | null>(null);

  // Pre-compute Matrix4 array synchronously so it's ready when the mesh mounts
  const matrices = useMemo(() => {
    const mats: THREE.Matrix4[] = [];
    const tempObj = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 15 + Math.random() * 45;
      tempObj.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 20,
        Math.sin(angle) * radius
      );
      const scale = 0.15 + Math.random() * 0.7;
      tempObj.scale.set(scale, scale * 0.9, scale * 1.1);
      tempObj.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      tempObj.updateMatrix();
      mats.push(tempObj.matrix.clone());
    }
    return mats;
  }, [count]);

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.03;
  });

  return (
    <instancedMesh
      ref={(mesh) => {
        meshRef.current = mesh;
        if (mesh) {
          matrices.forEach((mat, i) => mesh.setMatrixAt(i, mat));
          mesh.instanceMatrix.needsUpdate = true;
        }
      }}
      args={[undefined, undefined, count]}
    >
      <dodecahedronGeometry args={[1.0, 1]} />
      <meshStandardMaterial color="#2d2d35" metalness={0.7} roughness={0.9} />
    </instancedMesh>
  );
}

interface ProjectSpacecraftProps {
  project: ProjectItem;
  index: number;
  hoveredObject: string | null;
  setHoveredObject: (id: string | null) => void;
  setSelectedProject: (id: string | null) => void;
}

function ProjectSpacecraft({
  project,
  index,
  hoveredObject,
  setHoveredObject,
  setSelectedProject,
}: ProjectSpacecraftProps) {
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);

  const isHovered = hoveredObject === project.id;
  
  // Distribute along flight path (Z-axis)
  const zSpacing = 32;
  const startZ = 20;
  const zPosition = startZ - index * zSpacing;
  
  // Stagger left and right
  const side = index % 2 === 0 ? 1 : -1;
  const xPosition = side * 7.5;
  const height = side * 1.5;

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Gentle floating
      groupRef.current.position.y = height + Math.sin(state.clock.elapsedTime * 0.6 + index) * 0.6;
    }
    if (modelRef.current) {
      // Continuous slow rotation, speeds up slightly on hover
      const speed = isHovered ? 0.4 : 0.08;
      modelRef.current.rotation.y += delta * speed;
      modelRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  // Render a completely unique class of spacecraft/module based on index
  const renderSpacecraft = () => {
    const accentColor = project.accentColor || '#ff8800';
    
    if (index % 3 === 0) {
      // CARGO CONTAINER TRANSPORT SHUTTLE
      return (
        <group>
          {/* Main Structural Truss Spine */}
          <mesh>
            <boxGeometry args={[0.3, 0.3, 4.2]} />
            <meshStandardMaterial color="#2a2a3e" metalness={0.8} roughness={0.3} emissive="#111128" emissiveIntensity={1} />
          </mesh>
          {/* Front Cargo Nose Command Pod */}
          <mesh position={[0, 0, -2.1]}>
            <coneGeometry args={[0.7, 1.2, 5]} />
            <meshStandardMaterial color="#3d3d52" metalness={0.9} roughness={0.1} emissive={accentColor} emissiveIntensity={0.15} />
          </mesh>
          <mesh position={[0, 0.2, -2.0]}>
            <boxGeometry args={[0.4, 0.1, 0.4]} />
            <meshBasicMaterial color={accentColor} />
          </mesh>
          {/* Core Modules */}
          {[-0.8, 0, 0.8].map((zPos, idx) => (
            <group key={idx} position={[0, 0, zPos]}>
              <mesh>
                <boxGeometry args={[1.4, 1.4, 0.6]} />
                <meshStandardMaterial color="#202030" metalness={0.8} roughness={0.4} emissive="#0a0a18" emissiveIntensity={1} />
              </mesh>
              {[-0.6, 0.6].map((xSide, i) => (
                <mesh key={i} position={[xSide, 0, 0.31]}>
                  <boxGeometry args={[0.1, 1.1, 0.02]} />
                  <meshBasicMaterial color={accentColor} />
                </mesh>
              ))}
            </group>
          ))}
          {/* Back Reactor */}
          <mesh position={[0, 0, 2.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.9, 0.9, 0.8, 8]} />
            <meshStandardMaterial color="#1a1a28" metalness={0.9} roughness={0.4} emissive={accentColor} emissiveIntensity={0.2} />
          </mesh>
          {[-0.3, 0.3].map((xVal, i) => (
            <mesh key={i} position={[xVal, 0, 2.6]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.15, 0.02, 0.6, 8]} />
              <meshBasicMaterial color={accentColor} transparent opacity={0.9} />
            </mesh>
          ))}
        </group>
      );
    } else if (index % 3 === 1) {
      // INTERSTELLAR MINING PROBE DRILLING AN ASTEROID
      return (
        <group>
          {/* Central Sphere Core */}
          <mesh>
            <sphereGeometry args={[1.1, 16, 16]} />
            <meshStandardMaterial color="#1a1a28" metalness={0.8} roughness={0.2} emissive={accentColor} emissiveIntensity={0.1} />
          </mesh>
          {[-1, 1].map((wingSide) => (
            <group key={wingSide} position={[wingSide * 1.5, 0, 0]} rotation={[0, 0, wingSide * 0.1]}>
              <mesh>
                <boxGeometry args={[1.2, 0.05, 1.8]} />
                <meshStandardMaterial color="#252535" metalness={0.8} roughness={0.3} emissive="#0a0a18" emissiveIntensity={1} />
              </mesh>
              <mesh position={[wingSide * 0.5, 0, 0]}>
                <boxGeometry args={[0.1, 0.12, 2.0]} />
                <meshBasicMaterial color={accentColor} />
              </mesh>
            </group>
          ))}
          <group position={[0, -1.2, 0]}>
            <mesh>
              <cylinderGeometry args={[0.2, 0.3, 0.6, 8]} />
              <meshStandardMaterial color="#2d2d38" metalness={0.8} roughness={0.4} />
            </mesh>
            <mesh position={[0, -1.5, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 3.0, 8]} />
              <meshBasicMaterial color={accentColor} transparent opacity={isHovered ? 0.9 : 0.5} />
            </mesh>
          </group>
          <group rotation={[0.4, 0.2, 0]}>
            <mesh>
              <torusGeometry args={[2.2, 0.08, 6, 24]} />
              <meshStandardMaterial color="#444455" metalness={0.7} roughness={0.9} />
            </mesh>
          </group>
        </group>
      );
    } else {
      // DEEP SPACE SCIENCE ORBITAL STATION ARRAY
      return (
        <group>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.7, 0.7, 2.4, 16]} />
            <meshStandardMaterial color="#1c1c2a" metalness={0.9} roughness={0.2} emissive={accentColor} emissiveIntensity={0.12} />
          </mesh>
          {[...Array(3)].map((_, rIdx) => (
            <mesh key={rIdx} position={[0, 0, -0.6 + rIdx * 0.6]} rotation={[0, 0, rIdx * (Math.PI / 3)]}>
              <torusGeometry args={[1.5, 0.06, 8, 32]} />
              <meshBasicMaterial color={accentColor} transparent opacity={0.7} />
            </mesh>
          ))}
          {[...Array(3)].map((_, sIdx) => {
            const angle = (sIdx * Math.PI * 2) / 3;
            return (
              <mesh key={sIdx} position={[Math.cos(angle) * 1.5, Math.sin(angle) * 1.5, 0]}>
                <sphereGeometry args={[0.22, 12, 12]} />
                <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={1.5} metalness={0.8} roughness={0.1} />
              </mesh>
            );
          })}
          <mesh position={[0, 0, -1.4]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.1, 0.05, 0.2, 16]} />
            <meshStandardMaterial color="#2d2d38" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      );
    }
  };

  return (
    <group ref={groupRef} position={[xPosition, height, zPosition]}>
      {/* Main Interactive Floating Model Group */}
      <group
        ref={modelRef}
        onClick={(e) => { e.stopPropagation(); setSelectedProject(project.id); }}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredObject(project.id); }}
        onPointerOut={() => setHoveredObject(null)}
      >
        {renderSpacecraft()}
      </group>

      {/* Proper card label panel */}
      <Html position={[0, -3.8, 0]} center distanceFactor={12}>
        <div style={{
          fontFamily: "'Courier New', monospace",
          borderRadius: '8px',
          background: isHovered
            ? `linear-gradient(135deg, rgba(0,0,0,0.96) 0%, rgba(12,10,20,0.97) 100%)`
            : `linear-gradient(135deg, rgba(0,0,0,0.88) 0%, rgba(10,8,18,0.92) 100%)`,
          border: `1px solid ${isHovered ? (project.accentColor || '#ff8800') + 'bb' : (project.accentColor || '#ff8800') + '44'}`,
          backdropFilter: 'blur(16px)',
          padding: '10px 14px',
          pointerEvents: 'none',
          userSelect: 'none',
          textAlign: 'center',
          minWidth: '160px',
          maxWidth: '200px',
          boxShadow: `0 0 ${isHovered ? '28px' : '12px'} ${(project.accentColor || '#ff8800')}${isHovered ? '44' : '22'}, 0 6px 30px rgba(0,0,0,0.9)`,
        }}>
          {/* Top accent bar */}
          <div style={{ height: '2px', background: `linear-gradient(90deg, transparent, ${project.accentColor || '#ff8800'}, transparent)`, marginBottom: '8px', borderRadius: '1px' }} />
          {/* Project title */}
          <div style={{ color: '#ffffff', fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.15em', lineHeight: 1.3, marginBottom: '5px', whiteSpace: 'normal' }}>
            {(project.title || '').toUpperCase()}
          </div>
          {/* Role */}
          <div style={{ color: project.accentColor || '#ff8800', fontSize: '8px', letterSpacing: '0.12em', opacity: 0.9, marginBottom: '5px' }}>
            {(project.role || '').toUpperCase()}
          </div>
          {/* Tech chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', justifyContent: 'center', marginBottom: isHovered ? '6px' : '0' }}>
            {(project.techStack || []).slice(0, 3).map((t, i) => (
              <span key={i} style={{
                background: `${project.accentColor || '#ff8800'}1a`,
                border: `1px solid ${project.accentColor || '#ff8800'}44`,
                color: project.accentColor || '#ff8800',
                fontSize: '7px',
                letterSpacing: '0.08em',
                padding: '1px 5px',
                borderRadius: '3px',
                whiteSpace: 'nowrap',
              }}>{t.toUpperCase()}</span>
            ))}
          </div>
          {/* Hover CTA */}
          {isHovered && (
            <>
              <div style={{ height: '1px', background: `${project.accentColor || '#ff8800'}44`, margin: '5px 0' }} />
              <div style={{ color: '#00ddff', fontSize: '8px', letterSpacing: '0.14em', fontWeight: 'bold' }}>
                ▶ CLICK TO OPEN
              </div>
            </>
          )}
        </div>
      </Html>

    </group>
  );
}