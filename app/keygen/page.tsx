"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, Copy, Loader2, CheckCircle2, MessageCircle } from "lucide-react";
import { Toast } from "@/components/ui/toast";
import { getAuthUser } from "@/lib/auth-supabase";

export default function KeyGenPage() {
  const router = useRouter();
  const [deviceId, setDeviceId] = useState("");
  const [courseId, setCourseId] = useState("audio-goc-01");
  const [generatedKey, setGeneratedKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check admin access - redirect to auth if not logged in
    const checkAdmin = async () => {
      try {
        const user = await getAuthUser();
        if (!user) {
          // Not logged in - redirect to auth
          router.push("/auth");
          return;
        }

        // Check if user is admin
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.ADMIN_EMAIL || "";
        const adminEmailsEnv = process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.ADMIN_EMAILS;
        const adminEmails = adminEmailsEnv ? adminEmailsEnv.split(",").map(e => e.trim()) : (adminEmail ? [adminEmail] : ["truongthanh160588@gmail.com"]);

        if (!user.email || !adminEmails.includes(user.email)) {
          // Not admin - redirect to home
          router.push("/");
          return;
        }

        // Admin - allow access
        setCheckingAuth(false);
      } catch {
        router.push("/auth");
      }
    };
    checkAdmin();
  }, [router]);

  const handleGenerate = async () => {
    if (!deviceId.trim()) {
      setError("Vui lòng nhập Device ID");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedKey("");

    try {
      const response = await fetch("/api/generate-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deviceId: deviceId.trim(),
          courseId,
        }),
      });

      const data = await response.json();

      if (data.ok && data.key) {
        setGeneratedKey(data.key);
      } else {
        setError(data.message || "Lỗi tạo key");
      }
    } catch (error: any) {
      setError("Lỗi kết nối: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = async () => {
    if (generatedKey) {
      await navigator.clipboard.writeText(generatedKey);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-titan-bg flex items-center justify-center">
        <div className="text-gray-400">Đang tải...</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-titan-bg flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md border-cyan-500/30 bg-gradient-to-br from-gray-900 to-gray-950">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Key className="h-6 w-6 text-yellow-400" />
              <CardTitle className="text-yellow-400 text-xl">Titan dBA Meter - Key Generator</CardTitle>
            </div>
            <CardDescription className="text-gray-300">
              Tạo Activation Key cho khóa học
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Device ID Input */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Device ID:
              </label>
              <Input
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                placeholder="Nhập Device ID từ khách hàng..."
                className="font-mono bg-gray-900 border-titan-border"
              />
            </div>

            {/* Error */}
            {error && (
              <Alert variant="error">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Generate Button */}
            <Button
              variant="primary"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={handleGenerate}
              disabled={loading || !deviceId.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang tạo key...
                </>
              ) : (
                "Generate Activation Key"
              )}
            </Button>

            {/* Generated Key */}
            {generatedKey && (
              <div className="p-4 rounded-md bg-green-900/20 border border-green-700">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span className="text-sm font-medium text-green-400">Activation Key đã tạo</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={generatedKey}
                    readOnly
                    className="font-mono bg-gray-900 border-titan-border"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyKey}
                    className="flex-shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="pt-4 border-t border-titan-border">
              <h3 className="text-sm font-semibold text-yellow-400 mb-3">Hướng dẫn:</h3>
              <ol className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 font-bold">1.</span>
                  <span>Khách hàng gửi Device ID cho bạn</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 font-bold">2.</span>
                  <span>Nhập Device ID vào ô trên</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 font-bold">3.</span>
                  <span>Nhấn &quot;Generate Activation Key&quot;</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 font-bold">4.</span>
                  <span>Copy Activation Key và gửi lại cho khách hàng</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 font-bold">5.</span>
                  <span>Khách hàng nhập key vào app để kích hoạt</span>
                </li>
              </ol>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-titan-border text-center">
              <p className="text-xs text-yellow-400 mb-2">
                Phần Mềm Phát Triển Bởi Trương Thanh
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-300">
                <MessageCircle className="h-4 w-4" />
                <span>Zalo: 0974 70 4444</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Toast
        open={showToast}
        onClose={() => setShowToast(false)}
        title="Đã copy"
        description="Activation Key đã được copy vào clipboard"
        variant="success"
      />
    </>
  );
}
