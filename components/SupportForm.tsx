"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Copy, X } from "lucide-react";
import { getZaloLink } from "@/lib/purchase-zalo";

interface SupportFormProps {
  userEmail: string;
  onClose?: () => void;
}

export function SupportForm({ userEmail, onClose }: SupportFormProps) {
  const [device, setDevice] = useState("");
  const [location, setLocation] = useState("");
  const [issue, setIssue] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const message = `Em gặp sự cố khi đi làm:

Thiết bị: ${device || "Chưa nhập"}
Địa điểm: ${location || "Chưa nhập"}
Vấn đề: ${issue || "Chưa nhập"}

Email: ${userEmail}
Nhờ anh Trương Thanh hỗ trợ giúp em ạ.`;

    setSupportMessage(message);
    setShowResult(true);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(supportMessage);
    alert("Đã copy! Dán vào Zalo để gửi cho anh Trương Thanh.");
  };

  const handleOpenZalo = () => {
    window.open(getZaloLink(supportMessage), "_blank");
  };

  if (showResult) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Nội dung gửi Zalo</CardTitle>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CardDescription>
            Copy và dán vào Zalo để gửi cho anh Trương Thanh
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-md bg-gray-900 border border-titan-border">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                {supportMessage}
              </pre>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" className="flex-1" onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-2" />
                Copy nội dung
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleOpenZalo}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Mở Zalo
              </Button>
            </div>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setShowResult(false);
                setDevice("");
                setLocation("");
                setIssue("");
              }}
            >
              Gửi lại
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Gửi thông tin ca khó</CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription>
          Điền thông tin để anh Trương Thanh hỗ trợ nhanh nhất
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block text-gray-300">
              Thiết bị đang dùng *
            </label>
            <Input
              placeholder="Ví dụ: Vang số X, Mixer Y, Loa Z..."
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block text-gray-300">
              Địa điểm *
            </label>
            <Input
              placeholder="Ví dụ: Phòng họp, Sân khấu ngoài trời..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block text-gray-300">
              Vấn đề gặp phải *
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-md border border-titan-border bg-titan-card text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 min-h-[100px]"
              placeholder="Ví dụ: Hú rít, thiếu lực, lệch sub-full, không có tiếng..."
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              required
            />
          </div>

          <div className="text-xs text-gray-500">
            💡 Tip: Có thể upload ảnh/video qua Zalo sau khi gửi thông tin này
          </div>

          <Button type="submit" variant="primary" className="w-full">
            Tạo nội dung gửi Zalo
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
