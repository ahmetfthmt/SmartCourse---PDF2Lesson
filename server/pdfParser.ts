import pdfParse from "pdf-parse/lib/pdf-parse.js";

export interface ParsedPDF {
  rawText: string;
  markdownContent: string;
  structuredJson: {
    pageCount: number;
    titleSnippet: string;
    sections: { heading: string; content: string }[];
  };
}

const isHeading = (line: string) => {
  const numberedHeading = /^(\d+(?:\.\d+)*[.)]?\s+)[A-ZÀ-ŽİŞĞÜÖÇ][\s\S]{2,80}$/.test(line);
  const uppercaseHeading = line.length < 72 && line.length > 2 && line === line.toLocaleUpperCase("tr-TR") && !/[.!?]$/.test(line);
  return numberedHeading || uppercaseHeading;
};

export function buildStructuredContent(rawText: string, pageCount: number): ParsedPDF {
  const lines = rawText.split(/\r?\n/).map((line) => line.replace(/\s+/g, " ").trim()).filter((line) => line.length > 0);
  const sections: { heading: string; content: string }[] = [];
  let currentHeading = "Giriş";
  let currentContent: string[] = [];
  const closeSection = () => { const content = currentContent.join(" ").trim(); if (content) sections.push({ heading: currentHeading, content }); };
  for (const line of lines) {
    if (isHeading(line)) { closeSection(); currentHeading = line; currentContent = []; } else { currentContent.push(line); }
  }
  closeSection();
  const usableSections = sections.length > 0 ? sections : [{ heading: "Doküman", content: lines.join(" ") }];
  const markdownContent = ["# PDF Doküman Özeti", "", ...usableSections.flatMap((section) => ["## " + section.heading, section.content, ""])].join("\n").trim();
  return { rawText, markdownContent, structuredJson: { pageCount, titleSnippet: lines[0] || "İsimsiz Doküman", sections: usableSections } };
}

export async function parsePdfToMarkdown(fileBuffer: Buffer): Promise<ParsedPDF> {
  const data = await pdfParse(fileBuffer);
  const rawText = data.text?.trim() || "";
  if (!rawText) throw new Error("PDF'den okunabilir metin çıkarılamadı. Metin tabanlı bir PDF deneyin.");
  return buildStructuredContent(rawText, data.numpages || 0);
}
