import { describe, expect, it } from "vitest";
import { ModelRequestError, chooseCandidateModels, runWithModelFallback, shouldFallbackToNextModel } from "./modelRouting";

describe("model routing", () => {
  it("uses a manually requested model first, then respects ranked discovered fallbacks", () => {
    expect(chooseCandidateModels("gpt-custom", [{ id: "gpt-5", score: 1000 }, { id: "gpt-4.1", score: 900 }])).toEqual(["gpt-custom", "gpt-5", "gpt-4.1"]);
    expect(chooseCandidateModels("auto", [{ id: "top", score: 10 }, { id: "next", score: 5 }])).toEqual(["top", "next"]);
  });

  it("moves to the next selected-provider model after quota or rate failures", async () => {
    const calls: string[] = [];
    const result = await runWithModelFallback(["top", "backup"], async (model) => { calls.push(model); if (model === "top") throw new ModelRequestError("quota exhausted", 429); return "course"; });
    expect(calls).toEqual(["top", "backup"]);
    expect(result).toMatchObject({ value: "course", usedModel: "backup", fallbackOccurred: true });
  });

  it("does not switch providers for unrelated invalid requests", () => {
    expect(shouldFallbackToNextModel(new ModelRequestError("invalid prompt", 400))).toBe(false);
    expect(shouldFallbackToNextModel(new ModelRequestError("model unavailable", 404))).toBe(true);
  });
});
