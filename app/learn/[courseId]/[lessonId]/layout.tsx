/**
 * Server-side layout guard for learn pages
 * Check access before rendering client component
 */

import { redirect } from "next/navigation";
import { checkLearnAccess } from "@/lib/learn-guard";

interface LearnLayoutProps {
  params: Promise<{ courseId: string; lessonId: string }>;
  children: React.ReactNode;
}

export default async function LearnLayout({ params, children }: LearnLayoutProps) {
  const { courseId, lessonId } = await params;
  const result = await checkLearnAccess(courseId, lessonId);

  if (!result.allowed && result.redirect) {
    redirect(result.redirect);
  }

  return <>{children}</>;
}
