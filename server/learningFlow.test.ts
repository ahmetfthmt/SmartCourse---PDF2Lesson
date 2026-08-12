import { describe, expect, it } from "vitest";
import type { CourseModule } from "../shared/course";
import { buildLearningFlow } from "../client/src/lib/learningFlow";

const modules: CourseModule[] = [1, 2, 3].map((index) => ({
  id: `m-${index}`,
  title: `Module ${index}`,
  description: "Description",
  lessons: [{ id: `l-${index}`, title: `Lesson ${index}`, contentMarkdown: "Text", keyTakeaways: ["One", "Two"], estimatedReadTimeMinutes: 5 }],
  quiz: [1, 2, 3].map((question) => ({ id: `q-${index}-${question}`, question: "Question?", options: ["A", "B", "C", "D"], correctOptionIndex: 0, explanation: "Explanation" })),
  practicalAssignment: "Practice",
}));

describe("learning flow", () => {
  it("derives ordered learning stages and lesson progress directly from course modules", () => {
    const flow = buildLearningFlow(modules, ["l-1"], "tr");
    expect(flow.map((stage) => stage.stageLabel)).toEqual(["Temel", "Uygulama", "Kapanış"]);
    expect(flow[0]).toMatchObject({ stageNumber: "01", completedLessons: 1, totalLessons: 1 });
    expect(flow[1]?.lessons[0]?.completed).toBe(false);
  });
});
