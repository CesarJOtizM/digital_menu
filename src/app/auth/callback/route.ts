import { NextResponse } from "next/server";
import { resolveSignIn } from "@/shared/infrastructure/auth/resolve-sign-in";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!resolveSignIn({ email: user?.email }, process.env.ALLOWED_EMAILS)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=unauthorized`);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
