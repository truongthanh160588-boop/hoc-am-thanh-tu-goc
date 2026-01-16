"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle, RotateCcw, Lightbulb } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { QuizQuestion } from "@/data/course";
import { recordQuizAttempt, completeLesson, unlockNextLesson, getProgress } from "@/lib/progress";
import { recordQuizAttempt as recordQuizAttemptSupabase, updateProgress as updateProgressSupabase } from "@/lib/progress-supabase";
import { getAuthUser } from "@/lib/auth-supabase";
import { getLessonIndex } from "@/lib/guard";

interface QuizPanelProps {
  quiz: QuizQuestion[];
  lessonId: string;
  courseId: string;
  onQuizPass: () => void;
}

export function QuizPanel({ quiz, lessonId, courseId, onQuizPass }: QuizPanelProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [wrongAnswers, setWrongAnswers] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const authUser = await getAuthUser();
    setUser(authUser);
    setLoading(false);
  };

  const handleAnswerChange = (questionId: string, optionIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== quiz.length) {
      alert("Vui lòng trả lời tất cả các câu hỏi!");
      return;
    }

    let correctCount = 0;
    quiz.forEach((q) => {
      if (answers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const score = (correctCount / quiz.length) * 100;
    const passed = score >= 80;

    // Track wrong answers for explanation
    const wrong = new Set<string>();
    quiz.forEach((q) => {
      if (answers[q.id] !== q.correctIndex) {
        wrong.add(q.id);
      }
    });
    setWrongAnswers(wrong);

    setResult({ score, passed });
    setSubmitted(true);

    if (user) {
      // Record locally
      recordQuizAttempt(courseId, user.id, lessonId, score, passed);
      // Record in DB
      await recordQuizAttemptSupabase(courseId, user.id, lessonId, score, passed);

      if (passed) {
        completeLesson(courseId, user.id, lessonId);
        const lessonIndex = getLessonIndex(lessonId);
        unlockNextLesson(courseId, user.id, lessonIndex);
        
        // Sync progress to DB
        const progress = getProgress(courseId, user.id);
        await updateProgressSupabase(courseId, user.id, progress);
        
        onQuizPass();
      }
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setResult(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kiểm tra kiến thức</CardTitle>
        <CardDescription>
          Trả lời đúng ít nhất 80% (4/5 câu) để mở bài tiếp theo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {quiz.map((question) => (
          <div key={question.id} className="space-y-3">
            <p className="font-medium text-gray-200">{question.question}</p>
            <div className="space-y-2">
              {question.options.map((option, index) => {
                const isSelected = answers[question.id] === index;
                const isCorrect = index === question.correctIndex;
                const isWrong = submitted && isSelected && !isCorrect;

                return (
                  <label
                    key={index}
                    className={`
                      flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors
                      ${isSelected && !submitted ? "border-cyan-400 bg-cyan-900/20" : "border-titan-border hover:bg-gray-800"}
                      ${submitted && isCorrect ? "border-green-500 bg-green-900/20" : ""}
                      ${isWrong ? "border-red-500 bg-red-900/20" : ""}
                      ${submitted ? "cursor-default" : ""}
                    `}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={index}
                      checked={isSelected}
                      onChange={() => handleAnswerChange(question.id, index)}
                      disabled={submitted}
                      className="sr-only"
                    />
                    <span className="flex-1 text-sm">{option}</span>
                    {submitted && isCorrect && (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    )}
                    {isWrong && <XCircle className="h-4 w-4 text-red-400" />}
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        {result && (
          <Alert variant={result.passed ? "success" : "error"}>
            <AlertTitle>
              {result.passed ? "Chúc mừng!" : "Chưa đạt yêu cầu"}
            </AlertTitle>
            <AlertDescription>
              Bạn đã trả lời đúng {Math.round((result.score / 100) * quiz.length)}/{quiz.length} câu ({Math.round(result.score)}%).
              {result.passed
                ? " Bài tiếp theo đã được mở!"
                : " Vui lòng làm lại để tiếp tục."}
            </AlertDescription>
            {!result.passed && wrongAnswers.size > 0 && (
              <div className="mt-3 p-3 rounded-md bg-gray-900 border border-gray-700">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-yellow-400 mb-1">Gợi ý:</p>
                    <p className="text-gray-300">
                      Hãy xem lại video và thử làm lại. Bạn cần trả lời đúng ít nhất 4/5 câu.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Alert>
        )}

        <div className="flex gap-3">
          {!submitted ? (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== quiz.length}
              className="flex-1"
            >
              Nộp bài
            </Button>
          ) : !result?.passed ? (
            <Button variant="outline" onClick={handleRetry} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Làm lại
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
