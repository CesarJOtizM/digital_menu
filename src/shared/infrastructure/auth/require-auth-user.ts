import "server-only";

import { redirect } from "next/navigation";
import { getAuthUser } from "@/shared/infrastructure/auth";
import type { User } from "@supabase/supabase-js";

export async function requireAuthUser(): Promise<User> {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login?error=session_required");
  }
  return user;
}
