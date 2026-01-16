import { courseData as defaultCourseData, Course } from "@/data/course";

// Re-export Course type for convenience
export type { Course } from "@/data/course";

const COURSE_STORAGE_KEY = "course_audio_goc_01";

export function getCourse(): Course {
  if (typeof window === "undefined") {
    return defaultCourseData;
  }

  const stored = localStorage.getItem(COURSE_STORAGE_KEY);
  if (!stored) {
    return defaultCourseData;
  }

  try {
    const parsed = JSON.parse(stored);
    // Validate structure
    if (parsed && parsed.id && parsed.lessons && Array.isArray(parsed.lessons)) {
      return parsed as Course;
    }
  } catch {
    // Invalid JSON, return default
  }

  return defaultCourseData;
}

export function setCourse(course: Course): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(course));
}

export function resetCourse(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(COURSE_STORAGE_KEY);
}

export function hasCustomCourse(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(COURSE_STORAGE_KEY) !== null;
}
