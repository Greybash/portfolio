// ============================================================
// EVENT HORIZON INFRASTRUCTURE — ZUSTAND STORE
// Central data layer with localStorage persistence
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  PortfolioData,
  ProjectItem,
  ExperienceItem,
  SkillCategory,
  CertificationItem,
  AchievementItem,
  EducationItem,
  ProfileData,
  HeroData,
  ContactData,
  SiteConfig,
  SceneConfig,
  AdminConfig,
} from '@/types';
import { initialPortfolioData } from '@/data/initialData';

interface PortfolioStore extends PortfolioData {
  // Profile
  updateProfile: (profile: Partial<ProfileData>) => void;

  // Hero
  updateHero: (hero: Partial<HeroData>) => void;

  // About
  updateAbout: (about: string) => void;

  // Skills CRUD
  addSkill: (skill: SkillCategory) => void;
  updateSkill: (id: string, skill: Partial<SkillCategory>) => void;
  deleteSkill: (id: string) => void;
  reorderSkills: (skills: SkillCategory[]) => void;

  // Experience CRUD
  addExperience: (exp: ExperienceItem) => void;
  updateExperience: (id: string, exp: Partial<ExperienceItem>) => void;
  deleteExperience: (id: string) => void;
  reorderExperience: (experience: ExperienceItem[]) => void;

  // Projects CRUD
  addProject: (project: ProjectItem) => void;
  updateProject: (id: string, project: Partial<ProjectItem>) => void;
  deleteProject: (id: string) => void;
  toggleFeatured: (id: string) => void;
  reorderProjects: (projects: ProjectItem[]) => void;

  // Certifications CRUD
  addCertification: (cert: CertificationItem) => void;
  updateCertification: (id: string, cert: Partial<CertificationItem>) => void;
  deleteCertification: (id: string) => void;

  // Achievements CRUD
  addAchievement: (achievement: AchievementItem) => void;
  updateAchievement: (id: string, achievement: Partial<AchievementItem>) => void;
  deleteAchievement: (id: string) => void;

  // Education CRUD
  addEducation: (edu: EducationItem) => void;
  updateEducation: (id: string, edu: Partial<EducationItem>) => void;
  deleteEducation: (id: string) => void;

  // Contact
  updateContact: (contact: Partial<ContactData>) => void;

  // Site Config
  updateSiteConfig: (config: Partial<SiteConfig>) => void;

  // Scene Config
  updateSceneConfig: (config: Partial<SceneConfig>) => void;

  // Admin Config
  updateAdminConfig: (config: Partial<AdminConfig>) => void;

  // Section Visibility
  toggleSection: (section: string) => void;

  // Import / Export
  exportToJSON: () => string;
  importFromJSON: (json: string) => boolean;

  // Reset
  resetToDefault: () => void;

