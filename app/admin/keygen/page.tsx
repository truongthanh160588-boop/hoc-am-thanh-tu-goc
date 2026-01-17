"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getAuthUser } from "@/lib/auth-supabase";
import { Copy, Key, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Toast } from "@/components/ui/toast";
import { ActivationsList } from "@/components/admin/ActivationsList";

export default function KeyGenPage() {
  const router = useRouter();
  const [deviceId, setDeviceId] = useState("");
  const [courseId, setCourseId] = useState("audio-goc-01");
  const [generatedKey, setGeneratedKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const authUser = await getAuthUser();
    if (!authUser) {
      router.push("/auth");
      return;
    }

    // Get admin email from env with fallback order
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.ADMIN_EMAIL || "";
    const adminEmailsEnv = process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.ADMIN_EMAILS;
    const adminEmails = adminEmailsEnv ? adminEmailsEnv.split(",").map(e => e.trim()) : (adminEmail ? [adminEmail] : ["truongthanh160588@gmail.com"]);

    if (!authUser.email || !adminEmails.includes(authUser.email)) {
      router.push("/");
      return;
    }

    setUser(authUser);
  };

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

  if (!user) {
    return (
      <div className="min-h-screen bg-titan-bg flex items-center justify-center">
        <div className="text-gray-400">Đang kiểm tra quyền truy cập...</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-titan-bg py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Admin Badge */}
          {user && (
            <div className="mb-4 text-right">
              <span className="text-xs text-gray-500">Admin: {user.email}</span>
            </div>
          )}
          
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-gray-200 to-cyan-400 bg-clip-text text-transparent">
              Key Generator
            </h1>
            <p className="text-gray-400">Tạo Activation Key cho khóa học</p>
          </div>

          <Card className="border-cyan-500/30 bg-gradient-to-br from-gray-900 to-gray-950">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="h-6 w-6 text-yellow-400" />
                <CardTitle>Tạo Activation Key</CardTitle>
              </div>
              <CardDescription className="text-gray-300">
                Nhập Device ID từ học viên để tạo key kích hoạt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Course ID */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Khóa học
                </label>
                <Input
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="bg-gray-900 border-titan-border"
                />
              </div>

              {/* Device ID */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Device ID
                </label>
                <Input
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  placeholder="Nhập Device ID từ học viên"
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
                className="w-full"
                onClick={handleGenerate}
                disabled={loading || !deviceId.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang tạo key...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    Generate Activation Key
                  </>
                )}
              </Button>

              {/* Generated Key */}
              {generatedKey && (
                <div className="mt-6 p-4 rounded-md bg-green-900/20 border border-green-700">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    <span className="text-sm font-medium text-green-400">Key đã tạo thành công</span>
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
              <div className="mt-6 pt-6 border-t border-titan-border">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Hướng dẫn 5 bước:</h3>
                <ol className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">1.</span>
                    <span>Học viên gửi Device ID cho anh</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">2.</span>
                    <span>Anh nhập Device ID vào ô trên</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">3.</span>
                    <span>Bấm &quot;Generate Activation Key&quot;</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">4.</span>
                    <span>Copy key và gửi lại cho học viên</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">5.</span>
                    <span>Học viên nhập key vào app để kích hoạt</span>
                  </li>
                </ol>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-titan-border text-center">
                <p className="text-xs text-gray-400">
                  Phần mềm phát triển bởi Trương Thanh - Zalo: 0974 70 4444
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Activations List */}
          <div className="mt-8">
            <ActivationsList courseId={courseId} />
          </div>
        </div>
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
