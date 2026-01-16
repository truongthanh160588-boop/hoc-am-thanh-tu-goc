import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Force Node.js runtime for crypto API
export const runtime = "nodejs";

/**
 * Generate Activation Key (Admin only)
 * POST /api/generate-key
 * Body: { deviceId: string, courseId: string }
 * Headers: x-admin-token hoặc check session (nếu có Supabase)
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin - ưu tiên check token header
    const adminToken = request.headers.get("x-admin-token");
    const expectedToken = process.env.ADMIN_TOKEN;
    
    let isAdmin = false;
    
    if (adminToken && expectedToken && adminToken === expectedToken) {
      isAdmin = true;
    } else {
      // Fallback: check Supabase session (nếu có)
      try {
        const { createClient } = await import("@/lib/supabase/server");
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        // Get admin email from env, fallback to default
        const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "truongthanh160588@gmail.com";
        const adminEmailsEnv = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS;
        const adminEmails = adminEmailsEnv ? adminEmailsEnv.split(",").map(e => e.trim()) : [adminEmail];
        
        if (user && user.email && adminEmails.includes(user.email)) {
          isAdmin = true;
        }
      } catch {
        // Supabase not available, skip
      }
    }
    
    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, message: "Không có quyền truy cập" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { deviceId, courseId = "audio-goc-01" } = body;

    if (!deviceId) {
      return NextResponse.json(
        { ok: false, message: "Thiếu deviceId" },
        { status: 400 }
      );
    }

    const secret = process.env.ACTIVATION_SECRET;
    if (!secret) {
      // In production, log but don't expose details
      if (process.env.NODE_ENV === "production") {
        console.error("[ACTIVATION] ACTIVATION_SECRET not configured");
      } else {
        console.error("ACTIVATION_SECRET not set");
      }
      return NextResponse.json(
        { ok: false, message: "Lỗi cấu hình server" },
        { status: 500 }
      );
    }

    // Generate key
    const payload = `${courseId}|${deviceId}|PERM`;
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(payload);
    const signature = hmac.digest("base64url").slice(0, 20);
    
    // Format key: HATG-XXXXX-XXXXX-XXXXX-XXXXX
    const key = `HATG-${signature.slice(0, 5)}-${signature.slice(5, 10)}-${signature.slice(10, 15)}-${signature.slice(15, 20)}`;

    return NextResponse.json({ ok: true, key });
  } catch (error: any) {
    console.error("Generate key error:", error);
    return NextResponse.json(
      { ok: false, message: "Lỗi xử lý: " + error.message },
      { status: 500 }
    );
  }
}
