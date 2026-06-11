import { usePortfolioStore } from '@/store/usePortfolioStore';
import { getZoneForProgress } from './three/CameraController';

export function StorytellingUI() {
  const { scrollProgress, profile, skills, experience, projects } = usePortfolioStore();
  const currentZone = getZoneForProgress(scrollProgress);
  const safeArray = (arr: any) => (Array.isArray(arr) ? arr : []);

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-center items-center">

      {/* ── 1. Intro — Entry Void ──────────────────────────────── */}
      <div
        className="absolute top-16 sm:top-24 w-full px-4 sm:px-8 transition-all duration-1000 ease-in-out flex flex-col items-center text-center"
        style={{
          opacity: currentZone === 'entry-void' ? 1 : 0,
          transform: `translateY(${currentZone === 'entry-void' ? 0 : -50}px)`,
          filter: `blur(${currentZone === 'entry-void' ? 0 : 10}px)`,
          pointerEvents: currentZone === 'entry-void' ? 'auto' : 'none',
        }}
      >
        <h1
          className="text-4xl sm:text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 tracking-tighter uppercase mb-3 sm:mb-4"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {profile?.name || 'Explorer'}
        </h1>
        <p className="text-[#F5A623] tracking-[0.3em] sm:tracking-[0.5em] text-[10px] sm:text-sm uppercase">
          {profile?.title || 'Unknown Rank'}
        </p>
        <p className="max-w-xs sm:max-w-md mt-4 sm:mt-6 text-[#E8ECF1] opacity-60 text-xs sm:text-sm leading-relaxed px-4 sm:px-0">
          {profile?.tagline || 'Navigating the cosmic void.'}
        </p>
      </div>

      {/* ── 2. Lightspeed Warp ────────────────────────────────── */}
      <div
        className="absolute bottom-20 sm:bottom-24 w-full transition-all duration-1000 ease-in-out flex flex-col items-center gap-4 sm:gap-6 px-4"
        style={{
          opacity: currentZone === 'lightspeed-corridor' ? 1 : 0,
          transform: `scale(${currentZone === 'lightspeed-corridor' ? 1 : 0.9})`,
          pointerEvents: currentZone === 'lightspeed-corridor' ? 'auto' : 'none',
        }}
      >
        <h2 className="text-2xl sm:text-4xl italic text-white opacity-80 tracking-widest uppercase text-center">
          Initiating Warp
        </h2>
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <div className="text-[#00D4FF] text-xs tracking-wider opacity-70">SCROLL TO CONTINUE</div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2" className="opacity-70 sm:w-6 sm:h-6">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* ── 3. Constellations — Skills ─────────────────────────── */}
      <div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out px-4 sm:px-8 md:px-[10%]"
        style={{
          opacity: currentZone === 'constellation-field' ? 1 : 0,
          pointerEvents: currentZone === 'constellation-field' ? 'auto' : 'none',
        }}
      >
        <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-8">
          <div className="w-8 sm:w-12 h-[2px] bg-[#7B61FF] flex-shrink-0" />
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">
            Technical Arsenal
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 sm:gap-x-12 gap-y-5 sm:gap-y-8 pl-4 sm:pl-8 md:pl-16">
          {safeArray(skills).slice(0, 4).map((category: any, idx: number) => (
            <div
              key={category?.category || idx}
              className="space-y-2 sm:space-y-3 relative before:absolute before:-left-3 sm:before:-left-4 before:top-0 before:w-[1px] before:h-full before:bg-white/10"
            >
              <h3 className="text-[#7B61FF] text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase">
                {category?.category || 'Category'}
              </h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 max-w-xs sm:max-w-sm">
                {safeArray(category?.tools || category?.skills).slice(0, 6).map((skill: any, sIdx: number) => (
                  <span
                    key={skill?.name || sIdx}
                    className="text-white/80 bg-black/50 border border-white/5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-sm text-[10px] sm:text-xs font-medium tracking-wide"
                  >
                    {skill?.name || 'Skill'}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Asteroid Belt — Projects ────────────────────────── */}
      <div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out px-4 sm:px-8 md:px-[10%]"
        style={{
          opacity: currentZone === 'asteroid-belt' ? 1 : 0,
          pointerEvents: currentZone === 'asteroid-belt' ? 'auto' : 'none',
        }}
      >
        <div className="flex items-center justify-end gap-3 sm:gap-4 mb-5 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">
            Mission Logs
          </h2>
          <div className="w-8 sm:w-12 h-[2px] bg-[#F5A623] flex-shrink-0" />
        </div>
        <div className="space-y-4 sm:space-y-6 flex flex-col items-stretch sm:items-end">
          {safeArray(projects).slice(0, 3).map((project: any, pIdx: number) => (
            <div
              key={project?.id || pIdx}
              className="w-full sm:max-w-md bg-black/60 backdrop-blur-md border border-white/5 p-4 sm:p-6 rounded-sm hover:border-[#F5A623]/50 transition-all duration-300 relative group"
            >
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#F5A623] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#F5A623] opacity-0 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-white text-base sm:text-xl font-bold mb-1 sm:mb-2 tracking-wide">
                {project?.title || 'Untitled Project'}
              </h3>
              <p className="text-white/50 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                {(project?.shortDescription || project?.description || '').substring(0, 100)}...
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-end">
                {safeArray(project?.techStack || project?.technologies).slice(0, 3).map((tech: string, tIdx: number) => (
                  <span
                    key={tech || tIdx}
                    className="text-[#F5A623] text-[9px] sm:text-[10px] font-bold tracking-widest uppercase bg-[#F5A623]/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. Orbital Station — Experience ────────────────────── */}
      <div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out px-4 sm:px-8 md:px-[10%]"
        style={{
          opacity: currentZone === 'orbital-station' ? 1 : 0,
          pointerEvents: currentZone === 'orbital-station' ? 'auto' : 'none',
        }}
      >
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-10">
          <div className="w-8 sm:w-12 h-[2px] bg-[#00D4FF] flex-shrink-0" />
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">
            Career Orbit
          </h2>
        </div>
        <div className="space-y-5 sm:space-y-8 pl-4 sm:pl-8 md:pl-16">
          {safeArray(experience).slice(0, 3).map((exp: any, eIdx: number) => (
            <div key={exp?.id || eIdx} className="relative pl-5 sm:pl-8 border-l border-white/10">
              <div className="absolute w-2 h-2 bg-[#00D4FF] rounded-none -left-[4px] top-1 shadow-[0_0_15px_#00D4FF]" />
              <h3 className="text-white text-base sm:text-lg font-bold tracking-wide">{exp?.role || 'Engineer'}</h3>
              <div className="text-[#00D4FF] text-[10px] sm:text-xs font-bold tracking-widest uppercase my-1">
                {exp?.company || 'Enterprise'} // {exp?.startDate && exp?.endDate ? `${exp.startDate} - ${exp.endDate}` : (exp?.period || '')}
              </div>
              <p className="text-white/50 text-xs sm:text-sm max-w-xs sm:max-w-md leading-relaxed mt-1 sm:mt-2">
                {exp?.summary || exp?.description || ''}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. Event Horizon — Contact ─────────────────────────── */}
      <div
        className="absolute bottom-10 sm:bottom-16 w-full px-4 sm:px-8 transition-all duration-1000 ease-in-out flex flex-col items-center"
        style={{
          opacity: currentZone === 'transmission-gateway' ? 1 : 0,
          transform: `scale(${currentZone === 'transmission-gateway' ? 1 : 1.1})`,
          filter: `blur(${currentZone === 'transmission-gateway' ? 0 : 10}px)`,
          pointerEvents: currentZone === 'transmission-gateway' ? 'auto' : 'none',
        }}
      >
        <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter uppercase mb-4 sm:mb-6 text-center drop-shadow-[0_0_30px_rgba(255,51,102,0.5)]">
          Event Horizon
        </h2>
        <div className="bg-black/60 backdrop-blur-xl border border-[#FF3366]/30 p-5 sm:p-8 rounded-2xl flex flex-col items-center w-full max-w-sm pointer-events-auto">
          <p className="text-white/80 mb-4 sm:mb-6 text-center text-xs sm:text-sm max-w-xs">
            You have reached the edge of known space. Transmit your signal to initiate contact.
          </p>
          <a
            href={`mailto:${profile?.email || ''}`}
            className="bg-[#FF3366] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold tracking-widest uppercase hover:bg-white hover:text-[#FF3366] hover:shadow-[0_0_30px_#FF3366] transition-all text-xs sm:text-sm"
          >
            Transmit Signal
          </a>
        </div>
      </div>

    </div>
  );
}
