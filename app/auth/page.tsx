"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signInWithOTP, signInWithPassword, signUpWithPassword, getAuthUser } from "@/lib/auth-supabase";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, CheckCircle2, ArrowLeft } from "lucide-react";
import { OTPInput } from "@/components/ui/otp-input";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"otp" | "password" | "signup">("otp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const user = await getAuthUser();
    if (user) {
      router.push("/courses");
    }
  };

  const handleOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Vui lòng nhập email!");
      return;
    }

    setLoading(true);
    setError(null);
    const { error } = await signInWithOTP(email);
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setOtpSent(true);
      setMessage("Đã gửi mã OTP đến email của bạn. Vui lòng kiểm tra hộp thư.");
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setError("Vui lòng nhập mã OTP!");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: "email",
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else if (data.user) {
      // Create profile if not exists
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: fullName || null,
      });

      router.push("/courses");
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu!");
      return;
    }

    setLoading(true);
    setError(null);

    if (mode === "signup") {
      const { error } = await signUpWithPassword(email, password, fullName);
      if (error) {
        setError(error.message);
      } else {
        setMessage("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.");
      }
    } else {
      const { data, error } = await signInWithPassword(email, password);
      if (error) {
        setError(error.message);
      } else if (data.user) {
        router.push("/courses");
      }
    }

    setLoading(false);
  };

  const handleOTPComplete = async (otp: string) => {
    setOtpCode(otp);
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else if (data.user) {
      // Create profile if not exists
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: fullName || null,
      });

      router.push("/courses");
    }
  };

  if (otpSent) {
    return (
      <div className="min-h-screen bg-titan-bg flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Nhập mã đăng nhập</CardTitle>
            <CardDescription className="text-center">
              Mã 6 số đã được gửi đến
            </CardDescription>
            <CardDescription className="text-center font-medium text-cyan-400">
              {email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {message && (
              <Alert variant="success" className="mb-4">
                <AlertDescription className="text-center">{message}</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="error" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-6">
              <div>
                <OTPInput onComplete={handleOTPComplete} />
                {loading && (
                  <p className="text-center text-sm text-gray-400 mt-4">Đang xác thực...</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-300">
                  Họ tên (tùy chọn)
                </label>
                <Input
                  type="text"
                  placeholder="Nhập họ tên"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOtpSent(false);
                  setOtpCode("");
                  setError(null);
                }}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-titan-bg flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Đăng nhập</CardTitle>
          <CardDescription className="text-center">
            Nhập email để nhận mã đăng nhập
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="error" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {message && (
            <Alert variant="success" className="mb-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleOTP} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-300">
                Email *
              </label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="text-lg"
              />
            </div>
            <Button type="submit" variant="primary" className="w-full" size="lg" disabled={loading}>
              {loading ? "Đang gửi..." : "Gửi mã đăng nhập"}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-titan-border">
            <button
              type="button"
              onClick={() => setMode(mode === "otp" ? "password" : "otp")}
              className="text-sm text-gray-400 hover:text-cyan-400 transition-colors w-full text-center"
            >
              {mode === "otp" ? "Đăng nhập bằng mật khẩu" : "Đăng nhập bằng mã OTP"}
            </button>
          </div>

          {mode === "password" && (
            <form onSubmit={handlePassword} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-300">
                  Email *
                </label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-300">
                  Mật khẩu *
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMode("signup")}
                  className="flex-1"
                >
                  Đăng ký
                </Button>
                <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
                  {loading ? "Đang xử lý..." : "Đăng nhập"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
