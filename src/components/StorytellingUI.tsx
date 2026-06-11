import { usePortfolioStore } from '@/store/usePortfolioStore';
import { getZoneForProgress } from './three/CameraController';

export function StorytellingUI() {
  const { scrollProgress, profile, skills, experience, projects } = usePortfolioStore();
  
  // Calculate current zone directly from scroll progress for immediate updates
  const currentZone = getZoneForProgress(scrollProgress);

  // Safe helper to ensure we always work with an array
  const safeArray = (arr: any) => (Array.isArray(arr) ? arr : []);

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-center items-center">
      {/* 1. Intro Sequence */}
      <div 
        className="absolute top-24 transition-all duration-1000 ease-in-out flex flex-col items-center text-center"
        style={{
          opacity: currentZone === 'entry-void' ? 1 : 0,
          transform: `translateY(${currentZone === 'entry-void' ? 0 : -50}px)`,
          filter: `blur(${currentZone === 'entry-void' ? 0 : 10}px)`,
        }}
      >
        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 tracking-tighter uppercase mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
          {profile?.name || 'Explorer'}
        </h1>
        <p className="text-[#F5A623] tracking-[0.5em] text-sm uppercase">
          {profile?.title || 'Unknown Rank'}
        </p>
        <p className="max-w-md mt-6 text-[#E8ECF1] opacity-60 text-sm leading-relaxed">
          {profile?.tagline || 'Navigating the cosmic void.'}
        </p>
      </div>

      {/* 2. Lightspeed Corridor Transition */}
      <div 
        className="absolute bottom-24 transition-all duration-1000 ease-in-out flex flex-col items-center gap-6"
        style={{
          opacity: currentZone === 'lightspeed-corridor' ? 1 : 0,
          transform: `scale(${currentZone === 'lightspeed-corridor' ? 1 : 0.9})`,
        }}
      >
        <h2 className="text-4xl italic text-white opacity-80 tracking-widest uppercase">
          Initiating Warp
        </h2>
        
        {/* Scroll indicator */}
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <div className="text-[#00D4FF] text-sm tracking-wider opacity-70">
            SCROLL TO CONTINUE
          </div>
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#00D4FF" 
            strokeWidth="2"
            className="opacity-70"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>

      {/* 3. Constellations (Skills) */}
      <div 
        className="absolute left-[5%] md:left-[10%] top-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out"
        style={{
          opacity: currentZone === 'constellation-field' ? 1 : 0,
          pointerEvents: currentZone === 'constellation-field' ? 'auto' : 'none',
        }}
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-[2px] bg-[#7B61FF]"></div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">
            Technical Arsenal
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 pl-16">
          {safeArray(skills).slice(0, 4).map((category: any, idx: number) => (
            <div key={category?.category || idx} className="space-y-3 relative before:absolute before:-left-4 before:top-0 before:w-[1px] before:h-full before:bg-white/10">
              <h3 className="text-[#7B61FF] text-xs font-bold tracking-[0.2em] uppercase">{category?.category || 'Category'}</h3>
              <div className="flex flex-wrap gap-2 max-w-sm">
                {safeArray(category?.tools || category?.skills).slice(0, 6).map((skill: any, sIdx: number) => (
                  <span key={skill?.name || sIdx} className="text-white/80 bg-black/50 border border-white/5 px-3 py-1.5 rounded-sm text-xs font-medium tracking-wide">
                    {skill?.name || 'Skill'}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Asteroid Belt (Projects) */}
      <div 
        className="absolute right-[5%] md:right-[10%] top-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out text-right"
        style={{
          opacity: currentZone === 'asteroid-belt' ? 1 : 0,
          pointerEvents: currentZone === 'asteroid-belt' ? 'auto' : 'none',
        }}
      >
        <div className="flex items-center justify-end gap-4 mb-8">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">
            Mission Logs
          </h2>
          <div className="w-12 h-[2px] bg-[#F5A623]"></div>
        </div>
        <div className="space-y-6 flex flex-col items-end pr-16">
          {safeArray(projects).slice(0, 3).map((project: any, pIdx: number) => (
            <div key={project?.id || pIdx} className="max-w-md bg-black/60 backdrop-blur-md border border-white/5 p-6 rounded-sm hover:border-[#F5A623]/50 transition-all duration-300 relative group">
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#F5A623] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#F5A623] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="text-white text-xl font-bold mb-2 tracking-wide">{project?.title || 'Untitled Project'}</h3>
              <p className="text-white/50 text-sm mb-4 leading-relaxed">
                {(project?.shortDescription || project?.description || '').substring(0, 100)}...
              </p>
              <div className="flex flex-wrap gap-2 justify-end">
                {safeArray(project?.techStack || project?.technologies).slice(0, 3).map((tech: string, tIdx: number) => (
                  <span key={tech || tIdx} className="text-[#F5A623] text-[10px] font-bold tracking-widest uppercase bg-[#F5A623]/10 px-2 py-1 rounded-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Orbital Station (Experience) */}
      <div 
        className="absolute left-[5%] md:left-[10%] top-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out"
        style={{
          opacity: currentZone === 'orbital-station' ? 1 : 0,
          pointerEvents: currentZone === 'orbital-station' ? 'auto' : 'none',
        }}
      >
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-[2px] bg-[#00D4FF]"></div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">
            Career Orbit
          </h2>
        </div>
        <div className="space-y-8 pl-16">
          {safeArray(experience).slice(0, 3).map((exp: any, eIdx: number) => (
            <div key={exp?.id || eIdx} className="relative pl-8 border-l border-white/10">
              <div className="absolute w-2 h-2 bg-[#00D4FF] rounded-none -left-[4px] top-1 shadow-[0_0_15px_#00D4FF]" />
              <h3 className="text-white text-lg font-bold tracking-wide">{exp?.role || 'Engineer'}</h3>
              <div className="text-[#00D4FF] text-xs font-bold tracking-widest uppercase my-1">
                {exp?.company || 'Enterprise'} // {exp?.startDate && exp?.endDate ? `${exp.startDate} - ${exp.endDate}` : (exp?.period || '')}
              </div>
              <p className="text-white/50 text-sm max-w-md leading-relaxed mt-2">{exp?.summary || exp?.description || ''}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Event Horizon (Contact) */}
      <div 
        className="absolute bottom-16 transition-all duration-1000 ease-in-out flex flex-col items-center"
        style={{
          opacity: currentZone === 'transmission-gateway' ? 1 : 0,
          transform: `scale(${currentZone === 'transmission-gateway' ? 1 : 1.1})`,
          filter: `blur(${currentZone === 'transmission-gateway' ? 0 : 10}px)`,
        }}
      >
        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase mb-6 drop-shadow-[0_0_30px_rgba(255,51,102,0.5)]">
          Event Horizon
        </h2>
        <div className="bg-black/60 backdrop-blur-xl border border-[#FF3366]/30 p-8 rounded-2xl flex flex-col items-center pointer-events-auto">
          <p className="text-white/80 mb-6 text-center max-w-sm">
            You have reached the edge of known space. Transmit your signal to initiate contact.
          </p>
          <a href={`mailto:${profile?.email || ''}`} className="bg-[#FF3366] text-white px-8 py-3 rounded-full font-bold tracking-widest uppercase hover:bg-white hover:text-[#FF3366] hover:shadow-[0_0_30px_#FF3366] transition-all">
            Transmit Signal
          </a>
        </div>
      </div>
    </div>
  );
}
