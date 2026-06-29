import "server-only";

import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";
import {
  createDevBypassUser,
  DEV_BYPASS_COOKIE,
  getDevBypassConfig,
  hasDevBypassCookieValue,
} from "./dev-bypass";

export const getAuthUser = cache(async (): Promise<User | null> => {
  const cookieStore = await cookies();
  const bypassCookie = cookieStore.get(DEV_BYPASS_COOKIE)?.value;
  const bypassConfig = getDevBypassConfig();

  if (bypassConfig && hasDevBypassCookieValue(bypassCookie)) {
    return createDevBypassUser(bypassConfig.email);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return user;
});
