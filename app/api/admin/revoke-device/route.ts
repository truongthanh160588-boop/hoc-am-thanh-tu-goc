import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/supabase/service";

// Force Node.js runtime
export const runtime = "nodejs";

/**
 * Revoke device activation (Admin only)
 * POST /api/admin/revoke-device
 * Body: { userId: string, courseId: string, deviceId: string, note?: string }
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
        { ok: false, message: "Không có quyền truy cập. Chỉ admin mới có thể thu hồi thiết bị." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, courseId, deviceId, note } = body;

    if (!userId || !courseId || !deviceId) {
      return NextResponse.json(
        { ok: false, message: "Thiếu thông tin userId, courseId hoặc deviceId" },
        { status: 400 }
      );
    }

    // Revoke device bằng service role
    const serviceSupabase = getServiceClient();
    const { error } = await serviceSupabase
      .from("activations")
      .update({
        revoked_at: new Date().toISOString(),
        revoked_by: user.id,
        note: note || null,
      })
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .eq("device_id", deviceId)
      .is("revoked_at", null); // Chỉ revoke những cái chưa bị revoke

    if (error) {
      console.error("[revoke-device] Error:", error);
      return NextResponse.json(
        { ok: false, message: "Lỗi thu hồi thiết bị: " + (error.message || "Unknown error") },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Đã thu hồi thiết bị thành công",
    });
  } catch (error: any) {
    console.error("[revoke-device] Error:", error);
    return NextResponse.json(
      { ok: false, message: "Lỗi xử lý: " + error.message },
      { status: 500 }
    );
  }
}
