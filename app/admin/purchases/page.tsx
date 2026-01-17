"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Toast } from "@/components/ui/toast";
import { CheckCircle2, XCircle, Clock, ExternalLink, RefreshCw } from "lucide-react";

interface Purchase {
  id: string;
  user_id: string;
  user_email: string;
  course_id: string;
  status: "pending" | "paid" | "rejected";
  amount_vnd?: number;
  amount?: number;
  note?: string;
  proof_url?: string;
  created_at: string;
  updated_at: string;
}

export default function AdminPurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ open: boolean; message: string; type: "success" | "error" }>({
    open: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/purchases");
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setPurchases(data.purchases || []);
        } else {
          setToast({
            open: true,
            message: data.message || "Lỗi tải danh sách đơn hàng",
            type: "error",
          });
        }
      } else if (res.status === 403) {
        // Not admin - layout will redirect
        window.location.href = "/courses";
      } else {
        setToast({
          open: true,
          message: "Lỗi tải danh sách đơn hàng",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error loading purchases:", error);
      setToast({
        open: true,
        message: "Lỗi kết nối. Vui lòng thử lại.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (purchaseId: string) => {
    try {
      const res = await fetch("/api/admin/purchases/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchaseId, status: "paid" }),
      });

      const data = await res.json();
      if (data.ok) {
        setToast({
          open: true,
          message: "Đã duyệt đơn hàng thành công",
          type: "success",
        });
        await loadPurchases(); // Refresh list
      } else {
        setToast({
          open: true,
          message: data.message || "Có lỗi xảy ra khi duyệt đơn hàng",
          type: "error",
        });
      }
    } catch (error) {
      setToast({
        open: true,
        message: "Lỗi kết nối. Vui lòng thử lại.",
        type: "error",
      });
    }
  };

  const handleReject = async (purchaseId: string) => {
    if (!confirm("Bạn có chắc muốn từ chối đơn hàng này?")) {
      return;
    }

    try {
      const res = await fetch("/api/admin/purchases/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchaseId, status: "rejected" }),
      });

      const data = await res.json();
      if (data.ok) {
        setToast({
          open: true,
          message: "Đã từ chối đơn hàng",
          type: "success",
        });
        await loadPurchases(); // Refresh list
      } else {
        setToast({
          open: true,
          message: data.message || "Có lỗi xảy ra khi từ chối đơn hàng",
          type: "error",
        });
      }
    } catch (error) {
      setToast({
        open: true,
        message: "Lỗi kết nối. Vui lòng thử lại.",
        type: "error",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            ĐÃ DUYỆT
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="border-red-500 text-red-400">
            <XCircle className="h-3 w-3 mr-1" />
            Đã từ chối
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-400">
            <Clock className="h-3 w-3 mr-1" />
            Chờ duyệt
          </Badge>
        );
    }
  };

  const pendingPurchases = purchases.filter((p) => p.status === "pending");
  const paidPurchases = purchases.filter((p) => p.status === "paid");
  const rejectedPurchases = purchases.filter((p) => p.status === "rejected");

  return (
    <>
      <div className="max-w-6xl mx-auto">
        {/* Admin Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quản lý đơn hàng</h1>
            <p className="text-gray-400">
              Duyệt đơn hàng đăng ký khóa học
            </p>
          </div>
          <Button variant="outline" onClick={loadPurchases} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">{pendingPurchases.length}</p>
                <p className="text-sm text-gray-400">Chờ duyệt</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{paidPurchases.length}</p>
                <p className="text-sm text-gray-400">Đã duyệt</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">{rejectedPurchases.length}</p>
                <p className="text-sm text-gray-400">Đã từ chối</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Purchases Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách đơn hàng</CardTitle>
            <CardDescription>
              Tất cả đơn hàng ({purchases.length} đơn) - Sắp xếp theo ngày tạo mới nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center text-gray-400">Đang tải...</div>
            ) : purchases.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                Chưa có đơn hàng nào
              </div>
            ) : (
              <div className="space-y-4">
                {purchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="p-4 rounded-lg border border-titan-border bg-titan-card/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-lg">Đơn #{purchase.id.slice(0, 8)}</h3>
                          {getStatusBadge(purchase.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                          <div>
                            <span className="text-gray-500">Email học viên:</span>{" "}
                            <span className="text-cyan-400 font-medium">{purchase.user_email || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Khóa học:</span>{" "}
                            <span className="text-cyan-400">{purchase.course_id}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Số tiền:</span>{" "}
                            <span className="text-cyan-400 font-semibold">
                              {((purchase.amount_vnd || purchase.amount || 0) / 1000).toLocaleString("vi-VN")}đ
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Ngày tạo:</span>{" "}
                            <span className="text-gray-300">
                              {new Date(purchase.created_at).toLocaleString("vi-VN")}
                            </span>
                          </div>
                          {purchase.note && (
                            <div className="col-span-2">
                              <span className="text-gray-500">Nội dung CK:</span>{" "}
                              <span className="text-gray-300 font-mono text-xs">{purchase.note}</span>
                            </div>
                          )}
                          {purchase.proof_url && (
                            <div className="col-span-2">
                              <span className="text-gray-500">Ảnh chuyển khoản:</span>{" "}
                              <a
                                href={purchase.proof_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                              >
                                Xem ảnh <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                          <div className="col-span-2">
                            <span className="text-gray-500 text-xs">Mã đơn:</span>{" "}
                            <span className="text-gray-500 font-mono text-xs">{purchase.id}</span>
                          </div>
                        </div>
                      </div>
                      {purchase.status === "pending" && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApprove(purchase.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            DUYỆT
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(purchase.id)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Từ chối
                          </Button>
                        </div>
                      )}
                      {purchase.status === "paid" && (
                        <div className="ml-4">
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            ĐÃ DUYỆT
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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
