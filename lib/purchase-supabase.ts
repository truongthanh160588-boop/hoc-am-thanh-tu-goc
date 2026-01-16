"use client";

import { createClient } from "@/lib/supabase/client";

export interface Purchase {
  id: string;
  user_id: string;
  course_id: string;
  status: "pending" | "paid" | "rejected";
  amount_vnd: number;
  transaction_code?: string;
  note?: string;
  created_at: string;
  updated_at: string;
}

export async function createPurchase(
  courseId: string,
  amountVnd: number,
  transactionCode?: string,
  note?: string
): Promise<{ data: Purchase | null; error: any }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: { message: "Chưa đăng nhập" } };
  }

  const { data, error } = await supabase
    .from("purchases")
    .insert({
      user_id: user.id,
      course_id: courseId,
      status: "pending",
      amount_vnd: amountVnd,
      transaction_code: transactionCode || null,
      note: note || null,
    })
    .select()
    .single();

  return { data, error };
}

export async function getPurchases(
  courseId?: string
): Promise<{ data: Purchase[] | null; error: any }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: { message: "Chưa đăng nhập" } };
  }

  let query = supabase
    .from("purchases")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (courseId) {
    query = query.eq("course_id", courseId);
  }

  const { data, error } = await query;

  return { data, error };
}

export async function isCoursePurchased(courseId: string): Promise<boolean> {
  const { data } = await getPurchases(courseId);
  if (!data) return false;
  return data.some((p) => p.status === "paid");
}

export async function updatePurchaseStatus(
  purchaseId: string,
  status: "paid" | "rejected"
): Promise<{ error: any }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("purchases")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", purchaseId);

  return { error };
}
