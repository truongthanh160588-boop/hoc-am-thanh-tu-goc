"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, User, LogOut, BookOpen, Download, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { getAuthUser, signOut } from "@/lib/auth-supabase";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string; fullName?: string } | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const standalone = window.matchMedia("(display-mode: standalone)").matches;
      
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowInstallButton(true);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowInstallButton(false);
      }
      setDeferredPrompt(null);
    }
  };

  const loadUser = async () => {
    const authUser = await getAuthUser();
    setUser(authUser);
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/auth");
  };

  const isAuthPage = pathname === "/auth";
  const isLandingPage = pathname === "/";
  const isKeyGenPage = pathname === "/keygen";

  if (isAuthPage || isLandingPage || isKeyGenPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-titan-bg text-gray-200">
      {/* Topbar */}
      <header className="sticky top-0 z-40 border-b border-titan-border bg-titan-card/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="Học Âm Thanh Từ Gốc"
                  width={40}
                  height={40}
                  className="rounded-lg object-contain"
                  priority
                />
              </div>
              <span className="font-bold text-lg hidden sm:inline">Học Âm Thanh Từ Gốc</span>
              <span className="font-bold text-lg sm:hidden">Học Âm Thanh</span>
            </Link>
          </div>

          {user && (
            <div className="flex items-center gap-2">
              {showInstallButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInstall}
                  className="hidden sm:flex"
                >
                  <Download className="h-4 w-4 mr-1" />
                  <span className="hidden md:inline">Cài ứng dụng</span>
                </Button>
              )}
              <Link href="/account/billing" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  <Receipt className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Hóa đơn</span>
                </Button>
              </Link>
              <div className="hidden md:flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-cyan-400" />
                <span>{user.fullName || user.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <div className="p-4 space-y-2">
          <Link
            href="/courses"
            className="block px-4 py-2 rounded hover:bg-gray-800"
            onClick={() => setSidebarOpen(false)}
          >
            Khóa học
          </Link>
          {user && (
            <div className="px-4 py-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{user.fullName || user.email}</span>
              </div>
            </div>
          )}
        </div>
      </Sheet>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
