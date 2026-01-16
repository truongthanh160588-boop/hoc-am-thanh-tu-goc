"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Copy, MessageCircle, ArrowRight, CreditCard, Key, User } from "lucide-react";
import { Toast } from "@/components/ui/toast";

const BANK_ACCOUNT = {
  owner: "Trương Văn Thanh",
  account: "0891000645477",
  bank: "Vietcombank Bạc Liêu",
  amount: "3.000.000",
};

const ZALO_PHONE = "0974704444";

export default function StartPage() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleCopyBankInfo = async () => {
    const info = `Chủ TK: ${BANK_ACCOUNT.owner}
STK: ${BANK_ACCOUNT.account}
Ngân hàng: ${BANK_ACCOUNT.bank}
Số tiền: ${BANK_ACCOUNT.amount} VNĐ`;
    
    await navigator.clipboard.writeText(info);
    setToastMessage("Đã copy thông tin chuyển khoản!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleCopyZaloMessage = async () => {
    const message = `Em muốn đăng ký khóa học Học Âm Thanh Từ Gốc.
Sau khi chuyển khoản em sẽ gửi Device ID để anh kích hoạt ạ.`;
    
    await navigator.clipboard.writeText(message);
    setToastMessage("Đã copy tin nhắn mẫu!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleOpenZalo = () => {
    const message = `Em muốn đăng ký khóa học Học Âm Thanh Từ Gốc.
Sau khi chuyển khoản em sẽ gửi Device ID để anh kích hoạt ạ.`;
    window.open(`https://zalo.me/${ZALO_PHONE}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <>
      <div className="min-h-screen bg-titan-bg py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-200 to-cyan-400 bg-clip-text text-transparent">
              Bắt đầu học ngay
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Học trọn đời – Hỗ trợ trực tiếp khi đi làm
            </p>
            <Link href="/courses">
              <Button variant="primary" size="lg" className="text-lg px-8">
                <ArrowRight className="h-5 w-5 mr-2" />
                Vào khóa học
              </Button>
            </Link>
          </div>

          {/* Steps */}
          <Card className="mb-6 border-cyan-500/30 bg-gradient-to-br from-gray-900 to-gray-950">
            <CardHeader>
              <CardTitle className="text-2xl">Hướng dẫn đăng ký</CardTitle>
              <CardDescription className="text-lg">
                Làm theo 4 bước đơn giản để bắt đầu học
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-lg font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <User className="h-5 w-5 text-cyan-400" />
                    Đăng nhập email
                  </h3>
                  <p className="text-gray-400">
                    Vào trang <Link href="/auth" className="text-cyan-400 hover:underline">Đăng nhập</Link> và nhập email của bạn.
                    Hệ thống sẽ gửi mã OTP hoặc bạn có thể dùng mật khẩu.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-lg font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-cyan-400" />
                    Chuyển khoản {BANK_ACCOUNT.amount}đ
                  </h3>
                  <div className="p-4 rounded-md bg-gray-900 border border-titan-border mb-3">
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-300">
                        <span className="text-gray-400">Chủ TK:</span>{" "}
                        <span className="text-cyan-400 font-semibold">{BANK_ACCOUNT.owner}</span>
                      </p>
                      <p className="text-gray-300">
                        <span className="text-gray-400">STK:</span>{" "}
                        <span className="text-cyan-400 font-mono font-semibold">{BANK_ACCOUNT.account}</span>
                      </p>
                      <p className="text-gray-300">
                        <span className="text-gray-400">Ngân hàng:</span>{" "}
                        <span className="text-cyan-400">{BANK_ACCOUNT.bank}</span>
                      </p>
                      <p className="text-gray-300">
                        <span className="text-gray-400">Số tiền:</span>{" "}
                        <span className="text-cyan-400 font-semibold">{BANK_ACCOUNT.amount} VNĐ</span>
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyBankInfo}
                    className="w-full sm:w-auto"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy thông tin chuyển khoản
                  </Button>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-lg font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Key className="h-5 w-5 text-cyan-400" />
                    Copy Device ID và gửi Zalo
                  </h3>
                  <p className="text-gray-400 mb-3">
                    Sau khi chuyển khoản, vào khóa học và copy <strong>Device ID</strong>.
                    Gửi Device ID cho anh Trương Thanh qua Zalo để nhận Activation Key.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyZaloMessage}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy tin nhắn mẫu
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenZalo}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Nhắn Zalo ngay
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Zalo: <span className="text-cyan-400">{ZALO_PHONE}</span>
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-lg font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    Nhận key và kích hoạt
                  </h3>
                  <p className="text-gray-400">
                    Sau khi nhận Activation Key từ anh Trương Thanh, nhập key vào khóa học để kích hoạt.
                    Sau đó bạn có thể học <strong>trọn đời</strong> và được hỗ trợ trực tiếp khi đi làm.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="border-cyan-500/30">
            <CardHeader>
              <CardTitle>Quyền lợi khóa học</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-200">✓ Học trọn đời – không giới hạn thời gian</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-200">✓ 20 bài học chuyên sâu + quiz kiểm tra</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-200">✓ Hỗ trợ trực tiếp khi đi làm gặp ca khó</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-200">✓ Cập nhật nội dung mới miễn phí</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Toast
        open={showToast}
        onClose={() => setShowToast(false)}
        title="Đã copy"
        description={toastMessage}
        variant="success"
      />
    </>
  );
}
