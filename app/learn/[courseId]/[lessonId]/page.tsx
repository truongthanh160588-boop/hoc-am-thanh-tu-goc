"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sheet } from "@/components/ui/sheet";
import { LessonSidebar } from "@/components/LessonSidebar";
import dynamic from "next/dynamic";

const YouTubeEmbed = dynamic(() => import("@/components/YouTubeEmbed").then(mod => ({ default: mod.YouTubeEmbed })), {
  loading: () => (
    <div className="w-full aspect-video rounded-lg overflow-hidden border border-titan-border bg-black flex items-center justify-center">
      <div className="text-gray-400">Đang tải video...</div>
    </div>
  ),
});

const QuizPanel = dynamic(() => import("@/components/QuizPanel").then(mod => ({ default: mod.QuizPanel })), {
  loading: () => (
    <Card>
      <CardHeader>
        <div className="h-6 w-48 bg-gray-800 rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-gray-800 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-full bg-gray-800 rounded animate-pulse" />
              <div className="h-10 w-full bg-gray-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  ),
});
import { ProgressBar } from "@/components/ProgressBar";
import { Confetti } from "@/components/Confetti";
import { Toast } from "@/components/ui/toast";
import { getCourse } from "@/lib/courseStore";
import { getAuthUser } from "@/lib/auth-supabase";
import { canAccessLesson, getLessonIndex } from "@/lib/guard";
import { isLessonWatched, markLessonWatched, unmarkLessonWatched } from "@/lib/lesson-watched";
import { isCoursePaidZalo } from "@/lib/purchase-zalo";
import { updateWatchTime, canMarkAsWatched, getWatchProgress } from "@/lib/watch-time";
import { getProgress as getProgressSupabase, updateProgress as updateProgressSupabase, updateWatchTime as updateWatchTimeSupabase } from "@/lib/progress-supabase";
import { getProgress, setProgress as setLocalProgress } from "@/lib/progress";
// Removed isActivated check - now handled by server guard in layout.tsx
import { ArrowLeft, Copy, MessageCircle, CheckCircle2, Circle, Clock, Lock } from "lucide-react";

export default function LearnPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;
  const lessonId = params?.lessonId as string;
  const [quizPassed, setQuizPassed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [watchProgress, setWatchProgress] = useState({ seconds: 0, percent: 0, requiredSeconds: 240 });
  
  const courseData = getCourse();
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [watched, setWatched] = useState(false);
  const [isWatched, setIsWatched] = useState(false);

  useEffect(() => {
    // Server guard đã check ở layout.tsx
    // Client chỉ cần load user và progress
    loadUser();
  }, [courseId, lessonId]);

  const loadUser = async () => {
    const authUser = await getAuthUser();
    if (!authUser) {
      router.push("/auth");
      return;
    }
    setUser(authUser);

    const lesson = courseData.lessons.find((l) => l.id === lessonId);
    if (!lesson) {
      router.push(`/courses/${courseId}`);
      return;
    }

    const watchedState = isLessonWatched(lessonId, courseId, authUser.id);
    setWatched(watchedState);
    setIsWatched(watchedState);

    const lessonIndex = getLessonIndex(lessonId);
    
    // Load progress from DB and sync to local
    try {
      const dbProgress = await getProgressSupabase(courseId, authUser.id);
      // Sync to local for guard functions
      setLocalProgress(courseId, authUser.id, dbProgress);
      if (lessonIndex > dbProgress.unlockedLessonIndex) {
        router.push(`/courses/${courseId}`);
        return;
      }
    } catch {
      // Fallback to local
      const localProgress = getProgress(courseId, authUser.id);
      if (lessonIndex > localProgress.unlockedLessonIndex) {
        router.push(`/courses/${courseId}`);
        return;
      }
    }

    // Load watch progress
    const progress = getWatchProgress(lessonId, courseId, authUser.id);
    setWatchProgress(progress);
  };

  // Update watch time when video is playing
  const handleWatchTimeUpdate = async (currentTime: number, duration: number) => {
    if (!user) return;
    
    // Update local với currentTime và duration thực tế
    updateWatchTime(lessonId, courseId, user.id, currentTime, duration);
    
    // Sync to DB (debounced - every 10s)
    if (currentTime >= 10) {
      await updateWatchTimeSupabase(courseId, user.id, lessonId, currentTime);
    }
    
    // Update UI progress
    const progress = getWatchProgress(lessonId, courseId, user.id);
    setWatchProgress(progress);
    
    // Debug log (có thể xóa sau)
    console.log(`[LearnPage] Watch progress: ${Math.floor(progress.seconds)}s / ${Math.floor(progress.requiredSeconds)}s (${Math.floor(progress.percent)}%)`);
    console.log(`[LearnPage] Can mark as watched:`, canMarkAsWatched(lessonId, courseId, user.id));
  };

  if (!user) {
    return null;
  }

  const lesson = courseData.lessons.find((l) => l.id === lessonId);
  if (!lesson) return null;

  const lessonIndex = getLessonIndex(lessonId);
  const nextLesson = courseData.lessons[lessonIndex + 1];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(lessonId);
    alert("Đã copy mã bài học!");
  };

  const handleSupport = () => {
    alert("Liên hệ Zalo: 0974 70 4444 để được hỗ trợ");
  };

  const handleToggleWatched = () => {
    if (!user) return;
    
    // Check if can mark as watched
    if (!isWatched && !canMarkAsWatched(lessonId, courseId, user.id)) {
      const requiredMinutes = Math.ceil(watchProgress.requiredSeconds / 60);
      alert(`Bạn cần xem tối thiểu ${requiredMinutes} phút (85% thời lượng video) để đánh dấu đã xem.`);
      return;
    }
    
    if (isWatched) {
      unmarkLessonWatched(lessonId, courseId, user.id);
      setIsWatched(false);
    } else {
      markLessonWatched(lessonId, courseId, user.id);
      setIsWatched(true);
    }
  };

  const handleQuizPass = () => {
    setQuizPassed(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <>
      {showConfetti && <Confetti />}
      <Toast
        open={showToast}
        onClose={() => setShowToast(false)}
        title="Yêu cầu kích hoạt"
        description="Bạn cần kích hoạt để học"
        variant="error"
      />
      <div className="max-w-7xl mx-auto">
        {/* Progress Bar tổng khóa ở trên */}
        <div className="mb-6">
          <ProgressBar courseId={courseId} />
        </div>

        {/* Mobile Sidebar Button */}
        <div className="lg:hidden mb-4">
          <Button
            variant="outline"
            onClick={() => setSidebarOpen(true)}
            className="w-full"
          >
            Danh sách bài học
          </Button>
        </div>

        {/* Mobile Sidebar Sheet */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <div className="p-4">
            <LessonSidebar courseId={courseId} />
          </div>
        </Sheet>

        <div className="flex gap-6">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <LessonSidebar courseId={courseId} />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="mb-6">
              <Link href={`/courses/${courseId}`}>
                <Button variant="ghost" size="sm" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại khóa học
                </Button>
              </Link>

              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyCode}>
                    <Copy className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Copy mã bài</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSupport}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Hỗ trợ</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Step 1: Video */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <h2 className="text-xl font-semibold">Xem video bài học</h2>
                </div>
                <YouTubeEmbed 
                  youtubeId={lesson.youtubeId} 
                  title={lesson.title}
                  onWatchTimeUpdate={handleWatchTimeUpdate}
                />
                
              </div>

              {/* Step 2: Đánh dấu đã xem */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <h2 className="text-xl font-semibold">Đánh dấu đã xem</h2>
                </div>
                <Card>
                  <CardContent className="pt-6">
                    {!isWatched && (
                      <div className="space-y-4">
                        {!canMarkAsWatched(lessonId, courseId, user?.id || "") && (
                          <div className="p-4 rounded-md bg-gray-900 border border-titan-border">
                            <div className="flex items-start gap-3">
                              <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm text-gray-300 mb-2">
                                  Bạn cần xem tối thiểu {Math.ceil(watchProgress.requiredSeconds / 60)} phút (85% thời lượng) để đánh dấu đã xem
                                </p>
                                <div className="w-full bg-gray-800 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-cyan-600 to-teal-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(watchProgress.percent, 100)}%` }}
                                  />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                  Đã xem: {Math.floor(watchProgress.seconds / 60)}:{String(Math.floor(watchProgress.seconds % 60)).padStart(2, "0")} / {Math.floor(watchProgress.requiredSeconds / 60)}:{String(Math.floor(watchProgress.requiredSeconds % 60)).padStart(2, "0")}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        <button
                          onClick={handleToggleWatched}
                          disabled={!canMarkAsWatched(lessonId, courseId, user?.id || "")}
                          className={`w-full flex items-center justify-center gap-3 p-4 rounded-md border transition-colors ${
                            !canMarkAsWatched(lessonId, courseId, user?.id || "")
                              ? "opacity-50 cursor-not-allowed border-titan-border bg-titan-card/50"
                              : isWatched
                              ? "border-cyan-500 bg-cyan-900/20 text-cyan-400"
                              : "border-titan-border bg-titan-card hover:border-cyan-400 hover:bg-cyan-900/10"
                          }`}
                        >
                          {isWatched ? (
                            <>
                              <CheckCircle2 className="h-5 w-5" />
                              <span className="font-medium">Đã đánh dấu xem</span>
                            </>
                          ) : (
                            <>
                              <Circle className="h-5 w-5" />
                              <span className="font-medium">
                                {canMarkAsWatched(lessonId, courseId, user?.id || "")
                                  ? "Bấm để đánh dấu đã xem"
                                  : "Chưa đủ thời lượng xem"}
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    {isWatched && (
                      <div className="text-center py-4">
                        <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Đã đánh dấu xem video</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Step 3: Làm quiz */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <h2 className="text-xl font-semibold">Làm kiểm tra</h2>
                </div>
                {isWatched ? (
                  <QuizPanel
                    quiz={lesson.quiz}
                    lessonId={lessonId}
                    courseId={courseId}
                    onQuizPass={handleQuizPass}
                  />
                ) : (
                  <Card>
                    <CardContent className="pt-6 text-center py-12">
                      <p className="text-gray-400 mb-2">
                        Vui lòng hoàn thành bước 2 trước
                      </p>
                      <p className="text-sm text-gray-500">
                        Đánh dấu &quot;Đã xem&quot; video để làm kiểm tra
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Next Lesson Button */}
              {quizPassed && nextLesson && (
                <div className="text-center">
                  <Link href={`/learn/${courseId}/${nextLesson.id}`}>
                    <Button variant="primary" size="lg">
                      Bài tiếp theo: {nextLesson.title}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
