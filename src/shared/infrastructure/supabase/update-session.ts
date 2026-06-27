import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  DEV_BYPASS_COOKIE,
  hasDevBypassCookieValue,
} from "@/shared/infrastructure/auth/dev-bypass";
import { resolveSignIn } from "@/shared/infrastructure/auth/resolve-sign-in";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

function copySupabaseCookies(
  source: NextResponse,
  target: NextResponse,
): void {
  source.cookies.getAll().forEach(({ name, value }) => {
    target.cookies.set(name, value);
  });
}

export async function updateSession(request: NextRequest) {
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  const bypassCookie = request.cookies.get(DEV_BYPASS_COOKIE)?.value;

  if (isDashboard && hasDevBypassCookieValue(bypassCookie)) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([key, value]) => {
          supabaseResponse.headers.set(key, value);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isDashboard) {
    const allowed =
      !!user &&
      resolveSignIn({ email: user.email }, process.env.ALLOWED_EMAILS);

    if (!allowed) {
      if (user) {
        await supabase.auth.signOut();
      }

      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set(
        "error",
        user ? "unauthorized" : "session_required",
      );

      const redirectResponse = NextResponse.redirect(url);
      copySupabaseCookies(supabaseResponse, redirectResponse);
      return redirectResponse;
    }
  }

  return supabaseResponse;
}
