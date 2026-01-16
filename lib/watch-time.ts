export const WATCH_TIME_KEY = "hoc_am_thanh_watch_time";

function getWatchTimeKey(courseId: string, userId: string, lessonId: string): string {
  return `${WATCH_TIME_KEY}_${courseId}_${userId}_${lessonId}`;
}

export interface WatchTimeData {
  watchSeconds: number;
  lastUpdated: number;
}

// Mock video duration (5 phút = 300s, có thể thay đổi)
const DEFAULT_VIDEO_DURATION = 300; // 5 phút
const MIN_WATCH_PERCENT = 0.8; // 80%
const MIN_WATCH_SECONDS = DEFAULT_VIDEO_DURATION * MIN_WATCH_PERCENT; // 240s = 4 phút

export function getWatchTime(
  lessonId: string,
  courseId: string,
  userId: string
): WatchTimeData {
  if (typeof window === "undefined") {
    return { watchSeconds: 0, lastUpdated: 0 };
  }

  const key = getWatchTimeKey(courseId, userId, lessonId);
  const stored = localStorage.getItem(key);
  if (!stored) {
    return { watchSeconds: 0, lastUpdated: 0 };
  }

  try {
    return JSON.parse(stored);
  } catch {
    return { watchSeconds: 0, lastUpdated: 0 };
  }
}

export function updateWatchTime(
  lessonId: string,
  courseId: string,
  userId: string,
  additionalSeconds: number
): void {
  if (typeof window === "undefined") return;

  const key = getWatchTimeKey(courseId, userId, lessonId);
  const current = getWatchTime(lessonId, courseId, userId);
  
  const newWatchSeconds = Math.min(
    current.watchSeconds + additionalSeconds,
    DEFAULT_VIDEO_DURATION // Không vượt quá duration
  );

  const updated: WatchTimeData = {
    watchSeconds: newWatchSeconds,
    lastUpdated: Date.now(),
  };

  localStorage.setItem(key, JSON.stringify(updated));
}

export function canMarkAsWatched(
  lessonId: string,
  courseId: string,
  userId: string
): boolean {
  const watchTime = getWatchTime(lessonId, courseId, userId);
  return watchTime.watchSeconds >= MIN_WATCH_SECONDS;
}

export function getWatchProgress(
  lessonId: string,
  courseId: string,
  userId: string
): { seconds: number; percent: number; requiredSeconds: number } {
  const watchTime = getWatchTime(lessonId, courseId, userId);
  const percent = (watchTime.watchSeconds / DEFAULT_VIDEO_DURATION) * 100;
  
  return {
    seconds: watchTime.watchSeconds,
    percent: Math.min(percent, 100),
    requiredSeconds: MIN_WATCH_SECONDS,
  };
}
