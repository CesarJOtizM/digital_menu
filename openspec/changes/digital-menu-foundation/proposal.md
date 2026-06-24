# Proposal: digital-menu-foundation

> Authoritative scope contract: Engram obs #575 (sdd/digital_menu/mvp-scope).

## Intent

Stand up a greenfield, SINGLE-TENANT digital menu app (Azahar-style, display-only) by
selectively reusing ws-catalog's technical foundation while building a fresh Menu domain.
One deploy per restaurant: own URL, DB, branding. Owner self-manages admin access via
Google OAuth + email allowlist. Domain is modeled so ordering/cart can extend cleanly
later without rework.

## Scope

### In Scope

**A. Foundation bootstrap** (clean tree, NOT git clone, from ws-catalog)
- Copy config: package.json (renamed), tsconfig.json, next.config.mjs, vitest.config.ts,
  eslint/postcss/prisma config, .env.example
- Copy shared kernel: shared/domain/entity.ts, prisma client singleton, http response/error
  handlers, cuid helper, local-image-storage (sharp), logging-event-dispatcher, error bases,
  event-dispatcher + image-storage ports
- Port VOs: Price (centavos), Slug (promoted to shared), ImageSource
- Copy DI manual-factory PATTERN (not catalog contents); app shell (layout, globals.css,
  error/not-found/loading)
- Supabase Postgres via Prisma + pg: only DATABASE_URL/DIRECT_URL change

**B. Menu domain** — Menu aggregate root → ordered Categories → ordered Items; Variant
(absolute Price), item-local ModifierGroup/Option; copy-modifiers clone use-case; Allergen
reference vocabulary; AvailabilityWindow + pure AvailabilityResolver.

**C. Auth** — Google OAuth (NextAuth 5) + email allowlist; public menu open, `/dashboard` guarded.

**D. Config / branding** — per-deploy DeployConfig (branding, currency/locale/timezone, optional
symbol toggle); CSS-var theming.

**E. Menu presentation** — public read-only Azahar-style menu, availability-aware.

**F. Optional landing** — config-driven; if disabled root redirects to menu.

### Out of Scope

Multi-tenant / `?brand=` / tenantId; cart/checkout/ordering/payments; Supabase Auth;
email-password auth; ws-catalog catalog domain (Product/Category/Settings entities,
whatsapp/discount VOs, inventory, catalog app + API routes).

## Capabilities (all NEW, greenfield)

`foundation-bootstrap`, `menu-domain`, `availability`, `admin-auth`, `deploy-config`,
`menu-presentation`, `landing-page`.

## Approach

Hexagonal + DDD, dependency rule inward. Three contexts: Menu (core), Identity (thin
NextAuth Google + allowlist), Config (per-deploy from ENV/config). Bootstrap = selective
copy into clean tree with a mandatory de-brand pass (strip "WS Catalog", es-CO/COP,
whatsapp/discount). strict_tdd via `pnpm test` (vitest); domain coverage ≥ 80%.

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Copied files drag catalog assumptions | High | Explicit EXCLUDE list + de-brand pass |
| Availability correctness across tz/DST | Med | Pure resolver, exhaustive unit tests |
| "Copy modifiers" hidden coupling | Low | Use-case CLONES; assert no shared FK |
| Scope > 400-line review budget | High | Chained PRs by work unit |

## Rollback Plan

Greenfield: rollback = revert the bootstrap commit(s) / delete the new tree. Each chained
PR slice reverts independently.

## Success Criteria

- [ ] Clean tree boots; `pnpm test`, `pnpm lint`, `tsc --noEmit` green
- [ ] Menu domain with absolute-price variants + item-local modifiers, all integer centavos
- [ ] "Copy modifiers" produces independent data
- [ ] AvailabilityResolver correct at category+item level in configured timezone
- [ ] Google OAuth + allowlist guards dashboard; public menu open
- [ ] Per-deploy branding/currency/locale/timezone; optional bare-number display
- [ ] Zero catalog-domain code, zero multi-tenant/?brand=/tenantId, zero cart/checkout
- [ ] Domain coverage ≥ 80%
