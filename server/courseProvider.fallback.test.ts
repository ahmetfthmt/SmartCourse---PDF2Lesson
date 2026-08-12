import { afterEach, describe, expect, it, vi } from "vitest";
import { generateCourse } from "./courseProvider";
import { discoverAvailableModels } from "./modelRouting";

const sampleCourse = {
  title: "Source grounded course", summary: "A clear path.", targetAudience: "Learners", estimatedHours: 2,
  modules: [1, 2, 3].map((moduleNumber) => ({
    id: `module-${moduleNumber}`, title: `Module ${moduleNumber}`, description: "Focused topic.", practicalAssignment: "Apply a source idea.",
    lessons: [{ id: `lesson-${moduleNumber}`, title: "Lesson", contentMarkdown: "## Concept\nExplanation", keyTakeaways: ["First", "Second"], estimatedReadTimeMinutes: 5 }],
    quiz: [1, 2, 3].map((questionNumber) => ({ id: `question-${moduleNumber}-${questionNumber}`, question: "Which answer is correct?", options: ["A", "B", "C", "D"], correctOptionIndex: 0, explanation: "A is supported." })),
  })),
};

const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

afterEach(() => vi.unstubAllGlobals());

describe("provider discovery and generation fallback", () => {
  it("ranks accessible OpenRouter text models while excluding non-text models", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({ data: [
      { id: "openai/gpt-4.1", context_length: 128000 },
      { id: "anthropic/claude-opus-4", context_length: 200000 },
      { id: "openai/gpt-image-1", architecture: { modality: "image" } },
    ] })));
    const models = await discoverAvailableModels("openrouter", "sk-or-test-key");
    expect(models.map((model) => model.id)).toEqual(["anthropic/claude-opus-4", "openai/gpt-4.1"]);
  });

  it("retries the next discovered OpenAI model after a quota response", async () => {
    const mockedFetch = vi.fn()
      .mockResolvedValueOnce(response({ data: [{ id: "gpt-4o" }, { id: "gpt-5" }, { id: "text-embedding-3-small" }] }))
      .mockResolvedValueOnce(response({ error: { message: "quota exhausted" } }, 429))
      .mockResolvedValueOnce(response({ choices: [{ message: { content: JSON.stringify(sampleCourse) } }] }));
    vi.stubGlobal("fetch", mockedFetch);

    const result = await generateCourse({ fileName: "source.pdf", pdfBase64: "data:application/pdf;base64," + "a".repeat(100), provider: "openai", apiKey: "sk-test-key", model: "auto", language: "en" }, "# Source\nA source-backed concept.");

    expect(result.modelSelection).toMatchObject({ usedModel: "gpt-4o", attemptedModels: ["gpt-5", "gpt-4o"], fallbackOccurred: true });
    expect(result.course.title).toBe("Source grounded course");
    expect(mockedFetch).toHaveBeenCalledTimes(3);
  });
});
