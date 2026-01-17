/**
 * Server-only activation helpers
 * Dùng service role để bypass RLS khi cần
 */

import { getServiceClient } from "@/lib/supabase/service";

export interface ActivationParams {
  userId: string;
  courseId: string;
  deviceId?: string;
}

/**
 * Đếm số activations đang active (revoked_at IS NULL)
 */
export async function getActiveActivationCount({
  userId,
  courseId,
}: ActivationParams): Promise<number> {
  const supabase = getServiceClient() as any;

  const { count, error } = await supabase
    .from("activations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .is("revoked_at", null);

  if (error) {
    console.error("[activations] Error counting active:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Kiểm tra device đã active chưa (và chưa bị revoke)
 */
export async function isDeviceActive({
  userId,
  courseId,
  deviceId,
}: Required<ActivationParams>): Promise<boolean> {
  if (!deviceId) return false;

  const supabase = getServiceClient() as any;

  const { data, error } = await supabase
    .from("activations")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("device_id", deviceId)
    .is("revoked_at", null)
    .maybeSingle();

  if (error) {
    console.error("[activations] Error checking device:", error);
    return false;
  }

  return !!data;
}

/**
 * Insert activation mới (dùng service role để bypass RLS)
 */
export async function insertActivation({
  userId,
  courseId,
  deviceId,
}: Required<ActivationParams>): Promise<{ data: any; error: any }> {
  if (!deviceId) {
    return { data: null, error: { message: "deviceId is required" } };
  }

  const supabase = getServiceClient() as any;

  const { data, error } = await supabase
    .from("activations")
    .insert({
      user_id: userId,
      course_id: courseId,
      device_id: deviceId,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Kiểm tra user có ít nhất 1 activation active không
 */
export async function hasActiveActivation({
  userId,
  courseId,
}: ActivationParams): Promise<boolean> {
  const count = await getActiveActivationCount({ userId, courseId });
  return count > 0;
}
