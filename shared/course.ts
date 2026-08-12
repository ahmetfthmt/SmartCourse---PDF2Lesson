import { z } from "zod";

export const QuizQuestionSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  options: z.array(z.string().min(1)).length(4),
  correctOptionIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(1),
});

export const LessonSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  contentMarkdown: z.string().min(1),
  keyTakeaways: z.array(z.string().min(1)).min(2),
  estimatedReadTimeMinutes: z.number().int().min(1).max(90),
});

export const ModuleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  lessons: z.array(LessonSchema).min(1),
  quiz: z.array(QuizQuestionSchema).min(3).max(5),
  practicalAssignment: z.string().min(1),
});

export const CourseSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  targetAudience: z.string().min(1),
  estimatedHours: z.number().positive().max(200),
  modules: z.array(ModuleSchema).min(3).max(5),
});

export const LanguageSchema = z.enum(["tr", "en"]);
export const ProviderSchema = z.enum(["openai", "gemini", "openrouter"]);

export const ProviderAccessInputSchema = z.object({
  provider: ProviderSchema,
  apiKey: z.string().min(8).max(500),
});

export const GenerateCourseInputSchema = ProviderAccessInputSchema.extend({
  fileName: z.string().min(1).max(180),
  pdfBase64: z.string().min(100).max(12_000_000),
  model: z.string().min(2).max(120).default("auto"),
  language: LanguageSchema,
});

export type Course = z.infer<typeof CourseSchema>;
export type CourseModule = z.infer<typeof ModuleSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type AppLanguage = z.infer<typeof LanguageSchema>;
export type AIProvider = z.infer<typeof ProviderSchema>;
export type GenerateCourseInput = z.infer<typeof GenerateCourseInputSchema>;
