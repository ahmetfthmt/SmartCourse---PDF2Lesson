import type { AppLanguage, CourseModule } from "@shared/course";

export type LearningFlowStage = {
  moduleIndex: number;
  stageLabel: string;
  stageNumber: string;
  title: string;
  completedLessons: number;
  totalLessons: number;
  lessons: Array<{ id: string; title: string; lessonIndex: number; completed: boolean }>;
};

const trStageNames = ["Temel", "Kavrama", "Uygulama", "Ustalık", "Kapanış"];
const enStageNames = ["Foundation", "Understanding", "Practice", "Mastery", "Wrap-up"];

function stageName(index: number, total: number, language: AppLanguage) {
  const names = language === "tr" ? trStageNames : enStageNames;
  if (total <= 1) return language === "tr" ? "Öğrenme yolu" : "Learning path";
  if (index === 0) return names[0];
  if (index === total - 1) return names[4];
  const ratio = index / (total - 1);
  return ratio < 0.45 ? names[1] : ratio < 0.78 ? names[2] : names[3];
}

export function buildLearningFlow(modules: CourseModule[], completedLessonIds: string[], language: AppLanguage): LearningFlowStage[] {
  const completed = new Set(completedLessonIds);
  return modules.map((module, moduleIndex) => {
    const lessons = module.lessons.map((lesson, lessonIndex) => ({ id: lesson.id, title: lesson.title, lessonIndex, completed: completed.has(lesson.id) }));
    return {
      moduleIndex,
      stageLabel: stageName(moduleIndex, modules.length, language),
      stageNumber: String(moduleIndex + 1).padStart(2, "0"),
      title: module.title,
      completedLessons: lessons.filter((lesson) => lesson.completed).length,
      totalLessons: lessons.length,
      lessons,
    };
  });
}
