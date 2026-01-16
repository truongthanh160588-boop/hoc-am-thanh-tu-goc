"use client";

import { createClient } from "@/lib/supabase/client";
import { getProgress as getLocalProgress, setProgress as setLocalProgress } from "./progress";
import type { LessonProgress } from "./progress";

export async function getProgress(
  courseId: string,
  userId: string
): Promise<LessonProgress> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("progress")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = not found, which is OK
      console.error("Error fetching progress:", error);
      // Fallback to localStorage
      return getLocalProgress(courseId, userId);
    }

    if (data) {
      return {
        unlockedLessonIndex: data.unlocked_index || 0,
        completedLessons: data.completed_lessons || [],
        quizAttempts: {},
        quizResults: {},
      };
    }

    // Not found in DB, check localStorage
    const localProgress = getLocalProgress(courseId, userId);
    if (localProgress.completedLessons.length > 0 || localProgress.unlockedLessonIndex > 0) {
      // Sync local to DB
      await syncProgressToDB(courseId, userId, localProgress);
      return localProgress;
    }

    // Return default
    return {
      unlockedLessonIndex: 0,
      completedLessons: [],
      quizAttempts: {},
      quizResults: {},
    };
  } catch (error) {
    console.error("Error in getProgress:", error);
    return getLocalProgress(courseId, userId);
  }
}

export async function syncProgressToDB(
  courseId: string,
  userId: string,
  progress: LessonProgress
): Promise<void> {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from("progress")
      .upsert({
        user_id: userId,
        course_id: courseId,
        unlocked_index: progress.unlockedLessonIndex,
        completed_lessons: progress.completedLessons,
        watch_seconds: {},
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Error syncing progress:", error);
    }
  } catch (error) {
    console.error("Error in syncProgressToDB:", error);
  }
}

export async function updateProgress(
  courseId: string,
  userId: string,
  progress: LessonProgress
): Promise<void> {
  // Update local first
  setLocalProgress(courseId, userId, progress);

  // Then sync to DB
  await syncProgressToDB(courseId, userId, progress);
}

export async function updateWatchTime(
  courseId: string,
  userId: string,
  lessonId: string,
  seconds: number
): Promise<void> {
  const supabase = createClient();

  try {
    // Get current progress
    const { data } = await supabase
      .from("progress")
      .select("watch_seconds")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single();

    const watchSeconds = (data?.watch_seconds as Record<string, number>) || {};
    watchSeconds[lessonId] = (watchSeconds[lessonId] || 0) + seconds;

    await supabase
      .from("progress")
      .upsert({
        user_id: userId,
        course_id: courseId,
        watch_seconds: watchSeconds,
        updated_at: new Date().toISOString(),
      });
  } catch (error) {
    console.error("Error updating watch time:", error);
  }
}

export async function recordQuizAttempt(
  courseId: string,
  userId: string,
  lessonId: string,
  score: number,
  passed: boolean
): Promise<void> {
  const supabase = createClient();

  try {
    await supabase.from("quiz_attempts").insert({
      user_id: userId,
      course_id: courseId,
      lesson_id: lessonId,
      score,
      passed,
    });
  } catch (error) {
    console.error("Error recording quiz attempt:", error);
  }
}
