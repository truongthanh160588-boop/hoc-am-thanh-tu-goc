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
                  <h3 className="font-semibold mb-2">Cơ bản về thiết bị và lý thuyết</h3>
                  <p className="text-sm text-gray-400">
                    Main công suất, coil loa, tần số, đấu nối thiết bị, EQ
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
                  <h3 className="font-semibold mb-2">Phần mềm đo và xử lý</h3>
                  <p className="text-sm text-gray-400">
                    Tập nghe, Smaart đo âm thanh, vang số PC, soundcard, Smaart V8
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
                  <h3 className="font-semibold mb-2">Thực hành đo phase và crossover</h3>
                  <p className="text-sm text-gray-400">
                    Smaart V9, vang số X5 đo phase, setup lấy phase, crossover số, phase full và sub
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
                  <h3 className="font-semibold mb-2">Hướng dẫn sử dụng Mixer và Crossover</h3>
                  <p className="text-sm text-gray-400">
                    Mixer M32R, Mixer cơ + Vang số, Mixer số SQ5, Mixer số LS9, Crossover CD48
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
                Khi bạn xem đủ tối thiểu 85% thời lượng video của các bài trong cùng một cụm,
                hệ thống sẽ cho bạn tự đánh giá mức độ hiểu.
                Nếu bạn thấy đã hiểu, bài học tiếp theo sẽ được mở.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger value="item-2">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-cyan-400" />
                  Không hiểu bài thì có bị dừng lại không?
                </div>
              </AccordionTrigger>
              <AccordionContent value="item-2">
                Không.
                Nếu bạn tự đánh giá chưa hiểu rõ, hệ thống sẽ cho đăng ký gọi video Zalo 1–1
                với Trương Thanh để được hỗ trợ trực tiếp, sau đó vẫn tiếp tục học bình thường.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger value="item-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-cyan-400" />
                  Nếu đi làm thực tế gặp sự cố thì xử lý thế nào?
                </div>
              </AccordionTrigger>
              <AccordionContent value="item-3">
                Bạn có thể liên hệ hỗ trợ trực tiếp để được hướng dẫn theo đúng tình huống thực tế.
                Khóa học không chỉ xem video mà còn đồng hành khi mang kiến thức ra làm thật.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger value="item-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-cyan-400" />
                  Cần hỗ trợ thêm ngoài nội dung bài học thì làm sao?
                </div>
              </AccordionTrigger>
              <AccordionContent value="item-4">
                Bạn có thể đăng ký gọi video 1–1 hoặc liên hệ qua Zalo
                để được Trương Thanh hỗ trợ trực tiếp theo hệ thống đang sử dụng.
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
