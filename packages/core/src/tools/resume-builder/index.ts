export type {
  ResumeLanguage,
  ResumeDirection,
  TemplateStyle,
  SectionKey,
  PersonalInfo,
  EducationEntry,
  ExperienceEntry,
  SkillEntry,
  SkillLevel,
  LanguageEntry,
  LanguageProficiency,
  ProjectEntry,
  ReferenceEntry,
  ResumeSections,
  SectionVisibility,
  ResumeData,
  ResumeTemplate,
  ResumeDraft,
  ResumeExportOptions,
} from "./types";

export {
  SKILL_LEVELS,
  LANGUAGE_PROFICIENCIES,
  SECTION_LABELS,
  RESUME_TEMPLATES,
  DEFAULT_PERSONAL_INFO,
  DEFAULT_SECTION_VISIBILITY,
  DEFAULT_SECTION_ORDER,
  SKILL_CATEGORIES,
  SKILL_CATEGORIES_AR,
} from "./types";

export {
  renderResumeHtml,
  getOrderedVisibleSections,
  formatDate,
  formatDateRange,
  escapeHtml,
  nlToBr,
  getSectionLabel,
  getSkillLevelLabel,
  getProficiencyLabel,
  renderClassic,
  renderModern,
  renderMinimal,
  exportResumeToPdf,
  renderForPreview,
  createEmptyResume,
  saveDraft,
  getAllDrafts,
  getDraft,
  deleteDraft,
  duplicateDraft,
  exportDraftAsJson,
  importDraftFromJson,
} from "./engine";

export type { PdfExportResult } from "./engine";

export { createResumeBuilderConfig, createDefaultResumeData } from "./plugin-manifest";
export type { ResumeBuilderInput, ResumeBuilderOutput } from "./plugin-manifest";
