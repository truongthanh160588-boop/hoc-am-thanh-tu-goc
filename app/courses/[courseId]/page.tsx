"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/ProgressBar";
import { getCourse } from "@/lib/courseStore";
import { getAuthUser } from "@/lib/auth-supabase";
import { createPurchaseZalo, isCoursePaidZalo, getUserPurchases, getZaloMessageTemplate, getZaloLink, getTransferContent, getTransferInfoText } from "@/lib/purchase-zalo";
import { Toast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { SupportForm } from "@/components/SupportForm";
import { ActivationCard } from "@/components/ActivationCard";
import { isActivated } from "@/lib/device-activation";
import { CreditCard, CheckCircle2, Clock, MessageCircle, Copy } from "lucide-react";

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;
  const [purchaseStep, setPurchaseStep] = useState<"button" | "form" | "pending">("button");
  const [purchased, setPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [currentPurchase, setCurrentPurchase] = useState<any>(null);
  const [zaloMessage, setZaloMessage] = useState("");
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; type: "success" | "error" }>({
    open: false,
    message: "",
    type: "success",
  });
  const [activated, setActivated] = useState(false);
  const courseData = getCourse();

  useEffect(() => {
    checkPurchase();
    // Check activation
    setActivated(isActivated(courseId));
  }, [courseId]);

  const checkPurchase = async () => {
    try {
      const authUser = await getAuthUser();
      if (!authUser) {
        router.push("/auth");
        return;
      }
      setUser(authUser);

      const isPaid = await isCoursePaidZalo(courseId, authUser.email);
      setPurchased(isPaid);
      
      // Check for pending purchase
      if (!isPaid) {
        const purchases = await getUserPurchases(authUser.email);
        const pending = purchases.find((p) => p.courseId === courseId && p.status === "pending");
        if (pending) {
          setPurchaseStep("pending");
          setCurrentPurchase(pending);
        }
      }
    } catch (error) {
      console.error("Error checking purchase:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12 text-gray-400">Đang tải...</div>
      </div>
    );
  }

  if (courseId !== courseData.id) {
    return null;
  }

  const firstLesson = courseData.lessons[0];

  const handleStartPurchase = () => {
    setShowPurchaseDialog(true);
  };

  const handleSubmitPurchase = async () => {
    setSubmitting(true);
    try {
      const authUser = await getAuthUser();
      if (!authUser) {
        router.push("/auth");
        return;
      }

      const purchase = await createPurchaseZalo(
        courseId,
        3000000, // 3.000.000đ
        undefined // Note will be auto-generated as transfer content
      );

      // Update note with correct transfer content
      const transferContent = getTransferContent(authUser.email, purchase.id);
      purchase.note = transferContent;

      setCurrentPurchase(purchase);
      const message = getZaloMessageTemplate(purchase);
      setZaloMessage(message);
      setPurchaseStep("pending");
      setShowPurchaseDialog(false);
      setToast({
        open: true,
        message: "Đã tạo đơn hàng. Vui lòng chuyển khoản và nhắn Zalo để xác nhận.",
        type: "success",
      });
    } catch (error) {
      setToast({
        open: true,
        message: "Có lỗi xảy ra",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyZaloMessage = () => {
    if (currentPurchase) {
      const message = getZaloMessageTemplate(currentPurchase);
      navigator.clipboard.writeText(message);
      setToast({
        open: true,
        message: "Đã copy nội dung nhắn Zalo!",
        type: "success",
      });
    }
  };

  const handleOpenZalo = () => {
    if (currentPurchase) {
      const message = getZaloMessageTemplate(currentPurchase);
      window.open(getZaloLink(message), "_blank");
    } else {
      window.open(getZaloLink(), "_blank");
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{courseData.title}</h1>
          <p className="text-gray-400 mb-6">{courseData.description}</p>
          <ProgressBar courseId={courseId} />
        </div>

        {/* Activation Card */}
        {!activated && (
          <div className="mb-6">
            <ActivationCard
              courseId={courseId}
              onActivated={() => {
                setActivated(true);
                setToast({
                  open: true,
                  message: "Kích hoạt thành công! Bạn có thể bắt đầu học.",
                  type: "success",
                });
              }}
            />
          </div>
        )}

        {/* Quyền lợi khóa học */}
        <Card className="mb-6 border-cyan-500/30 bg-gradient-to-br from-gray-900 to-gray-950">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-2xl">Học Âm Thanh Từ Gốc – Trọn đời</CardTitle>
            </div>
            <CardDescription className="text-lg font-semibold text-cyan-400">
              3.000.000 VNĐ
            </CardDescription>
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
                <p className="text-gray-200">✓ Mở bài theo tiến độ – học tới đâu chắc tới đó</p>
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
            <div className="mt-4 pt-4 border-t border-titan-border">
              <p className="text-sm text-gray-400">
                <span className="font-medium text-gray-300">Thanh toán:</span> Chuyển khoản → Nhắn Zalo xác nhận → Kích hoạt
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tổng quan khóa học</CardTitle>
            <CardDescription>
              {courseData.lessons.length} bài học • Học theo tiến độ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-6">
              {courseData.lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="flex items-center gap-3 p-3 rounded-md border border-titan-border bg-titan-card/50"
                >
                  <span className="text-sm font-medium text-cyan-400 w-16">
                    Bài {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 text-sm text-gray-300">{lesson.title}</span>
                </div>
              ))}
            </div>

            {purchased ? (
              <div className="space-y-4">
                <div className="p-4 rounded-md bg-green-900/20 border border-green-700 text-center">
                  <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-400">Đã kích hoạt</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Khóa học đã được mở.
                    Chúc bạn học tốt và áp dụng hiệu quả khi đi làm.
                  </p>
                </div>
                <Link href={`/learn/${courseId}/${firstLesson.id}`}>
                  <Button variant="primary" className="w-full" size="lg">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Vào học ngay
                  </Button>
                </Link>
              </div>
            ) : purchaseStep === "button" ? (
              <Button
                variant="primary"
                className="w-full"
                size="lg"
                onClick={handleStartPurchase}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Mua khóa học
              </Button>
            ) : (
              <div className="text-center space-y-4">
                <div className="p-4 rounded-md bg-yellow-900/20 border border-yellow-700">
                  <Clock className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-yellow-400">Chờ duyệt</p>
                  <p className="text-xs text-gray-400 mt-1 mb-3">
                    Hệ thống đã nhận thông tin.
                    Vui lòng chờ anh Trương Thanh xác nhận để kích hoạt khóa học.
                  </p>
                  {currentPurchase && (
                    <div className="text-left space-y-2 mt-3 pt-3 border-t border-yellow-700/50">
                      <p className="text-xs text-gray-400">
                        <span className="text-gray-300">Mã đơn:</span>{" "}
                        <span className="text-cyan-400 font-mono">{currentPurchase.id}</span>
                      </p>
                      <p className="text-xs text-gray-400">
                        <span className="text-gray-300">Email:</span>{" "}
                        <span className="text-cyan-400">{currentPurchase.userEmail}</span>
                      </p>
                      {currentPurchase.note && (
                        <p className="text-xs text-gray-400">
                          <span className="text-gray-300">Nội dung CK:</span>{" "}
                          <span className="text-cyan-400 font-mono">{currentPurchase.note}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleOpenZalo}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Nhắn Zalo
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleCopyZaloMessage}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy nội dung
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  className="w-full mt-2"
                  onClick={() => setPurchaseStep("button")}
                >
                  Quay lại
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Support Form Dialog */}
      {showSupportForm && user && (
        <Dialog open={showSupportForm} onOpenChange={setShowSupportForm}>
          <DialogContent>
            <SupportForm
              userEmail={user.email}
              onClose={() => setShowSupportForm(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Purchase Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent className="max-w-md">
            <DialogHeader>
            <DialogTitle>Hướng dẫn thanh toán</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 rounded-md bg-gray-900 border border-titan-border space-y-2">
              <div className="space-y-1 text-sm">
                <p className="text-gray-300">
                  Chủ tài khoản: <span className="text-cyan-400">Trương Văn Thanh</span>
                </p>
                <p className="text-gray-300">
                  Số tài khoản: <span className="text-cyan-400 font-mono">0891000645477</span>
                </p>
                <p className="text-gray-300">
                  Ngân hàng: <span className="text-cyan-400">Vietcombank Bạc Liêu</span>
                </p>
                <p className="text-gray-300">
                  Số tiền: <span className="text-cyan-400 font-semibold">3.000.000 VNĐ</span>
                </p>
                <p className="text-gray-300">
                  Nội dung CK: <span className="text-cyan-400 font-mono text-xs">HATG &lt;email&gt; &lt;mã đơn&gt;</span>
                </p>
              </div>
            </div>
            
            <div className="p-3 rounded-md bg-yellow-900/20 border border-yellow-700/50">
              <p className="text-xs text-gray-300">
                Sau khi chuyển khoản, vui lòng nhắn Zalo anh Trương Thanh để được kích hoạt nhanh.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={async () => {
                  if (!user?.email) return;
                  const purchaseIdPlaceholder = currentPurchase?.id || "[mã_đơn]";
                  const info = `Chủ tài khoản: Trương Văn Thanh
Số tài khoản: 0891000645477
Ngân hàng: Vietcombank Bạc Liêu
Số tiền: 3.000.000 VNĐ
Nội dung CK: HATG ${user.email.split("@")[0]} ${purchaseIdPlaceholder}`;
                  await navigator.clipboard.writeText(info);
                  setToast({
                    open: true,
                    message: "Đã copy thông tin chuyển khoản!",
                    type: "success",
                  });
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy thông tin chuyển khoản
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleOpenZalo}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Nhắn Zalo xác nhận
              </Button>
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={handleSubmitPurchase}
              disabled={submitting}
            >
              {submitting ? "Đang xử lý..." : "Tôi đã thanh toán"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Toast
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        title={toast.type === "success" ? "Thành công" : "Lỗi"}
        description={toast.message}
        variant={toast.type === "success" ? "success" : "error"}
      />
    </>
  );
}
