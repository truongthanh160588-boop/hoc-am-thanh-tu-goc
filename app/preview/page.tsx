"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Copy, Key, CheckCircle2, AlertTriangle, Loader2, MessageCircle, BookOpen, Users, HelpCircle } from "lucide-react";
import {
  getOrCreateDeviceId,
  formatDeviceId,
  getActivationState,
  setActivationState,
} from "@/lib/device-activation";
import { Toast } from "@/components/ui/toast";

const COURSE_ID = "audio-goc-01";
const ZALO_PHONE = "0974704444";

export default function PreviewPage() {
  const router = useRouter();
  const [step, setStep] = useState<"preview" | "register">("preview");
  const [deviceId, setDeviceId] = useState<string>("");
  const [activationKey, setActivationKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activated, setActivated] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    // Load device ID
    const id = getOrCreateDeviceId();
    setDeviceId(id);

    // Check activation state
    const state = getActivationState(COURSE_ID);
    setActivated(state.activated);
    
    // Nếu đã kích hoạt, redirect đến courses
    if (state.activated) {
      router.push("/courses");
    }
  }, [router]);

  const handleRegister = () => {
    setStep("register");
  };

  const handleCopyDeviceId = async () => {
    if (deviceId) {
      await navigator.clipboard.writeText(deviceId);
      setToastMessage("Đã copy Device ID!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const handleCopyZaloMessage = async () => {
    const message = `Em muốn đăng ký khóa học Học Âm Thanh Từ Gốc.
Device ID của em là: ${deviceId}
Nhờ anh Trương Thanh cấp Activation Key giúp em ạ.`;
    
    await navigator.clipboard.writeText(message);
    setToastMessage("Đã copy tin nhắn mẫu!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleOpenZalo = () => {
    const message = `Em muốn đăng ký khóa học Học Âm Thanh Từ Gốc.
Device ID của em là: ${deviceId}
Nhờ anh Trương Thanh cấp Activation Key giúp em ạ.`;
    window.open(`https://zalo.me/${ZALO_PHONE}?text=${encodeURIComponent(message)}`, "_blank");
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
          deviceId,
          key: activationKey.trim(),
          courseId: COURSE_ID,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        // Lưu trạng thái kích hoạt
        setActivationState(COURSE_ID, deviceId, true);
        setActivated(true);
        setMessage({ type: "success", text: "Kích hoạt thành công! Đang chuyển hướng..." });
        
        // Redirect sau 1 giây
        setTimeout(() => {
          router.push("/courses");
        }, 1000);
      } else {
        setMessage({ type: "error", text: data.message || "Key không hợp lệ" });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: "Lỗi kết nối. Vui lòng thử lại." });
    } finally {
      setLoading(false);
    }
  };

  if (step === "register") {
    return (
      <div className="min-h-screen bg-titan-bg py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="border-cyan-500/30 bg-gradient-to-br from-gray-900 to-gray-950">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Key className="h-6 w-6 text-yellow-400" />
                <CardTitle className="text-2xl text-gray-200">Đăng ký khóa học</CardTitle>
              </div>
              <CardDescription className="text-gray-300">
                Copy Device ID và gửi cho anh Trương Thanh để nhận Activation Key
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Device ID */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Device ID của bạn
                </label>
                <div className="flex gap-2">
                  <Input
                    value={deviceId}
                    readOnly
                    className="font-mono bg-gray-900 border-titan-border text-cyan-400"
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
                <p className="text-xs text-gray-400 mt-2">
                  Mỗi máy có 1 Device ID khác nhau. Copy và gửi cho anh Trương Thanh.
                </p>
              </div>

              {/* Zalo buttons */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleCopyZaloMessage}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy tin nhắn mẫu (có Device ID)
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleOpenZalo}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Nhắn Zalo cho anh Trương Thanh
                </Button>
                <p className="text-xs text-center text-gray-500">
                  Zalo: <span className="text-cyan-400">{ZALO_PHONE}</span>
                </p>
              </div>

              <div className="border-t border-titan-border pt-4">
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Activation Key (từ anh Trương Thanh)
                </label>
                <Input
                  value={activationKey}
                  onChange={(e) => setActivationKey(e.target.value.toUpperCase())}
                  placeholder="HATG-XXXXX-XXXXX-XXXXX-XXXXX"
                  className="font-mono bg-gray-900 border-titan-border"
                  disabled={loading}
                />
                <p className="text-xs text-gray-400 mt-2">
                  Sau khi nhận Activation Key từ anh, nhập vào đây và bấm &quot;Kích hoạt&quot;
                </p>
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
                className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
                size="lg"
                onClick={handleActivate}
                disabled={loading || !activationKey.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Kích hoạt
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setStep("preview")}
              >
                Quay lại xem giao diện
              </Button>
            </CardContent>
          </Card>
        </div>

        <Toast
          open={showToast}
          onClose={() => setShowToast(false)}
          title="Đã copy"
          description={toastMessage}
          variant="success"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-titan-bg">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
          <Badge variant="default" className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white border-0 px-4 py-1.5 text-sm font-bold">
            🔰 HỌC TRỌN ĐỜI
          </Badge>
        </div>
        <div className="mb-6">
          <Image
            src="/logo.png"
            alt="Học Âm Thanh Từ Gốc - Trương Thanh"
            width={280}
            height={280}
            className="mx-auto rounded-xl shadow-lg border border-titan-border/50 object-contain w-[220px] md:w-[280px]"
            priority
          />
        </div>
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-gray-200 to-cyan-400 bg-clip-text text-transparent">
          HỌC ÂM THANH TỪ GỐC
        </h1>
        <p className="text-xl text-gray-300 mb-2 max-w-2xl mx-auto font-medium">
          Khóa học âm thanh thực chiến – từ cơ bản đến nâng cao.
        </p>
        <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
          Học đúng bản chất – đi làm gặp ca khó vẫn được hỗ trợ trực tiếp.
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={handleRegister}
          className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
        >
          <Key className="h-5 w-5 mr-2" />
          Đăng ký
        </Button>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Lợi ích khóa học</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <BookOpen className="h-10 w-10 text-cyan-400 mb-4" />
              <CardTitle>20 bài học chi tiết</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Từ nền tảng sóng âm đến setup – mixing – xử lý hệ thống thực tế.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle2 className="h-10 w-10 text-cyan-400 mb-4" />
              <CardTitle>Học theo tiến độ</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Xem bài + làm quiz đạt yêu cầu để mở bài tiếp theo. Học chắc – không học lướt.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-cyan-400 mb-4" />
              <CardTitle>Hỗ trợ tận tình</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Khi đi làm gặp ca khó, học viên được hỗ trợ trực tiếp qua Zalo/điện thoại.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Câu hỏi thường gặp</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-cyan-400" />
                <CardTitle>Làm sao để mở bài tiếp theo?</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Bạn cần xem bài học và làm quiz đạt ít nhất 80% để mở bài tiếp theo.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-cyan-400" />
                <CardTitle>Có thể làm lại quiz không?</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Có. Bạn có thể làm lại cho đến khi đạt yêu cầu.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-cyan-400" />
                <CardTitle>Khi đi làm gặp sự cố thì làm sao?</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Bạn nhắn Zalo kèm hình ảnh/video + thông tin hệ thống, anh Trương Thanh sẽ hỗ trợ trực tiếp cách xử lý.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Sẵn sàng bắt đầu?</CardTitle>
            <CardDescription className="text-base">
              Đăng ký ngay để bắt đầu hành trình học âm thanh của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="primary"
              size="lg"
              className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
              onClick={handleRegister}
            >
              <Key className="h-5 w-5 mr-2" />
              Đăng ký
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-titan-border py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-400">
          <p>Học Âm Thanh Từ Gốc – Trương Thanh – 0974 70 4444</p>
        </div>
      </footer>
    </div>
  );
}
