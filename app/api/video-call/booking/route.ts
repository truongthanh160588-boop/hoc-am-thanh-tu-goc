import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { courseId, clusterNumber, phone, preferredTime, note } = body;

    if (!phone || !courseId || !clusterNumber) {
      return NextResponse.json(
        { ok: false, message: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      );
    }

    // Lưu vào database (cần tạo bảng video_call_bookings)
    // Tạm thời chỉ log, sau sẽ tạo bảng
    console.log("[Video Call Booking]", {
      userId: user.id,
      courseId,
      clusterNumber,
      phone,
      preferredTime,
      note,
      createdAt: new Date().toISOString(),
    });

    // TODO: Insert vào bảng video_call_bookings
    // const { error } = await supabase
    //   .from("video_call_bookings")
    //   .insert({
    //     user_id: user.id,
    //     course_id: courseId,
    //     cluster_number: clusterNumber,
    //     phone,
    //     preferred_time: preferredTime,
    //     note,
    //     status: "pending",
    //   });

    return NextResponse.json({
      ok: true,
      message: "Đã đăng ký thành công. Trương Thanh sẽ liên hệ với bạn sớm nhất.",
    });
  } catch (error) {
    console.error("[Video Call Booking Error]:", error);
    return NextResponse.json(
      { ok: false, message: "Có lỗi xảy ra" },
      { status: 500 }
    );
  }
}
