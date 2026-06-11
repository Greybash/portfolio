// ============================================================
// STARFIELD — ULTRA REALISTIC PROCEDURAL STARS
// Multi-layered with parallax, twinkling, color variation,
// nebula dust, and galactic core glow
// ============================================================

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StarfieldProps {
  count?: number;
  radius?: number;
  depth?: number;
  scrollProgress?: number;
  speed?: number;
  color?: string;
  size?: number;
}

// Star shader with twinkling and color temperature
const starVertexShader = `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aTwinkleSpeed;
  attribute float aTwinkleOffset;

  varying vec3 vColor;
  varying float vTwinkle;

  uniform float uTime;
  uniform float uScrollProgress;

  void main() {
    vColor = aColor;

    // Twinkling effect
    float twinkle = sin(uTime * aTwinkleSpeed + aTwinkleOffset) * 0.5 + 0.5;
    twinkle = pow(twinkle, 3.0); // Sharper twinkle
    vTwinkle = twinkle;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // Size attenuation with twinkle
    float size = aSize * (0.7 + twinkle * 0.6);
    size *= (300.0 / -mvPosition.z);

    gl_PointSize = max(size, 0.5);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const starFragmentShader = `
  varying vec3 vColor;
  varying float vTwinkle;

  void main() {
    // Circular point with soft edge
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);

    if (dist > 0.5) discard;

    // Soft glow falloff
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    alpha = pow(alpha, 1.5);

    // Cross flare for bright stars
    float flare = 0.0;
    if (vTwinkle > 0.7) {
      float xFlare = 1.0 - abs(coord.x) * 8.0;
      float yFlare = 1.0 - abs(coord.y) * 8.0;
      flare = max(xFlare, yFlare) * smoothstep(0.7, 1.0, vTwinkle) * 0.5;
    }

    vec3 finalColor = vColor * (0.6 + vTwinkle * 0.8);
    finalColor += vec3(flare);

    gl_FragColor = vec4(finalColor, alpha * (0.6 + vTwinkle * 0.4));
  }
