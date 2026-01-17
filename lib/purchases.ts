/**
 * Server-only purchase helpers
 * Dùng service role để bypass RLS khi cần
 */

import { getServiceClient } from "@/lib/supabase/service";

export interface PurchaseRow {
  id: string;
  user_id: string;
  course_id: string;
  status: "pending" | "paid" | "rejected";
  amount_vnd?: number;
  amount?: number;
  transaction_code?: string;
  note?: string;
  proof_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePurchasePayload {
  courseId: string;
  amount?: number;
  amountVnd?: number;
  note?: string;
  proofUrl?: string;
}

/**
 * Lấy purchase của user cho course
 */
export async function getPurchase(
  userId: string,
  courseId: string
): Promise<PurchaseRow | null> {
  const supabase = getServiceClient() as any;

  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (error) {
    console.error("[purchases] Error getting purchase:", error);
    return null;
  }

  return data;
}

/**
 * Tạo purchase mới với status pending
 * Nếu đã có purchase và chưa paid, update lại
 */
export async function createPendingPurchase(
  userId: string,
  payload: CreatePurchasePayload
): Promise<{ data: PurchaseRow | null; error: any }> {
  const supabase = getServiceClient() as any;

  // Check existing purchase
  const existing = await getPurchase(userId, payload.courseId);
  
  // Nếu đã có purchase và status là paid, không cho tạo mới
  if (existing && existing.status === "paid") {
    return {
      data: existing,
      error: { message: "Đã có purchase paid cho khóa học này" },
    };
  }

  // Upsert: nếu có pending thì update, không thì insert
  const purchaseData: any = {
    user_id: userId,
    course_id: payload.courseId,
    status: "pending",
  };

  if (payload.amount !== undefined) {
    purchaseData.amount = payload.amount;
  }
  if (payload.amountVnd !== undefined) {
    purchaseData.amount_vnd = payload.amountVnd;
  }
  if (payload.note) {
    purchaseData.note = payload.note;
  }
  if (payload.proofUrl) {
    purchaseData.proof_url = payload.proofUrl;
  }

  const { data, error } = await supabase
    .from("purchases")
    .upsert(purchaseData, {
      onConflict: "user_id,course_id",
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Admin: List purchases với filter status
 */
export async function adminListPurchases(
  status?: "pending" | "paid" | "rejected"
): Promise<PurchaseRow[]> {
  const supabase = getServiceClient() as any;

  let query = supabase
    .from("purchases")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[purchases] Error listing purchases:", error);
    return [];
  }

  return data || [];
}

/**
 * Admin: Set purchase status
 */
export async function adminSetPurchaseStatus(
  purchaseId: string,
  status: "paid" | "rejected"
): Promise<{ error: any }> {
  const supabase = getServiceClient() as any;

  const { error } = await supabase
    .from("purchases")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", purchaseId);

  return { error };
}
