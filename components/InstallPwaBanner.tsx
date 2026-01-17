"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Download, Share2 } from "lucide-react";
import { usePathname } from "next/navigation";

export function InstallPwaBanner() {
  // Banner đã được ẩn theo yêu cầu
  return null;

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check if already installed
    if (typeof window !== "undefined") {
      const standalone = window.matchMedia("(display-mode: standalone)").matches;
      setIsStandalone(standalone);

      // Check if iOS
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      setIsIOS(iOS);

      // Only show on landing and courses pages
      const shouldShow = pathname === "/" || pathname?.startsWith("/courses");
      
      if (standalone || !shouldShow) {
        setShowBanner(false);
        return;
      }

      // Listen for beforeinstallprompt (Chrome/Android)
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowBanner(true);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      // For iOS, show banner after a delay
      if (iOS && !standalone) {
        setTimeout(() => {
          setShowBanner(true);
        }, 3000);
      }

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }
  }, [pathname]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!showBanner || isStandalone) return null;

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto border-cyan-500/30 bg-titan-card/95 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            {isIOS ? (
              <div>
                <h3 className="font-semibold text-sm mb-1 text-cyan-400">
                  Cài ứng dụng trên iPhone
                </h3>
                <p className="text-xs text-gray-400 mb-2">
                  Nhấn nút <Share2 className="inline h-3 w-3" /> Share ở dưới màn hình, sau đó chọn &quot;Thêm vào Màn hình chính&quot;
                </p>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold text-sm mb-1 text-cyan-400">
                  Cài ứng dụng
                </h3>
                <p className="text-xs text-gray-400 mb-2">
                  Cài đặt để học offline và truy cập nhanh hơn
                </p>
              </div>
            )}
            {!isIOS && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleInstall}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Cài ứng dụng
              </Button>
            )}
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
