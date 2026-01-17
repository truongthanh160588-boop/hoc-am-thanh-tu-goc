import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminListPurchases } from "@/lib/purchases";
import { getServiceClient } from "@/lib/supabase/service";

// Force Node.js runtime
export const runtime = "nodejs";

/**
 * List purchases (Admin only)
 * GET /api/admin/purchases?status=pending|paid|rejected
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
        { ok: false, message: "Không có quyền truy cập. Chỉ admin mới có thể xem purchases." },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") as "pending" | "paid" | "rejected" | undefined;

    // Load all purchases for admin (not filtered by status unless specified)
    const purchases = await adminListPurchases(status);

    // Lấy emails từ auth.users (dùng service role)
    const serviceSupabase = getServiceClient() as any;
    const { data: usersData } = await (serviceSupabase.auth.admin as any).listUsers();
    const emailMap = new Map(
      (usersData?.users || []).map((u: any) => [u.id, u.email])
    );

    // Format response với email
    const formattedPurchases = purchases.map((p: any) => ({
      ...p,
      user_email: emailMap.get(p.user_id) || "N/A",
    }));

    return NextResponse.json({
      ok: true,
      purchases: formattedPurchases,
    });
  } catch (error: any) {
    console.error("[admin/purchases] Error:", error);
    return NextResponse.json(
      { ok: false, message: "Lỗi xử lý: " + error.message },
      { status: 500 }
    );
  }
}
