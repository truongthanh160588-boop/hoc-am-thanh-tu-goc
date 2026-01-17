"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAuthUser } from "@/lib/auth-supabase";
import { Toast } from "@/components/ui/toast";
import { CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";

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
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ open: boolean; message: string; type: "success" | "error" }>({
    open: false,
    message: "",
    type: "success",
  });
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");

  useEffect(() => {
    checkAdmin();
    loadPurchases();
  }, []);

  const checkAdmin = async () => {
    const user = await getAuthUser();
    if (!user) {
      router.push("/auth");
      return;
    }

    setCurrentUserEmail(user.email);

    // Check admin via API
    const res = await fetch("/api/admin/purchases?status=pending");
    if (!res.ok) {
      if (res.status === 403) {
        router.push("/courses");
        return;
      }
    }
  };

  const loadPurchases = async () => {
    try {
      const res = await fetch("/api/admin/purchases?status=pending");
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setPurchases(data.purchases || []);
        }
      }
    } catch (error) {
      console.error("Error loading purchases:", error);
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
          message: "Đã duyệt đơn hàng",
          type: "success",
        });
        loadPurchases();
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
    }
  };

  const handleReject = async (purchaseId: string) => {
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
        loadPurchases();
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
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Đã thanh toán
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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12 text-gray-400">Đang tải...</div>
      </div>
    );
  }

  const pendingPurchases = purchases.filter((p) => p.status === "pending");

  return (
    <>
      <div className="max-w-6xl mx-auto">
        {/* Admin Badge */}
        {currentUserEmail && (
          <div className="mb-4 text-right">
            <span className="text-xs text-gray-500">Admin: {currentUserEmail}</span>
          </div>
        )}
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Quản lý đơn hàng</h1>
          <p className="text-gray-400">
            Duyệt đơn hàng chuyển khoản ({pendingPurchases.length} đơn chờ duyệt)
          </p>
        </div>

        <div className="space-y-4">
          {purchases.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-400">
                Chưa có đơn hàng nào
              </CardContent>
            </Card>
          ) : (
            purchases.map((purchase) => (
              <Card key={purchase.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">Đơn #{purchase.id.slice(0, 8)}</h3>
                        {getStatusBadge(purchase.status)}
                      </div>
                      <div className="text-sm text-gray-400 space-y-1">
                        <p>Email: <span className="text-cyan-400">{purchase.user_email || "N/A"}</span></p>
                        <p>Khóa học: <span className="text-cyan-400">{purchase.course_id}</span></p>
                        <p>
                          Số tiền:{" "}
                          <span className="text-cyan-400 font-semibold">
                            {((purchase.amount_vnd || purchase.amount || 0) / 1000).toLocaleString("vi-VN")}đ
                          </span>
                        </p>
                        <p>Ngày tạo: {new Date(purchase.created_at).toLocaleString("vi-VN")}</p>
                        {purchase.note && (
                          <p>
                            Nội dung/Mã giao dịch: <span className="text-gray-300">{purchase.note}</span>
                          </p>
                        )}
                        {purchase.proof_url && (
                          <p>
                            Ảnh chuyển khoản:{" "}
                            <a
                              href={purchase.proof_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                            >
                              Xem ảnh <ExternalLink className="h-3 w-3" />
                            </a>
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Mã đơn: <span className="font-mono">{purchase.id}</span>
                        </p>
                      </div>
                    </div>
                    {purchase.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApprove(purchase.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Duyệt
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
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
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
