import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Skip Supabase if env vars are not set (for development without Supabase)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({
      request,
    });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value,
              ...options,
            });
            supabaseResponse = NextResponse.next({
              request,
            });
            supabaseResponse.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value: "",
              ...options,
            });
            supabaseResponse = NextResponse.next({
              request,
            });
            supabaseResponse.cookies.set({
              name,
              value: "",
              ...options,
            });
          },
        },
      }
    );

    // Refresh session if expired
    await supabase.auth.getUser();
  } catch (error) {
    // If Supabase fails, just continue without it
    console.warn("Supabase middleware error:", error);
  }

  return supabaseResponse;
}
