import { describe, expect, it } from "vitest";
import { buildLearningFlow } from "./learningFlow";

const modules = [1, 2, 3].map((index) => ({ id: `m-${index}`, title: `Module ${index}`, description: "Description", lessons: [{ id: `l-${index}`, title: `Lesson ${index}`, contentMarkdown: "Text", keyTakeaways: ["One", "Two"], estimatedReadTimeMinutes: 5 }], quiz: [], practicalAssignment: "Practice" }));

describe("learning flow", () => {
  it("derives sequential visual stages and completion counts from course modules", () => {
    const flow = buildLearningFlow(modules, ["l-1"], "tr");
    expect(flow.map((stage) => stage.stageLabel)).toEqual(["Temel", "Uygulama", "Kapanış"]);
    expect(flow[0]).toMatchObject({ stageNumber: "01", completedLessons: 1, totalLessons: 1 });
    expect(flow[1]?.lessons[0]?.completed).toBe(false);
  });
});
