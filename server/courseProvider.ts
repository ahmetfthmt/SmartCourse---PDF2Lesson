import { Course, CourseSchema, GenerateCourseInput } from "../shared/course";

const courseContract = `Return ONLY a valid JSON object. Do not use markdown fences or commentary. The JSON must have this exact shape: {"title":"string","summary":"string","targetAudience":"string","estimatedHours":number,"modules":[{"id":"string","title":"string","description":"string","lessons":[{"id":"string","title":"string","contentMarkdown":"string","keyTakeaways":["string","string"],"estimatedReadTimeMinutes":number}],"quiz":[{"id":"string","question":"string","options":["string","string","string","string"],"correctOptionIndex":0,"explanation":"string"}],"practicalAssignment":"string"}]}`;

function buildPrompt(markdownContent: string, language: "tr" | "en") {
  const languageName = language === "tr" ? "Turkish" : "English";
  return `You are an expert instructional designer. Convert the supplied PDF extract into a cohesive, evidence-grounded learning path in ${languageName}.

Pedagogical requirements:
- Create 3 to 5 modules ordered from foundational concepts to applied mastery.
- Create 2 to 4 concise but substantive lessons per module. Use markdown headings, short paragraphs, examples, and lists when helpful.
- Include at least two specific key takeaways per lesson.
- Write exactly 3 multiple-choice questions for each module. Each must have exactly 4 plausible options, one correct index, and feedback.
- Include one authentic, practical assignment for every module.
- Do not invent factual claims absent from the source.

${courseContract}

PDF extract:
---
${markdownContent.slice(0, 28_000)}
---`;
}

function cleanJson(raw: string) {
  const withoutFence = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = withoutFence.indexOf("{");
  const end = withoutFence.lastIndexOf("}");
  return start >= 0 && end > start ? withoutFence.slice(start, end + 1) : withoutFence;
}

export function parseCoursePayload(raw: string): Course {
  let parsed: unknown;
  try { parsed = JSON.parse(cleanJson(raw)); } catch { throw new Error("AI sağlayıcısı geçerli bir kurs JSON'u döndürmedi. Aynı sağlayıcıyla tekrar deneyin."); }
  const result = CourseSchema.safeParse(parsed);
  if (!result.success) throw new Error("AI yanıtı kurs şemasını karşılamadı. Sağlayıcı veya model ayarlarınızı kontrol edin.");
  return result.data;
}

async function generateWithOpenAI(input: GenerateCourseInput, prompt: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${input.apiKey}` }, body: JSON.stringify({ model: input.model || "gpt-4o", temperature: 0.35, response_format: { type: "json_object" }, messages: [{ role: "system", content: "You produce rigorous pedagogical course JSON and follow the requested schema exactly." }, { role: "user", content: prompt }] }) });
  const body = (await response.json()) as { error?: { message?: string }; choices?: Array<{ message?: { content?: string } }> };
  if (!response.ok) throw new Error(body.error?.message || "OpenAI isteği başarısız oldu.");
  return body.choices?.[0]?.message?.content || "";
}

async function generateWithGemini(input: GenerateCourseInput, prompt: string) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(input.model || "gemini-2.0-flash")}:generateContent?key=${encodeURIComponent(input.apiKey)}`;
  const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.35, responseMimeType: "application/json" } }) });
  const body = (await response.json()) as { error?: { message?: string }; candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  if (!response.ok) throw new Error(body.error?.message || "Gemini isteği başarısız oldu.");
  return body.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
}

export async function generateCourse(input: GenerateCourseInput, markdownContent: string): Promise<Course> {
  const prompt = buildPrompt(markdownContent, input.language);
  // The selected provider is the only outbound AI call; there is intentionally no fallback.
  const raw = input.provider === "openai" ? await generateWithOpenAI(input, prompt) : await generateWithGemini(input, prompt);
  return parseCoursePayload(raw);
}
