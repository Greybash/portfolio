// ============================================================
// HEADS-UP DISPLAY — Zone indicator, progress bar, telemetry
// Fixed overlay on top of the 3D canvas
// Mobile-first responsive layout
// ============================================================

import { useState } from 'react';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { getZoneForProgress } from './three/CameraController';

const ZONE_LABELS: Record<string, { name: string; subtitle: string; color: string }> = {
  'entry-void':          { name: 'THE VOID',       subtitle: 'Approaching the event horizon', color: '#F5A623' },
  'lightspeed-corridor': { name: 'LIGHTSPEED',     subtitle: 'Warp travel engaged',           color: '#00D4FF' },
  'constellation-field': { name: 'CONSTELLATIONS', subtitle: 'Skill matrix detected',          color: '#7B61FF' },
  'asteroid-belt':       { name: 'MISSION BELT',   subtitle: 'Project archives found',         color: '#F5A623' },
  'orbital-station':     { name: 'CMD STATION',    subtitle: 'Experience & credentials',       color: '#00D4FF' },
  'transmission-gateway':{ name: 'EVENT HORIZON',  subtitle: 'Transmission point reached',     color: '#FF3366' },
};

export function HUD() {
  const { scrollProgress, profile } = usePortfolioStore();
  const currentZone = getZoneForProgress(scrollProgress);
  const zone = ZONE_LABELS[currentZone] || ZONE_LABELS['entry-void'];
  const [showTelemetry] = useState(true);

  return (
    <div className="fixed inset-0 pointer-events-none z-10" style={{ fontFamily: 'monospace' }}>

      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4">
        {/* Logo / Name */}
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-2 h-2 flex-shrink-0 rounded-full animate-pulse"
            style={{ background: zone.color, boxShadow: `0 0 12px ${zone.color}, 0 0 24px ${zone.color}40` }}
          />
          <span className="text-[10px] sm:text-xs tracking-widest text-[#E8ECF1] opacity-80 truncate max-w-[90px] sm:max-w-none">
            {(profile?.name || 'Explorer').toUpperCase()}
          </span>
        </div>

        {/* Zone indicator — hidden on very small screens, shown on sm+ */}
        <div className="hidden xs:flex flex-col items-center text-center flex-1 px-2">
          <div
            className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] font-bold transition-colors duration-500"
            style={{ color: zone.color, textShadow: `0 0 20px ${zone.color}60` }}
          >
            {zone.name}
          </div>
          <div className="text-[9px] sm:text-xs opacity-50 mt-0.5 tracking-wider hidden sm:block">
            {zone.subtitle}
          </div>
        </div>

        {/* Zone name on tiny screens only */}
        <div
          className="xs:hidden text-[9px] font-bold flex-1 text-center tracking-wider transition-colors duration-500"
          style={{ color: zone.color }}
        >
          {zone.name}
        </div>

        {/* Admin link */}
        <a
          href="#/void-control-center"
          className="pointer-events-auto text-xs opacity-40 hover:opacity-80 transition-opacity text-[#E8ECF1] flex-shrink-0"
          title="Void Control Center"
        >
          ◆
        </a>
      </div>

      {/* ── Corner decorations (hidden on mobile to save space) ─ */}
      <div className="hidden sm:block absolute top-4 left-4 w-6 sm:w-8 h-6 sm:h-8 border-l border-t opacity-20" style={{ borderColor: zone.color }} />
      <div className="hidden sm:block absolute top-4 right-4 w-6 sm:w-8 h-6 sm:h-8 border-r border-t opacity-20" style={{ borderColor: zone.color }} />
      <div className="hidden sm:block absolute bottom-4 left-4 w-6 sm:w-8 h-6 sm:h-8 border-l border-b opacity-20" style={{ borderColor: zone.color }} />
      <div className="hidden sm:block absolute bottom-4 right-4 w-6 sm:w-8 h-6 sm:h-8 border-r border-b opacity-20" style={{ borderColor: zone.color }} />

      {/* ── Telemetry panel — hidden on mobile ─────────────────── */}
      {showTelemetry && (
        <div className="hidden md:block absolute left-6 top-1/2 -translate-y-1/2 space-y-3 text-xs opacity-40">
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full" style={{ background: zone.color }} />
            <span>POS: {scrollProgress.toFixed(3)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full" style={{ background: zone.color }} />
            <span>VEL: {(scrollProgress * 299792).toFixed(0)} km/s</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full" style={{ background: zone.color }} />
            <span>TEMP: {(10000 + scrollProgress * 50000).toFixed(0)} K</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full" style={{ background: zone.color }} />
            <span>ZONE: {currentZone}</span>
          </div>
        </div>
      )}

      {/* ── Progress bar — bottom ───────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-[10px] sm:text-xs opacity-50 w-8 sm:w-12 font-mono">
            {(scrollProgress * 100).toFixed(0)}%
          </span>
          <div className="flex-1 h-0.5 bg-[#1A1A2E] relative overflow-hidden rounded-full">
            <div
              className="absolute inset-y-0 left-0 transition-all duration-300 rounded-full"
              style={{
                width: `${scrollProgress * 100}%`,
                background: `linear-gradient(90deg, ${zone.color}60, ${zone.color})`,
                boxShadow: `0 0 15px ${zone.color}80, 0 0 30px ${zone.color}40`,
              }}
            />
            <div
              className="absolute inset-y-0 w-12 sm:w-20 rounded-full"
              style={{
                left: `${scrollProgress * 100 - 10}%`,
                background: `linear-gradient(90deg, transparent, ${zone.color}40, transparent)`,
                animation: 'shimmer 2s infinite',
              }}
            />
          </div>
          <span className="text-[10px] sm:text-xs opacity-50 w-8 sm:w-12 text-right">100%</span>
        </div>
      </div>

      {/* ── Scroll hint ─────────────────────────────────────────── */}
      {scrollProgress < 0.05 && (
        <div className="absolute bottom-14 sm:bottom-20 left-1/2 -translate-x-1/2 text-center animate-bounce">
          <div className="text-[10px] sm:text-xs opacity-40 tracking-widest">SCROLL TO ENGAGE</div>
          <div className="text-base sm:text-lg opacity-30 mt-1">↓</div>
        </div>
      )}
    </div>
  );
}

export default HUD;
