/**
 * Server-side guards for /learn routes
 * Không tin localStorage, mọi quyền học quyết định bằng server (DB)
 */

import { createClient } from "@/lib/supabase/server";
import { hasActiveActivation } from "@/lib/activations";
import { getLessonIndex } from "@/lib/guard";
import { getCourse } from "@/lib/courseStore";

export interface GuardResult {
  allowed: boolean;
  redirect?: string;
  reason?: string;
}

/**
 * Check if user can access /learn route
 * Guards theo thứ tự:
 * 1. Auth
 * 2. Purchase paid
 * 3. Activated (có ít nhất 1 device active)
 * 4. Lesson unlocked
 */
export async function checkLearnAccess(
  courseId: string,
  lessonId: string
): Promise<GuardResult> {
  const supabase = await createClient();

  // 1. Check auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      allowed: false,
      redirect: "/auth",
      reason: "Chưa đăng nhập",
    };
  }

  const userId = user.id;

  // Check if lesson is preview (allow without purchase/activation)
  const courseData = getCourse();
  const lesson = courseData.lessons.find((l) => l.id === lessonId);
  const isPreview = lesson?.is_preview === true;

  // Preview lessons: only need auth, skip purchase/activation checks
  if (isPreview) {
    // Still check lesson unlock for preview (but allow even if not unlocked)
    return { allowed: true };
  }

  // Non-preview lessons: require purchase paid + activation

  // 2. Check purchase paid
  const { data: purchase, error: purchaseError } = await supabase
    .from("purchases")
    .select("id, status")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("status", "paid")
    .maybeSingle();

  if (purchaseError) {
    console.error("[learn-guard] Error checking purchase:", purchaseError);
    return {
      allowed: false,
      redirect: `/courses/${courseId}`,
      reason: "Lỗi kiểm tra thanh toán",
    };
  }

  if (!purchase) {
    return {
      allowed: false,
      redirect: `/courses/${courseId}`,
      reason: "Chưa thanh toán khóa học",
    };
  }

  // 3. Check activated (có ít nhất 1 device active) - từ DB, không tin localStorage
  const activated = await hasActiveActivation({ userId, courseId });
  if (!activated) {
    return {
      allowed: false,
      redirect: `/courses/${courseId}`,
      reason: "Chưa kích hoạt thiết bị",
    };
  }

  // 4. Check lesson unlocked
  const lessonIndex = getLessonIndex(lessonId);
  if (lessonIndex < 0) {
    return {
      allowed: false,
      redirect: `/courses/${courseId}`,
      reason: "Bài học không tồn tại",
    };
  }

  // Bài 0 (index 0) luôn unlock
  if (lessonIndex === 0) {
    return { allowed: true };
  }

  // Check progress from DB (server-side)
  try {
    const { data: progress, error: progressError } = await supabase
      .from("progress")
      .select("unlocked_index")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();

    if (progressError && progressError.code !== "PGRST116") {
      // PGRST116 = not found, which is OK (default to 0)
      console.error("[learn-guard] Error checking progress:", progressError);
    }

    const unlockedIndex = progress?.unlocked_index ?? 0;
    if (lessonIndex > unlockedIndex) {
      return {
        allowed: false,
        redirect: `/courses/${courseId}`,
        reason: "Bài học chưa được mở khóa",
      };
    }
  } catch (error) {
    console.error("[learn-guard] Error checking progress:", error);
    // Fallback: allow if can't check progress
    return { allowed: true };
  }

  return { allowed: true };
}

/**
 * Check if user has paid for course (server-side)
 */
export async function isCoursePaidServer(
  userId: string,
  courseId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("status", "paid")
    .maybeSingle();

  if (error) {
    console.error("[learn-guard] Error checking purchase:", error);
    return false;
  }

  return !!data;
}

/**
 * Check if user has activated course (server-side)
 */
export async function isCourseActivatedServer(
  userId: string,
  courseId: string
): Promise<boolean> {
  return await hasActiveActivation({ userId, courseId });
}
