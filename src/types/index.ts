// ============================================================
// EVENT HORIZON INFRASTRUCTURE — TYPE DEFINITIONS
// ============================================================

export interface SiteConfig {
  title: string;
  tagline: string;
  description: string;
  secretAdminUrl: string;
  themeColors: {
    voidBlack: string;
    accretionGold: string;
    starlightWhite: string;
    nebulaPurple: string;
    telemetryCyan: string;
    alertOrange: string;
    gravityRed: string;
  };
}

export interface ProfileData {
  name: string;
  title: string;
  tagline: string;
  location: string;
  email: string;
  phone: string;
  avatarUrl: string;
  socialLinks: {
    linkedin: string;
    github: string;
    leetcode: string;
  };
}

export interface HeroData {
  greeting: string;
  headline: string;
  subtitle: string;
  ctaText: string;
  scrollPrompt: string;
}

export interface SkillTool {
  name: string;
  level: number; // 0-100
  icon?: string;
}

export interface SkillCategory {
  id: string;
  category: string;
  description: string;
  icon: string;
  tools: SkillTool[];
  proficiency: number;
  highlight: boolean;
  visualClusterType: 'satellite' | 'constellation' | 'nebula' | 'relay';
  orbitRadius: number;
  signalStrength: number;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  employmentType: string;
  startDate: string;
  endDate: string;
  summary: string;
  achievements: string[];
  impactMetrics: { label: string; value: string }[];
  techStack: string[];
  beaconType: 'station' | 'outpost' | 'relay' | 'colony';
  orbitDepth: number;
  themeTone: 'warm' | 'cool' | 'neutral';
}

export interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  role: string;
  techStack: string[];
  architecture: string[];
  highlights: string[];
  metrics: { label: string; value: string }[];
  githubUrl: string;
  demoUrl: string;
  imageUrl: string;
  featured: boolean;
  status: 'active' | 'archived' | 'draft';
  startDate: string;
  endDate: string;
  tags: string[];
  objectType: 'asteroid' | 'capsule' | 'station' | 'ship' | 'debris';
  orbitZone: string;
  accentColor: string;
  caseStudySections: { title: string; content: string }[];
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credentialUrl: string;
  icon: string;
  description: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  date: string;
  impact: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  coursework: string[];
}

export interface ContactData {
  heading: string;
  message: string;
  email: string;
  phone: string;
  location: string;
  availability: string;
  socials: { platform: string; url: string; icon: string }[];
}

export interface NavigationItem {
  id: string;
  label: string;
  zone: string;
  position: number; // scroll position 0-1
}

export interface SceneConfig {
  zones: {
    id: string;
    name: string;
    description: string;
    startZ: number;
    endZ: number;
    atmosphereColor: string;
    fogDensity: number;
    starDensity: number;
  }[];
  cameraPath: {
    points: [number, number, number][];
    lookAtPoints: [number, number, number][];
  };
  renderQuality: 'low' | 'medium' | 'high' | 'ultra';
  effects: {
    bloom: boolean;
    bloomStrength: number;
    bloomRadius: number;
    motionBlur: boolean;
    vignette: boolean;
    filmGrain: boolean;
    chromaticAberration: boolean;
  };
}

export interface AdminConfig {
  secretUrl: string;
  enableExportImport: boolean;
  enablePreview: boolean;
  contentEditable: boolean;
}

// Unified portfolio data
export interface PortfolioData {
  siteConfig: SiteConfig;
  profile: ProfileData;
  hero: HeroData;
  about: string;
  skills: SkillCategory[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  achievements: AchievementItem[];
  education: EducationItem[];
  contact: ContactData;
  navigation: NavigationItem[];
  sceneConfig: SceneConfig;
  adminConfig: AdminConfig;
  sectionVisibility: Record<string, boolean>;
}