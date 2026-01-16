"use client";

import { useState } from "react";
import { Search, Lock, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Lesson } from "@/data/course";

interface LessonListProps {
  lessons: Lesson[];
  selectedLessonId: string | null;
  onSelectLesson: (lessonId: string) => void;
}

export function LessonList({ lessons, selectedLessonId, onSelectLesson }: LessonListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLessons = lessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLessonStatus = (lesson: Lesson) => {
    if (!lesson.youtubeId || lesson.youtubeId === "dQw4w9WgXcQ") {
      return "error"; // Thiếu youtubeId
    }
    if (!lesson.quiz || lesson.quiz.length === 0) {
      return "warning"; // Thiếu quiz
    }
    return "success"; // OK
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "error":
        return <AlertCircle className="h-3 w-3 text-red-400" />;
      case "warning":
        return <AlertCircle className="h-3 w-3 text-yellow-400" />;
      case "success":
        return <CheckCircle2 className="h-3 w-3 text-green-400" />;
      default:
        return <Circle className="h-3 w-3 text-gray-400" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-titan-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm bài học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-titan-border bg-titan-card text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {filteredLessons.map((lesson, index) => {
            const status = getLessonStatus(lesson);
            const isSelected = selectedLessonId === lesson.id;

            return (
              <button
                key={lesson.id}
                onClick={() => onSelectLesson(lesson.id)}
                className={cn(
                  "w-full text-left p-3 rounded-md transition-colors flex items-center gap-3",
                  isSelected
                    ? "bg-cyan-900/20 border-l-2 border-cyan-400 text-cyan-400"
                    : "hover:bg-gray-800 text-gray-200 border-l-2 border-transparent"
                )}
              >
                <div className="flex-shrink-0">
                  {getStatusIcon(status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    Bài {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {lesson.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
