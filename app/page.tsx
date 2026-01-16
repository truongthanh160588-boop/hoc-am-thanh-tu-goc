"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, CheckCircle2, Users, HelpCircle, Sparkles } from "lucide-react";
import { getAuthUser } from "@/lib/auth-supabase";
import { InstallPwaBanner } from "@/components/InstallPwaBanner";

export default function HomePage() {
  const [authenticated, setAuthenticated] = React.useState(false);

  React.useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const user = await getAuthUser();
    setAuthenticated(!!user);
  };

  return (
    <div className="min-h-screen bg-titan-bg">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] md:w-[280px] md:h-[280px]">
            <Image
              src="/logo.png"
              alt="Học Âm Thanh Từ Gốc - Trương Thanh"
              width={280}
              height={280}
              className="rounded-xl shadow-lg border border-titan-border/50 object-contain"
              priority
            />
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
          <Badge variant="default" className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white border-0 px-4 py-1.5 text-sm font-bold">
            🔰 HỌC TRỌN ĐỜI
          </Badge>
        </div>
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-gray-200 to-cyan-400 bg-clip-text text-transparent">
          HỌC ÂM THANH TỪ GỐC
        </h1>
        <p className="text-xl text-gray-300 mb-2 max-w-2xl mx-auto font-medium">
          Khóa học âm thanh thực chiến – từ cơ bản đến nâng cao.
        </p>
        <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
          Học đúng bản chất – đi làm gặp ca khó vẫn được hỗ trợ trực tiếp.
        </p>
        {authenticated ? (
          <Link href="/courses">
            <Button variant="primary" size="lg">
              Vào học ngay
            </Button>
          </Link>
        ) : (
          <Link href="/auth">
            <Button variant="primary" size="lg">
              Đăng ký học ngay
            </Button>
          </Link>
        )}
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Lợi ích khóa học</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <BookOpen className="h-10 w-10 text-cyan-400 mb-4" />
              <CardTitle>20 bài học chi tiết</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Từ nền tảng sóng âm đến setup – mixing – xử lý hệ thống thực tế.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle2 className="h-10 w-10 text-cyan-400 mb-4" />
              <CardTitle>Học theo tiến độ</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Xem bài + làm quiz đạt yêu cầu để mở bài tiếp theo.
                Học chắc – không học lướt.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-cyan-400 mb-4" />
              <CardTitle>Hỗ trợ tận tình</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Khi đi làm gặp ca khó, học viên được hỗ trợ trực tiếp qua Zalo/điện thoại.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Lộ trình học tập</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-sm font-bold">
                  1-5
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Cơ bản về âm thanh</h3>
                  <p className="text-sm text-gray-400">
                    Tần số, decibel, sóng âm, microphone, preamp
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-sm font-bold">
                  6-10
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Công cụ xử lý</h3>
                  <p className="text-sm text-gray-400">
                    EQ, Compressor, Reverb, Delay, Panning
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-sm font-bold">
                  11-15
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Kỹ thuật mixing</h3>
                  <p className="text-sm text-gray-400">
                    Mix bus, automation, sidechain, saturation, phase
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-sm font-bold">
                  16-20
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Mastering & xuất file</h3>
                  <p className="text-sm text-gray-400">
                    Final mix, mastering, reference tracks, export
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Câu hỏi thường gặp</h2>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger value="item-1">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-cyan-400" />
                  Làm sao để mở bài tiếp theo?
                </div>
              </AccordionTrigger>
              <AccordionContent value="item-1">
                Bạn cần xem bài học và làm quiz đạt ít nhất 80% để mở bài tiếp theo.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger value="item-2">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-cyan-400" />
                  Có thể làm lại quiz không?
                </div>
              </AccordionTrigger>
              <AccordionContent value="item-2">
                Có. Bạn có thể làm lại cho đến khi đạt yêu cầu.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger value="item-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-cyan-400" />
                  Khi đi làm gặp sự cố thì làm sao?
                </div>
              </AccordionTrigger>
              <AccordionContent value="item-3">
                Bạn nhắn Zalo kèm hình ảnh/video + thông tin hệ thống,
                anh Trương Thanh sẽ hỗ trợ trực tiếp cách xử lý.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger value="item-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-cyan-400" />
                  Cần hỗ trợ khác thì làm sao?
                </div>
              </AccordionTrigger>
              <AccordionContent value="item-4">
                Liên hệ Zalo: 0974 70 4444 để được hỗ trợ trong quá trình học tập.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Sẵn sàng bắt đầu?</CardTitle>
            <CardDescription className="text-base">
              Đăng ký ngay để bắt đầu hành trình học âm thanh của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            {authenticated ? (
              <Link href="/courses">
                <Button variant="primary" size="lg" className="w-full">
                  Vào học ngay
                </Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button variant="primary" size="lg" className="w-full">
                  Đăng ký học ngay
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-titan-border py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-gray-400">
          <p>Học Âm Thanh Từ Gốc – Trương Thanh – 0974 70 4444</p>
        </div>
      </footer>

      {/* Install PWA Banner */}
      <InstallPwaBanner />
    </div>
  );
}
