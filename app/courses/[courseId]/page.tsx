"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ProgressBar";
import { getCourse } from "@/lib/courseStore";
import { getAuthUser } from "@/lib/auth-supabase";
import { ActivationCard } from "@/components/ActivationCard";
import { Toast } from "@/components/ui/toast";
import { CheckCircle2, Clock, Lock, Play, LogIn, CreditCard, Upload } from "lucide-react";

type PurchaseStatus = "none" | "pending" | "paid" | "rejected";

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchaseStatus, setPurchaseStatus] = useState<PurchaseStatus>("none");
  const [activated, setActivated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [proofUrl, setProofUrl] = useState("");
  const [toast, setToast] = useState<{ open: boolean; message: string; type: "success" | "error" }>({
    open: false,
    message: "",
    type: "success",
  });
  const courseData = getCourse();

  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = async () => {
    try {
      const authUser = await getAuthUser();
      setUser(authUser);

      if (!authUser) {
        setLoading(false);
        return;
      }

      // Check purchase status
      const purchaseRes = await fetch(`/api/purchases/status?courseId=${courseId}`);
      if (purchaseRes.ok) {
        const purchaseData = await purchaseRes.json();
        if (purchaseData.purchase) {
          setPurchaseStatus(purchaseData.purchase.status as PurchaseStatus);
        }
      }

      // Check activation
      const activationRes = await fetch(`/api/check-activation?courseId=${courseId}`);
      if (activationRes.ok) {
        const activationData = await activationRes.json();
        setActivated(activationData.activated || false);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePurchase = async () => {
    if (!user) {
      router.push(`/auth?next=/courses/${courseId}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/purchases/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          amountVnd: 3000000,
          note: `HATG ${user.email.split("@")[0]}`,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setPurchaseStatus("pending");
        setToast({
          open: true,
          message: "Đã tạo đơn hàng. Vui lòng chuyển khoản và chờ admin duyệt.",
          type: "success",
        });
      } else {
        setToast({
          open: true,
          message: data.message || "Có lỗi xảy ra",
          type: "error",
        });
      }
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

  const handleUploadProof = async () => {
    if (!proofUrl.trim()) {
      setToast({
        open: true,
        message: "Vui lòng nhập URL ảnh chuyển khoản",
        type: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/purchases/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          amountVnd: 3000000,
          proofUrl: proofUrl.trim(),
          note: `HATG ${user?.email.split("@")[0]}`,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setPurchaseStatus("pending");
        setShowUploadDialog(false);
        setProofUrl("");
        setToast({
          open: true,
          message: "Đã tạo đơn hàng với ảnh chuyển khoản. Vui lòng chờ admin duyệt.",
          type: "success",
        });
      } else {
        setToast({
          open: true,
          message: data.message || "Có lỗi xảy ra",
          type: "error",
        });
      }
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

  if (courseId !== courseData.id) {
    return null;
  }

  const previewLessons = courseData.lessons.filter((l) => l.is_preview);
  const firstLesson = courseData.lessons[0];

  // Determine access for lessons
  const canAccessLesson = (lesson: typeof courseData.lessons[0]) => {
    if (lesson.is_preview) return true; // Preview lessons always accessible
    if (!user) return false; // Not logged in
    if (purchaseStatus !== "paid") return false; // Not paid
    if (!activated) return false; // Not activated
    return true;
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* Course Header - Always visible */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{courseData.title}</h1>
          <p className="text-gray-400 mb-6">{courseData.description}</p>
          {user && <ProgressBar courseId={courseId} />}
        </div>

        {/* Preview Section - Always visible */}
        <Card className="mb-6 border-cyan-500/30 bg-gradient-to-br from-gray-900 to-gray-950">
          <CardHeader>
            <CardTitle className="text-2xl">Xem trước khóa học</CardTitle>
            <CardDescription>
              {previewLessons.length} bài học demo miễn phí
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              {previewLessons.map((lesson, index) => (
                <Link
                  key={lesson.id}
                  href={`/learn/${courseId}/${lesson.id}`}
                  className="flex items-center gap-3 p-3 rounded-md border border-cyan-500/30 bg-gray-900/50 hover:bg-gray-800/50 transition-colors"
                >
                  <Play className="h-4 w-4 text-cyan-400" />
                  <span className="flex-1 text-sm text-gray-300">{lesson.title}</span>
                  <Badge variant="outline" className="border-cyan-500 text-cyan-400">
                    Preview
                  </Badge>
                </Link>
              ))}
            </div>
            <p className="text-xs text-gray-400">
              Đăng ký khóa học để xem toàn bộ {courseData.lessons.length} bài học
            </p>
          </CardContent>
        </Card>

        {/* Course Outline - All lessons */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Mục lục khóa học</CardTitle>
            <CardDescription>
              {courseData.lessons.length} bài học • Học theo tiến độ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-6">
              {courseData.lessons.map((lesson, index) => {
                const canAccess = canAccessLesson(lesson);
                return (
                  <div
                    key={lesson.id}
                    className={`flex items-center gap-3 p-3 rounded-md border ${
                      canAccess
                        ? "border-cyan-500/30 bg-gray-900/50 hover:bg-gray-800/50"
                        : "border-titan-border bg-titan-card/50 opacity-60"
                    }`}
                  >
                    <span className="text-sm font-medium text-cyan-400 w-16">
                      Bài {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 text-sm text-gray-300">{lesson.title}</span>
                    {lesson.is_preview && (
                      <Badge variant="outline" className="border-cyan-500 text-cyan-400">
                        Preview
                      </Badge>
                    )}
                    {!canAccess && <Lock className="h-4 w-4 text-gray-500" />}
                    {canAccess && (
                      <Link href={`/learn/${courseId}/${lesson.id}`}>
                        <Button variant="ghost" size="sm">
                          <Play className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Purchase & Activation Section */}
        {!user ? (
          // Not logged in
          <Card className="mb-6 border-cyan-500/30">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-gray-300">
                  Đăng nhập để đăng ký khóa học và xem toàn bộ nội dung
                </p>
                <Link href={`/auth?next=/courses/${courseId}`}>
                  <Button variant="primary" size="lg" className="w-full">
                    <LogIn className="h-4 w-4 mr-2" />
                    Đăng nhập để đăng ký
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : purchaseStatus === "none" ? (
          // Logged in, no purchase
          <Card className="mb-6 border-cyan-500/30">
            <CardHeader>
              <CardTitle>Đăng ký khóa học</CardTitle>
              <CardDescription className="text-lg font-semibold text-cyan-400">
                3.000.000 VNĐ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2 text-sm text-gray-300">
                  <p>✓ Học trọn đời – không giới hạn thời gian</p>
                  <p>✓ 20 bài học chuyên sâu + quiz kiểm tra</p>
                  <p>✓ Mở bài theo tiến độ – học tới đâu chắc tới đó</p>
                  <p>✓ Hỗ trợ trực tiếp khi đi làm gặp ca khó</p>
                </div>
                <div className="pt-4 border-t border-titan-border">
                  <p className="text-xs text-gray-400 mb-4">
                    <span className="font-medium text-gray-300">Thanh toán:</span> Chuyển khoản → Đăng ký → Chờ admin duyệt → Kích hoạt
                  </p>
                  <div className="space-y-2">
                    <Button
                      variant="primary"
                      className="w-full"
                      size="lg"
                      onClick={handleCreatePurchase}
                      disabled={submitting}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      {submitting ? "Đang xử lý..." : "Đăng ký khóa học"}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowUploadDialog(true)}
                      disabled={submitting}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Đã chuyển khoản, upload ảnh
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : purchaseStatus === "pending" ? (
          // Pending purchase
          <Card className="mb-6 border-yellow-500/30">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Clock className="h-12 w-12 text-yellow-400 mx-auto" />
                <div>
                  <p className="text-lg font-semibold text-yellow-400 mb-2">Đang chờ duyệt</p>
                  <p className="text-sm text-gray-400">
                    Đơn hàng của bạn đang chờ admin duyệt. Vui lòng kiên nhẫn.
                  </p>
                </div>
                <div className="p-4 rounded-md bg-gray-900 border border-titan-border text-left">
                  <p className="text-xs text-gray-400 mb-2">
                    <span className="text-gray-300">Thông tin chuyển khoản:</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    Chủ TK: <span className="text-cyan-400">Trương Văn Thanh</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    Số TK: <span className="text-cyan-400 font-mono">0891000645477</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    Ngân hàng: <span className="text-cyan-400">Vietcombank Bạc Liêu</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    Số tiền: <span className="text-cyan-400 font-semibold">3.000.000 VNĐ</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : purchaseStatus === "paid" && !activated ? (
          // Paid but not activated
          <Card className="mb-6 border-cyan-500/30">
            <CardContent className="pt-6">
              <div className="text-center space-y-4 mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto" />
                <div>
                  <p className="text-lg font-semibold text-green-400 mb-2">Đã thanh toán</p>
                  <p className="text-sm text-gray-400">
                    Vui lòng kích hoạt thiết bị để bắt đầu học
                  </p>
                </div>
              </div>
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
            </CardContent>
          </Card>
        ) : purchaseStatus === "paid" && activated ? (
          // Paid and activated
          <Card className="mb-6 border-green-500/30">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto" />
                <div>
                  <p className="text-lg font-semibold text-green-400 mb-2">Đã kích hoạt</p>
                  <p className="text-sm text-gray-400">
                    Khóa học đã được mở. Chúc bạn học tốt!
                  </p>
                </div>
                <Link href={`/learn/${courseId}/${firstLesson.id}`}>
                  <Button variant="primary" className="w-full" size="lg">
                    <Play className="h-4 w-4 mr-2" />
                    Vào học ngay
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Upload Proof Dialog */}
        {showUploadDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4">
              <CardHeader>
                <CardTitle>Upload ảnh chuyển khoản</CardTitle>
                <CardDescription>
                  Dán link ảnh chuyển khoản (từ Google Drive, Imgur, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="https://..."
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-titan-border rounded-md text-gray-300"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowUploadDialog(false);
                        setProofUrl("");
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={handleUploadProof}
                      disabled={submitting}
                    >
                      {submitting ? "Đang xử lý..." : "Xác nhận"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

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
