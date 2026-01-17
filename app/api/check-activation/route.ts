import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isActivated as isActivatedDB } from "@/lib/activation-supabase";

// Force Node.js runtime
export const runtime = "nodejs";

/**
 * Check activation status (server-side)
 * GET /api/check-activation?courseId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { ok: false, message: "Thiếu courseId" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { ok: false, activated: false, message: "Chưa đăng nhập" },
        { status: 401 }
      );
    }

    // Check activation from DB
    const activated = await isActivatedDB(user.id, courseId);

    return NextResponse.json({
      ok: true,
      activated,
    });
  } catch (error: any) {
    console.error("[check-activation] Error:", error);
    return NextResponse.json(
      { ok: false, activated: false, message: "Lỗi xử lý" },
      { status: 500 }
    );
  }
}
