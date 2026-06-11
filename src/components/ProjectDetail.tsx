// ============================================================
// PROJECT DETAIL MODAL — Case study view when clicking a project
// ============================================================

import { usePortfolioStore } from '@/store/usePortfolioStore';
import { X, Github, ExternalLink, ChevronRight } from 'lucide-react';

export function ProjectDetail() {
  const { selectedProject, setSelectedProject, projects } = usePortfolioStore();

  if (!selectedProject) return null;

  const project = projects.find(p => p.id === selectedProject);
  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5, 5, 8, 0.85)', backdropFilter: 'blur(8px)' }}
      onClick={() => setSelectedProject(null)}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl"
        style={{
          background: 'rgba(10, 10, 18, 0.98)',
          border: `1px solid ${project.accentColor}40`,
          boxShadow: `0 0 60px ${project.accentColor}20`,
          fontFamily: 'monospace',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-5 border-b" style={{ borderColor: `${project.accentColor}20`, background: 'rgba(10, 10, 18, 0.95)' }}>
          <div>
            <div className="flex items-center gap-3 mb-1">
              {project.featured && (
                <span
                  className="px-2 py-0.5 rounded text-xs font-bold"
                  style={{ background: `${project.accentColor}30`, color: project.accentColor }}
                >
                  FEATURED
                </span>
              )}
              <span className="text-xs opacity-50 uppercase">{project.objectType}</span>
            </div>
            <h2 className="text-xl font-bold" style={{ color: project.accentColor }}>
              {project.title}
            </h2>
          </div>
          <button
            onClick={() => setSelectedProject(null)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Description */}
          <div>
            <p className="text-sm leading-relaxed opacity-80">{project.longDescription}</p>
          </div>

          {/* Role */}
          <div className="flex items-center gap-2 text-sm">
            <span className="opacity-50">Role:</span>
            <span style={{ color: project.accentColor }}>{project.role}</span>
          </div>

          {/* Tech Stack */}
          <div>
            <div className="text-xs uppercase tracking-wider opacity-50 mb-2">Tech Stack</div>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-md text-xs"
                  style={{
                    background: `${project.accentColor}15`,
                    border: `1px solid ${project.accentColor}30`,
                    color: `${project.accentColor}CC`,
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Highlights */}
          <div>
            <div className="text-xs uppercase tracking-wider opacity-50 mb-2">Key Highlights</div>
            <div className="space-y-2">
              {project.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <ChevronRight className="w-4 h-4 mt-0.5 shrink-0" style={{ color: project.accentColor }} />
                  <span className="opacity-80">{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div>
            <div className="text-xs uppercase tracking-wider opacity-50 mb-2">Impact Metrics</div>
            <div className="grid grid-cols-3 gap-3">
              {project.metrics.map((m, i) => (
                <div
                  key={i}
                  className="text-center p-3 rounded-lg"
                  style={{ background: `${project.accentColor}10` }}
                >
                  <div className="text-lg font-bold" style={{ color: project.accentColor }}>{m.value}</div>
                  <div className="text-xs opacity-60">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Case Study Sections */}
          {project.caseStudySections.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wider opacity-50 mb-3">Case Study</div>
              <div className="space-y-3">
                {project.caseStudySections.map((section, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg border"
                    style={{ borderColor: `${project.accentColor}20`, background: `${project.accentColor}05` }}
                  >
                    <div className="text-sm font-bold mb-1" style={{ color: project.accentColor }}>
                      {section.title}
                    </div>
                    <p className="text-xs opacity-70 leading-relaxed">{section.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag, i) => (
              <span key={i} className="text-xs opacity-40">#{tag}</span>
            ))}
          </div>

          {/* Links */}
          <div className="flex gap-3 pt-3 border-t" style={{ borderColor: `${project.accentColor}20` }}>
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all hover:scale-105"
                style={{
                  background: `${project.accentColor}20`,
                  border: `1px solid ${project.accentColor}40`,
                  color: project.accentColor,
                }}
              >
                <Github className="w-4 h-4" />
                View Code
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all hover:scale-105"
                style={{
                  background: `${project.accentColor}20`,
                  border: `1px solid ${project.accentColor}40`,
                  color: project.accentColor,
                }}
              >
                <ExternalLink className="w-4 h-4" />
                Live Demo
              </a>
            )}
          </div>

          {/* Dates */}
          <div className="text-xs opacity-40 pt-2">
            {project.startDate} — {project.endDate} • {project.status}
          </div>
        </div>
      </div>
    </div>
  );
}