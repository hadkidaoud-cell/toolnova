import type { ResumeData, EducationEntry, ExperienceEntry, ProjectEntry, ReferenceEntry, ResumeLanguage } from "../types";
import { SKILL_LEVELS } from "../types";
import { escapeHtml, nlToBr, formatDateRange, getProficiencyLabel, getSectionLabel, getOrderedVisibleSections } from "./renderer";

export function renderClassic(data: ResumeData): string {
  const lang = data.language;
  const p = data.personal;
  const sections = getOrderedVisibleSections(data);

  let html = `<div class="resume-page">`;

  html += `<div class="header-section">`;
  if (p.photo) {
    html += `<img src="${escapeHtml(p.photo)}" alt="" class="photo-circle" style="margin: 0 auto 12px; display: block;" />`;
  }
  html += `<h1>${escapeHtml(p.fullName) || (lang === "ar" ? "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644" : "Your Name")}</h1>`;
  if (p.title) html += `<div class="subtitle">${escapeHtml(p.title)}</div>`;
  html += `<div class="contact-row">`;
  if (p.email) html += `<span class="contact-item">\u2709 ${escapeHtml(p.email)}</span>`;
  if (p.phone) html += `<span class="contact-item">\u260E ${escapeHtml(p.phone)}</span>`;
  if (p.location) html += `<span class="contact-item">\u2302 ${escapeHtml(p.location)}</span>`;
  if (p.website) html += `<span class="contact-item">\u{1F310} ${escapeHtml(p.website)}</span>`;
  if (p.linkedin) html += `<span class="contact-item">in ${escapeHtml(p.linkedin)}</span>`;
  if (p.github) html += `<span class="contact-item">GH ${escapeHtml(p.github)}</span>`;
  html += `</div></div>`;

  if (p.summary) {
    html += `<div class="summary-text">${nlToBr(p.summary)}</div>`;
  }

  for (const key of sections) {
    html += renderSectionClassic(key, data, lang);
  }

  html += `</div>`;
  return html;
}

function renderSectionClassic(key: string, data: ResumeData, lang: ResumeLanguage): string {
  let html = "";
  switch (key) {
    case "education": {
      const items = data.sections.education.filter((e) => e.visible);
      if (items.length === 0) return "";
      html += `<div class="section-block"><div class="section-title">${getSectionLabel("education", lang)}</div>`;
      for (const e of items) html += renderEducationClassic(e, lang);
      html += `</div>`;
      break;
    }
    case "experience": {
      const items = data.sections.experience.filter((e) => e.visible);
      if (items.length === 0) return "";
      html += `<div class="section-block"><div class="section-title">${getSectionLabel("experience", lang)}</div>`;
      for (const e of items) html += renderExperienceClassic(e, lang);
      html += `</div>`;
      break;
    }
    case "skills": {
      const items = data.sections.skills.filter((e) => e.visible);
      if (items.length === 0) return "";
      html += `<div class="section-block"><div class="section-title">${getSectionLabel("skills", lang)}</div><div class="skills-grid">`;
      for (const s of items) {
        const levelVal = SKILL_LEVELS[s.level as keyof typeof SKILL_LEVELS]?.value ?? 50;
        html += `<div class="skill-tag"><span>${escapeHtml(s.name)}</span><div class="skill-bar"><div class="skill-fill" style="width:${levelVal}%"></div></div></div>`;
      }
      html += `</div></div>`;
      break;
    }
    case "languages": {
      const items = data.sections.languages.filter((e) => e.visible);
      if (items.length === 0) return "";
      html += `<div class="section-block"><div class="section-title">${getSectionLabel("languages", lang)}</div>`;
      for (const l of items) {
        html += `<div class="language-item"><span>${escapeHtml(l.name)}</span><span style="color:#718096">${getProficiencyLabel(l.proficiency, lang)}</span></div>`;
      }
      html += `</div>`;
      break;
    }
    case "projects": {
      const items = data.sections.projects.filter((e) => e.visible);
      if (items.length === 0) return "";
      html += `<div class="section-block"><div class="section-title">${getSectionLabel("projects", lang)}</div>`;
      for (const pr of items) html += renderProjectClassic(pr, lang);
      html += `</div>`;
      break;
    }
    case "references": {
      const items = data.sections.references.filter((e) => e.visible);
      if (items.length === 0) return "";
      html += `<div class="section-block"><div class="section-title">${getSectionLabel("references", lang)}</div>`;
      html += renderReferencesClassic(items, lang);
      html += `</div>`;
      break;
    }
  }
  return html;
}

function renderEducationClassic(e: EducationEntry, lang: ResumeLanguage): string {
  const date = formatDateRange(e.startDate, e.endDate, false, lang);
  let html = `<div class="entry"><div class="entry-header"><div><div class="entry-title">${escapeHtml(e.degree)}${e.field ? ` ${lang === "ar" ? "\u0641\u064a" : "in"} ${escapeHtml(e.field)}` : ""}</div><div class="entry-subtitle">${escapeHtml(e.institution)}</div></div>`;
  if (date) html += `<div class="entry-date">${date}</div>`;
  html += `</div>`;
  if (e.gpa) html += `<div class="entry-desc">${lang === "ar" ? "\u0627\u0644\u0645\u062a\u0648\u0633\u0637\u0637\u063a: " : "GPA: "}${escapeHtml(e.gpa)}</div>`;
  if (e.description) html += `<div class="entry-desc">${nlToBr(e.description)}</div>`;
  html += `</div>`;
  return html;
}

function renderExperienceClassic(e: ExperienceEntry, lang: ResumeLanguage): string {
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

function renderProjectClassic(p: ProjectEntry, lang: ResumeLanguage): string {
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

function renderReferencesClassic(refs: ReferenceEntry[], _lang: ResumeLanguage): string {
  let html = `<div class="reference-grid">`;
  for (const r of refs) {
    html += `<div class="reference-card"><div class="ref-name">${escapeHtml(r.name)}</div><div class="ref-title">${escapeHtml(r.title)}${r.company ? ` \u2014 ${escapeHtml(r.company)}` : ""}</div>`;
    if (r.email) html += `<div style="margin-top:2px">${escapeHtml(r.email)}</div>`;
    if (r.relationship) html += `<div style="color:#718096;margin-top:2px">${escapeHtml(r.relationship)}</div>`;
    html += `</div>`;
  }
  html += `</div>`;
  return html;
}
