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

async function setDevBypassSession() {
  const cookieStore = await cookies();
  cookieStore.set(DEV_BYPASS_COOKIE, DEV_BYPASS_COOKIE_VALUE, devBypassCookieOptions);
}

async function clearDevBypassSession() {
  const cookieStore = await cookies();
  cookieStore.delete(DEV_BYPASS_COOKIE);
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
