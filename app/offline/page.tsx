"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  const router = useRouter();

  const handleRetry = () => {
    if (navigator.onLine) {
      router.push("/");
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-titan-bg flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <WifiOff className="h-16 w-16 text-gray-400" />
          </div>
          <CardTitle className="text-2xl">Không có kết nối</CardTitle>
          <CardDescription className="mt-2">
            Vui lòng bật mạng để xem video và tiếp tục học tập
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="primary"
            className="w-full"
            onClick={handleRetry}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
