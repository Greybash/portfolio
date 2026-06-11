// ============================================================
// ADMIN DASHBOARD — Void Control Center
// Secret URL-only access for full portfolio content management
// ============================================================

import { useState, useCallback } from 'react';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import {
  Download, Upload, RotateCcw, Eye, EyeOff, Plus, Trash2,
  ChevronDown, ChevronUp, Star, FileCode, User, Briefcase,
  Award, Trophy, GraduationCap, Mail, Settings, ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  ProjectItem
} from '@/types';

// ======================== TABS ========================

type TabId = 'profile' | 'hero' | 'skills' | 'experience' | 'projects' |
  'certifications' | 'achievements' | 'education' | 'contact' | 'settings';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  { id: 'hero', label: 'Hero', icon: <Star className="w-4 h-4" /> },
  { id: 'skills', label: 'Skills', icon: <Award className="w-4 h-4" /> },
  { id: 'experience', label: 'Experience', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'projects', label: 'Projects', icon: <FileCode className="w-4 h-4" /> },
  { id: 'certifications', label: 'Certs', icon: <Award className="w-4 h-4" /> },
  { id: 'achievements', label: 'Wins', icon: <Trophy className="w-4 h-4" /> },
  { id: 'education', label: 'Education', icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'contact', label: 'Contact', icon: <Mail className="w-4 h-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

// ======================== ADMIN PAGE ========================

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);

  const store = usePortfolioStore();

  // Export JSON
  const handleExport = useCallback(() => {
    const json = store.exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-horizon-portfolio-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Portfolio data exported!');
  }, [store]);

  // Import JSON
  const handleImport = useCallback(() => {
    if (!importText.trim()) {
      toast.error('Please paste JSON data');
      return;
    }
    const success = store.importFromJSON(importText);
    if (success) {
      toast.success('Portfolio data imported successfully!');
      setImportText('');
      setShowImport(false);
    } else {
      toast.error('Invalid JSON format');
    }
  }, [importText, store]);

  // File import
  const handleFileImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const success = store.importFromJSON(text);
      if (success) {
        toast.success('Portfolio data imported from file!');
      } else {
        toast.error('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [store]);

  return (
    <div className="min-h-screen bg-[#050508] text-[#E8ECF1]" style={{ fontFamily: 'monospace' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#1A1A2E]" style={{ background: 'rgba(5, 5, 8, 0.95)', backdropFilter: 'blur(10px)' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="#/" className="flex items-center gap-2 text-sm opacity-60 hover:opacity-100 transition-opacity">
              <ArrowLeft className="w-4 h-4" />
              Back
            </a>
            <div className="h-4 w-px bg-[#1A1A2E]" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#F5A623]" style={{ boxShadow: '0 0 8px #F5A623' }} />
              <span className="text-sm font-bold text-[#F5A623]">VOID CONTROL CENTER</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border border-[#F5A62340] text-[#F5A623] hover:bg-[#F5A62320] transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border border-[#00D4FF40] text-[#00D4FF] hover:bg-[#00D4FF20] transition-all cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              Import File
              <input type="file" accept=".json" className="hidden" onChange={handleFileImport} />
            </label>
            <button
              onClick={() => { if (confirm('Reset all data to defaults?')) { store.resetToDefault(); toast.success('Reset to defaults'); } }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border border-[#FF336640] text-[#FF3366] hover:bg-[#FF336620] transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto pb-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap"
              style={{
                background: activeTab === tab.id ? '#F5A62320' : 'transparent',
                color: activeTab === tab.id ? '#F5A623' : '#E8ECF180',
                border: activeTab === tab.id ? '1px solid #F5A62340' : '1px solid transparent',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Import Text Area */}
      {showImport && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="border border-[#00D4FF40] rounded-lg p-4">
            <div className="text-xs text-[#00D4FF] mb-2">Paste JSON data:</div>
            <textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              className="w-full h-32 bg-[#0A0A12] border border-[#1A1A2E] rounded-lg p-3 text-xs text-[#E8ECF1] focus:border-[#00D4FF] outline-none resize-none"
              placeholder="Paste your portfolio JSON here..."
            />
            <div className="flex gap-2 mt-2">
              <button onClick={handleImport} className="px-4 py-1.5 rounded-lg text-xs bg-[#00D4FF20] text-[#00D4FF] border border-[#00D4FF40] hover:bg-[#00D4FF30] transition-all">
                Import
              </button>
              <button onClick={() => setShowImport(false)} className="px-4 py-1.5 rounded-lg text-xs border border-[#1A1A2E] opacity-60 hover:opacity-100 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'hero' && <HeroTab />}
        {activeTab === 'skills' && <SkillsTab />}
        {activeTab === 'experience' && <ExperienceTab />}
        {activeTab === 'projects' && <ProjectsTab />}
        {activeTab === 'certifications' && <CertificationsTab />}
        {activeTab === 'achievements' && <AchievementsTab />}
        {activeTab === 'education' && <EducationTab />}
        {activeTab === 'contact' && <ContactTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
}

// ======================== FORM COMPONENTS ========================

function Input({ label, value, onChange, placeholder = '', type = 'text', multiline = false }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; multiline?: boolean;
}) {
  return (
    <div className="mb-3">
      <label className="block text-xs opacity-60 mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[#0A0A12] border border-[#1A1A2E] rounded-lg p-2.5 text-xs text-[#E8ECF1] focus:border-[#F5A623] outline-none resize-none"
          rows={3}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[#0A0A12] border border-[#1A1A2E] rounded-lg p-2.5 text-xs text-[#E8ECF1] focus:border-[#F5A623] outline-none"
        />
      )}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[#1A1A2E] rounded-xl overflow-hidden mb-4">
      <div className="px-4 py-3 border-b border-[#1A1A2E] flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#F5A623]" />
        <span className="text-sm font-bold">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ======================== PROFILE TAB ========================

function ProfileTab() {
  const { profile, updateProfile } = usePortfolioStore();
  return (
    <SectionCard title="Profile Information">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Name" value={profile.name} onChange={v => updateProfile({ name: v })} />
        <Input label="Title" value={profile.title} onChange={v => updateProfile({ title: v })} />
        <Input label="Tagline" value={profile.tagline} onChange={v => updateProfile({ tagline: v })} />
        <Input label="Location" value={profile.location} onChange={v => updateProfile({ location: v })} />
        <Input label="Email" value={profile.email} onChange={v => updateProfile({ email: v })} />
        <Input label="Phone" value={profile.phone} onChange={v => updateProfile({ phone: v })} />
      </div>
      <div className="grid grid-cols-3 gap-4 mt-3">
        <Input label="LinkedIn" value={profile.socialLinks.linkedin} onChange={v => updateProfile({ socialLinks: { ...profile.socialLinks, linkedin: v } })} />
        <Input label="GitHub" value={profile.socialLinks.github} onChange={v => updateProfile({ socialLinks: { ...profile.socialLinks, github: v } })} />
        <Input label="LeetCode" value={profile.socialLinks.leetcode} onChange={v => updateProfile({ socialLinks: { ...profile.socialLinks, leetcode: v } })} />
      </div>
    </SectionCard>
  );
}

// ======================== HERO TAB ========================

function HeroTab() {
  const { hero, updateHero, about, updateAbout } = usePortfolioStore();
  return (
    <>
      <SectionCard title="Hero Section">
        <Input label="Greeting" value={hero.greeting} onChange={v => updateHero({ greeting: v })} />
        <Input label="Headline" value={hero.headline} onChange={v => updateHero({ headline: v })} />
        <Input label="Subtitle" value={hero.subtitle} onChange={v => updateHero({ subtitle: v })} multiline />
        <Input label="CTA Text" value={hero.ctaText} onChange={v => updateHero({ ctaText: v })} />
        <Input label="Scroll Prompt" value={hero.scrollPrompt} onChange={v => updateHero({ scrollPrompt: v })} />
      </SectionCard>
      <SectionCard title="About Text">
        <textarea
          value={about}
          onChange={e => updateAbout(e.target.value)}
          className="w-full bg-[#0A0A12] border border-[#1A1A2E] rounded-lg p-3 text-xs text-[#E8ECF1] focus:border-[#F5A623] outline-none resize-none"
          rows={8}
        />
      </SectionCard>
    </>
  );
}

// ======================== SKILLS TAB ========================

function SkillsTab() {
  const { skills, addSkill, updateSkill, deleteSkill } = usePortfolioStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  const addNewSkill = () => {
    const id = `skill-${Date.now()}`;
    addSkill({
      id,
      category: 'New Skill Category',
      description: '',
      icon: 'code',
      tools: [],
      proficiency: 50,
      highlight: false,
      visualClusterType: 'satellite',
      orbitRadius: 40,
      signalStrength: 80,
    });
    setExpanded(id);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={addNewSkill} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs bg-[#F5A62320] text-[#F5A623] border border-[#F5A62340] hover:bg-[#F5A62330] transition-all">
          <Plus className="w-3.5 h-3.5" />
          Add Skill Category
        </button>
      </div>

      {skills.map(skill => (
        <div key={skill.id} className="border border-[#1A1A2E] rounded-xl overflow-hidden mb-3">
          <div
            className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#0A0A12] transition-colors"
            onClick={() => setExpanded(expanded === skill.id ? null : skill.id)}
          >
            <div className="flex items-center gap-3">
              {skill.highlight && <Star className="w-3.5 h-3.5 text-[#F5A623]" />}
              <span className="text-sm font-bold">{skill.category}</span>
              <span className="text-xs opacity-40">{skill.tools.length} tools</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: '#F5A623' }}>{skill.proficiency}%</span>
              {expanded === skill.id ? <ChevronUp className="w-4 h-4 opacity-50" /> : <ChevronDown className="w-4 h-4 opacity-50" />}
            </div>
          </div>

          {expanded === skill.id && (
            <div className="p-4 border-t border-[#1A1A2E]">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Category" value={skill.category} onChange={v => updateSkill(skill.id, { category: v })} />
                <Input label="Description" value={skill.description} onChange={v => updateSkill(skill.id, { description: v })} />
                <Input label="Proficiency (0-100)" value={String(skill.proficiency)} onChange={v => updateSkill(skill.id, { proficiency: Number(v) })} />
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skill.highlight}
                      onChange={e => updateSkill(skill.id, { highlight: e.target.checked })}
                      className="rounded border-[#1A1A2E]"
                    />
                    Highlight
                  </label>
                </div>
              </div>

              {/* Tools */}
              <div className="mt-4">
                <div className="text-xs opacity-60 mb-2">Tools</div>
                <div className="space-y-2">
                  {(skill.tools || []).map((tool, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        value={tool.name}
                        onChange={e => {
                          const newTools = [...(skill.tools || [])];
                          newTools[i] = { ...tool, name: e.target.value };
                          updateSkill(skill.id, { tools: newTools });
                        }}
                        className="flex-1 bg-[#0A0A12] border border-[#1A1A2E] rounded-lg p-2 text-xs focus:border-[#F5A623] outline-none"
                      />
                      <input
                        type="number"
                        value={tool.level}
                        onChange={e => {
                          const newTools = [...(skill.tools || [])];
                          newTools[i] = { ...tool, level: Number(e.target.value) };
                          updateSkill(skill.id, { tools: newTools });
                        }}
                        className="w-20 bg-[#0A0A12] border border-[#1A1A2E] rounded-lg p-2 text-xs focus:border-[#F5A623] outline-none"
                      />
                      <button
                        onClick={() => {
                          const newTools = (skill.tools || []).filter((_, idx) => idx !== i);
                          updateSkill(skill.id, { tools: newTools });
                        }}
                        className="p-1.5 rounded-lg text-[#FF3366] hover:bg-[#FF336620] transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => updateSkill(skill.id, { tools: [...(skill.tools || []), { name: 'New Tool', level: 50 }] })}
                    className="flex items-center gap-1 text-xs text-[#00D4FF] hover:opacity-80 transition-opacity"
                  >
                    <Plus className="w-3 h-3" /> Add Tool
                  </button>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => { if (confirm('Delete this skill category?')) deleteSkill(skill.id); }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[#FF3366] hover:bg-[#FF336620] transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ======================== EXPERIENCE TAB ========================

function ExperienceTab() {
  const { experience, addExperience, updateExperience, deleteExperience } = usePortfolioStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  const addNew = () => {
    const id = `exp-${Date.now()}`;
    addExperience({
      id,
      company: 'Company',
      role: 'Role',
      location: '',
      employmentType: 'Full-time',
      startDate: '',
      endDate: 'Present',
      summary: '',
      achievements: [],
      impactMetrics: [],
      techStack: [],
      beaconType: 'station',
      orbitDepth: 45,
      themeTone: 'neutral',
    });
    setExpanded(id);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={addNew} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs bg-[#F5A62320] text-[#F5A623] border border-[#F5A62340] hover:bg-[#F5A62330] transition-all">
          <Plus className="w-3.5 h-3.5" /> Add Experience
        </button>
      </div>

      {experience.map(exp => (
        <div key={exp.id} className="border border-[#1A1A2E] rounded-xl overflow-hidden mb-3">
          <div className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#0A0A12]" onClick={() => setExpanded(expanded === exp.id ? null : exp.id)}>
            <div>
              <span className="text-sm font-bold">{exp.role}</span>
              <span className="text-xs opacity-40 ml-2">at {exp.company}</span>
            </div>
            {expanded === exp.id ? <ChevronUp className="w-4 h-4 opacity-50" /> : <ChevronDown className="w-4 h-4 opacity-50" />}
          </div>

          {expanded === exp.id && (
            <div className="p-4 border-t border-[#1A1A2E] space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Company" value={exp.company} onChange={v => updateExperience(exp.id, { company: v })} />
                <Input label="Role" value={exp.role} onChange={v => updateExperience(exp.id, { role: v })} />
                <Input label="Location" value={exp.location} onChange={v => updateExperience(exp.id, { location: v })} />
                <Input label="Employment Type" value={exp.employmentType} onChange={v => updateExperience(exp.id, { employmentType: v })} />
                <Input label="Start Date" value={exp.startDate} onChange={v => updateExperience(exp.id, { startDate: v })} />
                <Input label="End Date" value={exp.endDate} onChange={v => updateExperience(exp.id, { endDate: v })} />
              </div>
              <Input label="Summary" value={exp.summary} onChange={v => updateExperience(exp.id, { summary: v })} multiline />

              {/* Achievements */}
              <div>
                <div className="text-xs opacity-60 mb-2">Achievements</div>
                {(exp.achievements || []).map((a, i) => (
                  <div key={i} className="flex items-center gap-2 mb-1">
                    <input value={a} onChange={e => {
                      const arr = [...(exp.achievements || [])]; arr[i] = e.target.value;
                      updateExperience(exp.id, { achievements: arr });
                    }} className="flex-1 bg-[#0A0A12] border border-[#1A1A2E] rounded-lg p-2 text-xs focus:border-[#F5A623] outline-none" />
                    <button onClick={() => {
                      const arr = (exp.achievements || []).filter((_, idx) => idx !== i);
                      updateExperience(exp.id, { achievements: arr });
                    }} className="p-1.5 text-[#FF3366]"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                <button onClick={() => updateExperience(exp.id, { achievements: [...(exp.achievements || []), ''] })} className="text-xs text-[#00D4FF]"><Plus className="w-3.5 h-3.5 inline" /> Add</button>
              </div>

              {/* Tech Stack */}
              <div>
                <div className="text-xs opacity-60 mb-2">Tech Stack (comma separated)</div>
                <input
                  value={(exp.techStack || []).join(', ')}
                  onChange={e => updateExperience(exp.id, { techStack: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  className="w-full bg-[#0A0A12] border border-[#1A1A2E] rounded-lg p-2 text-xs focus:border-[#F5A623] outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button onClick={() => { if (confirm('Delete?')) deleteExperience(exp.id); }} className="text-xs text-[#FF3366] flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ======================== PROJECTS TAB ========================

function ProjectsTab() {
  const { projects, addProject, updateProject, deleteProject, toggleFeatured } = usePortfolioStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  const addNew = () => {
    const id = `proj-${Date.now()}`;
    addProject({
      id,
      title: 'New Project',
      slug: 'new-project',
      shortDescription: '',
      longDescription: '',
      role: '',
      techStack: [],
      architecture: [],
      highlights: [],
      metrics: [],
      githubUrl: '',
      demoUrl: '',
      imageUrl: '',
      featured: false,
      status: 'active',
      startDate: '',
      endDate: '',
      tags: [],
      objectType: 'asteroid',
      orbitZone: 'asteroid-belt',
      accentColor: '#F5A623',
      caseStudySections: [],
    });
    setExpanded(id);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={addNew} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs bg-[#F5A62320] text-[#F5A623] border border-[#F5A62340] hover:bg-[#F5A62330] transition-all">
          <Plus className="w-3.5 h-3.5" /> Add Project
        </button>
      </div>

      {projects.map(project => (
        <div key={project.id} className="border border-[#1A1A2E] rounded-xl overflow-hidden mb-3">
          <div className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#0A0A12]" onClick={() => setExpanded(expanded === project.id ? null : project.id)}>
            <div className="flex items-center gap-3">
              {project.featured && <Star className="w-3.5 h-3.5 text-[#F5A623]" />}
              <span className="text-sm font-bold">{project.title}</span>
              <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: `${project.accentColor}20`, color: project.accentColor }}>{project.objectType}</span>
            </div>
            {expanded === project.id ? <ChevronUp className="w-4 h-4 opacity-50" /> : <ChevronDown className="w-4 h-4 opacity-50" />}
          </div>

          {expanded === project.id && (
            <div className="p-4 border-t border-[#1A1A2E] space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Title" value={project.title} onChange={v => updateProject(project.id, { title: v })} />
                <Input label="Slug" value={project.slug} onChange={v => updateProject(project.id, { slug: v })} />
                <Input label="Role" value={project.role} onChange={v => updateProject(project.id, { role: v })} />
                <Input label="Accent Color" value={project.accentColor} onChange={v => updateProject(project.id, { accentColor: v })} />
                <Input label="Start Date" value={project.startDate} onChange={v => updateProject(project.id, { startDate: v })} />
                <Input label="End Date" value={project.endDate} onChange={v => updateProject(project.id, { endDate: v })} />
                <Input label="GitHub URL" value={project.githubUrl} onChange={v => updateProject(project.id, { githubUrl: v })} />
                <Input label="Demo URL" value={project.demoUrl} onChange={v => updateProject(project.id, { demoUrl: v })} />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={project.featured} onChange={() => toggleFeatured(project.id)} className="rounded" />
                  Featured
                </label>
                <select
                  value={project.objectType}
                  onChange={e => updateProject(project.id, { objectType: e.target.value as ProjectItem['objectType'] })}
                  className="bg-[#0A0A12] border border-[#1A1A2E] rounded-lg p-2 text-xs focus:border-[#F5A623] outline-none"
                >
                  <option value="asteroid">Asteroid</option>
                  <option value="capsule">Capsule</option>
                  <option value="station">Station</option>
                  <option value="ship">Ship</option>
                </select>
                <select
                  value={project.status}
                  onChange={e => updateProject(project.id, { status: e.target.value as ProjectItem['status'] })}
                  className="bg-[#0A0A12] border border-[#1A1A2E] rounded-lg p-2 text-xs focus:border-[#F5A623] outline-none"
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <Input label="Short Description" value={project.shortDescription} onChange={v => updateProject(project.id, { shortDescription: v })} multiline />
              <Input label="Long Description" value={project.longDescription} onChange={v => updateProject(project.id, { longDescription: v })} multiline />

              {/* Tech Stack */}
              <div>
                <div className="text-xs opacity-60 mb-1">Tech Stack (comma separated)</div>
                <input
                  value={(project.techStack || []).join(', ')}
                  onChange={e => updateProject(project.id, { techStack: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  className="w-full bg-[#0A0A12] border border-[#1A1A2E] rounded-lg p-2 text-xs focus:border-[#F5A623] outline-none"
                />
              </div>

              {/* Highlights */}
              <div>
                <div className="text-xs opacity-60 mb-1">Highlights</div>
                {(project.highlights || []).map((h, i) => (
                  <div key={i} className="flex items-center gap-2 mb-1">
                    <input value={h} onChange={e => { const arr = [...(project.highlights || [])]; arr[i] = e.target.value; updateProject(project.id, { highlights: arr }); }} className="flex-1 bg-[#0A0A12] border border-[#1A1A2E] rounded-lg p-2 text-xs focus:border-[#F5A623] outline-none" />
                    <button onClick={() => { const arr = (project.highlights || []).filter((_, idx) => idx !== i); updateProject(project.id, { highlights: arr }); }} className="p-1.5 text-[#FF3366]"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                <button onClick={() => updateProject(project.id, { highlights: [...(project.highlights || []), ''] })} className="text-xs text-[#00D4FF]"><Plus className="w-3 h-3 inline" /> Add</button>
              </div>

              {/* Metrics */}
              <div>
                <div className="text-xs opacity-60 mb-1">Metrics</div>
                {(project.metrics || []).map((m, i) => (
                  <div key={i} className="flex items-center gap-2 mb-1">
                    <input value={m.label} placeholder="Label" onChange={e => { const arr = [...(project.metrics || [])]; arr[i] = { ...arr[i], label: e.target.value }; updateProject(project.id, { metrics: arr }); }} className="flex-1 bg-[#0A0A12] border border-[#1A1A2E] rounded-lg p-2 text-xs focus:border-[#F5A623] outline-none" />
                    <input value={m.value} placeholder="Value" onChange={e => { const arr = [...(project.metrics || [])]; arr[i] = { ...arr[i], value: e.target.value }; updateProject(project.id, { metrics: arr }); }} className="w-24 bg-[#0A0A12] border border-[#1A1A2E] rounded-lg p-2 text-xs focus:border-[#F5A623] outline-none" />
                    <button onClick={() => { const arr = (project.metrics || []).filter((_, idx) => idx !== i); updateProject(project.id, { metrics: arr }); }} className="p-1.5 text-[#FF3366]"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                <button onClick={() => updateProject(project.id, { metrics: [...(project.metrics || []), { label: '', value: '' }] })} className="text-xs text-[#00D4FF]"><Plus className="w-3.5 h-3.5 inline" /> Add Metric</button>
              </div>

              {/* Case Study Sections */}
              <div>
                <div className="text-xs opacity-60 mb-1">Case Study Sections</div>
                {(project.caseStudySections || []).map((sec, i) => (
                  <div key={i} className="border border-[#1A1A2E] rounded-lg p-3 mb-2 space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs opacity-40 font-bold">Section #{i + 1}</span>
                      <button
                        onClick={() => {
                          const arr = (project.caseStudySections || []).filter((_, idx) => idx !== i);
                          updateProject(project.id, { caseStudySections: arr });
                        }}
                        className="text-[#FF3366] text-xs hover:opacity-80 transition-opacity flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Remove Section
                      </button>
                    </div>
                    <input
                      value={sec.title}
                      placeholder="Section Title (e.g., Challenge, Solution, Results)"
                      onChange={e => {
                        const arr = [...(project.caseStudySections || [])];
                        arr[i] = { ...arr[i], title: e.target.value };
                        updateProject(project.id, { caseStudySections: arr });
                      }}
                      className="w-full bg-[#0A0A12] border border-[#1A1A2E] rounded-lg p-2 text-xs focus:border-[#F5A623] outline-none"
                    />
                    <textarea
                      value={sec.content}
                      placeholder="Section Content"
                      onChange={e => {
                        const arr = [...(project.caseStudySections || [])];
                        arr[i] = { ...arr[i], content: e.target.value };
                        updateProject(project.id, { caseStudySections: arr });
                      }}
                      className="w-full bg-[#0A0A12] border border-[#1A1A2E] rounded-lg p-2 text-xs focus:border-[#F5A623] outline-none h-16 resize-none"
                    />
                  </div>
                ))}
                <button
                  onClick={() => updateProject(project.id, { caseStudySections: [...(project.caseStudySections || []), { title: '', content: '' }] })}
                  className="text-xs text-[#00D4FF] flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Case Study Section
                </button>
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={() => { if (confirm('Delete?')) deleteProject(project.id); }} className="text-xs text-[#FF3366] flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ======================== CERTIFICATIONS TAB ========================

function CertificationsTab() {
  const { certifications, addCertification, updateCertification, deleteCertification } = usePortfolioStore();

  const addNew = () => {
    addCertification({
      id: `cert-${Date.now()}`,
      title: 'New Certification',
      issuer: '',
      date: '',
      credentialUrl: '',
      icon: 'award',
      description: '',
    });
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={addNew} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs bg-[#F5A62320] text-[#F5A623] border border-[#F5A62340] hover:bg-[#F5A62330] transition-all">
          <Plus className="w-3.5 h-3.5" /> Add Certification
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {certifications.map(cert => (
          <div key={cert.id} className="border border-[#1A1A2E] rounded-xl p-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Title" value={cert.title} onChange={v => updateCertification(cert.id, { title: v })} />
              <Input label="Issuer" value={cert.issuer} onChange={v => updateCertification(cert.id, { issuer: v })} />
              <Input label="Date" value={cert.date} onChange={v => updateCertification(cert.id, { date: v })} />
              <Input label="Credential URL" value={cert.credentialUrl} onChange={v => updateCertification(cert.id, { credentialUrl: v })} />
            </div>
            <Input label="Description" value={cert.description} onChange={v => updateCertification(cert.id, { description: v })} multiline />
            <div className="flex justify-end mt-2">
              <button onClick={() => { if (confirm('Delete?')) deleteCertification(cert.id); }} className="text-xs text-[#FF3366] flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ======================== ACHIEVEMENTS TAB ========================

function AchievementsTab() {
  const { achievements, addAchievement, updateAchievement, deleteAchievement } = usePortfolioStore();

  const addNew = () => {
    addAchievement({
      id: `ach-${Date.now()}`,
      title: 'New Achievement',
      description: '',
      date: '',
      impact: '',
    });
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={addNew} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs bg-[#F5A62320] text-[#F5A623] border border-[#F5A62340] hover:bg-[#F5A62330] transition-all">
          <Plus className="w-3.5 h-3.5" /> Add Achievement
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {achievements.map(ach => (
          <div key={ach.id} className="border border-[#1A1A2E] rounded-xl p-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Title" value={ach.title} onChange={v => updateAchievement(ach.id, { title: v })} />
              <Input label="Date" value={ach.date} onChange={v => updateAchievement(ach.id, { date: v })} />
            </div>
            <Input label="Description" value={ach.description} onChange={v => updateAchievement(ach.id, { description: v })} multiline />
            <Input label="Impact" value={ach.impact} onChange={v => updateAchievement(ach.id, { impact: v })} multiline />
            <div className="flex justify-end mt-2">
              <button onClick={() => { if (confirm('Delete?')) deleteAchievement(ach.id); }} className="text-xs text-[#FF3366] flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ======================== EDUCATION TAB ========================

function EducationTab() {
  const { education, addEducation, updateEducation, deleteEducation } = usePortfolioStore();

  const addNew = () => {
    addEducation({
      id: `edu-${Date.now()}`,
      institution: 'Institution',
      degree: 'Degree',
      field: 'Field',
      location: '',
      startDate: '',
      endDate: '',
      coursework: [],
    });
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={addNew} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs bg-[#F5A62320] text-[#F5A623] border border-[#F5A62340] hover:bg-[#F5A62330] transition-all">
          <Plus className="w-3.5 h-3.5" /> Add Education
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {education.map(edu => (
          <div key={edu.id} className="border border-[#1A1A2E] rounded-xl p-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Institution" value={edu.institution} onChange={v => updateEducation(edu.id, { institution: v })} />
              <Input label="Degree" value={edu.degree} onChange={v => updateEducation(edu.id, { degree: v })} />
              <Input label="Field" value={edu.field} onChange={v => updateEducation(edu.id, { field: v })} />
              <Input label="Location" value={edu.location} onChange={v => updateEducation(edu.id, { location: v })} />
              <Input label="Start Date" value={edu.startDate} onChange={v => updateEducation(edu.id, { startDate: v })} />
              <Input label="End Date" value={edu.endDate} onChange={v => updateEducation(edu.id, { endDate: v })} />
            </div>
            <div className="mt-3">
              <div className="text-xs opacity-60 mb-1">Coursework (comma separated)</div>
              <input
                value={(edu.coursework || []).join(', ')}
                onChange={e => updateEducation(edu.id, { coursework: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                className="w-full bg-[#0A0A12] border border-[#1A1A2E] rounded-lg p-2 text-xs focus:border-[#F5A623] outline-none"
              />
            </div>
            <div className="flex justify-end mt-2">
              <button onClick={() => { if (confirm('Delete?')) deleteEducation(edu.id); }} className="text-xs text-[#FF3366] flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ======================== CONTACT TAB ========================

function ContactTab() {
  const { contact, updateContact } = usePortfolioStore();
  return (
    <SectionCard title="Contact Information">
      <Input label="Heading" value={contact.heading} onChange={v => updateContact({ heading: v })} />
      <Input label="Message" value={contact.message} onChange={v => updateContact({ message: v })} multiline />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Email" value={contact.email} onChange={v => updateContact({ email: v })} />
        <Input label="Phone" value={contact.phone} onChange={v => updateContact({ phone: v })} />
        <Input label="Location" value={contact.location} onChange={v => updateContact({ location: v })} />
        <Input label="Availability" value={contact.availability} onChange={v => updateContact({ availability: v })} />
      </div>

      {/* Socials */}
      <div className="mt-4">
        <div className="text-xs opacity-60 mb-2">Social Links</div>
        {contact.socials.map((s, i) => (
          <div key={i} className="grid grid-cols-3 gap-2 mb-2">
            <input value={s.platform} onChange={e => {
              const arr = [...contact.socials]; arr[i] = { ...arr[i], platform: e.target.value };
              updateContact({ socials: arr });
            }} className="bg-[#0A0A12] border border-[#1A1A2E] rounded-lg p-2 text-xs focus:border-[#F5A623] outline-none" placeholder="Platform" />
            <input value={s.url} onChange={e => {
              const arr = [...contact.socials]; arr[i] = { ...arr[i], url: e.target.value };
              updateContact({ socials: arr });
            }} className="col-span-2 bg-[#0A0A12] border border-[#1A1A2E] rounded-lg p-2 text-xs focus:border-[#F5A623] outline-none" placeholder="URL" />
          </div>
        ))}
        <button onClick={() => updateContact({ socials: [...contact.socials, { platform: '', url: '', icon: '' }] })} className="text-xs text-[#00D4FF]"><Plus className="w-3 h-3 inline" /> Add Social</button>
      </div>
    </SectionCard>
  );
}

// ======================== SETTINGS TAB ========================

function SettingsTab() {
  const { siteConfig, sectionVisibility, toggleSection, exportToJSON, updateSiteConfig } = usePortfolioStore();

  return (
    <>
      <SectionCard title="Site Configuration">
        <Input label="Site Title" value={siteConfig.title} onChange={v => updateSiteConfig({ title: v })} />
        <Input label="Tagline" value={siteConfig.tagline} onChange={v => updateSiteConfig({ tagline: v })} />
        <Input label="Description" value={siteConfig.description} onChange={v => updateSiteConfig({ description: v })} multiline />
      </SectionCard>

      <SectionCard title="Section Visibility">
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(sectionVisibility).map(([section, visible]) => (
            <label key={section} className="flex items-center gap-3 p-3 rounded-lg border border-[#1A1A2E] cursor-pointer hover:bg-[#0A0A12] transition-colors">
              {visible ? <Eye className="w-4 h-4 text-[#00D4FF]" /> : <EyeOff className="w-4 h-4 text-[#FF3366]" />}
              <span className="text-sm capitalize">{section}</span>
              <input
                type="checkbox"
                checked={visible}
                onChange={() => toggleSection(section)}
                className="ml-auto rounded border-[#1A1A2E]"
              />
            </label>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Data Backup">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border border-[#1A1A2E]">
            <span className="text-sm">Export all portfolio data as JSON</span>
            <button
              onClick={() => {
                const json = exportToJSON();
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `portfolio-backup-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success('Backup downloaded!');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs bg-[#00D4FF20] text-[#00D4FF] border border-[#00D4FF40] hover:bg-[#00D4FF30] transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Download Backup
            </button>
          </div>
        </div>
      </SectionCard>
    </>
  );
}