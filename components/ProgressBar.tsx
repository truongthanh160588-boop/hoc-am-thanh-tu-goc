import { Progress } from "@/components/ui/progress";
import { getCourse } from "@/lib/courseStore";
import { getProgress } from "@/lib/progress";
import { getProgress as getProgressSupabase } from "@/lib/progress-supabase";
import { getAuthUser } from "@/lib/auth-supabase";
import { useEffect, useState } from "react";

interface ProgressBarProps {
  courseId: string;
}

export function ProgressBar({ courseId }: ProgressBarProps) {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [progress, setProgress] = useState({
    completedLessons: [] as string[],
  });

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

  if (!user) return null;

  const courseData = getCourse();
  const totalLessons = courseData.lessons.length;
  const completedCount = progress.completedLessons.length;
  const progressPercent = (completedCount / totalLessons) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Tiến độ khóa học</span>
        <span className="text-cyan-400 font-medium">
          {completedCount}/{totalLessons} bài ({Math.round(progressPercent)}%)
        </span>
      </div>
      <Progress value={progressPercent} />
    </div>
  );
}
