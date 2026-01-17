/**
 * Server-side activation helpers
 * Làm việc với bảng activations trong Supabase
 */

import { createClient } from "@/lib/supabase/server";

export interface ActivationRow {
  id: string;
  user_id: string;
  course_id: string;
  device_id: string;
  activated_at: string;
  revoked_at: string | null;
  revoked_by: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Lấy danh sách devices đang active (chưa bị revoke) cho user + course
 */
export async function getActiveDevices(
  userId: string,
  courseId: string
): Promise<ActivationRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("activations")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .is("revoked_at", null)
    .order("activated_at", { ascending: false });

  if (error) {
    console.error("[activation-supabase] Error getting active devices:", error);
    return [];
  }

  return data || [];
}

/**
 * Kiểm tra user đã activated course chưa (có ít nhất 1 device active)
 */
export async function isActivated(
  userId: string,
  courseId: string
): Promise<boolean> {
  const devices = await getActiveDevices(userId, courseId);
  return devices.length > 0;
}

/**
 * Đếm số devices đang active cho user + course
 */
export async function countActiveDevices(
  userId: string,
  courseId: string
): Promise<number> {
  const devices = await getActiveDevices(userId, courseId);
  return devices.length;
}

/**
 * Kiểm tra deviceId đã được activate chưa (và chưa bị revoke)
 */
export async function isDeviceActivated(
  userId: string,
  courseId: string,
  deviceId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("activations")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("device_id", deviceId)
    .is("revoked_at", null)
    .maybeSingle();

  if (error) {
    console.error("[activation-supabase] Error checking device:", error);
    return false;
  }

  return !!data;
}

/**
 * Tạo activation mới (server-side, dùng service role hoặc user context)
 */
export async function createActivation(
  userId: string,
  courseId: string,
  deviceId: string,
  note?: string
): Promise<{ data: ActivationRow | null; error: any }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("activations")
    .insert({
      user_id: userId,
      course_id: courseId,
      device_id: deviceId,
      note: note || null,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Revoke activation (admin only)
 */
export async function revokeActivation(
  activationId: string,
  revokedBy: string,
  note?: string
): Promise<{ error: any }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("activations")
    .update({
      revoked_at: new Date().toISOString(),
      revoked_by: revokedBy,
      note: note || null,
    })
    .eq("id", activationId);

  return { error };
}

/**
 * Revoke activation by user_id + course_id + device_id
 */
export async function revokeDevice(
  userId: string,
  courseId: string,
  deviceId: string,
  revokedBy: string,
  note?: string
): Promise<{ error: any }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("activations")
    .update({
      revoked_at: new Date().toISOString(),
      revoked_by: revokedBy,
      note: note || null,
    })
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("device_id", deviceId)
    .is("revoked_at", null); // Chỉ revoke những cái chưa bị revoke

  return { error };
}

/**
 * List activations (admin only)
 * @param courseId Optional filter by course
 * @param status 'active' | 'revoked' | 'all'
 */
export async function listActivationsAdmin(
  courseId?: string,
  status: "active" | "revoked" | "all" = "all"
): Promise<ActivationRow[]> {
  const supabase = await createClient();

  let query = supabase
    .from("activations")
    .select("*")
    .order("created_at", { ascending: false });

  if (courseId) {
    query = query.eq("course_id", courseId);
  }

  if (status === "active") {
    query = query.is("revoked_at", null);
  } else if (status === "revoked") {
    query = query.not("revoked_at", "is", null);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[activation-supabase] Error listing activations:", error);
    return [];
  }

  return data || [];
}
