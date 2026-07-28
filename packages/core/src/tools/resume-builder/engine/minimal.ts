import type { ResumeData, EducationEntry, ExperienceEntry, ProjectEntry, ResumeLanguage } from "../types";
import { escapeHtml, nlToBr, formatDateRange, getProficiencyLabel, getSectionLabel, getOrderedVisibleSections } from "./renderer";
import { SKILL_LEVELS } from "../types";

export function renderMinimal(data: ResumeData): string {
  const lang = data.language;
  const p = data.personal;
  const sections = getOrderedVisibleSections(data);

  let html = `<div class="resume-page">`;

  html += `<div class="header-section">`;
  if (p.photo) {
    html += `<img src="${escapeHtml(p.photo)}" alt="" style="width:60px;height:60px;border-radius:50%;object-fit:cover;margin-bottom:8px" />`;
  }
  html += `<h1>${escapeHtml(p.fullName) || (lang === "ar" ? "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644" : "Your Name")}</h1>`;
  if (p.title) html += `<div class="subtitle">${escapeHtml(p.title)}</div>`;
  html += `<div class="contact-row">`;
  if (p.email) html += `<span class="contact-item">${escapeHtml(p.email)}</span>`;
  if (p.phone) html += `<span class="contact-item">${escapeHtml(p.phone)}</span>`;
  if (p.location) html += `<span class="contact-item">${escapeHtml(p.location)}</span>`;
  if (p.website) html += `<span class="contact-item">${escapeHtml(p.website)}</span>`;
  if (p.linkedin) html += `<span class="contact-item">${escapeHtml(p.linkedin)}</span>`;
  if (p.github) html += `<span class="contact-item">${escapeHtml(p.github)}</span>`;
  html += `</div></div>`;

  if (p.summary) {
    html += `<div class="summary-text">${nlToBr(p.summary)}</div>`;
  }

  for (const key of sections) {
    html += renderSectionMinimal(key, data, lang);
  }

  html += `</div>`;
  return html;
}

function renderSectionMinimal(key: string, data: ResumeData, lang: ResumeLanguage): string {
  let html = "";
  switch (key) {
    case "education": {
      const items = data.sections.education.filter((e) => e.visible);
      if (items.length === 0) return "";
      html += `<div class="section-block"><div class="section-title">${getSectionLabel("education", lang)}</div>`;
      for (const e of items) html += renderEducationMinimal(e, lang);
      html += `</div>`;
      break;
    }
    case "experience": {
      const items = data.sections.experience.filter((e) => e.visible);
      if (items.length === 0) return "";
      html += `<div class="section-block"><div class="section-title">${getSectionLabel("experience", lang)}</div>`;
      for (const e of items) html += renderExperienceMinimal(e, lang);
      html += `</div>`;
      break;
    }
    case "skills": {
      const items = data.sections.skills.filter((e) => e.visible);
      if (items.length === 0) return "";
      html += `<div class="section-block"><div class="section-title">${getSectionLabel("skills", lang)}</div><div style="display:flex;flex-wrap:wrap;gap:4px">`;
      for (const s of items) {
        const levelVal = SKILL_LEVELS[s.level as keyof typeof SKILL_LEVELS]?.value ?? 50;
        html += `<span style="padding:3px 10px;background:#f4f4f5;border-radius:4px;font-size:11px;display:inline-flex;align-items:center;gap:6px">${escapeHtml(s.name)}<span style="width:40px;height:3px;background:#e4e4e7;border-radius:2px;display:inline-block"><span style="width:${levelVal}%;height:100%;background:#18181b;border-radius:2px;display:block"></span></span></span>`;
      }
      html += `</div></div>`;
      break;
    }
    case "languages": {
      const items = data.sections.languages.filter((e) => e.visible);
      if (items.length === 0) return "";
      html += `<div class="section-block"><div class="section-title">${getSectionLabel("languages", lang)}</div>`;
      for (const l of items) {
        html += `<div class="language-item"><span>${escapeHtml(l.name)}</span><span style="color:#a1a1aa;font-size:11px">${getProficiencyLabel(l.proficiency, lang)}</span></div>`;
      }
      html += `</div>`;
      break;
    }
    case "projects": {
      const items = data.sections.projects.filter((e) => e.visible);
      if (items.length === 0) return "";
      html += `<div class="section-block"><div class="section-title">${getSectionLabel("projects", lang)}</div>`;
      for (const pr of items) html += renderProjectMinimal(pr, lang);
      html += `</div>`;
      break;
    }
    case "references": {
      const items = data.sections.references.filter((e) => e.visible);
      if (items.length === 0) return "";
      html += `<div class="section-block"><div class="section-title">${getSectionLabel("references", lang)}</div>`;
      for (const r of items) {
        html += `<div style="margin-bottom:8px;font-size:12px"><strong>${escapeHtml(r.name)}</strong> \u2014 ${escapeHtml(r.title)}${r.company ? `, ${escapeHtml(r.company)}` : ""}`;
        if (r.email) html += `<br /><span style="color:#71717a">${escapeHtml(r.email)}</span>`;
        html += `</div>`;
      }
      html += `</div>`;
      break;
    }
  }
  return html;
}

