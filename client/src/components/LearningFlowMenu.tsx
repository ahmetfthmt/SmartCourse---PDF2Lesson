import { Check, ChevronRight, Circle, Compass, LockKeyhole, Sparkles } from "lucide-react";
import type { AppLanguage, CourseModule } from "@shared/course";
import { buildLearningFlow } from "@/lib/learningFlow";

type LearningFlowMenuProps = {
  modules: CourseModule[];
  completedLessonIds: string[];
  activeModuleIndex: number;
  activeLessonIndex: number;
  language: AppLanguage;
  onSelectLesson: (moduleIndex: number, lessonIndex: number) => void;
};

const palette = [
  { line: "bg-violet-300", icon: "bg-violet-600", surface: "from-violet-50 to-white", ring: "ring-violet-200", text: "text-violet-700" },
  { line: "bg-cyan-300", icon: "bg-cyan-600", surface: "from-cyan-50 to-white", ring: "ring-cyan-200", text: "text-cyan-700" },
  { line: "bg-amber-300", icon: "bg-amber-500", surface: "from-amber-50 to-white", ring: "ring-amber-200", text: "text-amber-700" },
  { line: "bg-emerald-300", icon: "bg-emerald-600", surface: "from-emerald-50 to-white", ring: "ring-emerald-200", text: "text-emerald-700" },
  { line: "bg-rose-300", icon: "bg-rose-500", surface: "from-rose-50 to-white", ring: "ring-rose-200", text: "text-rose-700" },
];

export function LearningFlowMenu({ modules, completedLessonIds, activeModuleIndex, activeLessonIndex, language, onSelectLesson }: LearningFlowMenuProps) {
  const flow = buildLearningFlow(modules, completedLessonIds, language);
  const nextLessonId = flow.flatMap((stage) => stage.lessons).find((lesson) => !lesson.completed)?.id;
  const labels = language === "tr" ? { route: "Öğrenme rotası", progress: "ilerleme", next: "Sıradaki adım", complete: "Tamamlandı", lesson: "ders" } : { route: "Learning route", progress: "progress", next: "Next step", complete: "Completed", lesson: "lesson" };

  return <nav aria-label={labels.route} className="relative">
    <div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-950 text-white shadow-sm"><Compass className="h-4 w-4" /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{labels.route}</p><p className="text-sm font-semibold text-slate-900">{flow.length} {language === "tr" ? "aşamalı yol" : "stage path"}</p></div></div><Sparkles className="h-4 w-4 text-violet-500" /></div>
    <div className="relative space-y-3 before:absolute before:bottom-7 before:left-[1.35rem] before:top-7 before:w-px before:bg-slate-200">
      {flow.map((stage, stageIndex) => {
        const colors = palette[stageIndex % palette.length] as (typeof palette)[number];
        const activeStage = stage.moduleIndex === activeModuleIndex;
        const stageComplete = stage.completedLessons === stage.totalLessons;
        return <section key={stage.moduleIndex} className={`relative overflow-hidden rounded-2xl border transition-all duration-200 ${activeStage ? `border-transparent bg-gradient-to-br ${colors.surface} ring-1 ${colors.ring} shadow-[0_18px_28px_-26px_rgba(15,23,42,.55)]` : "border-transparent bg-white hover:border-slate-200 hover:shadow-[0_14px_26px_-25px_rgba(15,23,42,.45)]"}`}>
          <div className="relative flex items-start gap-3 px-3.5 pb-2.5 pt-3.5"><span className={`relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white shadow-sm ${stageComplete ? "bg-emerald-500" : colors.icon}`}>{stageComplete ? <Check className="h-3.5 w-3.5" /> : stage.stageNumber}</span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className={`text-[10px] font-bold uppercase tracking-[0.14em] ${activeStage ? colors.text : "text-slate-400"}`}>{stage.stageLabel}</p><span className="text-[10px] font-medium text-slate-400">{stage.completedLessons}/{stage.totalLessons}</span></div><p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-5 text-slate-900">{stage.title}</p></div></div>
          <div className="space-y-0.5 px-2 pb-2.5">{stage.lessons.map((lesson) => {
            const active = activeStage && lesson.lessonIndex === activeLessonIndex;
            const isNext = lesson.id === nextLessonId;
            return <button type="button" key={lesson.id} aria-current={active ? "step" : undefined} onClick={() => onSelectLesson(stage.moduleIndex, lesson.lessonIndex)} className={`group flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left transition-all duration-150 ${active ? "bg-white/90 text-slate-950 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}>
              <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${lesson.completed ? "border-emerald-500 bg-emerald-500 text-white" : active ? `border-transparent ${colors.icon} text-white` : "border-slate-300 text-transparent"}`}>{lesson.completed ? <Check className="h-2.5 w-2.5" /> : active ? <Circle className="h-2.5 w-2.5 fill-current" /> : <LockKeyhole className="h-2.5 w-2.5 opacity-0" />}</span><span className="min-w-0 flex-1"><span className="block line-clamp-1 text-xs font-medium">{lesson.title}</span>{isNext && !active && <span className={`mt-0.5 block text-[9px] font-bold uppercase tracking-[0.12em] ${colors.text}`}>{labels.next}</span>}</span>{active && <ChevronRight className={`h-3.5 w-3.5 shrink-0 ${colors.text}`} />}</button>;
          })}</div>
        </section>;
      })}
    </div>
  </nav>;
}
