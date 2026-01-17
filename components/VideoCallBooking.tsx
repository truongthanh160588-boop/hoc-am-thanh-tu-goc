"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Video, CheckCircle2, MessageCircle } from "lucide-react";
import { getAuthUser } from "@/lib/auth-supabase";

interface VideoCallBookingProps {
  clusterNumber: number;
  courseId: string;
  onBookingComplete: () => void;
}

export function VideoCallBooking({
  clusterNumber,
  courseId,
  onBookingComplete,
}: VideoCallBookingProps) {
  const [phone, setPhone] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!phone.trim()) {
      alert("Vui lòng nhập số điện thoại");
      return;
    }

    setLoading(true);
    try {
      const user = await getAuthUser();
      if (!user) {
        alert("Vui lòng đăng nhập");
        return;
      }

      // Gửi thông tin đăng ký gọi video
      const response = await fetch("/api/video-call/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          courseId,
          clusterNumber,
          phone: phone.trim(),
          preferredTime: preferredTime.trim() || null,
          note: note.trim() || null,
        }),
      });

      const data = await response.json();
      if (data.ok) {
        setSubmitted(true);
        // Sau 2 giây, gọi callback để unlock
        setTimeout(() => {
          onBookingComplete();
        }, 2000);
      } else {
        alert(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error booking video call:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Alert variant="success">
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription>
          <strong>Đã đăng ký thành công!</strong>
          <br />
          Trương Thanh sẽ liên hệ với bạn qua số điện thoại {phone} trong thời gian sớm nhất.
          <br />
          <span className="text-xs text-gray-400 mt-2 block">
            Cụm bài tiếp theo đã được mở. Bạn có thể tiếp tục học trong khi chờ hỗ trợ.
          </span>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-md bg-cyan-900/20 border border-cyan-500/30">
        <div className="flex items-start gap-3">
          <Video className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 text-sm text-gray-300">
            <p className="font-medium text-cyan-400 mb-1">Gọi video 1-1 với Trương Thanh</p>
            <p>
              Không ghi âm – không lưu video. Chỉ kiểm tra miệng + xem thao tác thực tế.
              <br />
              Mục tiêu: biết bạn CÓ HIỂU hay KHÔNG.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">
            Số điện thoại <span className="text-red-400">*</span>
          </label>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0974 70 4444"
            className="bg-gray-900 border-titan-border"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">
            Thời gian mong muốn (tùy chọn)
          </label>
          <Input
            type="text"
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
            placeholder="Ví dụ: Sáng 8-10h, Chiều 14-16h..."
            className="bg-gray-900 border-titan-border"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">
            Ghi chú thêm (tùy chọn)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Phần nào bạn muốn được hỗ trợ cụ thể..."
            className="w-full px-3 py-2 bg-gray-900 border border-titan-border rounded-md text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            rows={3}
          />
        </div>
      </div>

      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={loading || !phone.trim()}
        className="w-full"
      >
        {loading ? "Đang xử lý..." : "Đăng ký gọi video"}
      </Button>

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <MessageCircle className="h-4 w-4" />
        <span>
          Hoặc liên hệ trực tiếp Zalo: <strong className="text-cyan-400">0974 70 4444</strong>
        </span>
      </div>
    </div>
  );
}
