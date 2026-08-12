import { Loader2, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import type { AppLanguage } from "@shared/course";
import { CourseViewer } from "@/components/CourseViewer";
import { courseDb, loadSettings, type StoredCourse } from "@/lib/courseDb";

export default function CoursePage() {
  const [, params] = useRoute("/course/:id"); const [record, setRecord] = useState<StoredCourse | null | undefined>(undefined); const [language, setLanguage] = useState<AppLanguage>("tr");
  useEffect(() => { void courseDb.courses.get(params?.id || "").then((found) => { setRecord(found || null); if (found) void courseDb.courses.update(found.id, { lastOpenedAt: Date.now() }); }); }, [params?.id]);
  useEffect(() => { void loadSettings().then((settings) => setLanguage(settings.language)); }, []);
  if (record === undefined) return <div className="grid min-h-screen place-items-center bg-slate-50"><Loader2 className="h-6 w-6 animate-spin text-violet-600" /></div>;
  if (!record) return <div className="grid min-h-screen place-items-center bg-slate-50 p-6 text-center"><div><TriangleAlert className="mx-auto h-8 w-8 text-amber-500" /><h1 className="mt-4 text-xl font-semibold">Course not found on this device</h1><p className="mt-2 text-sm text-slate-500">This course may have been removed from local storage.</p></div></div>;
  return <CourseViewer record={record} language={language} onChange={(next) => { setRecord(next); void courseDb.courses.put(next); }} />;
}
