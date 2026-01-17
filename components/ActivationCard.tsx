"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import {
  getOrCreateDeviceId,
  formatDeviceId,
  getActivationState,
  setActivationState,
} from "@/lib/device-activation";
import { Toast } from "@/components/ui/toast";

interface ActivationCardProps {
  courseId: string;
  onActivated?: () => void;
}

export function ActivationCard({ courseId, onActivated }: ActivationCardProps) {
  const [deviceId, setDeviceId] = useState<string>("");
  const [activationKey, setActivationKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activated, setActivated] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Load device ID
    const id = getOrCreateDeviceId();
    setDeviceId(id);

    // Check activation state
    const state = getActivationState(courseId);
    setActivated(state.activated);
  }, [courseId]);

  const handleCopyDeviceId = async () => {
    if (deviceId) {
      // Copy normalized Device ID (8 ký tự đầu, uppercase)
      // Đảm bảo admin tạo key từ cùng format
      const { normalizeDeviceId } = await import("@/lib/device-id-normalize");
      const normalizedId = normalizeDeviceId(deviceId);
      await navigator.clipboard.writeText(normalizedId);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const handleActivate = async () => {
    if (!activationKey.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập Activation Key" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/verify-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deviceId, // Send full UUID, server will normalize
          key: activationKey.trim().toUpperCase(), // Normalize key to uppercase
          courseId,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        // Lưu trạng thái kích hoạt vào localStorage (cho UX nhanh)
        // Nhưng nguồn chân lý là DB, sẽ được check lại khi vào /learn
        setActivationState(courseId, deviceId, true);
        setActivated(true);
        setMessage({ 
          type: "success", 
          text: data.message || "Kích hoạt thành công!" 
        });
        if (onActivated) {
          onActivated();
        }
      } else {
        setMessage({ type: "error", text: data.message || "Key không hợp lệ" });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: "Lỗi kết nối. Vui lòng thử lại." });
    } finally {
      setLoading(false);
    }
  };

  if (activated) {
    return (
      <Card className="border-green-700 bg-green-900/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <CardTitle className="text-green-400">Đã kích hoạt</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-300">
            Khóa học đã được kích hoạt. Bạn có thể bắt đầu học ngay.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-yellow-700 bg-yellow-900/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <CardTitle className="text-yellow-400">Yêu cầu kích hoạt</CardTitle>
          </div>
          <CardDescription className="text-gray-300">
            Vui lòng kích hoạt khóa học để bắt đầu học
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Device ID */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Device ID
            </label>
            <div className="flex gap-2">
              <Input
                value={formatDeviceId(deviceId)}
                readOnly
                className="font-mono bg-gray-900 border-titan-border"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyDeviceId}
                className="flex-shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Gửi Device ID này cho anh Trương Thanh để nhận Activation Key
            </p>
          </div>

          {/* Activation Key */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Activation Key
            </label>
            <Input
              value={activationKey}
              onChange={(e) => setActivationKey(e.target.value.toUpperCase())}
              placeholder="HATG-XXXXX-XXXXX-XXXXX-XXXXX"
              className="font-mono bg-gray-900 border-titan-border"
              disabled={loading}
            />
          </div>

          {/* Message */}
          {message && (
            <Alert variant={message.type === "success" ? "success" : "error"}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Activate Button */}
          <Button
            variant="primary"
            className="w-full"
            onClick={handleActivate}
            disabled={loading || !activationKey.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Kích hoạt"
            )}
          </Button>

          {/* Footer */}
          <div className="pt-4 border-t border-titan-border text-center">
            <p className="text-xs text-gray-400">
              Trương Thanh - Zalo: 0974 70 4444
            </p>
          </div>
        </CardContent>
      </Card>

      <Toast
        open={showToast}
        onClose={() => setShowToast(false)}
        title="Đã copy"
        description="Device ID đã được copy vào clipboard"
        variant="success"
      />
    </>
  );
}
