import type { ResumeData, ResumeLanguage, TemplateStyle, SectionKey } from "../types";
import { SECTION_LABELS, SKILL_LEVELS, LANGUAGE_PROFICIENCIES } from "../types";
import { renderClassic } from "./classic";
import { renderModern } from "./modern";
import { renderMinimal } from "./minimal";

export function renderResumeHtml(data: ResumeData): string {
  const dir = data.language === "ar" ? "rtl" : "ltr";
  const lang = data.language === "ar" ? "ar" : "en";

  const bodyHtml = renderTemplateBody(data);

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  @page { size: A4; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: ${getFontFamily(data.template, data.language)}; color: #1a1a2e; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  ${getGlobalStyles(data.template, data.language)}
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

function getFontFamily(template: TemplateStyle, _lang: ResumeLanguage): string {
  switch (template) {
    case "classic": return "'Georgia', 'Times New Roman', serif";
    case "modern": return "'Segoe UI', 'Tahoma', system-ui, sans-serif";
    case "minimal": return "'Inter', 'Segoe UI', system-ui, sans-serif";
    default: return "system-ui, sans-serif";
  }
}

function getGlobalStyles(template: TemplateStyle, _lang: ResumeLanguage): string {
  const base = `
  .resume-page { width: 210mm; min-height: 297mm; padding: 0; margin: 0 auto; background: #fff; position: relative; }
  .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 2px solid var(--primary); color: var(--primary); }
  .entry { margin-bottom: 12px; }
  .entry-header { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 4px; }
  .entry-title { font-weight: 600; font-size: 13px; color: #1a1a2e; }
  .entry-subtitle { font-size: 12px; color: #4a5568; }
  .entry-date { font-size: 11px; color: #718096; white-space: nowrap; }
  .entry-desc { font-size: 12px; color: #4a5568; margin-top: 4px; line-height: 1.5; }
  .entry-location { font-size: 11px; color: #718096; }
  .skill-bar { height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; width: 80px; }
  .skill-fill { height: 100%; background: var(--primary); border-radius: 3px; }
  .skills-grid { display: flex; flex-wrap: wrap; gap: 6px; }
  .skill-tag { padding: 3px 10px; background: #f1f5f9; border-radius: 4px; font-size: 11px; display: flex; align-items: center; gap: 6px; }
  .language-item { display: flex; align-items: center; justify-content: space-between; padding: 4px 0; font-size: 12px; }
  .project-tech { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
  .project-tech span { padding: 2px 6px; background: #f1f5f9; border-radius: 3px; font-size: 10px; color: #4a5568; }
  .highlights { margin-top: 4px; padding-left: 16px; }
  .highlights li { font-size: 12px; color: #4a5568; line-height: 1.5; margin-bottom: 2px; }
  .reference-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .reference-card { padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 11px; }
  .reference-card .ref-name { font-weight: 600; font-size: 12px; }
  .reference-card .ref-title { color: #4a5568; }
  .contact-row { display: flex; flex-wrap: wrap; gap: 12px; font-size: 11px; color: #4a5568; }
  .contact-item { display: flex; align-items: center; gap: 4px; }
  .empty-state { color: #a0aec0; font-style: italic; font-size: 12px; padding: 8px 0; }
  .photo-circle { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary); }
  .photo-square { width: 70px; height: 70px; border-radius: 8px; object-fit: cover; border: 2px solid var(--primary); }
  @media print { .resume-page { width: 100%; min-height: auto; } }
  `;

  if (template === "classic") {
    return `${base}
    :root { --primary: #1a365d; --primary-light: #ebf4ff; }
    .resume-page { padding: 32px 36px; }
    .header-section { text-align: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #1a365d; }
    .header-section h1 { font-size: 26px; font-weight: 700; color: #1a365d; margin-bottom: 4px; }
    .header-section .subtitle { font-size: 14px; color: #4a5568; margin-bottom: 8px; }
    .header-section .contact-row { justify-content: center; }
    .summary-text { font-size: 12px; color: #4a5568; line-height: 1.6; margin-bottom: 16px; padding: 8px 12px; background: #f7fafc; border-left: 3px solid #1a365d; }
    .section-block { margin-bottom: 16px; }
    .section-title { border-bottom-color: #1a365d; color: #1a365d; }`;
  }

  if (template === "modern") {
    return `${base}
    :root { --primary: #059669; --primary-light: #ecfdf5; }
    .resume-page { display: grid; grid-template-columns: 200px 1fr; }
    .sidebar { background: #064e3b; color: #fff; padding: 28px 18px; }
    .sidebar .photo-circle { border-color: #fff; width: 100px; height: 100px; display: block; margin: 0 auto 16px; }
    .sidebar h1 { font-size: 18px; font-weight: 700; margin-bottom: 2px; text-align: center; }
    .sidebar .subtitle { font-size: 11px; color: #a7f3d0; text-align: center; margin-bottom: 16px; }
    .sidebar .contact-item { font-size: 10px; color: #d1fae5; margin-bottom: 6px; }
    .sidebar .section-title { color: #a7f3d0; border-bottom-color: #059669; font-size: 11px; }
    .sidebar .skill-tag { background: rgba(255,255,255,0.15); color: #d1fae5; }
    .sidebar .skill-fill { background: #34d399; }
    .sidebar .skill-bar { background: rgba(255,255,255,0.2); }
    .sidebar .language-item { color: #d1fae5; }
    .sidebar .summary-text { color: #d1fae5; background: rgba(255,255,255,0.1); border-left-color: #34d399; }
    .main-content { padding: 28px 24px; }
    .main-content .section-block { margin-bottom: 14px; }
    .main-content .section-title { color: #059669; border-bottom-color: #059669; }`;
  }

  return `${base}
  :root { --primary: #18181b; --primary-light: #f4f4f5; }
  .resume-page { padding: 28px 32px; }
  .header-section { margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid #e4e4e7; }
  .header-section h1 { font-size: 28px; font-weight: 800; color: #18181b; letter-spacing: -0.5px; }
  .header-section .subtitle { font-size: 14px; color: #71717a; margin-top: 2px; }
  .header-section .contact-row { margin-top: 8px; }
  .summary-text { font-size: 12px; color: #52525b; line-height: 1.6; margin-bottom: 16px; }
  .section-block { margin-bottom: 16px; }
  .section-title { color: #18181b; border-bottom-color: #18181b; font-weight: 800; }
  .entry-title { font-weight: 700; }`;
}

function renderTemplateBody(data: ResumeData): string {
  switch (data.template) {
    case "classic": return renderClassic(data);
    case "modern": return renderModern(data);
    case "minimal": return renderMinimal(data);
    default: return renderMinimal(data);
  }
}

export function getOrderedVisibleSections(data: ResumeData): SectionKey[] {
  return data.sectionOrder.filter((key) => key !== "personal" && data.sectionVisibility[key]);
}

export function formatDate(dateStr: string, lang: ResumeLanguage): string {
  if (!dateStr) return "";
  const [year, month] = dateStr.split("-");
  if (!year) return "";
  if (lang === "ar") {
    const monthsAr = ["\u064a\u0646\u0627\u064a\u0631", "\u0641\u0628\u0631\u0627\u064a\u0631", "\u0645\u0627\u0631\u0633", "\u0623\u0628\u0631\u064a\u0644", "\u0645\u0627\u064a\u0648", "\u064a\u0648\u0646\u064a\u0648", "\u064a\u0648\u0644\u064a\u0648", "\u0623\u063a\u0633\u0637\u0633", "\u0633\u0628\u062a\u0645\u0628\u0631", "\u0623\u0643\u062a\u0648\u0628\u0631", "\u0646\u0648\u0641\u0645\u0628\u0631", "\u062f\u064a\u0633\u0645\u0628\u0631"];
    const m = parseInt(month ?? "1", 10) - 1;
    return `${monthsAr[m] ?? ""} ${year}`;
  }
  const monthsEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const m = parseInt(month ?? "1", 10) - 1;
  return `${monthsEn[m] ?? ""} ${year}`;
}

export function formatDateRange(start: string, end: string, current: boolean, lang: ResumeLanguage): string {
  const s = formatDate(start, lang);
  const e = current
    ? lang === "ar" ? "\u062d\u0627\u0644\u064a\u0627\u064b" : "Present"
    : formatDate(end, lang);
  if (!s && !e) return "";
  if (!s) return e;
  if (!e) return s;
  return `${s} \u2013 ${e}`;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function nlToBr(text: string): string {
  return escapeHtml(text).replace(/\n/g, "<br />");
}

export function getSectionLabel(key: SectionKey, lang: ResumeLanguage): string {
  const labels = SECTION_LABELS[key];
  return labels[lang] ?? labels.en;
}

export function getSkillLevelLabel(level: string, lang: ResumeLanguage): string {
  const entry = SKILL_LEVELS[level as keyof typeof SKILL_LEVELS];
  return entry ? entry[lang === "ar" ? "labelAr" : "label"] : level;
}

export function getProficiencyLabel(prof: string, lang: ResumeLanguage): string {
  const entry = LANGUAGE_PROFICIENCIES[prof as keyof typeof LANGUAGE_PROFICIENCIES];
  return entry ? entry[lang === "ar" ? "labelAr" : "label"] : prof;
}
