import { CheckCircle2, ChevronLeft, Clock3, FileText, GraduationCap, ListChecks, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Streamdown } from "./LessonMarkdown";
import type { AppLanguage, CourseModule, Lesson } from "@shared/course";
import type { StoredCourse } from "@/lib/courseDb";
import { getCopy } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LearningFlowMenu } from "./LearningFlowMenu";
import { QuizModule } from "./QuizModule";

export function CourseViewer({ record, language, onChange }: { record: StoredCourse; language: AppLanguage; onChange: (record: StoredCourse) => void }) {
  const copy = getCopy(language);
  const [moduleIndex, setModuleIndex] = useState(0);
  const [lessonIndex, setLessonIndex] = useState(0);
  const module = record.course.modules[moduleIndex] as CourseModule;
  const lesson = module.lessons[lessonIndex] as Lesson;
  const allLessons = useMemo(() => record.course.modules.flatMap((item) => item.lessons), [record.course.modules]);
  const completion = Math.round((record.completedLessonIds.length / Math.max(allLessons.length, 1)) * 100);
  const lessonDone = record.completedLessonIds.includes(lesson.id);
  const selectLesson = (nextModuleIndex: number, nextLessonIndex: number) => { setModuleIndex(nextModuleIndex); setLessonIndex(nextLessonIndex); };
  const nextLesson = () => { if (lessonIndex < module.lessons.length - 1) return selectLesson(moduleIndex, lessonIndex + 1); if (moduleIndex < record.course.modules.length - 1) selectLesson(moduleIndex + 1, 0); };
  const updateCompleted = () => { if (!lessonDone) onChange({ ...record, completedLessonIds: [...record.completedLessonIds, lesson.id], lastOpenedAt: Date.now() }); };

  return <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl"><div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 sm:px-6"><a href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"><ChevronLeft className="h-4 w-4" />{copy.courseBack}</a><div className="hidden items-center gap-3 sm:flex"><span className="text-sm font-medium text-slate-500">{completion}%</span><Progress value={completion} className="h-2 w-36 bg-slate-100" /></div><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />{copy.offline}</span></div></header>
    <div className="mx-auto grid max-w-[1500px] grid-cols-1 lg:grid-cols-[318px_minmax(0,1fr)_250px]">
      <aside className="border-b border-slate-200 bg-white p-4 sm:p-5 lg:min-h-[calc(100vh-57px)] lg:border-b-0 lg:border-r"><LearningFlowMenu modules={record.course.modules} completedLessonIds={record.completedLessonIds} activeModuleIndex={moduleIndex} activeLessonIndex={lessonIndex} language={language} onSelectLesson={selectLesson} /></aside>
      <main className="min-w-0 px-4 py-8 sm:px-8 lg:px-12"><div className="mx-auto max-w-3xl"><div className="mb-8"><div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-violet-700"><Sparkles className="h-3.5 w-3.5" />{module.title}</div><h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{lesson.title}</h1><div className="mt-4 flex items-center gap-2 text-sm text-slate-500"><Clock3 className="h-4 w-4" />{lesson.estimatedReadTimeMinutes} {copy.minutes}</div></div><article className="course-content max-w-none"><Streamdown>{lesson.contentMarkdown}</Streamdown></article><section className="mt-10 rounded-3xl border border-violet-100 bg-violet-50/70 p-6"><div className="mb-4 flex items-center gap-2 text-sm font-bold text-violet-950"><ListChecks className="h-4 w-4" />{copy.keyIdeas}</div><ul className="space-y-3">{lesson.keyTakeaways.map((takeaway) => <li key={takeaway} className="flex gap-3 text-sm leading-6 text-violet-950/80"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-violet-600" />{takeaway}</li>)}</ul></section><div className="mt-6 flex flex-wrap items-center gap-3"><Button onClick={updateCompleted} className={lessonDone ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-950 hover:bg-slate-800"}>{lessonDone ? <><CheckCircle2 className="mr-2 h-4 w-4" />{copy.completed}</> : copy.completeLesson}</Button><Button variant="outline" onClick={nextLesson} className="border-slate-200 bg-white">{copy.next}</Button></div><section className="mt-14 border-t border-slate-200 pt-10"><div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-violet-700"><FileText className="h-3.5 w-3.5" />{copy.practice}</div><h2 className="font-serif text-2xl font-semibold text-slate-950">{module.title}</h2><p className="mt-3 rounded-2xl bg-slate-950 p-5 text-sm leading-6 text-slate-100">{module.practicalAssignment}</p></section><section className="mt-14 border-t border-slate-200 pt-10"><div className="mb-6"><div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-violet-700"><GraduationCap className="h-3.5 w-3.5" />{copy.quiz}</div><h2 className="font-serif text-2xl font-semibold text-slate-950">{module.title}</h2></div><QuizModule questions={module.quiz} labels={copy} /></section></div></main>
      <aside className="border-t border-slate-200 bg-white p-5 lg:min-h-[calc(100vh-57px)] lg:border-l lg:border-t-0"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{copy.overview}</p><p className="mt-3 text-sm leading-6 text-slate-600">{record.course.summary}</p></div><dl className="mt-5 space-y-4 text-sm"><div><dt className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">{copy.audience}</dt><dd className="mt-1 text-slate-700">{record.course.targetAudience}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">{copy.estimated}</dt><dd className="mt-1 font-medium text-slate-700">{record.course.estimatedHours} {language === "tr" ? "saat" : "hours"}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">{copy.source}</dt><dd className="mt-1 truncate text-slate-700">{record.sourceFileName}</dd></div></dl></aside>
    </div>
  </div>;
}
