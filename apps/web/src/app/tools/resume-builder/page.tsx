"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import type {
  ResumeData, PersonalInfo, EducationEntry, ExperienceEntry, SkillEntry,
  LanguageEntry, ProjectEntry, ReferenceEntry, TemplateStyle, ResumeLanguage,
  SectionKey, SkillLevel, LanguageProficiency,
} from "@toolnova/core/src/tools/resume-builder";
import {
  RESUME_TEMPLATES, SECTION_LABELS, SKILL_LEVELS, LANGUAGE_PROFICIENCIES,
  SKILL_CATEGORIES, SKILL_CATEGORIES_AR,
  createEmptyResume, renderForPreview, saveDraft, getAllDrafts, deleteDraft,
} from "@toolnova/core/src/tools/resume-builder";

type Tab = "editor" | "preview" | "drafts";
type EditorSection = "personal" | "education" | "experience" | "skills" | "languages" | "projects" | "references";

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

interface Toast { message: string; type: "success" | "error" | "info" }

export default function ResumeBuilderPage() {
  const [data, setData] = useState<ResumeData>(createEmptyResume("en"));
  const [tab, setTab] = useState<Tab>("editor");
  const [editorSection, setEditorSection] = useState<EditorSection>("personal");
  const [toast, setToast] = useState<Toast | null>(null);
  const [drafts, setDrafts] = useState(getAllDrafts());
  const previewRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const lang = data.language;
  const isRtl = lang === "ar";
  const t = (en: string, ar: string) => (isRtl ? ar : en);

  const showToast = (message: string, type: Toast["type"] = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updatePersonal = useCallback((field: keyof PersonalInfo, value: string) => {
    setData((d) => ({ ...d, personal: { ...d.personal, [field]: value }, updatedAt: new Date().toISOString() }));
  }, []);

  const updateData = useCallback((updater: (d: ResumeData) => ResumeData) => {
    setData((d) => updater({ ...d, updatedAt: new Date().toISOString() }));
  }, []);

  // Education
  const addEducation = useCallback(() => {
    setData((d) => ({
      ...d,
      sections: { ...d.sections, education: [...d.sections.education, { id: uid(), institution: "", degree: "", field: "", startDate: "", endDate: "", gpa: "", description: "", visible: true }] },
    }));
  }, []);
  const updateEducation = useCallback((id: string, field: keyof EducationEntry, value: string | boolean) => {
    setData((d) => ({
      ...d,
      sections: { ...d.sections, education: d.sections.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)) },
    }));
  }, []);
  const removeEducation = useCallback((id: string) => {
    setData((d) => ({ ...d, sections: { ...d.sections, education: d.sections.education.filter((e) => e.id !== id) } }));
  }, []);

  // Experience
  const addExperience = useCallback(() => {
    setData((d) => ({
      ...d,
      sections: { ...d.sections, experience: [...d.sections.experience, { id: uid(), company: "", position: "", location: "", startDate: "", endDate: "", current: false, description: "", highlights: [], visible: true }] },
    }));
  }, []);
  const updateExperience = useCallback((id: string, field: keyof ExperienceEntry, value: string | boolean | string[]) => {
    setData((d) => ({
      ...d,
      sections: { ...d.sections, experience: d.sections.experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)) },
    }));
  }, []);
  const removeExperience = useCallback((id: string) => {
    setData((d) => ({ ...d, sections: { ...d.sections, experience: d.sections.experience.filter((e) => e.id !== id) } }));
  }, []);

  // Skills
  const addSkill = useCallback(() => {
    setData((d) => ({
      ...d,
      sections: { ...d.sections, skills: [...d.sections.skills, { id: uid(), name: "", level: "intermediate" as SkillLevel, category: SKILL_CATEGORIES[0] ?? "Other", visible: true }] },
    }));
  }, []);
  const updateSkill = useCallback((id: string, field: keyof SkillEntry, value: string) => {
    setData((d) => ({
      ...d,
      sections: { ...d.sections, skills: d.sections.skills.map((e) => (e.id === id ? { ...e, [field]: value } : e)) },
    }));
  }, []);
  const removeSkill = useCallback((id: string) => {
    setData((d) => ({ ...d, sections: { ...d.sections, skills: d.sections.skills.filter((e) => e.id !== id) } }));
  }, []);

  // Languages
  const addLanguage = useCallback(() => {
    setData((d) => ({
      ...d,
      sections: { ...d.sections, languages: [...d.sections.languages, { id: uid(), name: "", proficiency: "professional" as LanguageProficiency, visible: true }] },
    }));
  }, []);
  const updateLanguage = useCallback((id: string, field: keyof LanguageEntry, value: string) => {
    setData((d) => ({
      ...d,
      sections: { ...d.sections, languages: d.sections.languages.map((e) => (e.id === id ? { ...e, [field]: value } : e)) },
    }));
  }, []);
  const removeLanguage = useCallback((id: string) => {
    setData((d) => ({ ...d, sections: { ...d.sections, languages: d.sections.languages.filter((e) => e.id !== id) } }));
  }, []);

  // Projects
  const addProject = useCallback(() => {
    setData((d) => ({
      ...d,
      sections: { ...d.sections, projects: [...d.sections.projects, { id: uid(), name: "", url: "", description: "", technologies: [], startDate: "", endDate: "", highlights: [], visible: true }] },
    }));
  }, []);
  const updateProject = useCallback((id: string, field: keyof ProjectEntry, value: string | string[]) => {
    setData((d) => ({
      ...d,
      sections: { ...d.sections, projects: d.sections.projects.map((e) => (e.id === id ? { ...e, [field]: value } : e)) },
    }));
  }, []);
  const removeProject = useCallback((id: string) => {
    setData((d) => ({ ...d, sections: { ...d.sections, projects: d.sections.projects.filter((e) => e.id !== id) } }));
  }, []);

  // References
  const addReference = useCallback(() => {
    setData((d) => ({
      ...d,
      sections: { ...d.sections, references: [...d.sections.references, { id: uid(), name: "", title: "", company: "", email: "", phone: "", relationship: "", visible: true }] },
    }));
  }, []);
  const updateReference = useCallback((id: string, field: keyof ReferenceEntry, value: string) => {
    setData((d) => ({
      ...d,
      sections: { ...d.sections, references: d.sections.references.map((e) => (e.id === id ? { ...e, [field]: value } : e)) },
    }));
  }, []);
  const removeReference = useCallback((id: string) => {
    setData((d) => ({ ...d, sections: { ...d.sections, references: d.sections.references.filter((e) => e.id !== id) } }));
  }, []);

  // Photo
  const handlePhoto = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setData((d) => ({ ...d, personal: { ...d.personal, photo: reader.result as string } }));
    };
    reader.readAsDataURL(file);
  }, []);

  // Preview
  useEffect(() => {
    if (tab !== "preview" || !iframeRef.current) return;
    const html = renderForPreview(data);
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, [tab, data]);

  // Save draft
  const handleSaveDraft = useCallback(() => {
    saveDraft(data, data.personal.fullName || "Untitled");
    setDrafts(getAllDrafts());
    showToast(t("Draft saved", "\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u0645\u0633\u0648\u062f\u0629"), "success");
  }, [data, t, showToast]);

  const handleLoadDraft = useCallback((id: string) => {
    const d = drafts.find((dr) => dr.id === id);
    if (d) {
      setData(d.data);
      setTab("editor");
      showToast(t("Draft loaded", "\u062a\u0645 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0645\u0633\u0648\u062f\u0629"), "success");
    }
  }, [drafts, t, showToast]);

  const handleDeleteDraft = useCallback((id: string) => {
    deleteDraft(id);
    setDrafts(getAllDrafts());
    showToast(t("Draft deleted", "\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0645\u0633\u0648\u062f\u0629"), "success");
  }, [t, showToast]);

  // Export PDF
  const handleExport = useCallback(() => {
    const html = renderForPreview(data);
    const printWindow = window.open("", "_blank", "width=800,height=1000");
    if (!printWindow) {
      showToast(t("Pop-up blocked. Allow pop-ups.", "\u062a\u0645 \u062d\u0638\u0631 \u0627\u0644\u0646\u0627\u0641\u0630. \u0633\u0645\u062d \u0644\u0644\u0646\u0627\u0641\u0630\u0627\u062a."), "error");
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
    showToast(t("Print dialog opened", "\u0641\u062a\u062d \u0627\u0644\u0637\u0628\u0627\u0639\u0629 \u0627\u0644\u0645\u0641\u062a\u0648\u062d\u0629"), "success");
  }, [data, t, showToast]);

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #dee2e6",
    fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fff",
  };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "#495057", marginBottom: 4 };
  const fieldGroupStyle: React.CSSProperties = { marginBottom: 12 };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      {toast !== null && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          padding: "12px 24px", borderRadius: 8, color: "#fff", fontWeight: 600, fontSize: 14,
          background: toast.type === "success" ? "#198754" : toast.type === "error" ? "#dc3545" : "#0d6efd",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}>{toast.message}</div>
      )}

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "20px 16px" }}>
        <header style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1a1a2e", margin: 0 }}>{t("Resume Builder", "\u0645\u0635\u0646\u0639 \u0627\u0644\u0633\u064a\u0631\u0629 \u0627\u0644\u0630\u0627\u062a\u064a\u0629")}</h1>
            <p style={{ fontSize: 14, color: "#6c757d", margin: "4px 0 0" }}>{t("Build professional resumes with modern templates", "\u0623\u0646\u0634\u0626 \u0633\u064a\u0631\u0627\u062a \u0645\u0647\u0646\u0626\u0629 \u0628\u0642\u0627\u0644\u0628 \u062d\u062f\u064a\u062b")}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleSaveDraft}
              style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #dee2e6", background: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              {t("Save Draft", "\u062d\u0641\u0638")}
            </button>
            <button onClick={handleExport}
              style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: "#0d6efd", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              {t("Export PDF", "\u062a\u0635\u062f\u064a\u0631 PDF")}
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "#fff", borderRadius: 8, padding: 4, border: "1px solid #e9ecef" }}>
          {([["editor", t("Editor", "\u0627\u0644\u0645\u062d\u0631\u0631")], ["preview", t("Preview", "\u0645\u0639\u0627\u064a\u0646\u0629")], ["drafts", t("Drafts", "\u0627\u0644\u0645\u0633\u0648\u062f\u0629")]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{
                flex: 1, padding: "8px 16px", borderRadius: 6, border: "none",
                background: tab === id ? "#0d6efd" : "transparent",
                color: tab === id ? "#fff" : "#495057",
                fontWeight: 600, fontSize: 13, cursor: "pointer",
              }}>{label}</button>
          ))}
        </div>

        {/* Template + Language Bar */}
        <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {RESUME_TEMPLATES.map((tmpl) => (
              <button key={tmpl.id}
                onClick={() => setData((d) => ({ ...d, template: tmpl.id as TemplateStyle }))}
                style={{
                  padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  border: `2px solid ${data.template === tmpl.id ? tmpl.primaryColor : "#dee2e6"}`,
                  background: data.template === tmpl.id ? `${tmpl.primaryColor}15` : "#fff",
                  color: data.template === tmpl.id ? tmpl.primaryColor : "#495057",
                }}>
                {isRtl ? tmpl.nameAr : tmpl.name}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button onClick={() => setData((d) => ({ ...d, language: d.language === "en" ? "ar" : "en" }))}
              style={{
                padding: "6px 14px", borderRadius: 6, border: "1px solid #dee2e6", background: "#fff",
                fontWeight: 600, fontSize: 12, cursor: "pointer",
              }}>
              {data.language === "en" ? "\u0639\u0631\u0628\u064a" : "English"}
            </button>
          </div>
        </div>

        {/* Content */}
        {tab === "drafts" ? (
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e9ecef" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>{t("Saved Drafts", "\u0627\u0644\u0645\u0633\u0648\u062f\u0629 \u0627\u0644\u0645\u062d\u0641\u0648\u0638\u0629")}</h2>
            {drafts.length === 0 ? (
              <p style={{ color: "#adb5bd" }}>{t("No drafts saved yet", "\u0644\u0645 \u062a\u0639\u062f \u062d\u0641\u0638 \u0645\u0633\u0648\u062f\u0629 \u0628\u0639\u062f")}</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {drafts.map((d) => (
                  <div key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", border: "1px solid #e9ecef", borderRadius: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{d.name}</div>
                      <div style={{ fontSize: 12, color: "#6c757d" }}>{new Date(d.savedAt).toLocaleDateString()}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => handleLoadDraft(d.id)}
                        style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #0d6efd", background: "#e7f1ff", color: "#0d6efd", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                        {t("Load", "\u062a\u062d\u0645\u064a\u0644")}
                      </button>
                      <button onClick={() => handleDeleteDraft(d.id)}
                        style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #fecaca", background: "#fff5f5", color: "#dc3545", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                        {t("Delete", "\u062d\u0630\u0641")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : tab === "preview" ? (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e9ecef", overflow: "hidden" }}>
            <iframe ref={iframeRef} style={{ width: "100%", height: "calc(100vh - 220px)", border: "none" }} title="Resume Preview" />
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16, alignItems: "start" }}>
            {/* Section Nav */}
            <div style={{ background: "#fff", borderRadius: 12, padding: 12, border: "1px solid #e9ecef", position: "sticky", top: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#adb5bd", textTransform: "uppercase", padding: "4px 8px", marginBottom: 4 }}>
                {t("Sections", "\u0627\u0644\u0623\u0642\u0633\u0627\u0645")}
              </div>
              {(["personal", "education", "experience", "skills", "languages", "projects", "references"] as EditorSection[]).map((s) => (
                <button key={s} onClick={() => setEditorSection(s)}
                  style={{
                    display: "block", width: "100%", textAlign: "left", padding: "8px 12px", borderRadius: 6, border: "none",
                    background: editorSection === s ? "#0d6efd" : "transparent",
                    color: editorSection === s ? "#fff" : "#495057",
                    fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 2,
                  }}>
                  {SECTION_LABELS[s as SectionKey] ? (isRtl ? SECTION_LABELS[s as SectionKey].ar : SECTION_LABELS[s as SectionKey].en) : s}
                </button>
              ))}
              <div style={{ borderTop: "1px solid #e9ecef", marginTop: 8, paddingTop: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#adb5bd", textTransform: "uppercase", padding: "4px 8px", marginBottom: 4 }}>
                  {t("Visibility", "\u0627\u0644\u0638\u0647\u0648\u0631")}
                </div>
                {(["education", "experience", "skills", "languages", "projects", "references"] as SectionKey[]).map((s) => (
                  <label key={s} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", fontSize: 12, cursor: "pointer" }}>
                    <input type="checkbox" checked={data.sectionVisibility[s]}
                      onChange={(e) => setData((d) => ({ ...d, sectionVisibility: { ...d.sectionVisibility, [s]: e.target.checked } }))} />
                    {isRtl ? SECTION_LABELS[s].ar : SECTION_LABELS[s].en}
                  </label>
                ))}
              </div>
            </div>

            {/* Editor Panel */}
            <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e9ecef", minHeight: 500 }}>
              {editorSection === "personal" && (
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px" }}>{t("Personal Information", "\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0634\u062e\u0635\u064a\u0629")}</h3>
                  <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                    <div>
                      {data.personal.photo ? (
                        <img src={data.personal.photo} alt="" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#adb5bd" }}>+</div>
                      )}
                      <label style={{ display: "block", marginTop: 6, fontSize: 11, color: "#0d6efd", cursor: "pointer", textAlign: "center" }}>
                        {t("Upload Photo", "\u0631\u0641\u0639 \u0635\u0648\u0631\u0629")}
                        <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
                      </label>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div style={fieldGroupStyle}><label style={labelStyle}>{t("Full Name", "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644")}</label><input style={inputStyle} value={data.personal.fullName} onChange={(e) => updatePersonal("fullName", e.target.value)} /></div>
                        <div style={fieldGroupStyle}><label style={labelStyle}>{t("Title", "\u0627\u0644\u0645\u0646\u0635\u0628")}</label><input style={inputStyle} value={data.personal.title} onChange={(e) => updatePersonal("title", e.target.value)} /></div>
                        <div style={fieldGroupStyle}><label style={labelStyle}>{t("Email", "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a")}</label><input style={inputStyle} type="email" value={data.personal.email} onChange={(e) => updatePersonal("email", e.target.value)} /></div>
                        <div style={fieldGroupStyle}><label style={labelStyle}>{t("Phone", "\u0627\u0644\u0647\u0627\u062a\u0641")}</label><input style={inputStyle} value={data.personal.phone} onChange={(e) => updatePersonal("phone", e.target.value)} /></div>
                        <div style={fieldGroupStyle}><label style={labelStyle}>{t("Location", "\u0627\u0644\u0645\u0648\u0642\u0639")}</label><input style={inputStyle} value={data.personal.location} onChange={(e) => updatePersonal("location", e.target.value)} /></div>
                        <div style={fieldGroupStyle}><label style={labelStyle}>{t("Website", "\u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a")}</label><input style={inputStyle} value={data.personal.website} onChange={(e) => updatePersonal("website", e.target.value)} /></div>
                        <div style={fieldGroupStyle}><label style={labelStyle}>LinkedIn</label><input style={inputStyle} value={data.personal.linkedin} onChange={(e) => updatePersonal("linkedin", e.target.value)} /></div>
                        <div style={fieldGroupStyle}><label style={labelStyle}>GitHub</label><input style={inputStyle} value={data.personal.github} onChange={(e) => updatePersonal("github", e.target.value)} /></div>
                      </div>
                    </div>
                  </div>
                  <div style={fieldGroupStyle}>
                    <label style={labelStyle}>{t("Professional Summary", "\u0645\u0644\u062e\u0635 \u0645\u0647\u0646\u0626")}</label>
                    <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={data.personal.summary} onChange={(e) => updatePersonal("summary", e.target.value)} />
                  </div>
                </div>
              )}

              {editorSection === "education" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{t("Education", "\u0627\u0644\u062a\u0639\u0644\u064a\u0645")}</h3>
                    <button onClick={addEducation} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "#0d6efd", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>+ {t("Add", "\u0625\u0636\u0627\u0641\u0629")}</button>
                  </div>
                  {data.sections.education.length === 0 && <p style={{ color: "#adb5bd", fontSize: 13 }}>{t("No entries yet", "\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0639\u062f\u0627\u062a \u0628\u0639\u062f")}</p>}
                  {data.sections.education.map((e) => (
                    <div key={e.id} style={{ border: "1px solid #e9ecef", borderRadius: 8, padding: 16, marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
                          <input type="checkbox" checked={e.visible} onChange={(ev) => updateEducation(e.id, "visible", ev.target.checked)} /> {t("Visible", "\u0638\u0627\u0647\u0631")}
                        </label>
                        <button onClick={() => removeEducation(e.id)} style={{ background: "none", border: "none", color: "#dc3545", cursor: "pointer", fontSize: 12 }}>{t("Remove", "\u062d\u0630\u0641")}</button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div style={fieldGroupStyle}><label style={labelStyle}>{t("Institution", "\u0627\u0644\u0645\u0624\u0633\u0633\u0629")}</label><input style={inputStyle} value={e.institution} onChange={(ev) => updateEducation(e.id, "institution", ev.target.value)} /></div>
                        <div style={fieldGroupStyle}><label style={labelStyle}>{t("Degree", "\u0627\u0644\u0634\u0647\u0627\u062f\u0629")}</label><input style={inputStyle} value={e.degree} onChange={(ev) => updateEducation(e.id, "degree", ev.target.value)} /></div>
                        <div style={fieldGroupStyle}><label style={labelStyle}>{t("Field of Study", "\u0627\u0644\u062a\u062e\u0635\u0635")}</label><input style={inputStyle} value={e.field} onChange={(ev) => updateEducation(e.id, "field", ev.target.value)} /></div>
                        <div style={fieldGroupStyle}><label style={labelStyle}>GPA</label><input style={inputStyle} value={e.gpa} onChange={(ev) => updateEducation(e.id, "gpa", ev.target.value)} /></div>
                        <div style={fieldGroupStyle}><label style={labelStyle}>{t("Start", "\u0627\u0644\u0628\u062f\u0627\u064a\u0629")}</label><input style={inputStyle} type="month" value={e.startDate} onChange={(ev) => updateEducation(e.id, "startDate", ev.target.value)} /></div>
                        <div style={fieldGroupStyle}><label style={labelStyle}>{t("End", "\u0627\u0644\u0646\u0647\u0627\u064a\u0629")}</label><input style={inputStyle} type="month" value={e.endDate} onChange={(ev) => updateEducation(e.id, "endDate", ev.target.value)} /></div>
                      </div>
                      <div style={fieldGroupStyle}><label style={labelStyle}>{t("Description", "\u0627\u0644\u0648\u0635\u0641")}</label><textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={e.description} onChange={(ev) => updateEducation(e.id, "description", ev.target.value)} /></div>
                    </div>
                  ))}
                </div>
              )}

              {editorSection === "experience" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{t("Experience", "\u0627\u0644\u062e\u0628\u0631\u0629")}</h3>
                    <button onClick={addExperience} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "#0d6efd", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>+ {t("Add", "\u0625\u0636\u0627\u0641\u0629")}</button>
                  </div>
                  {data.sections.experience.length === 0 && <p style={{ color: "#adb5bd", fontSize: 13 }}>{t("No entries yet", "\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0639\u062f\u0627\u062a \u0628\u0639\u062f")}</p>}
                  {data.sections.experience.map((e) => (
                    <div key={e.id} style={{ border: "1px solid #e9ecef", borderRadius: 8, padding: 16, marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
                            <input type="checkbox" checked={e.visible} onChange={(ev) => updateExperience(e.id, "visible", ev.target.checked)} /> {t("Visible", "\u0638\u0627\u0647\u0631")}
                          </label>
                          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
                            <input type="checkbox" checked={e.current} onChange={(ev) => updateExperience(e.id, "current", ev.target.checked)} /> {t("Current", "\u062d\u0627\u0644\u064a\u0627\u064b")}
                          </label>
                        </div>
                        <button onClick={() => removeExperience(e.id)} style={{ background: "none", border: "none", color: "#dc3545", cursor: "pointer", fontSize: 12 }}>{t("Remove", "\u062d\u0630\u0641")}</button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div style={fieldGroupStyle}><label style={labelStyle}>{t("Company", "\u0627\u0644\u0634\u0631\u0643\u0629")}</label><input style={inputStyle} value={e.company} onChange={(ev) => updateExperience(e.id, "company", ev.target.value)} /></div>
                        <div style={fieldGroupStyle}><label style={labelStyle}>{t("Position", "\u0627\u0644\u0648\u0636\u0639\u064a\u0629")}</label><input style={inputStyle} value={e.position} onChange={(ev) => updateExperience(e.id, "position", ev.target.value)} /></div>
                        <div style={fieldGroupStyle}><label style={labelStyle}>{t("Location", "\u0627\u0644\u0645\u0648\u0642\u0639")}</label><input style={inputStyle} value={e.location} onChange={(ev) => updateExperience(e.id, "location", ev.target.value)} /></div>
                        <div style={fieldGroupStyle}><label style={labelStyle}>{t("Start", "\u0627\u0644\u0628\u062f\u0627\u064a\u0629")}</label><input style={inputStyle} type="month" value={e.startDate} onChange={(ev) => updateExperience(e.id, "startDate", ev.target.value)} /></div>
                        {!e.current && <div style={fieldGroupStyle}><label style={labelStyle}>{t("End", "\u0627\u0644\u0646\u0647\u0627\u064a\u0629")}</label><input style={inputStyle} type="month" value={e.endDate} onChange={(ev) => updateExperience(e.id, "endDate", ev.target.value)} /></div>}
                      </div>
                      <div style={fieldGroupStyle}><label style={labelStyle}>{t("Description", "\u0627\u0644\u0648\u0635\u0641")}</label><textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={e.description} onChange={(ev) => updateExperience(e.id, "description", ev.target.value)} /></div>
                      <div style={fieldGroupStyle}>
                        <label style={labelStyle}>{t("Highlights", "\u0627\u0644\u0646\u0642\u0627\u0637 \u0627\u0644\u0628\u0627\u0631\u0632\u0629")} ({t("one per line", "\u0643\u0644 \u0633\u0637\u0631 \u0641\u064a \u0633\u0637\u0631")})</label>
                        <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={e.highlights.join("\n")} onChange={(ev) => updateExperience(e.id, "highlights", ev.target.value.split("\n"))} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {editorSection === "skills" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{t("Skills", "\u0627\u0644\u0645\u0647\u0627\u0631\u0627\u062a")}</h3>
                    <button onClick={addSkill} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "#0d6efd", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>+ {t("Add", "\u0625\u0636\u0627\u0641\u0629")}</button>
                  </div>
                  {data.sections.skills.length === 0 && <p style={{ color: "#adb5bd", fontSize: 13 }}>{t("No skills added", "\u0644\u0645 \u062a\u0636\u0641 \u0645\u0647\u0627\u0631\u0627\u062a")}</p>}
                  {data.sections.skills.map((s) => (
                    <div key={s.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, padding: "8px 12px", border: "1px solid #e9ecef", borderRadius: 6 }}>
                      <input type="checkbox" checked={s.visible} onChange={(ev) => updateSkill(s.id, "visible", ev.target.checked)} />
                      <input style={{ ...inputStyle, flex: 2 }} value={s.name} placeholder={t("Skill name", "\u0627\u0633\u0645 \u0627\u0644\u0645\u0647\u0627\u0631\u0629")} onChange={(ev) => updateSkill(s.id, "name", ev.target.value)} />
                      <select style={{ ...inputStyle, flex: 1 }} value={s.level} onChange={(ev) => updateSkill(s.id, "level", ev.target.value)}>
                        {Object.entries(SKILL_LEVELS).map(([k, v]) => <option key={k} value={k}>{isRtl ? v.labelAr : v.label}</option>)}
                      </select>
                      <select style={{ ...inputStyle, flex: 1 }} value={s.category} onChange={(ev) => updateSkill(s.id, "category", ev.target.value)}>
                        {(isRtl ? SKILL_CATEGORIES_AR : SKILL_CATEGORIES).map((c, i) => <option key={i} value={SKILL_CATEGORIES[i]}>{c}</option>)}
                      </select>
                      <button onClick={() => removeSkill(s.id)} style={{ background: "none", border: "none", color: "#dc3545", cursor: "pointer" }}>x</button>
                    </div>
                  ))}
                </div>
              )}

              {editorSection === "languages" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{t("Languages", "\u0627\u0644\u0644\u063a\u0627\u062a")}</h3>
                    <button onClick={addLanguage} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "#0d6efd", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>+ {t("Add", "\u0625\u0636\u0627\u0641\u0629")}</button>
                  </div>
                  {data.sections.languages.length === 0 && <p style={{ color: "#adb5bd", fontSize: 13 }}>{t("No languages added", "\u0644\u0645 \u062a\u0636\u0641 \u0644\u063a\u0627\u062a")}</p>}
                  {data.sections.languages.map((l) => (
                    <div key={l.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, padding: "8px 12px", border: "1px solid #e9ecef", borderRadius: 6 }}>
                      <input type="checkbox" checked={l.visible} onChange={(ev) => updateLanguage(l.id, "visible", ev.target.checked)} />
                      <input style={{ ...inputStyle, flex: 2 }} value={l.name} placeholder={t("Language name", "\u0627\u0633\u0645 \u0627\u0644\u0644\u063a\u0629")} onChange={(ev) => updateLanguage(l.id, "name", ev.target.value)} />
                      <select style={{ ...inputStyle, flex: 1 }} value={l.proficiency} onChange={(ev) => updateLanguage(l.id, "proficiency", ev.target.value)}>
                        {Object.entries(LANGUAGE_PROFICIENCIES).map(([k, v]) => <option key={k} value={k}>{isRtl ? v.labelAr : v.label}</option>)}
                      </select>
                      <button onClick={() => removeLanguage(l.id)} style={{ background: "none", border: "none", color: "#dc3545", cursor: "pointer" }}>x</button>
                    </div>
                  ))}
                </div>
              )}

              {editorSection === "projects" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{t("Projects", "\u0627\u0644\u0645\u0634\u0627\u0631\u064a\u0639")}</h3>
                    <button onClick={addProject} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "#0d6efd", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>+ {t("Add", "\u0625\u0636\u0627\u0641\u0629")}</button>
                  </div>
                  {data.sections.projects.length === 0 && <p style={{ color: "#adb5bd", fontSize: 13 }}>{t("No projects added", "\u0644\u0645 \u062a\u0636\u0641 \u0645\u0634\u0627\u0631\u064a\u0639")}</p>}
                  {data.sections.projects.map((p) => (
                    <div key={p.id} style={{ border: "1px solid #e9ecef", borderRadius: 8, padding: 16, marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
                          <input type="checkbox" checked={p.visible} onChange={(ev) => updateProject(p.id, "visible", ev.target.checked)} /> {t("Visible", "\u0638\u0627\u0647\u0631")}
                        </label>
                        <button onClick={() => removeProject(p.id)} style={{ background: "none", border: "none", color: "#dc3545", cursor: "pointer", fontSize: 12 }}>{t("Remove", "\u062d\u0630\u0641")}</button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div style={fieldGroupStyle}><label style={labelStyle}>{t("Project Name", "\u0627\u0633\u0645 \u0627\u0644\u0645\u0634\u0631\u0648\u0639")}</label><input style={inputStyle} value={p.name} onChange={(ev) => updateProject(p.id, "name", ev.target.value)} /></div>
                        <div style={fieldGroupStyle}><label style={labelStyle}>URL</label><input style={inputStyle} value={p.url} onChange={(ev) => updateProject(p.id, "url", ev.target.value)} /></div>
                        <div style={fieldGroupStyle}><label style={labelStyle}>{t("Start", "\u0627\u0644\u0628\u062f\u0627\u064a\u0629")}</label><input style={inputStyle} type="month" value={p.startDate} onChange={(ev) => updateProject(p.id, "startDate", ev.target.value)} /></div>
                        <div style={fieldGroupStyle}><label style={labelStyle}>{t("End", "\u0627\u0644\u0646\u0647\u0627\u064a\u0629")}</label><input style={inputStyle} type="month" value={p.endDate} onChange={(ev) => updateProject(p.id, "endDate", ev.target.value)} /></div>
                      </div>
                      <div style={fieldGroupStyle}><label style={labelStyle}>{t("Description", "\u0627\u0644\u0648\u0635\u0641")}</label><textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={p.description} onChange={(ev) => updateProject(p.id, "description", ev.target.value)} /></div>
                      <div style={fieldGroupStyle}><label style={labelStyle}>{t("Technologies", "\u0627\u0644\u062a\u0642\u0646\u064a\u0627\u062a")} ({t("comma separated", "\u0641\u0627\u0635\u0644\u0629 \u0628\u0641\u0627\u0635\u0644\u0629")})</label><input style={inputStyle} value={p.technologies.join(", ")} onChange={(ev) => updateProject(p.id, "technologies", ev.target.value.split(",").map((t) => t.trim()).filter(Boolean))} /></div>
                    </div>
                  ))}
                </div>
              )}

              {editorSection === "references" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{t("References", "\u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0648\u0646")}</h3>
                    <button onClick={addReference} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "#0d6efd", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>+ {t("Add", "\u0625\u0636\u0627\u0641\u0629")}</button>
                  </div>
                  {data.sections.references.length === 0 && <p style={{ color: "#adb5bd", fontSize: 13 }}>{t("No references added", "\u0644\u0645 \u062a\u0636\u0641 \u0645\u0631\u0627\u062c\u0639\u064a\u0646")}</p>}
                  {data.sections.references.map((r) => (
                    <div key={r.id} style={{ border: "1px solid #e9ecef", borderRadius: 8, padding: 16, marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
                          <input type="checkbox" checked={r.visible} onChange={(ev) => updateReference(r.id, "visible", ev.target.checked)} /> {t("Visible", "\u0638\u0627\u0647\u0631")}
                        </label>
                        <button onClick={() => removeReference(r.id)} style={{ background: "none", border: "none", color: "#dc3545", cursor: "pointer", fontSize: 12 }}>{t("Remove", "\u062d\u0630\u0641")}</button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div style={fieldGroupStyle}><label style={labelStyle}>{t("Name", "\u0627\u0644\u0627\u0633\u0645")}</label><input style={inputStyle} value={r.name} onChange={(ev) => updateReference(r.id, "name", ev.target.value)} /></div>
                        <div style={fieldGroupStyle}><label style={labelStyle}>{t("Title", "\u0627\u0644\u0645\u0646\u0635\u0628")}</label><input style={inputStyle} value={r.title} onChange={(ev) => updateReference(r.id, "title", ev.target.value)} /></div>
                        <div style={fieldGroupStyle}><label style={labelStyle}>{t("Company", "\u0627\u0644\u0634\u0631\u0643\u0629")}</label><input style={inputStyle} value={r.company} onChange={(ev) => updateReference(r.id, "company", ev.target.value)} /></div>
                        <div style={fieldGroupStyle}><label style={labelStyle}>{t("Email", "\u0627\u0644\u0628\u0631\u064a\u062f")}</label><input style={inputStyle} value={r.email} onChange={(ev) => updateReference(r.id, "email", ev.target.value)} /></div>
                        <div style={fieldGroupStyle}><label style={labelStyle}>{t("Relationship", "\u0627\u0644\u0639\u0644\u0627\u0642\u0629")}</label><input style={inputStyle} value={r.relationship} onChange={(ev) => updateReference(r.id, "relationship", ev.target.value)} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 240px 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
