import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminSetPurchaseStatus } from "@/lib/purchases";

// Force Node.js runtime
export const runtime = "nodejs";

/**
 * Update purchase status (Admin only)
 * POST /api/admin/purchases/update
 * Body: { purchaseId: string, status: 'paid' | 'rejected' }
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { ok: false, message: "Chưa đăng nhập" },
        { status: 401 }
      );
    }

    // Check admin role từ DB
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile || profile.role !== "admin") {
      return NextResponse.json(
        { ok: false, message: "Không có quyền truy cập. Chỉ admin mới có thể cập nhật purchase." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { purchaseId, status } = body;

    if (!purchaseId || !status) {
      return NextResponse.json(
        { ok: false, message: "Thiếu purchaseId hoặc status" },
        { status: 400 }
      );
    }

    if (status !== "paid" && status !== "rejected") {
      return NextResponse.json(
        { ok: false, message: "Status phải là 'paid' hoặc 'rejected'" },
        { status: 400 }
      );
    }

    // Update purchase status
    const { error } = await adminSetPurchaseStatus(purchaseId, status);

    if (error) {
      console.error("[admin/purchases/update] Error:", error);
      return NextResponse.json(
        { ok: false, message: "Lỗi cập nhật purchase: " + (error.message || "Unknown error") },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: `Đã cập nhật purchase thành ${status}`,
    });
  } catch (error: any) {
    console.error("[admin/purchases/update] Error:", error);
    return NextResponse.json(
      { ok: false, message: "Lỗi xử lý: " + error.message },
      { status: 500 }
    );
  }
}
