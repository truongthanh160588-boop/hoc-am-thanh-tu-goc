"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Course } from "@/data/course";
import { Save } from "lucide-react";

interface CourseEditorProps {
  course: Course;
  onSave: (course: Course) => void;
}

export function CourseEditor({ course, onSave }: CourseEditorProps) {
  const [editedCourse, setEditedCourse] = useState<Course>(course);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setEditedCourse(course);
    setHasChanges(false);
  }, [course]);

  const handleFieldChange = (field: keyof Course, value: any) => {
    setEditedCourse({ ...editedCourse, [field]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(editedCourse);
    setHasChanges(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin khóa học</CardTitle>
        <CardDescription>Chỉnh sửa thông tin chung của khóa học</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block text-gray-300">
            Tên khóa học *
          </label>
          <Input
            value={editedCourse.title}
            onChange={(e) => handleFieldChange("title", e.target.value)}
            placeholder="Nhập tên khóa học"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block text-gray-300">
            Mô tả *
          </label>
          <textarea
            value={editedCourse.description}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-titan-border bg-titan-card text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 min-h-[80px]"
            placeholder="Nhập mô tả khóa học"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            Lưu khóa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