`;

export function StarLayer({
  count = 2000,
  radius = 300,
  depth = 150,
  scrollProgress = 0,
  speed = 0.002,
  color = '#E8ECF1',
  size = 1.0,
}: StarfieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const [positions, sizes, colors, twinkleSpeeds, twinkleOffsets] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const twinkleSpeeds = new Float32Array(count);
    const twinkleOffsets = new Float32Array(count);


    const tempColors = [
      new THREE.Color('#A8C8FF'), // Blue-white (hot)
      new THREE.Color('#E8ECF1'), // White
      new THREE.Color('#FFF4E0'), // Warm white
      new THREE.Color('#FFD4A3'), // Orange-ish
      new THREE.Color('#FFB8A3'), // Red-ish (cool)
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Spherical distribution with galactic disk bias
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius + (Math.random() - 0.5) * depth;

      // Flatten for galactic disk feel
      const diskFlatten = 0.3 + Math.random() * 0.4;

      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * diskFlatten;
      positions[i3 + 2] = r * Math.cos(phi);

      // Varied sizes — most small, few bright
      const sizeRoll = Math.random();
      if (sizeRoll > 0.995) {
        sizes[i] = size * 4; // Super bright stars
      } else if (sizeRoll > 0.98) {
        sizes[i] = size * 2.5; // Bright stars
      } else if (sizeRoll > 0.9) {
        sizes[i] = size * 1.5; // Medium stars
      } else {
        sizes[i] = size * (0.3 + Math.random() * 0.7); // Normal stars
      }

      // Color temperature based on random selection
      const tempIndex = Math.floor(Math.random() * tempColors.length);
      const starColor = tempColors[tempIndex].clone();

      // Slight variation
      starColor.offsetHSL(0, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1);

      colors[i3] = starColor.r;
      colors[i3 + 1] = starColor.g;
      colors[i3 + 2] = starColor.b;

      // Twinkle parameters
      twinkleSpeeds[i] = 0.5 + Math.random() * 3.0;
      twinkleOffsets[i] = Math.random() * Math.PI * 2;
    }

    return [positions, sizes, colors, twinkleSpeeds, twinkleOffsets];
  }, [count, radius, depth, color, size]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uScrollProgress: { value: 0 },
  }), []);

  useFrame((_, delta) => {
    if (!pointsRef.current || !materialRef.current) return;

    const time = performance.now() * 0.001;
    materialRef.current.uniforms.uTime.value = time;
    materialRef.current.uniforms.uScrollProgress.value = scrollProgress;

    // Subtle rotation
    pointsRef.current.rotation.y += delta * speed * (1 + scrollProgress * 0.3);
    pointsRef.current.rotation.x += delta * speed * 0.15;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
        <bufferAttribute attach="attributes-aTwinkleSpeed" args={[twinkleSpeeds, 1]} />
        <bufferAttribute attach="attributes-aTwinkleOffset" args={[twinkleOffsets, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={starVertexShader}
        fragmentShader={starFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Nebula dust particles
function NebulaDust({ count = 500, radius = 100 }: { count?: number; radius?: number }) {
  const ref = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);

    const nebulaColors = [
      new THREE.Color('#7B61FF'),
      new THREE.Color('#00D4FF'),
      new THREE.Color('#F5A623'),
      new THREE.Color('#FF6B35'),
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      const height = (Math.random() - 0.5) * 20;

      pos[i3] = Math.cos(angle) * r;
      pos[i3 + 1] = height;
      pos[i3 + 2] = Math.sin(angle) * r;

      const color = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];
      cols[i3] = color.r;
      cols[i3 + 1] = color.g;
      cols[i3 + 2] = color.b;
    }

    return [pos, cols];
  }, [count, radius]);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.005;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={`
          attribute vec3 color;
          varying vec3 vColor;
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = 30.0 * (1.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          varying vec3 vColor;
          void main() {
            vec2 coord = gl_PointCoord - vec2(0.5);
            if (length(coord) > 0.5) discard;
            float alpha = 1.0 - (length(coord) * 2.0);
            gl_FragColor = vec4(vColor, alpha * 0.4);
          }
        `}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Galactic core glow
function GalacticCore() {
  return (
    <mesh>
      <sphereGeometry args={[60, 32, 32]} />
      <meshBasicMaterial
        color="#1A0A2E"
        transparent
        opacity={0.08}
        side={THREE.BackSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export function Starfield({ scrollProgress = 0 }: { scrollProgress?: number }) {
  return (
    <group>
      {/* Galactic core background glow */}
      <GalacticCore />

      {/* Distant background stars — very faint, blue-white */}
      <StarLayer
        count={3000}
        radius={400}
        depth={200}
        scrollProgress={scrollProgress}
        speed={0.001}
        color="#8A9BB8"
        size={0.4}
      />

      {/* Mid-range stars — white with temperature variation */}
      <StarLayer
        count={2500}
        radius={220}
        depth={120}
        scrollProgress={scrollProgress}
        speed={0.003}
        color="#C8D0E0"
        size={0.7}
      />

      {/* Bright foreground stars — with flares */}
      <StarLayer
        count={800}
        radius={120}
        depth={60}
        scrollProgress={scrollProgress}
        speed={0.006}
        color="#E8ECF1"
        size={1.2}
      />

      {/* Golden accent stars near galactic plane */}
      <StarLayer
        count={300}
        radius={70}
        depth={15}
        scrollProgress={scrollProgress}
        speed={0.008}
        color="#F5A623"
        size={0.8}
      />

      {/* Nebula dust */}
      <NebulaDust count={600} radius={80} />

      {/* Second nebula layer */}
      <NebulaDust count={400} radius={150} />
    </group>
  );
}

export default Starfield;
