import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/supabase/service";

// Force Node.js runtime
export const runtime = "nodejs";

/**
 * List activations (Admin only)
 * GET /api/admin/activations?courseId=xxx&status=active|revoked|all
 */
export async function GET(request: NextRequest) {
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
        { ok: false, message: "Không có quyền truy cập. Chỉ admin mới có thể xem activations." },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get("courseId") || undefined;
    const status = (searchParams.get("status") as "active" | "revoked" | "all") || "all";

    // Dùng service role để list activations (bypass RLS)
    const serviceSupabase = getServiceClient() as any;
    let query = serviceSupabase
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

    const { data: activations, error: activationsError } = await query;

    if (activationsError) {
      console.error("[admin/activations] Error:", activationsError);
      return NextResponse.json(
        { ok: false, message: "Lỗi tải danh sách activations" },
        { status: 500 }
      );
    }

    // Lấy emails từ auth.users (dùng service role)
    const userIds = [...new Set((activations || []).map((a: any) => a.user_id))];
    const { data: usersData } = await (serviceSupabase.auth.admin as any).listUsers();
    const emailMap = new Map(
      (usersData?.users || []).map((u: any) => [u.id, u.email])
    );

    // Format response với email
    const formattedActivations = (activations || []).map((act: any) => ({
      ...act,
      user_email: emailMap.get(act.user_id) || "N/A",
    }));

    return NextResponse.json({
      ok: true,
      activations: formattedActivations,
    });
  } catch (error: any) {
    console.error("[admin/activations] Error:", error);
    return NextResponse.json(
      { ok: false, message: "Lỗi xử lý: " + error.message },
      { status: 500 }
    );
  }
}
