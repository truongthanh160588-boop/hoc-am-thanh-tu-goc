import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Học Âm Thanh Từ Gốc - Khóa học âm thanh chuyên nghiệp",
  description: "Khóa học toàn diện về âm thanh, từ cơ bản đến nâng cao. Học cách xử lý, mixing và mastering audio chuyên nghiệp. 20 bài học với video và quiz.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Học Âm Thanh",
  },
      icons: {
        icon: [
          { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
        apple: [
          { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0b0f14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="vi">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Học Âm Thanh" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
