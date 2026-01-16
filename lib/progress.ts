export interface LessonProgress {
  unlockedLessonIndex: number; // Index bài được mở (0-based)
  completedLessons: string[]; // IDs của các bài đã hoàn thành
  quizAttempts: Record<string, number>; // lessonId -> số lần làm quiz
  quizResults: Record<string, { score: number; passed: boolean; timestamp: number }>; // lessonId -> kết quả
}

const PROGRESS_STORAGE_KEY = "hoc_am_thanh_progress";

function getProgressKey(courseId: string, userId: string): string {
  return `${PROGRESS_STORAGE_KEY}_${courseId}_${userId}`;
}

export function getProgress(
  courseId: string,
  userId: string
): LessonProgress {
  if (typeof window === "undefined") {
    return {
      unlockedLessonIndex: 0,
      completedLessons: [],
      quizAttempts: {},
      quizResults: {},
    };
  }

  const key = getProgressKey(courseId, userId);
  const stored = localStorage.getItem(key);
  if (!stored) {
    // Bài đầu tiên (index 0) luôn được mở mặc định
    return {
      unlockedLessonIndex: 0,
      completedLessons: [],
      quizAttempts: {},
      quizResults: {},
    };
  }

  try {
    return JSON.parse(stored);
  } catch {
    return {
      unlockedLessonIndex: 0,
      completedLessons: [],
      quizAttempts: {},
      quizResults: {},
    };
  }
}

export function setProgress(
  courseId: string,
  userId: string,
  progress: LessonProgress
): void {
  if (typeof window === "undefined") return;
  const key = getProgressKey(courseId, userId);
  localStorage.setItem(key, JSON.stringify(progress));
}

export function unlockNextLesson(
  courseId: string,
  userId: string,
  currentLessonIndex: number
): void {
  const progress = getProgress(courseId, userId);
  if (currentLessonIndex >= progress.unlockedLessonIndex) {
    progress.unlockedLessonIndex = currentLessonIndex + 1;
    setProgress(courseId, userId, progress);
  }
}

export function completeLesson(
  courseId: string,
  userId: string,
  lessonId: string
): void {
  const progress = getProgress(courseId, userId);
  if (!progress.completedLessons.includes(lessonId)) {
    progress.completedLessons.push(lessonId);
    setProgress(courseId, userId, progress);
  }
}

export function recordQuizAttempt(
  courseId: string,
  userId: string,
  lessonId: string,
  score: number,
  passed: boolean
): void {
  const progress = getProgress(courseId, userId);
  progress.quizAttempts[lessonId] = (progress.quizAttempts[lessonId] || 0) + 1;
  progress.quizResults[lessonId] = {
    score,
    passed,
    timestamp: Date.now(),
  };
  setProgress(courseId, userId, progress);
}
