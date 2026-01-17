import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPurchase } from "@/lib/purchases";

// Force Node.js runtime
export const runtime = "nodejs";

/**
 * Get purchase status for current user
 * GET /api/purchases/status?courseId=xxx
 */
export async function GET(request: NextRequest) {
  try {
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

    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { ok: false, message: "Thiếu courseId" },
        { status: 400 }
      );
    }

    const purchase = await getPurchase(user.id, courseId);

    return NextResponse.json({
      ok: true,
      purchase: purchase || null,
    });
  } catch (error: any) {
    console.error("[purchases/status] Error:", error);
    return NextResponse.json(
      { ok: false, message: "Lỗi xử lý: " + error.message },
      { status: 500 }
    );
  }
}
