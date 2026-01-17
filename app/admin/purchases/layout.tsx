/**
 * Server-side layout guard for admin purchases page
 * Check admin role from profiles table before rendering
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPurchasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth");
  }

  // Check admin role from profiles table
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== "admin") {
    // Not admin - redirect to courses
    redirect("/courses");
  }

  // Admin confirmed - render children
  return <>{children}</>;
}
