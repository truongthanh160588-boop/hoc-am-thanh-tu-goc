"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Toast } from "@/components/ui/toast";
import { LessonList } from "@/components/admin/LessonList";
import { LessonEditor } from "@/components/admin/LessonEditor";
import { CourseEditor } from "@/components/admin/CourseEditor";
import { isAuthenticated } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { getCourse, setCourse, resetCourse, Course } from "@/lib/courseStore";
import { Lesson } from "@/data/course";
import { Save, Download, Upload, RotateCcw, FileCode, Copy, Check } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [course, setCourseState] = useState<Course>(getCourse());
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(course.lessons[0]?.id || null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [exportCode, setExportCode] = useState("");
  const [toast, setToast] = useState<{ open: boolean; message: string; type: "success" | "error" }>({
    open: false,
    message: "",
    type: "success",
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Guard admin
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth");
      return;
    }
    if (!isAdmin()) {
      router.push("/courses");
      return;
    }
  }, [router]);

  // Keyboard shortcut: Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveAll();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [course]);

  // Warning khi rời trang chưa lưu
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (!isAuthenticated() || !isAdmin()) {
    return null;
  }

  const selectedLesson = course.lessons.find((l) => l.id === selectedLessonId);

  const handleSaveLesson = (lesson: Lesson) => {
    const newLessons = course.lessons.map((l) =>
      l.id === lesson.id ? lesson : l
    );
    const newCourse = { ...course, lessons: newLessons };
    setCourseState(newCourse);
    setCourse(newCourse);
    setHasUnsavedChanges(false);
    showToast("Đã lưu bài học", "success");
  };

  const handleSaveCourse = (updatedCourse: Course) => {
    setCourseState(updatedCourse);
    setCourse(updatedCourse);
    setHasUnsavedChanges(false);
    showToast("Đã lưu thông tin khóa học", "success");
  };

  const handleSaveAll = () => {
    setCourse(course);
    setHasUnsavedChanges(false);
    showToast("Đã lưu tất cả", "success");
  };

  const handleReset = () => {
    if (confirm("Bạn có chắc muốn reset về dữ liệu mặc định? Tất cả thay đổi sẽ mất.")) {
      resetCourse();
      const defaultCourse = getCourse();
      setCourseState(defaultCourse);
      setSelectedLessonId(defaultCourse.lessons[0]?.id || null);
      setHasUnsavedChanges(false);
      showToast("Đã reset về mặc định", "success");
    }
  };

  const handleDuplicateLesson = () => {
    if (!selectedLesson) return;

    const newLesson: Lesson = {
      ...selectedLesson,
      id: `lesson${String(course.lessons.length + 1).padStart(2, "0")}`,
      title: `${selectedLesson.title} (Copy)`,
      quiz: selectedLesson.quiz.map((q) => ({
        ...q,
        id: `q${Date.now()}_${Math.random()}`,
      })),
    };

    const newLessons = [...course.lessons, newLesson];
    const newCourse = { ...course, lessons: newLessons };
    setCourseState(newCourse);
    setSelectedLessonId(newLesson.id);
    setHasUnsavedChanges(true);
    showToast("Đã duplicate bài học", "success");
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(course, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "course.json";
    link.click();
    URL.revokeObjectURL(url);
    showToast("Đã tải xuống course.json", "success");
  };

  const handleExportTS = () => {
    const code = `export const courseData: Course = ${JSON.stringify(course, null, 2)} as const;`;
    setExportCode(code);
    setShowExportDialog(true);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(exportCode);
    showToast("Đã copy code", "success");
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported && imported.id && imported.lessons) {
          setCourseState(imported);
          setCourse(imported);
          setSelectedLessonId(imported.lessons[0]?.id || null);
          setHasUnsavedChanges(false);
          showToast("Đã import thành công", "success");
          setShowImportDialog(false);
        } else {
          showToast("File không hợp lệ", "error");
        }
      } catch (error) {
        showToast("Lỗi đọc file", "error");
      }
    };
    reader.readAsText(file);
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ open: true, message, type });
    setTimeout(() => setToast({ open: false, message: "", type: "success" }), 3000);
  };

  return (
    <>
      <div className="min-h-screen bg-titan-bg">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 border-b border-titan-border bg-titan-card/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">Quản trị khóa học</h1>
                <p className="text-xs text-gray-400">
                  {hasUnsavedChanges ? "Có thay đổi chưa lưu" : "Đã lưu"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveAll}
                  disabled={!hasUnsavedChanges}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Lưu tất cả
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportJSON}>
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportTS}>
                  <FileCode className="h-4 w-4 mr-2" />
                  Export TS
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImportDialog(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          {/* Course Editor */}
          <div className="mb-6">
            <CourseEditor course={course} onSave={handleSaveCourse} />
          </div>

          {/* Main Layout */}
          <div className="grid lg:grid-cols-[300px_1fr] gap-6 h-[calc(100vh-300px)]">
            {/* Left Panel - Lesson List */}
            <div className="hidden lg:block">
              <Card className="h-full">
                <LessonList
                  lessons={course.lessons}
                  selectedLessonId={selectedLessonId}
                  onSelectLesson={setSelectedLessonId}
                />
              </Card>
            </div>

            {/* Right Panel - Lesson Editor */}
            <div className="h-full">
              <LessonEditor
                lesson={selectedLesson || null}
                onSave={handleSaveLesson}
                onReset={handleReset}
                onDuplicate={handleDuplicateLesson}
              />
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="lg:hidden mt-6">
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {course.lessons.map((lesson, index) => (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedLessonId(lesson.id)}
                  className={`px-4 py-2 rounded-md text-sm whitespace-nowrap ${
                    selectedLessonId === lesson.id
                      ? "bg-cyan-900/20 text-cyan-400 border border-cyan-400"
                      : "bg-titan-card text-gray-400 border border-titan-border"
                  }`}
                >
                  Bài {index + 1}
                </button>
              ))}
            </div>
            <LessonEditor
              lesson={selectedLesson || null}
              onSave={handleSaveLesson}
              onReset={handleReset}
              onDuplicate={handleDuplicateLesson}
            />
          </div>
        </div>
      </div>

      {/* Export TS Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent onClose={() => setShowExportDialog(false)} className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Export TypeScript Code</DialogTitle>
            <DialogDescription>
              Copy code này vào file data/course.ts
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <pre className="bg-gray-900 p-4 rounded-md overflow-auto max-h-[60vh] text-sm">
              <code>{exportCode}</code>
            </pre>
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleCopyCode}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent onClose={() => setShowImportDialog(false)}>
          <DialogHeader>
            <DialogTitle>Import JSON</DialogTitle>
            <DialogDescription>
              Chọn file course.json để import
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="w-full px-3 py-2 rounded-md border border-titan-border bg-titan-card text-sm text-gray-200"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast */}
      <Toast
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        title={toast.type === "success" ? "Thành công" : "Lỗi"}
        description={toast.message}
        variant={toast.type === "success" ? "success" : "error"}
      />
    </>
  );
}
