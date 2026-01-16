"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Lesson, QuizQuestion } from "@/data/course";
import { Save, Plus, Trash2, RotateCcw, Copy } from "lucide-react";

interface LessonEditorProps {
  lesson: Lesson | null;
  onSave: (lesson: Lesson) => void;
  onReset: () => void;
  onDuplicate?: () => void;
}

export function LessonEditor({ lesson, onSave, onReset, onDuplicate }: LessonEditorProps) {
  const [editedLesson, setEditedLesson] = useState<Lesson | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (lesson) {
      setEditedLesson(JSON.parse(JSON.stringify(lesson))); // Deep clone
      setHasChanges(false);
    }
  }, [lesson]);

  if (!lesson || !editedLesson) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full min-h-[400px]">
          <p className="text-gray-400">Chọn bài học để chỉnh sửa</p>
        </CardContent>
      </Card>
    );
  }

  const handleFieldChange = (field: keyof Lesson, value: any) => {
    if (!editedLesson) return;
    setEditedLesson({ ...editedLesson, [field]: value });
    setHasChanges(true);
  };

  const handleQuizChange = (questionIndex: number, field: keyof QuizQuestion, value: any) => {
    if (!editedLesson) return;
    const newQuiz = [...editedLesson.quiz];
    newQuiz[questionIndex] = { ...newQuiz[questionIndex], [field]: value };
    setEditedLesson({ ...editedLesson, quiz: newQuiz });
    setHasChanges(true);
  };

  const handleAddQuestion = () => {
    if (!editedLesson) return;
    const newQuestion: QuizQuestion = {
      id: `q${editedLesson.quiz.length + 1}`,
      question: "Câu hỏi mới?",
      options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      correctIndex: 0,
    };
    setEditedLesson({ ...editedLesson, quiz: [...editedLesson.quiz, newQuestion] });
    setHasChanges(true);
  };

  const handleRemoveQuestion = (index: number) => {
    if (!editedLesson || editedLesson.quiz.length <= 1) return;
    const newQuiz = editedLesson.quiz.filter((_, i) => i !== index);
    setEditedLesson({ ...editedLesson, quiz: newQuiz });
    setHasChanges(true);
  };

  const handleSave = () => {
    if (editedLesson) {
      onSave(editedLesson);
      setHasChanges(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{editedLesson.title}</CardTitle>
              <CardDescription>ID: {editedLesson.id}</CardDescription>
            </div>
            <div className="flex gap-2">
              {hasChanges && (
                <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                  Chưa lưu
                </Badge>
              )}
              {!hasChanges && (
                <Badge variant="outline" className="text-green-400 border-green-400">
                  Đã lưu
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-300">
                Tiêu đề bài học *
              </label>
              <Input
                value={editedLesson.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                placeholder="Nhập tiêu đề bài học"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-gray-300">
                YouTube Video ID *
              </label>
              <Input
                value={editedLesson.youtubeId}
                onChange={(e) => handleFieldChange("youtubeId", e.target.value)}
                placeholder="dQw4w9WgXcQ"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lấy ID từ link: https://www.youtube.com/watch?v=ABC123xyz → ID: ABC123xyz
              </p>
            </div>
          </div>

          {/* Quiz Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Câu hỏi Quiz ({editedLesson.quiz.length})</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddQuestion}
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm câu hỏi
              </Button>
            </div>

            {editedLesson.quiz.map((question, qIndex) => (
              <Card key={question.id} className="border-titan-border">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">Câu {qIndex + 1}</Badge>
                    {editedLesson.quiz.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveQuestion(qIndex)}
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block text-gray-300">
                      Câu hỏi *
                    </label>
                    <textarea
                      value={question.question}
                      onChange={(e) => handleQuizChange(qIndex, "question", e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-titan-border bg-titan-card text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 min-h-[60px]"
                      placeholder="Nhập câu hỏi..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium block text-gray-300">
                      Đáp án *
                    </label>
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...question.options];
                            newOptions[oIndex] = e.target.value;
                            handleQuizChange(qIndex, "options", newOptions);
                          }}
                          placeholder={`Đáp án ${String.fromCharCode(65 + oIndex)}`}
                          className={question.correctIndex === oIndex ? "border-cyan-500" : ""}
                        />
                        <Button
                          variant={question.correctIndex === oIndex ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleQuizChange(qIndex, "correctIndex", oIndex)}
                          className="flex-shrink-0"
                        >
                          {question.correctIndex === oIndex ? "✓ Đúng" : "Chọn"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-titan-border">
            <Button
              variant="primary"
              onClick={handleSave}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              Lưu bài
            </Button>
            {onDuplicate && (
              <Button
                variant="outline"
                onClick={onDuplicate}
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onReset}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
