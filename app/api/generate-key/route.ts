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
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("[GENERATE-KEY] Error getting user:", userError);
        }
        
        // Get admin email from env with fallback order
        const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";
        const adminEmailsEnv = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS;
        const adminEmails = adminEmailsEnv ? adminEmailsEnv.split(",").map(e => e.trim()) : (adminEmail ? [adminEmail] : ["truongthanh160588@gmail.com"]);
        
        if (user && user.email) {
          console.log("[GENERATE-KEY] User email:", user.email, "Admin emails:", adminEmails);
          if (adminEmails.includes(user.email)) {
            isAdmin = true;
          }
        } else {
          console.log("[GENERATE-KEY] No user found in session");
        }
      } catch (error: any) {
        // Supabase not available, skip
        console.error("[GENERATE-KEY] Supabase error:", error);
      }
    }
    
    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, message: "Không có quyền truy cập" },
        { status: 403 }
      );
    }

    const body = await request.json();
    let { deviceId, courseId = "audio-goc-01" } = body;

    if (!deviceId) {
      return NextResponse.json(
        { ok: false, message: "Thiếu deviceId" },
        { status: 400 }
      );
    }

    // Normalize device ID: luôn dùng 8 ký tự đầu (uppercase)
    // Nếu là UUID đầy đủ → lấy 8 ký tự đầu, nếu không → lấy 8 ký tự đầu
    const { normalizeDeviceId } = await import("@/lib/device-id-normalize");
    const normalizedDeviceId = normalizeDeviceId(deviceId);
    
    if (!normalizedDeviceId || normalizedDeviceId.length < 8) {
      return NextResponse.json(
        { ok: false, message: "Device ID không hợp lệ. Vui lòng nhập đầy đủ Device ID." },
        { status: 400 }
      );
    }

    console.log("[GENERATE-KEY] Original deviceId:", deviceId, "→ Normalized:", normalizedDeviceId);

    // Read secret with fallback order
    const secret = process.env.ACTIVATION_SECRET || process.env.NEXT_PUBLIC_ACTIVATION_SECRET || "";
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

    // Generate key với normalized device ID
    const payload = `${courseId}|${normalizedDeviceId}|PERM`;
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(payload);
    const signature = hmac.digest("base64url").slice(0, 20);
    
    // Format key: HATG-XXXXX-XXXXX-XXXXX-XXXXX (uppercase)
    const key = `HATG-${signature.slice(0, 5).toUpperCase()}-${signature.slice(5, 10).toUpperCase()}-${signature.slice(10, 15).toUpperCase()}-${signature.slice(15, 20).toUpperCase()}`;

    console.log("[GENERATE-KEY] Generated key for deviceId:", normalizedDeviceId);

    return NextResponse.json({ ok: true, key, normalizedDeviceId });
  } catch (error: any) {
    console.error("Generate key error:", error);
    return NextResponse.json(
      { ok: false, message: "Lỗi xử lý: " + error.message },
      { status: 500 }
    );
  }
}
