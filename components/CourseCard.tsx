import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getProgress } from "@/lib/progress";
import { getProgress as getProgressSupabase } from "@/lib/progress-supabase";
import { getAuthUser } from "@/lib/auth-supabase";
import { getCourse } from "@/lib/courseStore";
import { useEffect, useState } from "react";

export function CourseCard() {
  const courseData = getCourse();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [progress, setProgress] = useState({
    unlockedLessonIndex: 0,
    completedLessons: [] as string[],
  });

  useEffect(() => {
    loadUserAndProgress();
  }, []);

  const loadUserAndProgress = async () => {
    const authUser = await getAuthUser();
    if (authUser) {
      setUser(authUser);
      try {
        const dbProgress = await getProgressSupabase(courseData.id, authUser.id);
        setProgress(dbProgress);
      } catch {
        // Fallback to local
        const localProgress = getProgress(courseData.id, authUser.id);
        setProgress(localProgress);
      }
    }
  };

  const totalLessons = courseData.lessons.length;
  const completedCount = progress.completedLessons.length;
  const progressPercent = (completedCount / totalLessons) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{courseData.title}</CardTitle>
        <CardDescription>{courseData.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Tiến độ</span>
            <span className="text-cyan-400">
              {completedCount}/{totalLessons} bài
            </span>
          </div>
          <Progress value={progressPercent} />
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/courses/${courseData.id}`} className="w-full">
          <Button variant="primary" className="w-full">
            Xem chi tiết
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
