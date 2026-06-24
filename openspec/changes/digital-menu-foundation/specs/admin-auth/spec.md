# Capability: admin-auth

> GLOBAL INVARIANTS: SINGLE-TENANT; DISPLAY-ONLY; MONEY in integer centavos.

## Requirement: Google OAuth with email allowlist

Admin auth SHALL use Google OAuth (Auth.js/NextAuth 5). Only emails on the configured
allowlist MAY access `/dashboard`. The session MUST carry role only (no tenant).

### Scenario: Allowlisted email admitted
- GIVEN email on the allowlist
- WHEN it completes Google OAuth
- THEN access to `/dashboard` is granted

### Scenario: Non-allowlisted email rejected (edge)
- GIVEN email NOT on the allowlist
- WHEN it completes Google OAuth
- THEN authorization is denied and `/dashboard` is not accessible

## Requirement: Public menu requires no auth

Public menu routes SHALL be accessible without authentication; only edit/dashboard routes
SHALL be guarded.

### Scenario: Anonymous public view
- GIVEN no session
- WHEN the public menu is requested
- THEN it renders without redirect to login

### Scenario: Guarded dashboard
- GIVEN no session
- WHEN `/dashboard` is requested
- THEN access is denied / redirected to sign-in

**Acceptance**: allowlist authorize() unit-tested for admit/reject; route guard test confirms
public open + dashboard closed.
