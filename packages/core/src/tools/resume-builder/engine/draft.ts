import type { ResumeData, ResumeDraft } from "../types";

const STORAGE_KEY = "toolnova_resume_drafts";
const MAX_DRAFTS = 20;

export function saveDraft(data: ResumeData, name?: string): ResumeDraft {
  const draft: ResumeDraft = {
    id: data.id,
    data: { ...data, updatedAt: new Date().toISOString() },
    savedAt: new Date().toISOString(),
    name: name || data.personal.fullName || "Untitled Resume",
  };

  const drafts = getAllDrafts();
  const existing = drafts.findIndex((d) => d.id === draft.id);
  if (existing >= 0) {
    drafts[existing] = draft;
  } else {
    drafts.unshift(draft);
  }

  const trimmed = drafts.slice(0, MAX_DRAFTS);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // storage full — remove oldest and retry
    trimmed.pop();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // give up silently
    }
  }

  return draft;
}

export function getAllDrafts(): ResumeDraft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as ResumeDraft[];
  } catch {
    return [];
  }
}

export function getDraft(id: string): ResumeDraft | null {
  const drafts = getAllDrafts();
  return drafts.find((d) => d.id === id) ?? null;
}

export function deleteDraft(id: string): boolean {
  const drafts = getAllDrafts();
  const filtered = drafts.filter((d) => d.id !== id);
  if (filtered.length === drafts.length) return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // ignore
  }
  return true;
}

export function duplicateDraft(id: string, newName?: string): ResumeDraft | null {
  const draft = getDraft(id);
  if (draft === null) return null;

  const newData: ResumeData = {
    ...draft.data,
    id: `resume-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`,
    personal: { ...draft.data.personal },
    sections: {
      education: draft.data.sections.education.map((e) => ({ ...e, id: `${e.id}-copy-${Date.now()}` })),
      experience: draft.data.sections.experience.map((e) => ({ ...e, id: `${e.id}-copy-${Date.now()}` })),
      skills: draft.data.sections.skills.map((e) => ({ ...e, id: `${e.id}-copy-${Date.now()}` })),
      languages: draft.data.sections.languages.map((e) => ({ ...e, id: `${e.id}-copy-${Date.now()}` })),
      projects: draft.data.sections.projects.map((e) => ({ ...e, id: `${e.id}-copy-${Date.now()}` })),
      references: draft.data.sections.references.map((e) => ({ ...e, id: `${e.id}-copy-${Date.now()}` })),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return saveDraft(newData, newName || `${draft.name} (Copy)`);
}

export function exportDraftAsJson(data: ResumeData): string {
  return JSON.stringify(data, null, 2);
}

export function importDraftFromJson(json: string): ResumeData {
  const parsed = JSON.parse(json);
  if (!parsed || typeof parsed !== "object") throw new Error("Invalid resume data");
  if (!parsed.personal) throw new Error("Missing personal info");
  if (!parsed.sections) throw new Error("Missing sections");

  return {
    ...parsed,
    id: `resume-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
