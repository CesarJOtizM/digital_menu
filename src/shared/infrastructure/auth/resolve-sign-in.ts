import { isEmailAllowed, parseAllowedEmails } from "./is-email-allowed";

/**
 * Minimal shape of the profile email handed to the sign-in decision.
 */
interface SignInProfile {
  email?: string | null;
}

/**
 * Pure sign-in decision: admit iff the profile email is on the allowlist
 * parsed from the `ALLOWED_EMAILS` env string.
 */
export function resolveSignIn(
  profile: SignInProfile | null | undefined,
  allowedEmailsEnv: string | undefined,
): boolean {
  const allowlist = parseAllowedEmails(allowedEmailsEnv);
  return isEmailAllowed(profile?.email, allowlist);
}

/** Used by proxy (matcher: /dashboard/*) — requires a valid authorized session. */
export function isAuthorizedSession(user: unknown): boolean {
  return !!user;
}
