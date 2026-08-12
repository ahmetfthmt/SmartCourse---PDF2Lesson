import Dexie, { type Table } from "dexie";
import type { AIProvider, AppLanguage, Course } from "@shared/course";

export interface StoredCourse { id: string; course: Course; sourceFileName: string; sourcePageCount: number; createdAt: number; completedLessonIds: string[]; lastOpenedAt: number; }
export interface LocalProviderSettings { provider: AIProvider; model: string; language: AppLanguage; apiKey?: string; rememberKey: boolean; }
interface Preference { key: string; value: unknown; }

class SmartCourseDatabase extends Dexie {
  courses!: Table<StoredCourse, string>;
  preferences!: Table<Preference, string>;
  constructor() { super("smartcourse-offline"); this.version(1).stores({ courses: "id, createdAt, lastOpenedAt", preferences: "&key" }); }
}

export const courseDb = new SmartCourseDatabase();
export const defaultSettings: LocalProviderSettings = { provider: "openai", model: "gpt-4o", language: "tr", rememberKey: false };
export async function loadSettings(): Promise<LocalProviderSettings> { const result = await courseDb.preferences.get("provider-settings"); return { ...defaultSettings, ...(result?.value as Partial<LocalProviderSettings> | undefined) }; }
export async function saveSettings(settings: LocalProviderSettings) { const saved: LocalProviderSettings = settings.rememberKey ? settings : { ...settings, apiKey: undefined }; await courseDb.preferences.put({ key: "provider-settings", value: saved }); }
export async function saveCourse(record: StoredCourse) { await courseDb.courses.put(record); }
export async function listCourses() { return courseDb.courses.orderBy("lastOpenedAt").reverse().toArray(); }
