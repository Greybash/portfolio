// ================================================================
// LIGHTSPEED TUNNEL — Full-screen procedural hyperspace
// Fixes:  streaks now cover full screen including corners
//         3 stars per angular band — no gaps / dashes
//         uFlash: brief white flash on entry AND exit
//         uBoost: speed spike on warp entry
// ================================================================

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const VERT = /* glsl */`
  varying vec2 vScreen;
  void main() {
    vScreen = position.xy;                         // -1..+1 (NDC)
    gl_Position = vec4(position.xy, 0.9999, 1.0); // far-plane: behind 3D objects
  }
`;

const FRAG = /* glsl */`
  precision highp float;

  uniform float uTime;
  uniform float uSpeed;   // 0..1 current warp factor
  uniform float uFlash;   // 0..1 entry/exit white flash
  uniform float uAspect;  // viewport w/h

  varying vec2 vScreen;

  float h1(float n){ return fract(sin(n*127.1+311.7)*43758.5453); }
  float h2(float n){ return fract(sin(n*269.5+183.3)*73856.7234); }
  float h3(float n){ return fract(sin(n* 74.3+921.1)*32617.3000); }

  void main() {
    if (uSpeed < 0.01 && uFlash < 0.01) { gl_FragColor = vec4(0.0); return; }

    // ── Screen coords (aspect-corrected so radial = round) ──────
    vec2  uv    = vec2(vScreen.x * uAspect, vScreen.y);
    float dist  = length(uv);
    float angle = atan(uv.y, uv.x);             // -PI..+PI
    float phi   = angle / 6.28318 + 0.5;        // 0..1

    // ── Angular bands ────────────────────────────────────────────
    const float N_BANDS    = 320.0;
    const float N_PER_BAND = 3.0;   // 3 stars per band → dense, no gaps

    float band     = floor(phi * N_BANDS);
    float bandFrac = fract(phi * N_BANDS) - 0.5;

    // Thin radial line — narrows as speed increases
    float halfW  = (0.30 + (1.0 - uSpeed) * 0.50) / N_BANDS;
    float angFac = smoothstep(halfW, 0.0, abs(bandFrac / N_BANDS));
    if (angFac < 0.004 && uFlash < 0.01) { gl_FragColor = vec4(0.0); return; }

    // ── Accumulate stars along this band ─────────────────────────
    float intensity = 0.0;

    for (int k = 0; k < 3; k++) {
      float seed = band * N_PER_BAND + float(k);
      float r1 = h1(seed), r2 = h2(seed), r3 = h3(seed);

      if (r1 < 0.38) continue;   // ~38% of slots are empty

      // Star moves outward from centre to screen edge, recycles
      float spd    = 0.14 + r3 * 0.22;
      // headR = 0..1.92 covering full screen including corners (16:9 diagonal ≈ 1.89)
      float headR  = fract(r2 + uTime * spd) * 1.92;
      float streak = uSpeed * (0.07 + r1 * 0.32);   // trail length grows with speed²
      float tailR  = headR - streak;

      if (dist > headR || dist < max(tailR, 0.0)) continue;

      float along = (dist - tailR) / max(streak, 0.001);  // 0=tail, 1=head
      intensity  += along * along * (0.45 + r1 * 0.55);   // bright head, dark tail
    }

    // ── Colour ───────────────────────────────────────────────────
    float bs  = uSpeed * 0.65;
    vec3 wht  = vec3(0.95, 0.97, 1.00);
    vec3 blue = vec3(0.50, 0.72, 1.00);
    vec3 viol = vec3(0.65, 0.48, 1.00);
    vec3 col  = mix(wht, mix(blue, viol, uSpeed * 0.45), bs);
    col      *= intensity * angFac * 3.5;

    // ── Central convergence glow ─────────────────────────────────
    float nd    = dist / max(uAspect, 1.0);          // normalize to square space
    float core  = exp(-nd * nd * 24.0) * uSpeed;
    float halo  = exp(-nd * nd *  5.8) * uSpeed * 0.42;
    float pulse = 0.87 + 0.13 * sin(uTime * 3.8);
    col += mix(vec3(0.40, 0.62, 1.0), vec3(0.96, 0.98, 1.0), core)
           * (core + halo) * pulse * 3.2;

    // ── Entry / exit FLASH ────────────────────────────────────────
    // uFlash 0..1: pure white overlay that fades after transition
    col  += vec3(uFlash * 2.0);

    // ── Vignette: fade at very screen edges so it looks finite ───
    float vig = 1.0 - smoothstep(1.6, 2.0, dist);

    float alpha = clamp((intensity * angFac + core * 0.85) * vig + uFlash, 0.0, 1.0);
    if (alpha < 0.005) discard;

    gl_FragColor = vec4(col, alpha * 0.95);
  }
`;

// ================================================================
//  COMPONENT
// ================================================================
interface LightspeedTunnelProps {
  active?: boolean;
  intensity?: number;
  scrollProgress?: number;
}

export function LightspeedTunnel({ active = false, intensity = 1 }: LightspeedTunnelProps) {
  const matRef   = useRef<THREE.ShaderMaterial>(null);
  const speedRef = useRef(0);
  const flashRef = useRef(0);      // current flash brightness
  const wasActive= useRef(false);  // track active edge transitions
  const { gl }   = useThree();

  const uniforms = useMemo(() => ({
    uTime:   { value: 0 },
    uSpeed:  { value: 0 },
    uFlash:  { value: 0 },
    uAspect: { value: 16 / 9 },
  }), []);

  // Detect entry (false→true) and exit (true→false) to trigger flash
  useEffect(() => {
    if (active && !wasActive.current) {
      // Entry: speed SNAPS to 1 immediately then settles
      speedRef.current = 1.0;
      flashRef.current = 1.0;   // bright white flash
    } else if (!active && wasActive.current) {
      // Exit flash
      flashRef.current = 0.85;
    }
    wasActive.current = active;
  }, [active]);

  useFrame((state) => {
    const aspect = gl.domElement.clientWidth / Math.max(gl.domElement.clientHeight, 1);

    // Speed: ramp up smoothly when active, ramp down when not
    const target = active ? intensity : 0;
    const rate   = active ? 0.035 : 0.055;   // ramp-up slower than ramp-down
    speedRef.current = THREE.MathUtils.lerp(speedRef.current, target, rate);

    // Flash decay: bright flash fades quickly
    flashRef.current = THREE.MathUtils.lerp(flashRef.current, 0, 0.08);

    if (matRef.current) {
      matRef.current.uniforms.uTime.value   = state.clock.elapsedTime;
      matRef.current.uniforms.uSpeed.value  = speedRef.current;
      matRef.current.uniforms.uFlash.value  = flashRef.current;
      matRef.current.uniforms.uAspect.value = aspect;
    }
  });

  if (!active && speedRef.current < 0.01 && flashRef.current < 0.01) return null;

  return (
    <mesh renderOrder={-1} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export default LightspeedTunnel;
