export const WATCH_TIME_KEY = "hoc_am_thanh_watch_time";

function getWatchTimeKey(courseId: string, userId: string, lessonId: string): string {
  return `${WATCH_TIME_KEY}_${courseId}_${userId}_${lessonId}`;
}

export interface WatchTimeData {
  watchSeconds: number;
  videoDuration: number; // Thời lượng video thực tế từ YouTube
  lastUpdated: number;
}

const MIN_WATCH_PERCENT = 0.85; // 85% (updated to match new system)

export function getWatchTime(
  lessonId: string,
  courseId: string,
  userId: string
): WatchTimeData {
  if (typeof window === "undefined") {
    return { watchSeconds: 0, videoDuration: 0, lastUpdated: 0 };
  }

  const key = getWatchTimeKey(courseId, userId, lessonId);
  const stored = localStorage.getItem(key);
  if (!stored) {
    return { watchSeconds: 0, videoDuration: 0, lastUpdated: 0 };
  }

  try {
    const data = JSON.parse(stored);
    // Backward compatibility: nếu không có videoDuration, dùng 0
    return {
      watchSeconds: data.watchSeconds || 0,
      videoDuration: data.videoDuration || 0,
      lastUpdated: data.lastUpdated || 0,
    };
  } catch {
    return { watchSeconds: 0, videoDuration: 0, lastUpdated: 0 };
  }
}

export function updateWatchTime(
  lessonId: string,
  courseId: string,
  userId: string,
  currentTime: number, // Thời gian hiện tại của video (từ YouTube API)
  videoDuration: number // Thời lượng video thực tế (từ YouTube API)
): void {
  if (typeof window === "undefined") return;

  const key = getWatchTimeKey(courseId, userId, lessonId);
  const current = getWatchTime(lessonId, courseId, userId);
  
  // Lưu thời gian xem cao nhất (không giảm nếu user tua ngược)
  const newWatchSeconds = Math.max(
    current.watchSeconds || 0,
    Math.min(currentTime, videoDuration) // Không vượt quá duration
  );

  const updated: WatchTimeData = {
    watchSeconds: newWatchSeconds,
    videoDuration: videoDuration || current.videoDuration || 0, // Update duration nếu có
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
  
  // Nếu chưa có videoDuration, fallback về check seconds (backward compatibility)
  if (!watchTime.videoDuration || watchTime.videoDuration === 0) {
    // Fallback: nếu đã xem >= 4 phút (240s) thì cho phép
    return watchTime.watchSeconds >= 240;
  }
  
  // Check theo %: watchSeconds >= 85% của videoDuration
  const minWatchSeconds = watchTime.videoDuration * MIN_WATCH_PERCENT;
  return watchTime.watchSeconds >= minWatchSeconds;
}

export function getWatchProgress(
  lessonId: string,
  courseId: string,
  userId: string
): { seconds: number; percent: number; requiredSeconds: number } {
  const watchTime = getWatchTime(lessonId, courseId, userId);
  
  // Nếu chưa có videoDuration, dùng fallback
  if (!watchTime.videoDuration || watchTime.videoDuration === 0) {
    const fallbackDuration = 300; // 5 phút fallback
    const percent = (watchTime.watchSeconds / fallbackDuration) * 100;
    return {
      seconds: watchTime.watchSeconds,
      percent: Math.min(percent, 100),
      requiredSeconds: fallbackDuration * MIN_WATCH_PERCENT,
    };
  }
  
  const percent = (watchTime.watchSeconds / watchTime.videoDuration) * 100;
  const requiredSeconds = watchTime.videoDuration * MIN_WATCH_PERCENT;
  
  return {
    seconds: watchTime.watchSeconds,
    percent: Math.min(percent, 100),
    requiredSeconds,
  };
}