  // Scroll progress (transient, not persisted)
  scrollProgress: number;
  setScrollProgress: (progress: number) => void;
  currentZone: string;
  setCurrentZone: (zone: string) => void;
  hoveredObject: string | null;
  setHoveredObject: (id: string | null) => void;
  selectedProject: string | null;
  setSelectedProject: (id: string | null) => void;
}

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set, get) => ({
      ...initialPortfolioData,

      // Profile
      updateProfile: (profile) =>
        set((state) => ({ profile: { ...state.profile, ...profile } })),

      // Hero
      updateHero: (hero) =>
        set((state) => ({ hero: { ...state.hero, ...hero } })),

      // About
      updateAbout: (about) => set({ about }),

      // Skills CRUD
      addSkill: (skill) =>
        set((state) => ({ skills: [...state.skills, skill] })),
      updateSkill: (id, skill) =>
        set((state) => ({
          skills: state.skills.map((s) => (s.id === id ? { ...s, ...skill } : s)),
        })),
      deleteSkill: (id) =>
        set((state) => ({ skills: state.skills.filter((s) => s.id !== id) })),
      reorderSkills: (skills) => set({ skills }),

      // Experience CRUD
      addExperience: (exp) =>
        set((state) => ({ experience: [...state.experience, exp] })),
      updateExperience: (id, exp) =>
        set((state) => ({
          experience: state.experience.map((e) => (e.id === id ? { ...e, ...exp } : e)),
        })),
      deleteExperience: (id) =>
        set((state) => ({
          experience: state.experience.filter((e) => e.id !== id),
        })),
      reorderExperience: (experience) => set({ experience }),

      // Projects CRUD
      addProject: (project) =>
        set((state) => ({ projects: [...state.projects, project] })),
      updateProject: (id, project) =>
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, ...project } : p)),
        })),
      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),
      toggleFeatured: (id) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, featured: !p.featured } : p
          ),
        })),
      reorderProjects: (projects) => set({ projects }),

      // Certifications CRUD
      addCertification: (cert) =>
        set((state) => ({ certifications: [...state.certifications, cert] })),
      updateCertification: (id, cert) =>
        set((state) => ({
          certifications: state.certifications.map((c) =>
            c.id === id ? { ...c, ...cert } : c
          ),
        })),
      deleteCertification: (id) =>
        set((state) => ({
          certifications: state.certifications.filter((c) => c.id !== id),
        })),

      // Achievements CRUD
      addAchievement: (achievement) =>
        set((state) => ({ achievements: [...state.achievements, achievement] })),
      updateAchievement: (id, achievement) =>
        set((state) => ({
          achievements: state.achievements.map((a) =>
            a.id === id ? { ...a, ...achievement } : a
          ),
        })),
      deleteAchievement: (id) =>
        set((state) => ({
          achievements: state.achievements.filter((a) => a.id !== id),
        })),

      // Education CRUD
      addEducation: (edu) =>
        set((state) => ({ education: [...state.education, edu] })),
      updateEducation: (id, edu) =>
        set((state) => ({
          education: state.education.map((e) => (e.id === id ? { ...e, ...edu } : e)),
        })),
      deleteEducation: (id) =>
        set((state) => ({
          education: state.education.filter((e) => e.id !== id),
        })),

      // Contact
      updateContact: (contact) =>
        set((state) => ({ contact: { ...state.contact, ...contact } })),

      // Site Config
      updateSiteConfig: (config) =>
        set((state) => ({ siteConfig: { ...state.siteConfig, ...config } })),

      // Scene Config
      updateSceneConfig: (config) =>
        set((state) => ({ sceneConfig: { ...state.sceneConfig, ...config } })),

      // Admin Config
      updateAdminConfig: (config) =>
        set((state) => ({ adminConfig: { ...state.adminConfig, ...config } })),

      // Section Visibility
      toggleSection: (section) =>
        set((state) => ({
          sectionVisibility: {
            ...state.sectionVisibility,
            [section]: !state.sectionVisibility[section],
          },
        })),

      // Import / Export
      exportToJSON: () => {
        const state = get();
        const exportData: PortfolioData = {
          siteConfig: state.siteConfig,
          profile: state.profile,
          hero: state.hero,
          about: state.about,
          skills: state.skills,
          experience: state.experience,
          projects: state.projects,
          certifications: state.certifications,
          achievements: state.achievements,
          education: state.education,
          contact: state.contact,
          navigation: state.navigation,
          sceneConfig: state.sceneConfig,
          adminConfig: state.adminConfig,
          sectionVisibility: state.sectionVisibility,
        };
        return JSON.stringify(exportData, null, 2);
      },

      importFromJSON: (json) => {
        try {
          const data = JSON.parse(json) as PortfolioData;
          set({ ...data });
          return true;
        } catch {
          return false;
        }
      },

      // Reset
      resetToDefault: () => set({ ...initialPortfolioData }),

      // Transient state (not persisted)
      scrollProgress: 0, // Start at beginning
      setScrollProgress: (progress) => set({ scrollProgress: progress }),
      currentZone: 'entry-void',
      setCurrentZone: (zone) => set({ currentZone: zone }),
      hoveredObject: null,
      setHoveredObject: (id) => set({ hoveredObject: id }),
      selectedProject: null,
      setSelectedProject: (id) => set({ selectedProject: id }),
    }),
    {
      name: 'event-horizon-portfolio-v2',
      partialize: (state) => {
        // Only persist data fields, not transient UI state
        const {
          scrollProgress: _,
          currentZone: __,
          hoveredObject: ___,
          selectedProject: ____,
          setScrollProgress: _____,
          setCurrentZone: ______,
          setHoveredObject: _______,
          setSelectedProject: ________,
          ...dataState
        } = state;
        return dataState as unknown as PortfolioStore;
      },
    }
  )
);