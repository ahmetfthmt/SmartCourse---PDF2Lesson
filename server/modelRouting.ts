import type { AIProvider } from "../shared/course";

export type AvailableModel = { id: string; score: number };
export type ModelRoutingResult<T> = { value: T; usedModel: string; attemptedModels: string[]; fallbackOccurred: boolean };

type OpenAIModelList = { data?: Array<{ id?: string }> };
type GeminiModelList = { models?: Array<{ name?: string; supportedGenerationMethods?: string[] }> };
type OpenRouterModelList = { data?: Array<{ id?: string; context_length?: number; architecture?: { modality?: string } }> };

export class ModelRequestError extends Error {
  constructor(message: string, public status?: number) { super(message); this.name = "ModelRequestError"; }
}

const blockedModelTerms = /(audio|image|video|embedding|tts|realtime|live|transcri|moderation|dall|veo|imagen|computer-use|deep-research)/i;
const scoreMap: Record<AIProvider, Array<[RegExp, number]>> = {
  openai: [[/gpt-5/i, 1000], [/gpt-4\.1/i, 900], [/gpt-4o(?!-mini)/i, 840], [/gpt-4/i, 700], [/mini/i, -110], [/nano/i, -230]],
  gemini: [[/gemini-3\.1-pro/i, 1000], [/gemini-2\.5-pro/i, 900], [/gemini-3\.6-flash/i, 850], [/gemini-3\.5-flash/i, 820], [/gemini-2\.5-flash/i, 740], [/lite/i, -140]],
  openrouter: [[/claude.*opus|opus.*claude/i, 1100], [/gpt-5/i, 1080], [/gemini-3.*pro|gemini.*3.*pro/i, 1040], [/claude.*sonnet|sonnet.*claude/i, 950], [/gemini-2\.5-pro/i, 900], [/gpt-4\.1/i, 850], [/mini|lite|haiku/i, -140]],
};

function scoreModel(provider: AIProvider, id: string, contextLength = 0) {
  let score = 100 + Math.min(Math.round(contextLength / 10_000), 40);
  const matchedValues = scoreMap[provider].filter(([pattern]) => pattern.test(id)).map(([, value]) => value);
  const strongestPositive = Math.max(0, ...matchedValues);
  const fallbackPenalty = strongestPositive === 0 ? Math.min(0, ...matchedValues) : 0;
  score += strongestPositive + fallbackPenalty;
  return score;
}

function normalizeAndRank(provider: AIProvider, models: Array<{ id: string; contextLength?: number }>) {
  const unique = new Map<string, AvailableModel>();
  for (const model of models) if (model.id && !blockedModelTerms.test(model.id)) unique.set(model.id, { id: model.id, score: scoreModel(provider, model.id, model.contextLength) });
  return Array.from(unique.values()).sort((left, right) => right.score - left.score || left.id.localeCompare(right.id));
}

async function readJson(response: Response) { try { return await response.json() as Record<string, unknown>; } catch { return {}; } }

async function discoverOpenAI(apiKey: string) {
  const response = await fetch("https://api.openai.com/v1/models", { headers: { Authorization: `Bearer ${apiKey}` } });
  const body = await readJson(response) as OpenAIModelList & { error?: { message?: string } };
  if (!response.ok) throw new ModelRequestError(body.error?.message || "OpenAI model listesi alınamadı.", response.status);
  return normalizeAndRank("openai", (body.data || []).flatMap((model) => model.id ? [{ id: model.id }] : []));
}

async function discoverGemini(apiKey: string) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`);
  const body = await readJson(response) as GeminiModelList & { error?: { message?: string } };
  if (!response.ok) throw new ModelRequestError(body.error?.message || "Gemini model listesi alınamadı.", response.status);
  return normalizeAndRank("gemini", (body.models || []).flatMap((model) => { const id = model.name?.replace(/^models\//, ""); return id && model.supportedGenerationMethods?.includes("generateContent") ? [{ id }] : []; }));
}

async function discoverOpenRouter(apiKey: string) {
  const response = await fetch("https://openrouter.ai/api/v1/models", { headers: { Authorization: `Bearer ${apiKey}` } });
  const body = await readJson(response) as OpenRouterModelList & { error?: { message?: string } };
  if (!response.ok) throw new ModelRequestError(body.error?.message || "OpenRouter model listesi alınamadı.", response.status);
  return normalizeAndRank("openrouter", (body.data || []).flatMap((model) => model.id && !/image|audio|video/i.test(model.architecture?.modality || "") ? [{ id: model.id, contextLength: model.context_length }] : []));
}

export async function discoverAvailableModels(provider: AIProvider, apiKey: string) {
  const models = provider === "openai" ? await discoverOpenAI(apiKey) : provider === "gemini" ? await discoverGemini(apiKey) : await discoverOpenRouter(apiKey);
  if (models.length === 0) throw new ModelRequestError("Bu anahtar için kurs üretimine uygun bir metin modeli bulunamadı.");
  return models;
}

export function chooseCandidateModels(requestedModel: string, discovered: AvailableModel[]) {
  const requested = requestedModel.trim();
  const first = requested && requested !== "auto" ? [requested] : [];
  return Array.from(new Set([...first, ...discovered.map((model) => model.id)])).slice(0, 6);
}

export function shouldFallbackToNextModel(error: unknown) {
  if (!(error instanceof ModelRequestError)) return false;
  if ([402, 403, 404, 429, 503].includes(error.status || 0)) return true;
  return /(quota|rate limit|too many requests|insufficient|model.*(?:unavailable|not found)|capacity)/i.test(error.message);
}

export async function runWithModelFallback<T>(models: string[], call: (model: string) => Promise<T>): Promise<ModelRoutingResult<T>> {
  const attemptedModels: string[] = [];
  let lastError: unknown;
  for (const model of models) {
    attemptedModels.push(model);
    try { return { value: await call(model), usedModel: model, attemptedModels, fallbackOccurred: attemptedModels.length > 1 }; }
    catch (error) { lastError = error; if (!shouldFallbackToNextModel(error)) throw error; }
  }
  const reason = lastError instanceof Error ? lastError.message : "Bilinmeyen hata";
  throw new Error(`Seçili sağlayıcıda kullanılabilir kurs modeli kalmadı. Denenen modeller: ${attemptedModels.join(", ")}. Son hata: ${reason}`);
}
