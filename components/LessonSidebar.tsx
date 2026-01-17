"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCourse } from "@/lib/courseStore";
import { getProgress } from "@/lib/progress";
import { getProgress as getProgressSupabase } from "@/lib/progress-supabase";
import { getAuthUser } from "@/lib/auth-supabase";
import { canAccessLesson, isLessonCompleted } from "@/lib/guard";
import { isLessonNumberCompleted } from "@/lib/cluster-progress";
import { PracticeToolPanel } from "@/components/PracticeToolPanel";
import { useEffect, useState } from "react";

interface LessonSidebarProps {
  courseId: string;
}

export function LessonSidebar({ courseId }: LessonSidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [progress, setProgress] = useState<{
    unlockedLessonIndex: number;
    completedLessons: string[];
  } | null>(null);
  const courseData = getCourse();

  useEffect(() => {
    loadUserAndProgress();
  }, [courseId]);

  const loadUserAndProgress = async () => {
    const authUser = await getAuthUser();
    if (authUser) {
      setUser(authUser);
      try {
        const dbProgress = await getProgressSupabase(courseId, authUser.id);
        setProgress(dbProgress);
      } catch {
        // Fallback to local
        const localProgress = getProgress(courseId, authUser.id);
        setProgress(localProgress);
      }
    }
  };

  if (!progress || !user) return null;

  // Check if Lesson 3 is completed (watch >= 85% AND marked as completed)
  const hasCompletedLesson3 = isLessonNumberCompleted(
    courseId,
    user.id,
    3, // Lesson 3
    progress.completedLessons
  );

  return (
    <div className="space-y-4">
      {/* Practice Tool Panel - Show after Lesson 3 is completed */}
      {hasCompletedLesson3 && (
        <PracticeToolPanel courseId={courseId} userId={user.id} />
      )}

      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-400 mb-4 px-2">
          Danh sách bài học
        </h3>
      {courseData.lessons.map((lesson, index) => {
        const accessible = index <= progress.unlockedLessonIndex;
        const completed = progress.completedLessons.includes(lesson.id);
        const isActive = pathname?.includes(`/${lesson.id}`);

        return (
          <Link
            key={lesson.id}
            href={accessible ? `/learn/${courseId}/${lesson.id}` : "#"}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
              isActive
                ? "bg-cyan-900/20 border-l-2 border-cyan-400 text-cyan-400"
                : accessible
                ? "hover:bg-gray-800 text-gray-200"
                : "text-gray-600 cursor-not-allowed"
            )}
          >
            {!accessible ? (
              <Lock className="h-4 w-4 flex-shrink-0" />
            ) : completed ? (
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-cyan-400" />
            ) : (
              <Circle className="h-4 w-4 flex-shrink-0" />
            )}
            <span className="flex-1 text-sm truncate">{lesson.title}</span>
            {isActive && (
              <ArrowRight className="h-4 w-4 flex-shrink-0 text-cyan-400" />
            )}
          </Link>
        );
      })}
      </div>
    </div>
  );
}
