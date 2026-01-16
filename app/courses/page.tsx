"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CourseCard } from "@/components/CourseCard";
import { InstallPwaBanner } from "@/components/InstallPwaBanner";
import { getAuthUser } from "@/lib/auth-supabase";
import { getCourse } from "@/lib/courseStore";

export default function CoursesPage() {
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [router]);

  const checkAuth = async () => {
    const user = await getAuthUser();
    if (!user) {
      router.push("/auth");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Khóa học của tôi</h1>
        <p className="text-gray-400">Chọn khóa học để bắt đầu học tập</p>
      </div>
      <CourseCard />
      <InstallPwaBanner />
    </div>
  );
}
