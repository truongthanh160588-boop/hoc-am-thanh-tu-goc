"use client";

import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
}

export async function signInWithOTP(email: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { error };
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signUpWithPassword(email: string, password: string, fullName?: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  return { data, error };
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email || "",
    fullName: profile?.full_name || undefined,
    phone: profile?.phone || undefined,
  };
}
