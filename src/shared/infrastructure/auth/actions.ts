"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";
import {
  DEV_BYPASS_COOKIE,
  DEV_BYPASS_COOKIE_VALUE,
  devBypassCookieOptions,
  getDevBypassConfig,
  matchesDevBypassCredentials,
} from "./dev-bypass";
import { resolveSignIn } from "./resolve-sign-in";

async function setDevBypassSession() {
  const cookieStore = await cookies();
  cookieStore.set(DEV_BYPASS_COOKIE, DEV_BYPASS_COOKIE_VALUE, devBypassCookieOptions);
}

async function clearDevBypassSession() {
  const cookieStore = await cookies();
  cookieStore.delete(DEV_BYPASS_COOKIE);
}

function getAuthRedirectOrigin(): string {
  return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
}

async function rejectUnauthorizedSignIn(email: string | undefined) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(`/login?error=unauthorized&email=${encodeURIComponent(email ?? "")}`);
}

export async function signInWithGoogleAction() {
  const supabase = await createSupabaseServerClient();
  const origin = getAuthRedirectOrigin();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect("/login?error=oauth_start");
  }

  redirect(data.url);
}

export async function signInWithDevBypassAction() {
  const config = getDevBypassConfig();
  if (!config) {
    redirect("/login?error=invalid_credentials");
  }

  await setDevBypassSession();
  redirect("/dashboard");
}

export async function signInWithPasswordAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=missing_credentials");
  }

  const bypassConfig = getDevBypassConfig();
  if (
    bypassConfig &&
    matchesDevBypassCredentials(email, password, bypassConfig)
  ) {
    await setDevBypassSession();
    redirect("/dashboard");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    redirect("/login?error=invalid_credentials");
  }

  if (!resolveSignIn({ email: data.user.email }, process.env.ALLOWED_EMAILS)) {
    await rejectUnauthorizedSignIn(data.user.email);
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  await clearDevBypassSession();

  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {
    // Supabase may be unconfigured during local bypass-only testing.
  }

  redirect("/login");
}
