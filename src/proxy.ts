export { auth as proxy } from "@/shared/infrastructure/auth";

// Guard only the admin dashboard. Public menu routes stay unauthenticated.
export const config = {
  matcher: ["/dashboard/:path*"],
};
