import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import {
  getActiveActivationCount,
  isDeviceActive,
  insertActivation,
} from "@/lib/activations";

// Force Node.js runtime for crypto API
export const runtime = "nodejs";

/**
 * Verify Activation Key
 * POST /api/verify-key
 * Body: { deviceId: string, key: string, courseId: string }
 * 
 * Flow:
 * 1. Verify HMAC key
 * 2. Check user authenticated
 * 3. Check purchase paid
 * 4. Check device limit (max 2 active devices)
 * 5. Create activation in DB
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, key, courseId } = body;

    // Validate input
    if (!deviceId || !key || !courseId) {
      return NextResponse.json(
        { ok: false, message: "Thiếu thông tin deviceId, key hoặc courseId" },
        { status: 400 }
      );
    }

    // Read secret (server-only, không dùng NEXT_PUBLIC_)
    const secret = process.env.ACTIVATION_SECRET;
    if (!secret) {
      console.error("[verify-key] ACTIVATION_SECRET not configured");
      return NextResponse.json(
        { ok: false, message: "Lỗi cấu hình server" },
        { status: 500 }
      );
    }

    // Verify HMAC key
    const payload = `${courseId}|${deviceId}|PERM`;
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(payload);
    const signature = hmac.digest("base64url").slice(0, 20);
    const expectedKey = `HATG-${signature.slice(0, 5)}-${signature.slice(5, 10)}-${signature.slice(10, 15)}-${signature.slice(15, 20)}`;

    if (key !== expectedKey) {
      return NextResponse.json(
        { ok: false, message: "Key không hợp lệ" },
        { status: 400 }
      );
    }

    // Check user authenticated
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

    const userId = user.id;

    // Check purchase paid
    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .select("id, status")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .eq("status", "paid")
      .maybeSingle();

    if (purchaseError) {
      console.error("[verify-key] Error checking purchase:", purchaseError);
      return NextResponse.json(
        { ok: false, message: "Lỗi kiểm tra thanh toán" },
        { status: 500 }
      );
    }

    if (!purchase) {
      return NextResponse.json(
        { ok: false, message: "Chưa thanh toán khóa học" },
        { status: 403 }
      );
    }

    // Enforce 2 devices: check if device already active (idempotent)
    const deviceActive = await isDeviceActive({ userId, courseId, deviceId });
    if (deviceActive) {
      return NextResponse.json({
        ok: true,
        message: "Thiết bị đã được kích hoạt",
      });
    }

    // Count active devices
    const activeCount = await getActiveActivationCount({ userId, courseId });
    if (activeCount >= 2) {
      return NextResponse.json(
        {
          ok: false,
          message: "Vượt quá 2 thiết bị. Liên hệ admin để thu hồi thiết bị cũ.",
        },
        { status: 403 }
      );
    }

    // Insert activation bằng service role
    const { data: activation, error: activationError } = await insertActivation({
      userId,
      courseId,
      deviceId,
    });

    if (activationError) {
      console.error("[verify-key] Error creating activation:", activationError);
      
      // Check if it's a unique constraint violation (device already exists but was revoked)
      if (activationError.code === "23505") {
        // Try to reactivate (update revoked_at to null) - dùng service role
        const { getServiceClient } = await import("@/lib/supabase/service");
        const serviceSupabase = getServiceClient();
        
        const { error: updateError } = await serviceSupabase
          .from("activations")
          .update({
            revoked_at: null,
            revoked_by: null,
            activated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .eq("course_id", courseId)
          .eq("device_id", deviceId);

        if (updateError) {
          return NextResponse.json(
            { ok: false, message: "Lỗi kích hoạt thiết bị" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          ok: true,
          message: "Kích hoạt thành công",
        });
      }

      return NextResponse.json(
        { ok: false, message: "Lỗi kích hoạt thiết bị: " + (activationError.message || "Unknown error") },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Kích hoạt thành công",
    });
  } catch (error: any) {
    console.error("[verify-key] Error:", error);
    return NextResponse.json(
      { ok: false, message: "Lỗi xử lý: " + error.message },
      { status: 500 }
    );
  }
}
