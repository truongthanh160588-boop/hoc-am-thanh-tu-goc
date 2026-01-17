import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPendingPurchase } from "@/lib/purchases";

// Force Node.js runtime
export const runtime = "nodejs";

/**
 * Create purchase (pending)
 * POST /api/purchases/create
 * Body: { courseId: string, amount?: number, amountVnd?: number, note?: string, proofUrl?: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Check auth
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

    const body = await request.json();
    const { courseId, amount, amountVnd, note, proofUrl } = body;

    if (!courseId) {
      return NextResponse.json(
        { ok: false, message: "Thiếu courseId" },
        { status: 400 }
      );
    }

    // Create pending purchase
    const { data: purchase, error } = await createPendingPurchase(user.id, {
      courseId,
      amount,
      amountVnd,
      note,
      proofUrl,
    });

    if (error) {
      console.error("[purchases/create] Error:", error);
      return NextResponse.json(
        { ok: false, message: error.message || "Lỗi tạo đơn hàng" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      purchase,
      message: "Đã tạo đơn hàng. Vui lòng chờ admin duyệt.",
    });
  } catch (error: any) {
    console.error("[purchases/create] Error:", error);
    return NextResponse.json(
      { ok: false, message: "Lỗi xử lý: " + error.message },
      { status: 500 }
    );
  }
}
