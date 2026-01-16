export const WATCHED_LESSONS_KEY = "hoc_am_thanh_watched_lessons";

function getWatchedKey(courseId: string, userId: string): string {
  return `${WATCHED_LESSONS_KEY}_${courseId}_${userId}`;
}

export function getWatchedLessons(courseId: string, userId: string): string[] {
  if (typeof window === "undefined") return [];
  const key = getWatchedKey(courseId, userId);
  const stored = localStorage.getItem(key);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function isLessonWatched(
  lessonId: string,
  courseId: string,
  userId: string
): boolean {
  const watched = getWatchedLessons(courseId, userId);
  return watched.includes(lessonId);
}

export function markLessonWatched(
  lessonId: string,
  courseId: string,
  userId: string
): void {
  if (typeof window === "undefined") return;
  const key = getWatchedKey(courseId, userId);
  const watched = getWatchedLessons(courseId, userId);
  if (!watched.includes(lessonId)) {
    watched.push(lessonId);
    localStorage.setItem(key, JSON.stringify(watched));
  }
}

export function unmarkLessonWatched(
  lessonId: string,
  courseId: string,
  userId: string
): void {
  if (typeof window === "undefined") return;
  const key = getWatchedKey(courseId, userId);
  const watched = getWatchedLessons(courseId, userId);
  const filtered = watched.filter((id) => id !== lessonId);
  localStorage.setItem(key, JSON.stringify(filtered));
}
