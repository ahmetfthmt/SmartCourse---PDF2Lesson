import { describe, expect, it } from "vitest";
import { CourseSchema } from "../shared/course";
import { buildStructuredContent } from "./pdfParser";

const sampleCourse = { title: "Sample course", summary: "A short, structured course.", targetAudience: "Learners", estimatedHours: 2, modules: [1, 2, 3].map((moduleNumber) => ({ id: `m-${moduleNumber}`, title: `Module ${moduleNumber}`, description: "A focused module.", practicalAssignment: "Apply one source concept.", lessons: [{ id: `l-${moduleNumber}`, title: "Lesson", contentMarkdown: "## Concept\n\nExplanation.", keyTakeaways: ["One", "Two"], estimatedReadTimeMinutes: 5 }], quiz: [1, 2, 3].map((questionNumber) => ({ id: `q-${moduleNumber}-${questionNumber}`, question: "Which option is correct?", options: ["A", "B", "C", "D"], correctOptionIndex: 0, explanation: "A is correct." })) })) };

describe("course contract", () => {
  it("accepts a pedagogically complete course payload", () => expect(CourseSchema.safeParse(sampleCourse).success).toBe(true));
  it("creates stable markdown sections from extracted PDF text", () => { const parsed = buildStructuredContent("INTRODUCTION\nCourse context\n1. PRACTICE\nApply the concept", 2); expect(parsed.structuredJson.pageCount).toBe(2); expect(parsed.structuredJson.sections).toHaveLength(2); expect(parsed.markdownContent).toContain("## 1. PRACTICE"); });
});
