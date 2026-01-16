"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";
import { Mail, Loader2 } from "lucide-react";
import { OTPInput } from "@/components/ui/otp-input";

export default function AuthPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      router.push("/courses");
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Vui lòng nhập email!");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email không hợp lệ!");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: true,
        // Không dùng emailRedirectTo để gửi mã 6 số thay vì magic link
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setStep("otp");
      setMessage("Mã 6 số đã được gửi về email của bạn. Vui lòng kiểm tra hộp thư.");
    }
  };

  const handleVerifyOTP = async (otpCode: string) => {
    if (!otpCode || otpCode.length !== 6) {
      setError("Vui lòng nhập đủ 6 số!");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otpCode,
      type: "email",
    });

    setLoading(false);

    if (error) {
      setError(error.message || "Mã OTP không đúng. Vui lòng thử lại.");
    } else if (data.user) {
      // Create profile if not exists
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: null,
      });

      router.push("/courses");
    }
  };

  const handleBackToEmail = () => {
    setStep("email");
    setError(null);
    setMessage(null);
  };

  if (step === "otp") {
    return (
      <div className="min-h-screen bg-titan-bg flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md border-cyan-500/30 bg-gradient-to-br from-gray-900 to-gray-950">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-200">Nhập mã đăng nhập</CardTitle>
            <CardDescription className="text-center text-gray-400">
              Mã 6 số đã được gửi đến
            </CardDescription>
            <CardDescription className="text-center font-medium text-cyan-400">
              {email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {message && (
              <Alert variant="success" className="bg-green-900/20 border-green-700">
                <AlertDescription className="text-green-400 text-center text-sm">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="error" className="bg-red-900/20 border-red-700">
                <AlertDescription className="text-red-400 text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-3 block text-gray-300 text-center">
                  Nhập mã 6 số
                </label>
                <OTPInput onComplete={handleVerifyOTP} />
                {loading && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                    <p className="text-sm text-gray-400">Đang xác thực...</p>
                  </div>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleBackToEmail}
                className="w-full"
                disabled={loading}
              >
                Quay lại nhập email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-titan-bg flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md border-cyan-500/30 bg-gradient-to-br from-gray-900 to-gray-950">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-gray-200">Đăng nhập</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Nhập email để nhận mã đăng nhập 6 số
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="error" className="mb-4 bg-red-900/20 border-red-700">
              <AlertDescription className="text-red-400 text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-300">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  disabled={loading}
                  className="pl-10 text-lg bg-gray-900 border-titan-border"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
              size="lg"
              disabled={loading || !email.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang gửi mã...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Gửi mã
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-titan-border">
            <p className="text-xs text-center text-gray-500">
              Mã 6 số sẽ được gửi về email của bạn. Vui lòng kiểm tra hộp thư (có thể trong thư mục Spam).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
