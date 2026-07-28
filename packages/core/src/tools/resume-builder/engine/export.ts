import type { ResumeData, ResumeExportOptions } from "../types";
import { renderResumeHtml } from "./renderer";

export interface PdfExportResult {
  blob: Blob;
  dataUrl: string;
  fileName: string;
  size: number;
}

export async function exportResumeToPdf(
  data: ResumeData,
  _options: Partial<ResumeExportOptions> = {}
): Promise<PdfExportResult> {
  const html = renderResumeHtml(data);

  const printWindow = window.open("", "_blank", "width=800,height=1000");
  if (!printWindow) {
    throw new Error("Pop-up blocked. Please allow pop-ups for PDF export.");
  }

  printWindow.document.write(html);
  printWindow.document.close();

  await new Promise<void>((resolve) => {
    const check = () => {
      if (printWindow.document.readyState === "complete") {
        resolve();
      } else {
        setTimeout(check, 50);
      }
    };
    check();
  });

  await new Promise((r) => setTimeout(r, 300));

  printWindow.print();

  const fileName = `${data.personal.fullName || "resume"}_${data.template}.pdf`;

  setTimeout(() => {
    printWindow.close();
  }, 2000);

  return {
    blob: new Blob([html], { type: "text/html" }),
    dataUrl: `data:text/html;base64,${btoa(unescape(encodeURIComponent(html)))}`,
    fileName,
    size: html.length,
  };
}

export function renderForPreview(data: ResumeData): string {
  return renderResumeHtml(data);
}

export function createEmptyResume(lang: "en" | "ar" = "en"): ResumeData {
  return {
    id: `resume-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`,
    personal: {
      fullName: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
      github: "",
      summary: "",
    },
    sections: {
      education: [],
      experience: [],
      skills: [],
      languages: [],
      projects: [],
      references: [],
    },
    sectionVisibility: {
      education: true,
      experience: true,
      skills: true,
      languages: true,
      projects: false,
      references: false,
    },
    sectionOrder: ["experience", "education", "skills", "languages", "projects", "references"],
    template: "modern",
    language: lang,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
