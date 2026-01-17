"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { VideoCallBooking } from "@/components/VideoCallBooking";
import { CheckCircle2, Video } from "lucide-react";

interface LessonSelfAssessmentProps {
  lessonId: string;
  courseId: string;
  userId: string;
  watchPercent: number;
  watchSeconds: number;
  requiredSeconds: number;
  isWatched: boolean;
  onMarkWatched: () => void;
  onContinue: () => void;
}

export function LessonSelfAssessment({
  lessonId,
  courseId,
  userId,
  watchPercent,
  watchSeconds,
  requiredSeconds,
  isWatched,
  onMarkWatched,
  onContinue,
}: LessonSelfAssessmentProps) {
  const [understandPercent, setUnderstandPercent] = useState<number>(0);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [assessmentSubmitted, setAssessmentSubmitted] = useState(false);

  // Load saved assessment from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `lesson_assessment_${courseId}_${userId}_${lessonId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setUnderstandPercent(data.understandPercent || 0);
        setAssessmentSubmitted(data.submitted || false);
        if (data.understandPercent < 70 && data.submitted) {
          setShowVideoCall(true);
        }
      } catch (error) {
        // Ignore
      }
    }
  }, [lessonId, courseId, userId]);

  const canMarkWatched = watchPercent >= 85;
  const requiredMinutes = Math.ceil(requiredSeconds / 60);
  const watchedMinutes = Math.floor(watchSeconds / 60);
  const watchedSeconds = Math.floor(watchSeconds % 60);

  const handleSubmitAssessment = () => {
    if (understandPercent === 0) {
      alert("Vui lòng chọn mức độ hiểu của bạn");
      return;
    }

    // Lưu assessment
    if (typeof window !== "undefined") {
      const key = `lesson_assessment_${courseId}_${userId}_${lessonId}`;
      localStorage.setItem(
        key,
        JSON.stringify({
          understandPercent,
          submitted: true,
          timestamp: Date.now(),
        })
      );
    }

    setAssessmentSubmitted(true);

    // Nếu hiểu < 70% → hiện video call booking
    if (understandPercent < 70) {
      setShowVideoCall(true);
    } else {
      // Hiểu ≥ 70% → cho tiếp tục ngay
      onContinue();
    }
  };

  const handleVideoCallComplete = () => {
    // Sau khi đăng ký video call → vẫn cho tiếp tục
    onContinue();
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
            Bạn đánh giá mức độ hiểu của mình là {understandPercent}%.
            Hãy đăng ký gọi video với Trương Thanh để được hỗ trợ trực tiếp.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VideoCallBooking
            clusterNumber={(() => {
              // Extract lesson number from lessonId (e.g., "lesson01" -> 1)
              const match = lessonId.match(/lesson(\d+)/);
              if (match) {
                const lessonNum = parseInt(match[1], 10);
                // Bài 1-5 = cụm 1, Bài 6-10 = cụm 2, ...
                return Math.ceil(lessonNum / 5);
              }
              return 1; // Fallback
            })()}
            courseId={courseId}
            onBookingComplete={handleVideoCallComplete}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-cyan-500/30">
      <CardHeader>
        <CardTitle>Tự đánh giá nhanh</CardTitle>
        <CardDescription>
          Xác nhận bạn đã xem đủ và tự đánh giá mức độ hiểu
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Watch Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">
              Anh/chị đã xem: <strong className="text-cyan-400">{Math.floor(watchPercent)}%</strong>
            </span>
            <span className="text-gray-500">
              (cần ≥ 85% để xác nhận đã xem)
            </span>
          </div>
          <Progress value={watchPercent} className="h-2" />
          <p className="text-xs text-gray-500 text-center">
            Đã xem: {watchedMinutes}:{String(watchedSeconds).padStart(2, "0")} / {requiredMinutes}:00
          </p>
        </div>

        {/* Mark as Watched Button */}
        {!isWatched && (
          <div className="space-y-2">
            <Button
              variant="primary"
              onClick={onMarkWatched}
              disabled={!canMarkWatched}
              className="w-full"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Đánh dấu đã xem
            </Button>
            {!canMarkWatched && (
              <p className="text-xs text-gray-500 text-center">
                Vui lòng xem đủ {requiredMinutes} phút để đánh dấu đã xem
              </p>
            )}
          </div>
        )}

        {/* Self Assessment - Chỉ hiện sau khi đã đánh dấu xem */}
        {isWatched && !assessmentSubmitted && (
          <div className="space-y-4 pt-4 border-t border-titan-border">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-3 block">
                Mức độ hiểu của anh/chị khoảng bao nhiêu %?
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[0, 50, 70, 85, 100].map((percent) => (
                  <button
                    key={percent}
                    onClick={() => setUnderstandPercent(percent)}
                    className={`px-3 py-2 rounded-md border text-sm transition-colors ${
                      understandPercent === percent
                        ? "border-cyan-400 bg-cyan-900/20 text-cyan-400"
                        : "border-titan-border hover:border-cyan-500/50 text-gray-300"
                    }`}
                  >
                    {percent}%
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              onClick={handleSubmitAssessment}
              disabled={understandPercent === 0}
              className="w-full"
            >
              Xác nhận đánh giá
            </Button>
          </div>
        )}

        {/* After Assessment Submitted */}
        {isWatched && assessmentSubmitted && understandPercent >= 70 && (
          <div className="text-center space-y-4 pt-4 border-t border-titan-border">
            <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto" />
            <div>
              <p className="text-lg font-semibold text-green-400 mb-2">
                Bạn đã tự đánh giá hiểu {understandPercent}%
              </p>
              <p className="text-sm text-gray-400">
                Bạn có thể tiếp tục bài tiếp theo
              </p>
            </div>
            <Button variant="primary" onClick={onContinue} className="w-full" size="lg">
              Tiếp tục bài tiếp theo
            </Button>
          </div>
        )}

        {/* Note */}
        {isWatched && !assessmentSubmitted && (
          <div className="p-3 rounded-md bg-gray-900/50 border border-cyan-500/20">
            <p className="text-xs text-gray-400 text-center">
              💡 <strong>Lưu ý:</strong> Nếu hiểu dưới 70%, bạn sẽ được hỗ trợ trực tiếp qua video call 1-1
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
