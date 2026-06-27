export { updateSession as proxy } from "@/shared/infrastructure/supabase/update-session";

// Refresh Supabase sessions and guard the admin dashboard.
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/auth/:path*"],
};
