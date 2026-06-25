import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { isEmailAllowed, parseAllowedEmails } from "./is-email-allowed";

/**
 * Minimal shape of the profile/account email NextAuth hands the `signIn`
 * callback. Kept local so the pure decision stays decoupled from NextAuth.
 */
interface SignInProfile {
  email?: string | null;
}

/**
 * Pure sign-in decision: admit iff the profile email is on the allowlist
 * parsed from the `ALLOWED_EMAILS` env string. Extracted from the NextAuth
 * callback so the access policy is exhaustively testable without NextAuth.
 */
export function resolveSignIn(
  profile: SignInProfile | null | undefined,
  allowedEmailsEnv: string | undefined,
): boolean {
  const allowlist = parseAllowedEmails(allowedEmailsEnv);
  return isEmailAllowed(profile?.email, allowlist);
}

/** Used by middleware (matcher: /dashboard/*) — requires a valid session. */
export function isAuthorizedSession(auth: unknown): boolean {
  return !!auth;
}

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: { strategy: "jwt" as const },
  pages: { signIn: "/login" },
  callbacks: {
    signIn({ profile, user }) {
      // Google supplies the verified email on `profile`; fall back to `user`.
      const email = profile?.email ?? user?.email;
      return resolveSignIn({ email }, process.env.ALLOWED_EMAILS);
    },
    authorized({ auth }) {
      return isAuthorizedSession(auth);
    },
  },
};
