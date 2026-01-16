"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getUserPurchases, type PurchaseZalo } from "@/lib/purchase-zalo";
import { getAuthUser } from "@/lib/auth-supabase";
import { CheckCircle2, XCircle, Clock, Printer, Receipt } from "lucide-react";

export default function BillingPage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<PurchaseZalo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseZalo | null>(null);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      const user = await getAuthUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      const userPurchases = await getUserPurchases(user.email);
      setPurchases(userPurchases.filter((p) => p.status === "paid"));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
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
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12 text-gray-400">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Hóa đơn của tôi</h1>
        <p className="text-gray-400">Xem lịch sử thanh toán và hóa đơn</p>
      </div>

      {purchases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">
            Chưa có hóa đơn nào
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <Card key={purchase.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="h-5 w-5 text-cyan-400" />
                      Hóa đơn #{purchase.id.slice(0, 8)}
                    </CardTitle>
                    <CardDescription>
                      {new Date(purchase.createdAt).toLocaleString("vi-VN")}
                    </CardDescription>
                  </div>
                  {getStatusBadge(purchase.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Gói học:</span>
                    <span className="text-gray-200 font-medium">Học trọn đời – Hỗ trợ trực tiếp</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-gray-200">{purchase.userEmail}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Khóa học:</span>
                    <span className="text-gray-200">{purchase.courseId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Giá:</span>
                    <span className="text-gray-200 font-semibold text-cyan-400">
                      {purchase.amountVnd.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </div>
                  {purchase.note && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Nội dung/Mã giao dịch:</span>
                      <span className="text-gray-200">{purchase.note}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Mã đơn:</span>
                    <span className="text-gray-200 font-mono text-xs">{purchase.id}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedPurchase(purchase);
                    setTimeout(handlePrint, 100);
                  }}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  In hóa đơn
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Print Receipt */}
      {selectedPurchase && (
        <div className="hidden print:block fixed inset-0 bg-white p-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">HỌC ÂM THANH TỪ GỐC</h1>
              <p className="text-gray-600">HÓA ĐƠN ĐIỆN TỬ</p>
            </div>
            <div className="space-y-4 border-t border-b py-6">
              <div className="flex justify-between">
                <span className="font-medium">Gói học:</span>
                <span className="font-semibold">Học trọn đời – Hỗ trợ trực tiếp</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Mã đơn:</span>
                <span>#{selectedPurchase.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span>{selectedPurchase.userEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Ngày:</span>
                <span>{new Date(selectedPurchase.createdAt).toLocaleString("vi-VN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Khóa học:</span>
                <span>{selectedPurchase.courseId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Giá:</span>
                <span className="font-bold">
                  {selectedPurchase.amountVnd.toLocaleString("vi-VN")} VNĐ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Trạng thái:</span>
                <span>Đã thanh toán</span>
              </div>
            </div>
            <div className="mt-8 text-center text-sm text-gray-600">
              <p>Trương Thanh - 0974 70 4444</p>
              <p>Cảm ơn bạn đã sử dụng dịch vụ!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
