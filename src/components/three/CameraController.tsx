import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PlayerShip } from './PlayerShip';

interface CameraControllerProps {
  scrollProgress: number;
  onZoneChange?: (zone: string) => void;
}

// ================================================================
//  SHIP PATH — cinematic S-curve spine through all zones
//  Black Hole sits at [0, 0, -350]
//  Closest pass: X≈12 at z≈-350 → ~12 units from BH center
//  (disk outer radius = 10, so we just graze past the disk edge)
// ================================================================
export const PATH_POINTS: [number, number, number][] = [
  // ── Entry void: drop in from above, slow drift ─────────────────
  [0,   12,  100],  // 0.00 — high start, looking down the corridor
  [0,    8,   78],  // 0.05
  [1.5,  6,   58],  // 0.10
  // ── Warp corridor: banking S-curve ─────────────────────────────
  [4,    4,   38],  // 0.15
  [6,    2,   18],  // 0.20 — sweeping right
  [5,    0,   -2],  // 0.25
  [3,   -1,  -22],  // 0.30
  // ── Constellation field: weaving between satellites ─────────────
  [0,    0,  -48],  // 0.35 — plunge through center
  [-3,   1,  -68],  // 0.40 — banking left
  [-6,   3,  -92],  // 0.45 — climbing left arc
  [-5,   5, -116],  // 0.50
  [-2,   4, -138],  // 0.55 — swooping back right
  // ── Asteroid belt: dramatic dive ────────────────────────────────
  [1,    2, -158],  // 0.60
  [5,    0, -182],  // 0.65 — hard right bank
  [4,   -2, -208],  // 0.70 — dipping low
  [1,   -3, -234],  // 0.75
  // ── Orbital station: climbing approach ──────────────────────────
  [-2,   0, -260],  // 0.80 — pulling back left and level
  // ── Black hole approach: rising arc to the right, close flyby ──
  // Pivot: bring ship up high and right, then SWOOP close at z≈-350
  [-1,   5, -288],  // 0.83 — climbing and banking right
  [ 6,  10, -318],  // 0.87 — high banking right, BH below-left
  [13,   8, -345],  // 0.91 — descending toward BH, ~15 units away
  [12,   3, -358],  // 0.95 — CLOSEST PASS: ~12.4 units from BH!
  [ 7,  -1, -374],  // 0.97 — swooping under & past
  [ 2,  -3, -392],  // 1.00 — flying away below
];

export const positionCurve = new THREE.CatmullRomCurve3(
  PATH_POINTS.map(p => new THREE.Vector3(...p)),
  false, 'catmullrom', 0.5
);

// Kept for backward-compat
export const lookAtCurve = positionCurve;

export function getZoneForProgress(p: number): string {
  if (p < 0.12)  return 'entry-void';
  if (p < 0.295) return 'lightspeed-corridor';
  if (p < 0.60)  return 'constellation-field';
  if (p < 0.75)  return 'asteroid-belt';
  if (p < 0.90)  return 'orbital-station';
  return 'transmission-gateway';
}

// ── TPP offsets ───────────────────────────────────────────────────
const CAMERA_BACK = 14;  // units behind ship (was 8)
const CAMERA_UP   =  3;  // units above ship
const LOOK_AHEAD  =  8;  // camera focuses ahead of nose

// Reuse vectors every frame (no GC pressure)
const _shipPos   = new THREE.Vector3();
const _tangent   = new THREE.Vector3();
const _worldUp   = new THREE.Vector3(0, 1, 0);
const _right     = new THREE.Vector3();
const _trueUp    = new THREE.Vector3();
const _camTarget = new THREE.Vector3();
const _lookPt    = new THREE.Vector3();

export function CameraController({ scrollProgress, onZoneChange }: CameraControllerProps) {
  const { camera } = useThree();
  const currentCamPos = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3());
  const currentZone   = useRef('');
  const initialized   = useRef(false);

  useEffect(() => {
    const newZone = getZoneForProgress(scrollProgress);
    if (newZone !== currentZone.current) {
      currentZone.current = newZone;
      onZoneChange?.(newZone);
    }
  }, [scrollProgress, onZoneChange]);

  useFrame(() => {
    const t = Math.max(0.001, Math.min(0.999, scrollProgress));

    // Ship position on curve
    positionCurve.getPointAt(t, _shipPos);

    // Tangent = ship's forward direction
    positionCurve.getTangentAt(t, _tangent).normalize();

    // Orthonormal camera frame (handles banking on curves)
    _right.crossVectors(_tangent, _worldUp).normalize();
    _trueUp.crossVectors(_right, _tangent).normalize();

    // Camera = ship - forward*BACK + trueUp*UP
    _camTarget
      .copy(_shipPos)
      .addScaledVector(_tangent, -CAMERA_BACK)
      .addScaledVector(_trueUp,   CAMERA_UP);

    // Look-at = point ahead of ship nose
    _lookPt.copy(_shipPos).addScaledVector(_tangent, LOOK_AHEAD);

    // Snap on very first frame so camera doesn't teleport
    if (!initialized.current) {
      currentCamPos.current.copy(_camTarget);
      currentLookAt.current.copy(_lookPt);
      initialized.current = true;
    }

    // Smooth lag — feels weighty like a real chase camera
    currentCamPos.current.lerp(_camTarget, 0.055);
    currentLookAt.current.lerp(_lookPt,    0.055);

    camera.position.copy(currentCamPos.current);
    camera.lookAt(currentLookAt.current);
  });

  return <PlayerShip scrollProgress={scrollProgress} />;
}