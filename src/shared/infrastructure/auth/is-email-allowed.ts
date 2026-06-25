/**
 * Pure admin-access policy for the single-tenant deploy.
 *
 * The allowlist is sourced from the `ALLOWED_EMAILS` env var (comma-separated)
 * and parsed by {@link parseAllowedEmails}. {@link isEmailAllowed} is the only
 * decision the NextAuth `signIn` callback delegates to, so it stays pure and
 * exhaustively testable — no I/O, no env reads, no NextAuth coupling.
 */

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Parse a comma-separated allowlist string into a normalized email list.
 * Entries are trimmed, lowercased, and empties are dropped. A missing or
 * blank value yields an empty list (which rejects everyone).
 */
export function parseAllowedEmails(raw: string | undefined): string[] {
  if (!raw) return [];

  return raw
    .split(",")
    .map(normalizeEmail)
    .filter((entry) => entry.length > 0);
}

/**
 * Decide whether `email` is permitted to access the dashboard.
 * Matching is case-insensitive and whitespace-insensitive. An empty allowlist
 * rejects all emails; a null/undefined/blank email is always rejected.
 */
export function isEmailAllowed(
  email: string | null | undefined,
  allowedEmails: readonly string[],
): boolean {
  if (!email) return false;

  const normalized = normalizeEmail(email);
  if (normalized.length === 0) return false;

  return allowedEmails.some((entry) => normalizeEmail(entry) === normalized);
}