function renderEducationMinimal(e: EducationEntry, lang: ResumeLanguage): string {
  const date = formatDateRange(e.startDate, e.endDate, false, lang);
  let html = `<div class="entry"><div class="entry-header"><div><div class="entry-title">${escapeHtml(e.degree)}${e.field ? ` ${escapeHtml(e.field)}` : ""}</div><div class="entry-subtitle">${escapeHtml(e.institution)}</div></div>`;
  if (date) html += `<div class="entry-date">${date}</div>`;
  html += `</div>`;
  if (e.gpa) html += `<div class="entry-desc">${lang === "ar" ? "\u0627\u0644\u0645\u062a\u0648\u0633\u0637\u0637\u063a: " : "GPA: "}${escapeHtml(e.gpa)}</div>`;
  if (e.description) html += `<div class="entry-desc">${nlToBr(e.description)}</div>`;
  html += `</div>`;
  return html;
}

function renderExperienceMinimal(e: ExperienceEntry, lang: ResumeLanguage): string {
  const date = formatDateRange(e.startDate, e.endDate, e.current, lang);
  let html = `<div class="entry"><div class="entry-header"><div><div class="entry-title">${escapeHtml(e.position)}</div><div class="entry-subtitle">${escapeHtml(e.company)}${e.location ? ` \u2014 ${escapeHtml(e.location)}` : ""}</div></div>`;
  if (date) html += `<div class="entry-date">${date}</div>`;
  html += `</div>`;
  if (e.description) html += `<div class="entry-desc">${nlToBr(e.description)}</div>`;
  if (e.highlights.length > 0 && e.highlights.some((h) => h.trim())) {
    html += `<ul class="highlights">`;
    for (const h of e.highlights) {
      if (h.trim()) html += `<li>${escapeHtml(h)}</li>`;
    }
    html += `</ul>`;
  }
  html += `</div>`;
  return html;
}

function renderProjectMinimal(p: ProjectEntry, lang: ResumeLanguage): string {
  const date = formatDateRange(p.startDate, p.endDate, false, lang);
  let html = `<div class="entry"><div class="entry-header"><div><div class="entry-title">${escapeHtml(p.name)}</div>`;
  if (p.url) html += `<div class="entry-subtitle">${escapeHtml(p.url)}</div>`;
  html += `</div>`;
  if (date) html += `<div class="entry-date">${date}</div>`;
  html += `</div>`;
  if (p.description) html += `<div class="entry-desc">${nlToBr(p.description)}</div>`;
  if (p.technologies.length > 0) {
    html += `<div class="project-tech">`;
    for (const t of p.technologies) html += `<span>${escapeHtml(t)}</span>`;
    html += `</div>`;
  }
  if (p.highlights.length > 0 && p.highlights.some((h) => h.trim())) {
    html += `<ul class="highlights">`;
    for (const h of p.highlights) {
      if (h.trim()) html += `<li>${escapeHtml(h)}</li>`;
    }
    html += `</ul>`;
  }
  html += `</div>`;
  return html;
}
