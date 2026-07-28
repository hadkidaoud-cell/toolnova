import type { ResumeData, TemplateStyle, ResumeLanguage } from "./types";
import { DEFAULT_PERSONAL_INFO, DEFAULT_SECTION_VISIBILITY, DEFAULT_SECTION_ORDER } from "./types";

export interface ResumeBuilderInput {
  personal: {
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
  };
  template: TemplateStyle;
  language: ResumeLanguage;
}

export interface ResumeBuilderOutput {
  html: string;
  dataUrl: string;
  fileName: string;
}

export function createResumeBuilderConfig(): import("../../sdk/types/tool-config").ToolConfig {
  return {
    id: "resume-builder",
    name: "Resume Builder",
    description: "Build professional resumes with modern templates, Arabic + English support, and PDF export",
    version: "1.0.0",
    category: "utilities",
    tags: ["resume", "cv", "builder", "pdf", "document", "career"],
    icon: "resume",
    permissions: {
      access: "public",
    },
    timeout: 60000,
    retries: 0,
    retryDelay: 0,
    cacheable: false,
    cacheTtl: 0,
    rateLimit: {
      windowMs: 60000,
      maxRequests: 30,
    },
    metadata: {
      author: "ToolNova",
      authorUrl: "https://toolnova.com",
      documentation: "https://toolnova.com/tools/resume-builder",
      license: "MIT",
    },
    inputs: [
      {
        id: "fullName",
        name: "Full Name",
        type: "text",
        label: "Full Name",
        description: "Your full name as it should appear on the resume",
        required: true,
        placeholder: "John Doe",
      },
      {
        id: "title",
        name: "Professional Title",
        type: "text",
        label: "Professional Title",
        description: "Your current or target job title",
        required: false,
        placeholder: "Senior Software Engineer",
      },
      {
        id: "template",
        name: "Template",
        type: "select",
        label: "Resume Template",
        description: "Choose a template style for your resume",
        required: false,
        defaultValue: "modern",
        options: [
          { label: "Classic", value: "classic" },
          { label: "Modern", value: "modern" },
          { label: "Minimal", value: "minimal" },
        ],
      },
      {
        id: "language",
        name: "Language",
        type: "select",
        label: "Resume Language",
        description: "Language and direction for the resume",
        required: false,
        defaultValue: "en",
        options: [
          { label: "English", value: "en" },
          { label: "Arabic", value: "ar" },
        ],
      },
    ],
    schema: {},
  };
}

export function createDefaultResumeData(): ResumeData {
  return {
    id: `resume-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`,
    personal: { ...DEFAULT_PERSONAL_INFO },
    sections: {
      education: [],
      experience: [],
      skills: [],
      languages: [],
      projects: [],
      references: [],
    },
    sectionVisibility: { ...DEFAULT_SECTION_VISIBILITY },
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    template: "modern",
    language: "en",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
