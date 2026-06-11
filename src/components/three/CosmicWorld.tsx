// ============================================================
// COSMIC WORLD — ULTRA REALISTIC INTERSTELLAR SCENE
// Master 3D scene with cinematic post-processing, realistic
// lighting, and atmospheric effects
// ============================================================

import { useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Environment } from '@react-three/drei';
import { BlackHole } from './BlackHole';
import { Starfield } from './Starfield';
import { SatelliteField } from './SatelliteField';
import { AsteroidBelt } from './AsteroidBelt';
import { OrbitalStation } from './OrbitalStation';
import { TransmissionGateway } from './TransmissionGateway';
import { CameraController, getZoneForProgress } from './CameraController';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import SpaceMusic from '@/components/SpaceMusic';
import * as THREE from 'three';

// Dust particles for atmosphere
function AtmosphericDust({ count = 200 }: { count?: number }) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
  }

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#F5A623"
        transparent
        opacity={0.2}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Scene() {
  const {
    scrollProgress,
    setScrollProgress,
    setCurrentZone,
    hoveredObject,
    setHoveredObject,
    skills,
    experience,
    projects,
    certifications,
  } = usePortfolioStore();

  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const [autoScrolled, setAutoScrolled] = useState(false);

  // Determine which zones are active based on scroll
  const showConstellations = scrollProgress >= 0.295; // constellation-field starts at 0.295
  const showAsteroids = scrollProgress >= 0.60;       // asteroid-belt starts at 0.60
  const showStation = scrollProgress >= 0.75;          // orbital-station starts at 0.75
  const showGateway = scrollProgress >= 0.90;          // transmission-gateway starts at 0.90
  const blackHoleIntensity = scrollProgress > 0.85 ? 1.8 : 1;

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? window.scrollY / docHeight : 0;
      setScrollProgress(Math.max(0, Math.min(1, progress)));
      if (window.scrollY > 10) {
        setUserHasScrolled(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Call immediately to set initial progress
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setScrollProgress]);

  // Auto-advance through warp after 1.5 seconds - only once
  useEffect(() => {
    if (autoScrolled || userHasScrolled) return;
    
    const timer = setTimeout(() => {
      // Scroll only to 20% — shows the warp tunnel, then user scrolls naturally
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const targetScroll = docHeight * 0.20;
      
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
      
      setAutoScrolled(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [autoScrolled, userHasScrolled]);

  // Set scrollable height — 6000vh gives each zone ~1000vh of travel room
  useEffect(() => {
    document.body.style.height = '6000vh';
    return () => { document.body.style.height = ''; };
  }, []);

  // DISABLE background color transitions - keep it simple
  useFrame((state) => {
    // Just keep background at default dark color
    if (!state.scene.background) {
      state.scene.background = new THREE.Color('#020205');
    }
    if (!state.scene.fog) {
      state.scene.fog = new THREE.FogExp2('#020205', 0.0003); // Very light fog
    }
  });

  return (
    <>
      {/* Camera */}
      <CameraController
        scrollProgress={scrollProgress}
        onZoneChange={setCurrentZone}
      />

      {/* Enhanced Lighting */}
      <ambientLight intensity={0.8} color="#ffffff" />
      <Environment preset="city" background={false} />

      {/* Main directional light mimicking a distant sun */}
      <directionalLight
        position={[50, 50, 50]}
        intensity={2.5}
        color="#ffffff"
      />
      
      {/* Camera area light for close objects */}
      <pointLight
        position={[0, 10, 80]}
        intensity={5.0}
        color="#ffffff"
        distance={100}
        decay={1}
      />
      
      <pointLight
        position={[0, 0, -350]}
        intensity={3 * blackHoleIntensity}
        color="#F5A623"
        distance={400}
        decay={1.5}
      />

      {/* Mid-scene fill light */}
      <pointLight
        position={[0, 20, -150]}
        intensity={2.0}
        color="#ffffff"
        distance={200}
        decay={1}
      />

      {/* Constellation zone fill lights — cover z=-25 to z=-120 where stations now live */}
      <pointLight
        position={[0, 5, -50]}
        intensity={4.0}
        color="#7B61FF"
        distance={100}
        decay={1.5}
      />
      <pointLight
        position={[0, 5, -100]}
        intensity={4.0}
        color="#00D4FF"
        distance={100}
        decay={1.5}
      />

      {/* Rim light */}
      <pointLight
        position={[30, -10, -200]}
        intensity={0.3}
        color="#7B61FF"
        distance={100}
        decay={2}
      />

      {/* Black Hole — simplified and optimized */}
      <BlackHole position={[0, 0, -350]} />

      {/* Starfield — always visible */}
      <Starfield scrollProgress={scrollProgress} />

      {/* Atmospheric dust */}
      <AtmosphericDust count={150} />

      {/* Constellation Field — Skills
           Camera travels from z≈-20 to z≈-150 during 0.295-0.60.
           Group at z=0 so stations at z=-25 to z=-130 are always in view. */}
      {showConstellations && (
        <group position={[0, 0, 0]}>
          <SatelliteField
            skills={skills}
            hoveredObject={hoveredObject}
            setHoveredObject={setHoveredObject}
          />
        </group>
      )}

      {/* Asteroid Belt (Projects)
           Camera travels from z≈-150 to z≈-200 during 0.60-0.75.
           Group at z=-160 so asteroids are in front. */}
      {showAsteroids && projects && projects.length > 0 && (
        <group position={[0, 0, -160]}>
          <AsteroidBelt projects={projects} />
        </group>
      )}

      {/* Orbital Station (Experience) */}
      {showStation && experience && experience.length > 0 && (
        <group position={[0, 0, -230]}>
          <OrbitalStation experience={experience} certifications={certifications} />
        </group>
      )}

      {/* Transmission Gateway — sits BELOW the black hole at y=-20
           Camera arcs past the BH from the right, so the gateway is visible
           beneath the accretion disk without overlapping the BH visuals */}
      {showGateway && (
        <group position={[0, -20, -345]}>
          <TransmissionGateway />
        </group>
      )}

      {/* Post-processing — values from Gargantua GUI screenshot
           Bloom Strength: 0.65 | Radius: 0 | Threshold: 0.22 */}
      <EffectComposer multisampling={4}>
        <Bloom
          luminanceThreshold={0.22}
          luminanceSmoothing={0.025}
          mipmapBlur={false}
          intensity={0.65}
          radius={0}
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.0006, 0.0006)}
        />
        <Vignette eskil={false} offset={0.15} darkness={1.0} />
      </EffectComposer>
    </>
  );
}

export function CosmicWorld() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 1, background: '#020205' }}>
      {/* Space Music */}
      <SpaceMusic enabled={musicEnabled} volume={0.12} />

      {/* Music toggle */}
      <button
        onClick={() => setMusicEnabled(!musicEnabled)}
        className="fixed bottom-20 right-6 z-50 flex items-center gap-2 px-3 py-2 rounded-lg text-xs border border-[#F5A62340] text-[#F5A623] hover:bg-[#F5A62320] transition-all cursor-pointer pointer-events-auto"
        style={{ fontFamily: 'monospace' }}
      >
        {musicEnabled ? '🔊' : '🔇'} {musicEnabled ? 'MUSIC ON' : 'MUSIC OFF'}
      </button>

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#020205] z-50">
          <div className="text-center">
            <div className="text-[#F5A623] text-sm font-mono tracking-widest mb-4 animate-pulse">
              INITIALIZING UNIVERSE
            </div>
            <div className="w-48 h-0.5 bg-[#1A1A2E] mx-auto overflow-hidden rounded-full">
              <div className="h-full bg-[#F5A623] animate-pulse rounded-full" style={{ width: '60%' }} />
            </div>
            <div className="text-xs text-[#E8ECF1] opacity-40 mt-4 font-mono">
              Generating cosmic ambience...
            </div>
          </div>
        </div>
      )}

      <Canvas
        camera={{ fov: 55, near: 0.1, far: 1000, position: [0, 8, 90] }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.47,
          powerPreference: 'high-performance',
        }}
        onCreated={(state) => {
          console.log('✅ Canvas created successfully!', state);
          setIsLoaded(true);
        }}
        onError={(error) => {
          console.error('❌ Canvas error:', error);
        }}
        style={{ width: '100%', height: '100%', background: '#020205' }}
        dpr={[1, 2]}
      >
        <Suspense fallback={
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="red" />
          </mesh>
        }>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default CosmicWorld;
