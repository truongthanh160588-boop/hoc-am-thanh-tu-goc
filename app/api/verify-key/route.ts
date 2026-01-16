import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Force Node.js runtime for crypto API
export const runtime = "nodejs";

/**
 * Verify Activation Key
 * POST /api/verify-key
 * Body: { deviceId: string, key: string, courseId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, key, courseId } = body;

    if (!deviceId || !key || !courseId) {
      return NextResponse.json(
        { ok: false, message: "Thiếu thông tin deviceId, key hoặc courseId" },
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

    // Generate expected key
    const payload = `${courseId}|${deviceId}|PERM`;
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(payload);
    const signature = hmac.digest("base64url").slice(0, 20);
    
    // Format key: HATG-XXXXX-XXXXX-XXXXX-XXXXX
    const expectedKey = `HATG-${signature.slice(0, 5)}-${signature.slice(5, 10)}-${signature.slice(10, 15)}-${signature.slice(15, 20)}`;

    // Verify
    if (key === expectedKey) {
      return NextResponse.json({ ok: true });
    } else {
      return NextResponse.json(
        { ok: false, message: "Key không hợp lệ" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Verify key error:", error);
    return NextResponse.json(
      { ok: false, message: "Lỗi xử lý: " + error.message },
      { status: 500 }
    );
  }
}
