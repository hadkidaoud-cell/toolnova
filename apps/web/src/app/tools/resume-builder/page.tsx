"use client";

import React, { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { UpgradeGate } from "@/components/billing/upgrade-gate";
import { usePlan } from "@/components/billing/plan-provider";
import { useI18n } from "@/i18n";
import { FileText } from "lucide-react";

const RELATED_SLUGS = ["pdf-merger", "image-compressor", "character-counter"] as const;

const RELATED_ICONS: Record<string, string> = {
  "pdf-merger": "P",
  "image-compressor": "🖼",
  "character-counter": "C",
};

const LONG_DESCRIPTION =
  "Create professional resumes with our easy-to-use builder. Add personal info, education, experience, skills, and more. Choose from multiple templates, preview in real-time, and export as HTML for printing.";

const FAQ = [
  {
    question: "Can I download my resume as PDF?",
    answer: "You can export as HTML and use your browser's Print function (Ctrl+P) to save as PDF. Select 'Save as PDF' as the destination for best results.",
  },
  {
    question: "Is my data saved anywhere?",
    answer: "Resumes are saved in your browser's localStorage. No data is sent to any server. You can export your resume at any time.",
  },
];

const ARTICLE = {
  title: "Resume Writing Tips",
  content:
    "A great resume is concise, achievements-focused, and tailored to the job you're applying for. Use strong action verbs, quantify achievements where possible, and keep it to 1-2 pages. Our builder helps you organize your information professionally.",
};

interface PersonalInfo { fullName: string; title: string; email: string; phone: string; location: string; website: string; linkedin: string; summary: string; photo: string; }
interface EducationEntry { id: string; institution: string; degree: string; field: string; startDate: string; endDate: string; gpa: string; description: string; visible: boolean; }
interface ExperienceEntry { id: string; company: string; position: string; location: string; startDate: string; endDate: string; current: boolean; description: string; highlights: string[]; visible: boolean; }
interface SkillEntry { id: string; name: string; level: string; category: string; visible: boolean; }
interface LanguageEntry { id: string; name: string; proficiency: string; visible: boolean; }
interface ProjectEntry { id: string; name: string; url: string; description: string; technologies: string[]; startDate: string; endDate: string; highlights: string[]; visible: boolean; }
interface ResumeData { personal: PersonalInfo; sections: { education: EducationEntry[]; experience: ExperienceEntry[]; skills: SkillEntry[]; languages: LanguageEntry[]; projects: ProjectEntry[]; }; template: string; sectionVisibility: Record<string, boolean>; }

type ResumeSectionEntry = ResumeData["sections"][keyof ResumeData["sections"]][number];

const TEMPLATES = [
  { id: "modern", primaryColor: "#0d6efd", font: "Inter, sans-serif" },
  { id: "classic", primaryColor: "#1a1a2e", font: "Georgia, serif" },
  { id: "minimal", primaryColor: "#495057", font: "system-ui, sans-serif" },
];

const SKILL_LEVELS: Record<string, string> = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced", expert: "Expert" };
const PROFICIENCY: Record<string, string> = { native: "Native", fluent: "Fluent", professional: "Professional", intermediate: "Intermediate", basic: "Basic" };

function uid() { return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`; }

function createEmptyResume(): ResumeData {
  return {
    personal: { fullName: "", title: "", email: "", phone: "", location: "", website: "", linkedin: "", summary: "", photo: "" },
    sections: { education: [], experience: [], skills: [], languages: [], projects: [] },
    template: "modern",
    sectionVisibility: { education: true, experience: true, skills: true, languages: true, projects: true },
  };
}

function renderResumeHtml(data: ResumeData): string {
  const tmpl = TEMPLATES.find((t) => t.id === data.template)!;
  const { personal, sections, sectionVisibility } = data;

  const e = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${tmpl.font}; color: #1a1a2e; background: #fff; line-height: 1.5; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 28px; color: ${tmpl.primaryColor}; margin-bottom: 4px; }
    h2 { font-size: 16px; color: ${tmpl.primaryColor}; border-bottom: 2px solid ${tmpl.primaryColor}; padding-bottom: 4px; margin: 20px 0 12px; text-transform: uppercase; letter-spacing: 1px; }
    .title { font-size: 16px; color: #495057; margin-bottom: 8px; }
    .contact { font-size: 13px; color: #6c757d; margin-bottom: 12px; display: flex; gap: 16px; flex-wrap: wrap; }
    .contact span { white-space: nowrap; }
    .summary { font-size: 14px; color: #495057; margin-bottom: 20px; line-height: 1.6; }
    .entry { margin-bottom: 14px; }
    .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
    .entry-title { font-weight: 700; font-size: 15px; color: #1a1a2e; }
    .entry-subtitle { font-size: 13px; color: ${tmpl.primaryColor}; }
    .entry-date { font-size: 12px; color: #6c757d; }
    .entry-desc { font-size: 13px; color: #495057; margin-top: 4px; }
    .skills-grid { display: flex; flex-wrap: wrap; gap: 6px 16px; }
    .skill-item { font-size: 13px; color: #495057; }
    .skill-level { font-size: 11px; color: #6c757d; margin-left: 4px; }
    .language-grid { display: flex; flex-wrap: wrap; gap: 8px 20px; }
    .lang-item { font-size: 13px; color: #495057; }
    @media print { body { padding: 0; } }
  </style></head><body>`;

  html += `<h1>${e(personal.fullName)}</h1>`;
  if (personal.title) html += `<div class="title">${e(personal.title)}</div>`;

  const contacts: string[] = [];
  if (personal.email) contacts.push(`<span>${e(personal.email)}</span>`);
  if (personal.phone) contacts.push(`<span>${e(personal.phone)}</span>`);
  if (personal.location) contacts.push(`<span>${e(personal.location)}</span>`);
  if (personal.website) contacts.push(`<span>${e(personal.website)}</span>`);
  if (contacts.length) html += `<div class="contact">${contacts.join("")}</div>`;

  if (personal.summary) html += `<div class="summary">${e(personal.summary)}</div>`;

  if (sectionVisibility.education && sections.education.filter((e) => e.visible).length > 0) {
    html += `<h2>Education</h2>`;
    for (const edu of sections.education.filter((e) => e.visible)) {
      html += `<div class="entry"><div class="entry-header">`;
      html += `<div><div class="entry-title">${e(edu.institution)}</div><div class="entry-subtitle">${e(edu.degree)}${edu.field ? " in " + e(edu.field) : ""}</div></div>`;
      html += `<div class="entry-date">${edu.startDate}${edu.endDate ? " — " + edu.endDate : ""}</div>`;
      html += `</div>${edu.description ? `<div class="entry-desc">${e(edu.description)}</div>` : ""}</div>`;
    }
  }

  if (sectionVisibility.experience && sections.experience.filter((e) => e.visible).length > 0) {
    html += `<h2>Experience</h2>`;
    for (const exp of sections.experience.filter((e) => e.visible)) {
      html += `<div class="entry"><div class="entry-header">`;
      html += `<div><div class="entry-title">${e(exp.position)}${exp.company ? " at " + e(exp.company) : ""}</div><div class="entry-subtitle">${e(exp.location)}</div></div>`;
      html += `<div class="entry-date">${exp.startDate}${exp.current ? " — Present" : exp.endDate ? " — " + exp.endDate : ""}</div>`;
      html += `</div>${exp.description ? `<div class="entry-desc">${e(exp.description)}</div>` : ""}`;
      if (exp.highlights.length > 0) {
        html += `<ul style="margin: 4px 0 0 16px; font-size: 13px; color: #495057;">`;
        for (const h of exp.highlights.filter(Boolean)) html += `<li>${e(h)}</li>`;
        html += `</ul>`;
      }
      html += `</div>`;
    }
  }

  if (sectionVisibility.skills && sections.skills.filter((s) => s.visible).length > 0) {
    html += `<h2>Skills</h2><div class="skills-grid">`;
    for (const skill of sections.skills.filter((s) => s.visible)) {
      html += `<span class="skill-item">${e(skill.name)}<span class="skill-level">(${SKILL_LEVELS[skill.level] || skill.level})</span></span>`;
    }
    html += `</div>`;
  }

  if (sectionVisibility.languages && sections.languages.filter((l) => l.visible).length > 0) {
    html += `<h2>Languages</h2><div class="language-grid">`;
    for (const lang of sections.languages.filter((l) => l.visible)) {
      html += `<span class="lang-item">${e(lang.name)} <span style="color: #6c757d; font-size: 12px;">(${PROFICIENCY[lang.proficiency] || lang.proficiency})</span></span>`;
    }
    html += `</div>`;
  }

  if (sectionVisibility.projects && sections.projects.filter((p) => p.visible).length > 0) {
    html += `<h2>Projects</h2>`;
    for (const proj of sections.projects.filter((p) => p.visible)) {
      html += `<div class="entry"><div class="entry-header">`;
      html += `<div><div class="entry-title">${e(proj.name)}${proj.url ? ` — <a href="${e(proj.url)}" style="color: ${tmpl.primaryColor}; font-size: 13px;">${e(proj.url)}</a>` : ""}</div></div>`;
      html += `<div class="entry-date">${proj.startDate}${proj.endDate ? " — " + proj.endDate : ""}</div>`;
      html += `</div>${proj.description ? `<div class="entry-desc">${e(proj.description)}</div>` : ""}`;
      if (proj.technologies.length > 0) {
        html += `<div style="font-size: 12px; color: ${tmpl.primaryColor}; margin-top: 2px;">${proj.technologies.join(", ")}</div>`;
      }
      html += `</div>`;
    }
  }

  html += `</body></html>`;
  return html;
}

function loadDrafts(): Array<{ id: string; name: string; data: ResumeData; savedAt: string }> {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("resumeDrafts") || "[]"); } catch { return []; }
}
function saveDrafts(drafts: Array<{ id: string; name: string; data: ResumeData; savedAt: string }>) {
  try { localStorage.setItem("resumeDrafts", JSON.stringify(drafts)); } catch { }
}

