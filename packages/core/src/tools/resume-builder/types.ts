export type ResumeLanguage = "en" | "ar";
export type ResumeDirection = "ltr" | "rtl";
export type TemplateStyle = "classic" | "modern" | "minimal";
export type SectionKey = "personal" | "education" | "experience" | "skills" | "languages" | "projects" | "references";

export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  summary: string;
  photo?: string;
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
  description: string;
  visible: boolean;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  highlights: string[];
  visible: boolean;
}

export interface SkillEntry {
  id: string;
  name: string;
  level: SkillLevel;
  category: string;
  visible: boolean;
}

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";

export interface LanguageEntry {
  id: string;
  name: string;
  proficiency: LanguageProficiency;
  visible: boolean;
}

export type LanguageProficiency = "elementary" | "limited" | "professional" | "full" | "native";

export interface ProjectEntry {
  id: string;
  name: string;
  url: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate: string;
  highlights: string[];
  visible: boolean;
}

export interface ReferenceEntry {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  relationship: string;
  visible: boolean;
}

export interface ResumeSections {
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: SkillEntry[];
  languages: LanguageEntry[];
  projects: ProjectEntry[];
  references: ReferenceEntry[];
}

export interface SectionVisibility {
  education: boolean;
  experience: boolean;
  skills: boolean;
  languages: boolean;
  projects: boolean;
  references: boolean;
}

export interface ResumeData {
  id: string;
  personal: PersonalInfo;
  sections: ResumeSections;
  sectionVisibility: SectionVisibility;
  sectionOrder: SectionKey[];
  template: TemplateStyle;
  language: ResumeLanguage;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeTemplate {
  id: TemplateStyle;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  preview: string;
  primaryColor: string;
  fontFamily: string;
}

export interface ResumeDraft {
  id: string;
  data: ResumeData;
  savedAt: string;
  name: string;
}

export interface ResumeExportOptions {
  format: "pdf";
  pageSize: "a4" | "letter";
  margin: number;
  quality: number;
}

export const SKILL_LEVELS: Record<SkillLevel, { label: string; labelAr: string; value: number }> = {
  beginner: { label: "Beginner", labelAr: "\u0645\u0628\u062a\u062f\u0626", value: 25 },
  intermediate: { label: "Intermediate", labelAr: "\u0645\u062a\u0648\u0633\u0637", value: 50 },
  advanced: { label: "Advanced", labelAr: "\u0645\u062a\u0642\u062f\u0645", value: 75 },
  expert: { label: "Expert", labelAr: "\u062e\u0627\u0635", value: 100 },
};

export const LANGUAGE_PROFICIENCIES: Record<LanguageProficiency, { label: string; labelAr: string }> = {
  elementary: { label: "Elementary", labelAr: "\u0623\u0633\u0627\u0633\u064a" },
  limited: { label: "Limited Working", labelAr: "\u0645\u062d\u062f\u0648\u062f \u0645\u0639\u062f\u0648\u062f" },
  professional: { label: "Professional", labelAr: "\u0645\u0647\u0627\u0631\u064a" },
  full: { label: "Full Professional", labelAr: "\u0645\u0647\u0627\u0631\u064a \u0643\u0627\u0645\u0644" },
  native: { label: "Native", labelAr: "\u0623\u0635\u0644\u064a" },
};

export const SECTION_LABELS: Record<SectionKey, { en: string; ar: string }> = {
  personal: { en: "Personal Info", ar: "\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0634\u062e\u0635\u064a\u0629" },
  education: { en: "Education", ar: "\u0627\u0644\u062a\u0639\u0644\u064a\u0645" },
  experience: { en: "Experience", ar: "\u0627\u0644\u062e\u0628\u0631\u0629" },
  skills: { en: "Skills", ar: "\u0627\u0644\u0645\u0647\u0627\u0631\u0627\u062a" },
  languages: { en: "Languages", ar: "\u0627\u0644\u0644\u063a\u0627\u062a" },
  projects: { en: "Projects", ar: "\u0627\u0644\u0645\u0634\u0627\u0631\u064a\u0639" },
  references: { en: "References", ar: "\u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0648\u0646" },
};

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: "classic",
    name: "Classic",
    nameAr: "\u0643\u0644\u0627\u0633\u064a\u0643\u064a",
    description: "Traditional professional layout with clean lines",
    descriptionAr: "\u062a\u0635\u0645\u064a\u0645 \u0645\u0647\u0646\u0626 \u0645\u0633\u064a\u0637\u0641\u064a \u0628\u062e\u0637\u0648\u0637 \u0646\u0638\u064a\u0641\u0629",
    preview: "classic",
    primaryColor: "#1a365d",
    fontFamily: "Georgia, serif",
  },
  {
    id: "modern",
    name: "Modern",
    nameAr: "\u0639\u0635\u0631\u064a",
    description: "Contemporary design with sidebar and accent colors",
    descriptionAr: "\u062a\u0635\u0645\u064a\u0645 \u0639\u0636\u0631\u064a \u0628\u0634\u0631\u064a\u0637 \u062c\u0627\u0646\u0628\u064a \u0648\u0623\u0644\u0648\u0627\u0646 \u062a\u0645\u064a\u0632\u0629",
    preview: "modern",
    primaryColor: "#059669",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  {
    id: "minimal",
    name: "Minimal",
    nameAr: "\u0628\u0633\u064a\u0637",
    description: "Clean and simple, focusing on content",
    descriptionAr: "\u0646\u0638\u064a\u0641 \u0648\u0628\u0633\u064a\u0637\u060c \u064a\u0631\u0643\u0632 \u0639\u0644\u0649 \u0627\u0644\u0645\u062d\u062a\u0648\u0649",
    preview: "minimal",
    primaryColor: "#18181b",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
];

export const DEFAULT_PERSONAL_INFO: PersonalInfo = {
  fullName: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  linkedin: "",
  github: "",
  summary: "",
};

export const DEFAULT_SECTION_VISIBILITY: SectionVisibility = {
  education: true,
  experience: true,
  skills: true,
  languages: true,
  projects: false,
  references: false,
};

export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  "experience",
  "education",
  "skills",
  "languages",
  "projects",
  "references",
];

export const SKILL_CATEGORIES = [
  "Programming Languages",
  "Frameworks",
  "Databases",
  "DevOps",
  "Design",
  "Soft Skills",
  "Other",
];

export const SKILL_CATEGORIES_AR = [
  "\u0644\u063a\u0627\u062a \u0627\u0644\u0628\u0631\u0645\u062c\u0629",
  "\u0627\u0644\u0623\u0637\u0642\u0629",
  "\u0642\u0648\u0627\u0639\u062f \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a",
  "\u0627\u0644\u062a\u0637\u0648\u064a\u0631",
  "\u0627\u0644\u062a\u0635\u0645\u064a\u0645",
  "\u0645\u0647\u0627\u0631\u0627\u062a \u0646\u0638\u0631\u064a\u0629",
  "\u0622\u062e\u0631\u0649",
];
