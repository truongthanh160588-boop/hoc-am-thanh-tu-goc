"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Monitor } from "lucide-react";

interface PracticeToolPanelProps {
  courseId: string;
  userId: string;
}

export function PracticeToolPanel({ courseId, userId }: PracticeToolPanelProps) {
  const handleOpenTool = () => {
    window.open("https://audio-howl-web.vercel.app", "_blank", "noopener,noreferrer");
  };

  return (
    <Card className="border-cyan-500/30 bg-gradient-to-br from-cyan-900/20 to-teal-900/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-cyan-400">
          Công cụ thực hành
        </CardTitle>
        <CardDescription className="text-xs text-gray-400">
          Mở Audio Howl Web để luyện tai, dò hú rít và xem phổ tần số.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenTool}
          className="w-full"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          MỞ AUDIO HOWL WEB
        </Button>
        <p className="text-xs text-gray-500 text-center">
          Khuyên dùng trên máy tính để thao tác dễ hơn.
        </p>
      </CardContent>
    </Card>
  );
}