export default function ResumeBuilderPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.document;
  const meta = t.meta["resume-builder"];

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "document",
    icon: <FileText className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/document" },
      { label: meta.name, href: "/tools/resume-builder" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const sectionLabels: Record<string, string> = {
    personal: t.resume.personal,
    education: t.resume.education,
    experience: t.resume.experience,
    skills: t.resume.skills,
    languages: t.resume.languages,
    projects: t.resume.projects,
  };

  const templateLabels: Record<string, string> = {
    modern: t.resume.templateModern,
    classic: t.resume.templateClassic,
    minimal: t.resume.templateMinimal,
  };

  const skillLevelLabels: Record<string, string> = {
    beginner: t.resume.levelBeginner,
    intermediate: t.resume.levelIntermediate,
    advanced: t.resume.levelAdvanced,
    expert: t.resume.levelExpert,
  };

  const proficiencyLabels: Record<string, string> = {
    native: t.resume.proficiencyNative,
    fluent: t.resume.proficiencyFluent,
    professional: t.resume.proficiencyProfessional,
    intermediate: t.resume.proficiencyIntermediate,
    basic: t.resume.proficiencyBasic,
  };

  const [data, setData] = useState<ResumeData>(createEmptyResume);
  const [tab, setTab] = useState<"editor" | "preview" | "drafts">("editor");
  const [section, setSection] = useState<string>("personal");
  const [drafts, setDrafts] = useState(loadDrafts);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { plan, limitFor } = usePlan();
  const draftLimit = limitFor("resumeDrafts");
  const atDraftLimit = plan === "free" && draftLimit !== null && drafts.length >= draftLimit;

  useEffect(() => {
    if (plan !== "free" && gateOpen) setGateOpen(false);
  }, [plan, gateOpen]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updatePersonal = (field: keyof PersonalInfo, value: string) => setData((d) => ({ ...d, personal: { ...d.personal, [field]: value } }));

  const addEntry = (sectionKey: keyof ResumeData["sections"]) => setData((d) => {
    const entryMap: Record<keyof ResumeData["sections"], ResumeSectionEntry> = {
      education: { id: uid(), institution: "", degree: "", field: "", startDate: "", endDate: "", gpa: "", description: "", visible: true },
      experience: { id: uid(), company: "", position: "", location: "", startDate: "", endDate: "", current: false, description: "", highlights: [], visible: true },
      skills: { id: uid(), name: "", level: "intermediate", category: "Other", visible: true },
      languages: { id: uid(), name: "", proficiency: "professional", visible: true },
      projects: { id: uid(), name: "", url: "", description: "", technologies: [], startDate: "", endDate: "", highlights: [], visible: true },
    };
    const next = [...d.sections[sectionKey], entryMap[sectionKey]] as (typeof d.sections)[typeof sectionKey];
    return { ...d, sections: { ...d.sections, [sectionKey]: next } };
  });

  const updateEntry = (sectionKey: keyof ResumeData["sections"], id: string, field: string, value: unknown) => setData((d) => ({
    ...d, sections: { ...d.sections, [sectionKey]: d.sections[sectionKey].map((e) => e.id === id ? { ...e, [field]: value } : e) as (typeof d.sections)[typeof sectionKey] },
  }));

  const removeEntry = (sectionKey: keyof ResumeData["sections"], id: string) => setData((d) => ({
    ...d, sections: { ...d.sections, [sectionKey]: d.sections[sectionKey].filter((e) => e.id !== id) },
  }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updatePersonal("photo", reader.result as string);
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (tab !== "preview" || !iframeRef.current) return;
    const html = renderResumeHtml(data);
    const doc = iframeRef.current.contentDocument;
    if (doc) { doc.open(); doc.write(html); doc.close(); }
  }, [tab, data]);

  const handleSaveDraft = () => {
    if (atDraftLimit) {
      setGateOpen(true);
      return;
    }
    setGateOpen(false);
    const id = uid();
    const newDrafts = [{ id, name: data.personal.fullName || t.resume.untitled, data, savedAt: new Date().toISOString() }, ...drafts];
    setDrafts(newDrafts);
    saveDrafts(newDrafts);
    showToast(t.resume.draftSaved, "success");
  };

  const handleLoadDraft = (draft: typeof drafts[0]) => {
    setData(draft.data);
    setTab("editor");
    showToast(t.resume.draftLoaded, "success");
  };

  const handleDeleteDraft = (id: string) => {
    const newDrafts = drafts.filter((d) => d.id !== id);
    setDrafts(newDrafts);
    saveDrafts(newDrafts);
    showToast(t.resume.draftDeleted, "success");
  };

  const handleExport = () => {
    const html = renderResumeHtml(data);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.html";
    a.click();
    URL.revokeObjectURL(url);
    showToast(t.resume.resumeExported, "success");
  };

  const inputCls = "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white";
  const labelCls = "mb-1 block text-xs font-medium text-neutral-500";
  const fieldCls = "mb-3";

  const personalFields = [
    { key: "fullName", label: t.resume.fullName },
    { key: "title", label: t.resume.title },
    { key: "email", label: t.resume.email },
    { key: "phone", label: t.resume.phone },
    { key: "location", label: t.resume.location },
    { key: "website", label: t.resume.website },
    { key: "linkedin", label: t.resume.linkedin },
  ];

  return (
    <ToolLayout
      name={tool.name}
      description={tool.description}
      longDescription={tool.longDescription}
      category={tool.category}
      categorySlug={tool.categorySlug}
      breadcrumbs={tool.breadcrumbs}
      icon={tool.icon}
      faq={FAQ}
      article={ARTICLE}
      relatedTools={relatedTools}
    >
      {toast && (
        <div className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium ${
          toast.type === "success" ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        }`}>{toast.message}</div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <button onClick={() => setTab("editor")}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === "editor" ? "bg-brand-600 text-white" : "border border-neutral-300 bg-white text-neutral-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"}`}>
            {t.resume.editor}
          </button>
          <button onClick={() => setTab("preview")}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === "preview" ? "bg-brand-600 text-white" : "border border-neutral-300 bg-white text-neutral-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"}`}>
            {t.resume.preview}
          </button>
          <button onClick={() => setTab("drafts")}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === "drafts" ? "bg-brand-600 text-white" : "border border-neutral-300 bg-white text-neutral-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"}`}>
            {t.resume.drafts}
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSaveDraft}
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            {t.resume.saveDraft}
          </button>
          <button onClick={handleExport}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
            {t.resume.exportHtml}
          </button>
        </div>
      </div>

      {plan === "free" && draftLimit !== null && (
        <p className="mb-4 text-xs text-neutral-500 dark:text-neutral-400">
          {t.resume.freeDraftLimit.replace("{count}", String(draftLimit))}
        </p>
      )}

      {plan === "free" && gateOpen && draftLimit !== null && (
        <UpgradeGate description={t.resume.freeDraftLimit.replace("{count}", String(draftLimit))} />
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {TEMPLATES.map((tmpl) => (
          <button key={tmpl.id} onClick={() => setData((d) => ({ ...d, template: tmpl.id }))}
            className={`rounded-lg border-2 px-3 py-1.5 text-xs font-bold ${
              data.template === tmpl.id ? "bg-brand-50 text-brand-600" : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-400 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
            }`}
            style={data.template === tmpl.id ? { borderColor: tmpl.primaryColor, color: tmpl.primaryColor } : {}}>
            {templateLabels[tmpl.id] ?? tmpl.id}
          </button>
        ))}
      </div>

      {tab === "drafts" ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
          <h3 className="mb-4 text-lg font-bold">{t.resume.savedDrafts}</h3>
          {drafts.length === 0 ? (
            <p className="text-neutral-400">{t.resume.noDrafts}</p>
          ) : (
            <div className="space-y-2">
              {drafts.map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                  <div>
                    <p className="font-medium text-sm">{d.name}</p>
                    <p className="text-xs text-neutral-500">{new Date(d.savedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleLoadDraft(d)}
                      className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white">{t.resume.load}</button>
                    <button onClick={() => handleDeleteDraft(d.id)}
                      className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 dark:bg-red-900/20">{t.resume.delete}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : tab === "preview" ? (
        <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">
          <iframe ref={iframeRef} className="h-[600px] w-full border-none" title={meta.name} />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-4">
          <div className="space-y-1 lg:col-span-1">
            <div className="rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
              <p className="mb-2 px-2 text-xs font-bold uppercase text-neutral-400">{t.resume.sections}</p>
              {["personal", "education", "experience", "skills", "languages", "projects"].map((s) => (
                <button key={s} onClick={() => setSection(s)}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium ${
                    section === s ? "bg-brand-600 text-white" : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  }`}>
                  {sectionLabels[s] ?? s}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
              {section === "personal" && (
                <div>
                  <h3 className="mb-4 text-lg font-bold">{t.resume.personalInformation}</h3>
                  <div className="mb-4 flex gap-4">
                    <div className="text-center">
                      {data.personal.photo ? (
                        <img src={data.personal.photo} alt="" className="h-20 w-20 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 text-2xl text-neutral-400">+</div>
                      )}
                      <label className="mt-1 block cursor-pointer text-xs text-brand-600">
                        {t.resume.uploadPhoto}
                        <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                      </label>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      {personalFields.map((f) => (
                        <div key={f.key} className={fieldCls}>
                          <label className={labelCls}>{f.label}</label>
                          <input className={inputCls} value={data.personal[f.key as keyof PersonalInfo] || ""} onChange={(e) => updatePersonal(f.key as keyof PersonalInfo, e.target.value)} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={fieldCls}>
                    <label className={labelCls}>{t.resume.professionalSummary}</label>
                    <textarea className={inputCls} rows={4} value={data.personal.summary} onChange={(e) => updatePersonal("summary", e.target.value)} />
                  </div>
                </div>
              )}

              {["education", "experience", "skills", "languages", "projects"].map((s) => section === s && (
                <div key={s}>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold">{sectionLabels[s] ?? s}</h3>
                    <button onClick={() => addEntry(s as keyof ResumeData["sections"])}
                      className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white">+ {t.resume.add}</button>
                  </div>

                  {(data.sections[s as keyof ResumeData["sections"]]).length === 0 && (
                    <p className="text-sm text-neutral-400">{t.resume.noEntriesYet}</p>
                  )}

                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(data.sections[s as keyof ResumeData["sections"]]).map((entry: any) => (
                    <div key={entry.id} className="mb-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
                      <div className="mb-2 flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs">
                          <input type="checkbox" checked={entry.visible} onChange={(e) => updateEntry(s as keyof ResumeData["sections"], entry.id, "visible", e.target.checked)} />
                          {t.resume.visible}
                        </label>
                        <button onClick={() => removeEntry(s as keyof ResumeData["sections"], entry.id)}
                          className="text-xs text-red-500 hover:underline">{t.resume.remove}</button>
                      </div>

                      {s === "education" && (
                        <div className="grid grid-cols-2 gap-3">
                          {[{ key: "institution", label: t.resume.institution }, { key: "degree", label: t.resume.degree }, { key: "field", label: t.resume.fieldOfStudy }, { key: "gpa", label: t.resume.gpa }, { key: "startDate", label: t.resume.start, type: "month" }, { key: "endDate", label: t.resume.end, type: "month" }].map((f) => (
                            <div key={f.key} className={fieldCls}>
                              <label className={labelCls}>{f.label}</label>
                              <input className={inputCls} type={f.type || "text"} value={entry[f.key] || ""} onChange={(e) => updateEntry("education", entry.id, f.key, e.target.value)} />
                            </div>
                          ))}
                          <div className="col-span-2">
                            <label className={labelCls}>{t.resume.description}</label>
                            <textarea className={inputCls} rows={3} value={entry.description} onChange={(e) => updateEntry("education", entry.id, "description", e.target.value)} />
                          </div>
                        </div>
                      )}

                      {s === "experience" && (
                        <div className="grid grid-cols-2 gap-3">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {[{ key: "company", label: t.resume.company }, { key: "position", label: t.resume.position }, { key: "location", label: t.resume.location }, { key: "startDate", label: t.resume.start, type: "month" }, ...(entry.current ? [] : [{ key: "endDate", label: t.resume.end, type: "month" }])].map((f: any) => (
                            <div key={f.key} className={fieldCls}>
                              <label className={labelCls}>{f.label}</label>
                              <input className={inputCls} type={f.type || "text"} value={entry[f.key] || ""} onChange={(e) => updateEntry("experience", entry.id, f.key, e.target.value)} />
                            </div>
                          ))}
                          <div className="col-span-2 flex items-center gap-4">
                            <label className="flex items-center gap-2 text-xs">
                              <input type="checkbox" checked={entry.current} onChange={(e) => updateEntry("experience", entry.id, "current", e.target.checked)} />
                              {t.resume.currentPosition}
                            </label>
                          </div>
                          <div className="col-span-2">
                            <label className={labelCls}>{t.resume.description}</label>
                            <textarea className={inputCls} rows={3} value={entry.description} onChange={(e) => updateEntry("experience", entry.id, "description", e.target.value)} />
                          </div>
                          <div className="col-span-2">
                            <label className={labelCls}>{t.resume.highlights}</label>
                            <textarea className={inputCls} rows={3} value={entry.highlights.join("\n")} onChange={(e) => updateEntry("experience", entry.id, "highlights", e.target.value.split("\n"))} />
                          </div>
                        </div>
                      )}

                      {s === "skills" && (
                        <div className="flex gap-3">
                          <input className={inputCls} placeholder={t.resume.skillName} value={entry.name} onChange={(e) => updateEntry("skills", entry.id, "name", e.target.value)} />
                          <select className={inputCls} value={entry.level} onChange={(e) => updateEntry("skills", entry.id, "level", e.target.value)}>
                            {Object.entries(SKILL_LEVELS).map(([k]) => <option key={k} value={k}>{skillLevelLabels[k] ?? k}</option>)}
                          </select>
                        </div>
                      )}

                      {s === "languages" && (
                        <div className="flex gap-3">
                          <input className={inputCls} placeholder={t.resume.languageName} value={entry.name} onChange={(e) => updateEntry("languages", entry.id, "name", e.target.value)} />
                          <select className={inputCls} value={entry.proficiency} onChange={(e) => updateEntry("languages", entry.id, "proficiency", e.target.value)}>
                            {Object.entries(PROFICIENCY).map(([k]) => <option key={k} value={k}>{proficiencyLabels[k] ?? k}</option>)}
                          </select>
                        </div>
                      )}

                      {s === "projects" && (
                        <div className="grid grid-cols-2 gap-3">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {[{ key: "name", label: t.resume.projectName }, { key: "url", label: t.resume.url }, { key: "startDate", label: t.resume.start, type: "month" }, { key: "endDate", label: t.resume.end, type: "month" }].map((f: any) => (
                            <div key={f.key} className={fieldCls}>
                              <label className={labelCls}>{f.label}</label>
                              <input className={inputCls} type={f.type || "text"} value={entry[f.key] || ""} onChange={(e) => updateEntry("projects", entry.id, f.key, e.target.value)} />
                            </div>
                          ))}
                          <div className="col-span-2">
                            <label className={labelCls}>{t.resume.technologies}</label>
                            <input className={inputCls} value={entry.technologies.join(", ")} onChange={(e) => updateEntry("projects", entry.id, "technologies", e.target.value.split(",").map((t: string) => t.trim()).filter(Boolean))} />
                          </div>
                          <div className="col-span-2">
                            <label className={labelCls}>{t.resume.description}</label>
                            <textarea className={inputCls} rows={3} value={entry.description} onChange={(e) => updateEntry("projects", entry.id, "description", e.target.value)} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
