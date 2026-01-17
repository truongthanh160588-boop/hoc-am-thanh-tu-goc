/**
 * Quản lý progress theo cụm bài (cluster-based)
 * Mỗi cụm = 5 bài học
 * Unlock theo cụm, không phải từng bài
 */

export interface ClusterProgress {
  unlockedClusterIndex: number; // Index cụm được mở (0-based)
  completedClusters: number[]; // Số thứ tự cụm đã hoàn thành
  selfAssessments: Record<number, {
    watchPercent: number;
    understandPercent: number;
    unclearPart?: string;
    passed: boolean; // ≥ 70% = true
    timestamp: number;
  }>; // clusterNumber -> assessment
  watchTime: Record<string, {
    seconds: number;
    percent: number;
    videoDuration: number; // Thời lượng video thực tế
  }>; // lessonId -> watch time
}

const CLUSTER_SIZE = 5; // Mỗi cụm 5 bài
const MIN_WATCH_PERCENT = 0.85; // Tối thiểu 85% thời lượng video
const MIN_UNDERSTAND_PERCENT = 70; // Tối thiểu 70% tự đánh giá hiểu

const CLUSTER_PROGRESS_KEY = "hoc_am_thanh_cluster_progress";

function getClusterProgressKey(courseId: string, userId: string): string {
  return `${CLUSTER_PROGRESS_KEY}_${courseId}_${userId}`;
}

/**
 * Lấy số cụm của một bài học
 * Bài 1-5 = cụm 1, Bài 6-10 = cụm 2, ...
 */
export function getClusterNumber(lessonIndex: number): number {
  return Math.floor(lessonIndex / CLUSTER_SIZE) + 1;
}

/**
 * Lấy index cụm (0-based)
 */
export function getClusterIndex(lessonIndex: number): number {
  return Math.floor(lessonIndex / CLUSTER_SIZE);
}

/**
 * Kiểm tra xem bài học có trong cụm đã unlock chưa
 */
export function isLessonUnlocked(
  lessonIndex: number,
  unlockedClusterIndex: number
): boolean {
  const lessonClusterIndex = getClusterIndex(lessonIndex);
  return lessonClusterIndex <= unlockedClusterIndex;
}

/**
 * Lấy progress
 */
export function getClusterProgress(
  courseId: string,
  userId: string
): ClusterProgress {
  if (typeof window === "undefined") {
    return {
      unlockedClusterIndex: 0, // Cụm đầu tiên (bài 1-5) luôn mở
      completedClusters: [],
      selfAssessments: {},
      watchTime: {},
    };
  }

  const key = getClusterProgressKey(courseId, userId);
  const stored = localStorage.getItem(key);
  if (!stored) {
    return {
      unlockedClusterIndex: 0,
      completedClusters: [],
      selfAssessments: {},
      watchTime: {},
    };
  }

  try {
    return JSON.parse(stored);
  } catch {
    return {
      unlockedClusterIndex: 0,
      completedClusters: [],
      selfAssessments: {},
      watchTime: {},
    };
  }
}

/**
 * Lưu progress
 */
export function setClusterProgress(
  courseId: string,
  userId: string,
  progress: ClusterProgress
): void {
  if (typeof window === "undefined") return;
  const key = getClusterProgressKey(courseId, userId);
  localStorage.setItem(key, JSON.stringify(progress));
}

/**
 * Cập nhật watch time cho một bài học
 */
export function updateLessonWatchTime(
  courseId: string,
  userId: string,
  lessonId: string,
  watchSeconds: number,
  videoDuration: number
): void {
  const progress = getClusterProgress(courseId, userId);
  const percent = videoDuration > 0 ? (watchSeconds / videoDuration) * 100 : 0;

  progress.watchTime[lessonId] = {
    seconds: watchSeconds,
    percent: Math.min(percent, 100),
    videoDuration,
  };

  setClusterProgress(courseId, userId, progress);
}

/**
 * Kiểm tra xem bài học đã xem đủ chưa (≥ 85%)
 */
export function isLessonWatchedEnough(
  courseId: string,
  userId: string,
  lessonId: string
): boolean {
  const progress = getClusterProgress(courseId, userId);
  const watchData = progress.watchTime[lessonId];
  if (!watchData) return false;
  return watchData.percent >= MIN_WATCH_PERCENT * 100;
}

/**
 * Lưu kết quả tự đánh giá cụm bài
 */
export function saveClusterSelfAssessment(
  courseId: string,
  userId: string,
  clusterNumber: number,
  watchPercent: number,
  understandPercent: number,
  unclearPart?: string
): void {
  const progress = getClusterProgress(courseId, userId);
  const passed = understandPercent >= MIN_UNDERSTAND_PERCENT;

  progress.selfAssessments[clusterNumber] = {
    watchPercent,
    understandPercent,
    unclearPart,
    passed,
    timestamp: Date.now(),
  };

  // Nếu pass → unlock cụm tiếp theo
  if (passed) {
    const clusterIndex = clusterNumber - 1; // clusterNumber là 1-based
    if (clusterIndex >= progress.unlockedClusterIndex) {
      progress.unlockedClusterIndex = clusterIndex + 1;
    }
    if (!progress.completedClusters.includes(clusterNumber)) {
      progress.completedClusters.push(clusterNumber);
    }
  }

  setClusterProgress(courseId, userId, progress);
}

/**
 * Kiểm tra xem cụm bài đã hoàn thành chưa (đã tự đánh giá và pass)
 */
export function isClusterCompleted(
  courseId: string,
  userId: string,
  clusterNumber: number
): boolean {
  const progress = getClusterProgress(courseId, userId);
  const assessment = progress.selfAssessments[clusterNumber];
  return assessment?.passed === true;
}

/**
 * Lấy danh sách bài học trong một cụm
 */
export function getClusterLessons(
  allLessons: Array<{ id: string }>,
  clusterNumber: number
): string[] {
  const startIndex = (clusterNumber - 1) * CLUSTER_SIZE;
  const endIndex = startIndex + CLUSTER_SIZE;
  return allLessons.slice(startIndex, endIndex).map((l) => l.id);
}

/**
 * Kiểm tra xem tất cả bài trong cụm đã xem đủ chưa
 */
export function areAllClusterLessonsWatched(
  courseId: string,
  userId: string,
  clusterLessons: string[]
): boolean {
  return clusterLessons.every((lessonId) =>
    isLessonWatchedEnough(courseId, userId, lessonId)
  );
}
