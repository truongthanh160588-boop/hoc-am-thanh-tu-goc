"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Toast } from "@/components/ui/toast";
import { XCircle, RefreshCw, AlertTriangle } from "lucide-react";
interface ActivationRow {
  id: string;
  user_id: string;
  user_email?: string;
  course_id: string;
  device_id: string;
  activated_at: string;
  revoked_at: string | null;
  revoked_by: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

interface ActivationsListProps {
  courseId?: string;
}

export function ActivationsList({ courseId }: ActivationsListProps) {
  const [activations, setActivations] = useState<ActivationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ open: boolean; message: string; type: "success" | "error" }>({
    open: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    loadActivations();
  }, [courseId]);

  const loadActivations = async () => {
    setLoading(true);
    try {
      const url = courseId
        ? `/api/admin/activations?courseId=${courseId}`
        : "/api/admin/activations";
      const response = await fetch(url);
      const data = await response.json();
      if (data.ok) {
        setActivations(data.activations || []);
      } else {
        setToast({
          open: true,
          message: data.message || "Lỗi tải danh sách",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error loading activations:", error);
      setToast({
        open: true,
        message: "Lỗi kết nối",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (activation: ActivationRow) => {
    if (!confirm(`Bạn có chắc muốn thu hồi thiết bị ${activation.device_id.substring(0, 8)}?`)) {
      return;
    }

    try {
      const response = await fetch("/api/admin/revoke-device", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: activation.user_id,
          courseId: activation.course_id,
          deviceId: activation.device_id,
          note: "Revoked by admin",
        }),
      });

      const data = await response.json();
      if (data.ok) {
        setToast({
          open: true,
          message: "Đã thu hồi thiết bị thành công",
          type: "success",
        });
        loadActivations();
      } else {
        setToast({
          open: true,
          message: data.message || "Lỗi thu hồi thiết bị",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error revoking device:", error);
      setToast({
        open: true,
        message: "Lỗi kết nối",
        type: "error",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-400">
          Đang tải...
        </CardContent>
      </Card>
    );
  }

  const activeActivations = activations.filter((a) => !a.revoked_at);
  const revokedActivations = activations.filter((a) => a.revoked_at);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quản lý Activations</CardTitle>
              <CardDescription>
                {courseId ? `Khóa học: ${courseId}` : "Tất cả khóa học"}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadActivations}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Active Activations */}
            <div>
              <h3 className="text-sm font-semibold mb-2 text-green-400">
                Đang hoạt động ({activeActivations.length})
              </h3>
              {activeActivations.length === 0 ? (
                <p className="text-sm text-gray-400">Không có activation nào đang hoạt động</p>
              ) : (
                <div className="space-y-2">
                  {activeActivations.map((activation) => (
                    <div
                      key={activation.id}
                      className="p-3 rounded-md border border-titan-border bg-titan-card/50 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="default" className="bg-green-600">
                            Active
                          </Badge>
                          <span className="text-sm font-mono text-cyan-400">
                            {activation.device_id.substring(0, 8)}...
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 space-y-1">
                          <p>Email: <span className="text-cyan-400">{activation.user_email || activation.user_id.substring(0, 8) + "..."}</span></p>
                          <p>Course: {activation.course_id}</p>
                          <p>Device: <span className="font-mono">{activation.device_id}</span></p>
                          <p>Kích hoạt: {new Date(activation.activated_at).toLocaleString("vi-VN")}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevoke(activation)}
                        className="ml-4"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Thu hồi
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Revoked Activations */}
            {revokedActivations.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 text-gray-400">
                  Đã thu hồi ({revokedActivations.length})
                </h3>
                <div className="space-y-2">
                  {revokedActivations.map((activation) => (
                    <div
                      key={activation.id}
                      className="p-3 rounded-md border border-gray-700 bg-gray-900/50 flex items-center justify-between opacity-60"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="border-red-500 text-red-400">
                            Revoked
                          </Badge>
                          <span className="text-sm font-mono text-gray-400">
                            {activation.device_id.substring(0, 8)}...
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>Email: <span className="text-gray-400">{activation.user_email || activation.user_id.substring(0, 8) + "..."}</span></p>
                          <p>Course: {activation.course_id}</p>
                          <p>Device: <span className="font-mono">{activation.device_id}</span></p>
                          <p>Thu hồi: {new Date(activation.revoked_at!).toLocaleString("vi-VN")}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
