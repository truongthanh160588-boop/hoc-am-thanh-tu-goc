export const PURCHASED_COURSES_KEY = "hoc_am_thanh_purchased_courses";

export function getPurchasedCourses(): string[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(PURCHASED_COURSES_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function isCoursePurchased(courseId: string): boolean {
  const purchased = getPurchasedCourses();
  return purchased.includes(courseId);
}

export function purchaseCourse(courseId: string): void {
  if (typeof window === "undefined") return;
  const purchased = getPurchasedCourses();
  if (!purchased.includes(courseId)) {
    purchased.push(courseId);
    localStorage.setItem(PURCHASED_COURSES_KEY, JSON.stringify(purchased));
  }
}
