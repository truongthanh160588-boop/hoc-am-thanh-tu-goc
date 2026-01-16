import { getProgress } from "./progress";
import { getCourse } from "./courseStore";

export function canAccessLesson(
  lessonIndex: number,
  courseId: string,
  userId: string
): boolean {
  const progress = getProgress(courseId, userId);
  return lessonIndex <= progress.unlockedLessonIndex;
}

export function isLessonCompleted(
  lessonId: string,
  courseId: string,
  userId: string
): boolean {
  const progress = getProgress(courseId, userId);
  return progress.completedLessons.includes(lessonId);
}

export function getLessonIndex(lessonId: string): number {
  const courseData = getCourse();
  return courseData.lessons.findIndex((l) => l.id === lessonId);
}
