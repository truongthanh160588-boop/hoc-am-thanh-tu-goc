"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Video, MessageCircle } from "lucide-react";
import { VideoCallBooking } from "./VideoCallBooking";

interface SelfAssessmentPanelProps {
  clusterNumber: number; // Số cụm bài (1, 2, 3, 4)
  clusterLessons: string[]; // Danh sách lesson IDs trong cụm
  courseId: string;
  onPass: () => void; // Callback khi đánh giá ≥ 70%
}

export function SelfAssessmentPanel({
  clusterNumber,
  clusterLessons,
  courseId,
  onPass,
}: SelfAssessmentPanelProps) {
  const [answers, setAnswers] = useState({
    watchPercent: 0, // % nội dung đã xem
    understandPercent: 0, // % tự tin hiểu được
    unclearPart: "", // Phần nào còn mơ hồ
  });
  const [submitted, setSubmitted] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    
    // Nếu hiểu ≥ 70% → cho phép qua bài tiếp theo
    if (answers.understandPercent >= 70) {
      onPass();
    } else {
      // Hiểu < 70% → hiện nút đăng ký gọi video
      setShowVideoCall(true);
    }
  };

  if (showVideoCall) {
    return (
      <Card className="border-cyan-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-cyan-400" />
            Hỗ trợ trực tiếp 1-1
          </CardTitle>
          <CardDescription>
            Bạn đánh giá mức độ hiểu của mình là {answers.understandPercent}%.
            Hãy đăng ký gọi video với Trương Thanh để được hỗ trợ trực tiếp.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VideoCallBooking
            clusterNumber={clusterNumber}
            courseId={courseId}
            onBookingComplete={() => {
              // Sau khi đăng ký, vẫn cho qua (vì đã có hỗ trợ)
              onPass();
            }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-cyan-500/30">
      <CardHeader>
        <CardTitle>Tự đánh giá cụm bài {clusterNumber}</CardTitle>
        <CardDescription>
          Hãy tự đánh giá mức độ hiểu của bạn sau khi xem các bài học trong cụm này.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Câu 1: % nội dung đã xem */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300">
            1. Bạn đã xem bao nhiêu % nội dung trong cụm bài này?
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={answers.watchPercent}
              onChange={(e) =>
                setAnswers({ ...answers, watchPercent: parseInt(e.target.value) })
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>0%</span>
              <span className="text-cyan-400 font-semibold">{answers.watchPercent}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Câu 2: % tự tin hiểu được */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300">
            2. Bạn tự tin hiểu được bao nhiêu %?
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={answers.understandPercent}
              onChange={(e) =>
                setAnswers({
                  ...answers,
                  understandPercent: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>0%</span>
              <span className="text-cyan-400 font-semibold">{answers.understandPercent}%</span>
              <span>100%</span>
            </div>
            {answers.understandPercent < 70 && (
              <p className="text-xs text-yellow-400">
                ⚠️ Nếu dưới 70%, bạn sẽ được hỗ trợ trực tiếp qua video call
              </p>
            )}
          </div>
        </div>

        {/* Câu 3: Phần nào còn mơ hồ */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300">
            3. Phần nào bạn còn mơ hồ nhất? (tùy chọn)
          </label>
          <textarea
            value={answers.unclearPart}
            onChange={(e) =>
              setAnswers({ ...answers, unclearPart: e.target.value })
            }
            placeholder="Ví dụ: Cách đo phase, cách setup vang số..."
            className="w-full px-3 py-2 bg-gray-900 border border-titan-border rounded-md text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            rows={3}
          />
        </div>

        {submitted && answers.understandPercent >= 70 && (
          <Alert variant="success">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Bạn đã tự đánh giá mức độ hiểu là {answers.understandPercent}%.
              Cụm bài tiếp theo đã được mở!
            </AlertDescription>
          </Alert>
        )}

        {!submitted && (
          <Button
            variant="primary"
            onClick={handleSubmit}
            className="w-full"
            disabled={answers.watchPercent === 0 || answers.understandPercent === 0}
          >
            Xác nhận đánh giá
          </Button>
        )}

        {/* Triết lý khóa học */}
        <div className="mt-6 p-4 rounded-md bg-gray-900/50 border border-cyan-500/20">
          <p className="text-xs text-gray-400 italic text-center">
            💡 <strong>Triết lý khóa học:</strong> Không dạy để nhớ – dạy để hiểu – hiểu để làm được.
            <br />
            Không hiểu thì hỏi trực tiếp – không ai bỏ rơi ai.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
