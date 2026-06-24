# Tasks: digital-menu-foundation

> Authoritative: spec #577, design #578, proposal #576, scope #575, patterns #579.
> strict_tdd=true (`pnpm test`, vitest). RED→GREEN→REFACTOR. Tests colocated `*.test.ts`.
> SINGLE-TENANT, display-only, centavos.
> NEW DEFAULT: out-of-availability items SHOWN MARKED unavailable (not hidden).

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1850 (all 6 slices) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR1→PR2→PR3→PR4→PR5→PR6 |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

## Slice 1: Bootstrap + Shared Kernel (PR1) — blocks all
- [x] 1.1 Scaffold clean tree; copy+rename `package.json`(name=digital-menu), `tsconfig.json`(@/* aliases), `next.config.mjs`, `vitest.config.ts`, eslint/postcss/prisma config, `.env.example`(DATABASE_URL/DIRECT_URL/AUTH_SECRET/GOOGLE_*/ALLOWED_EMAILS)
- [x] 1.2 Copy `src/shared/domain/entity.ts` (Entity base) + error bases
- [x] 1.3 RED `src/shared/domain/price.test.ts`: integer≥0 centavos, reject float/negative
- [x] 1.4 GREEN port `price.ts` (drop Discount dep; formatter injected, NO es-CO/COP)
- [x] 1.5 RED `src/shared/domain/slug.test.ts` (diacritic strip) → GREEN port `slug.ts`
- [x] 1.6 Port `image-source.ts` + storage/events/http ports, prisma client singleton, cuid helper, logging-event-dispatcher
- [x] 1.7 Copy DI factory PATTERN → `src/menu/infrastructure/di/container.ts` (empty shell); app shell (layout, globals.css, error/not-found/loading)
- [x] 1.8 De-brand pass: grep+strip "WS Catalog", es-CO/COP, whatsapp/discount; assert EXCLUDE list absent
- Acceptance (Cap A): tree scan no catalog entity/route; `grep tenantId|?brand=`=0; `pnpm test|lint|tsc --noEmit` green
- Rollback: revert PR1 = delete tree

## Slice 2a: Menu Domain — pure model (PR2) — depends PR1, TDD-heavy
- [ ] 2a.1 RED `availability-window.test.ts` → GREEN VO
- [ ] 2a.2 RED `variant.test.ts` (absolute Price) → GREEN
- [ ] 2a.3 RED `modifier-group.test.ts`: min/max bounds → GREEN ModifierGroup + ModifierOption
- [ ] 2a.4 RED `item.test.ts`: effectivePrice cases → GREEN Item.effectivePrice
- [ ] 2a.5 RED `menu.test.ts`: ordering, empty menu → GREEN Menu aggregate + Category
- [ ] 2a.6 RED `allergen.test.ts` → GREEN Allergen aggregate
- [ ] 2a.7 RED `availability-resolver.test.ts`: tz/DST → GREEN pure resolver
- [ ] 2a.8 RED `copy-modifiers-from-item.test.ts`: clone independence → GREEN use-case
- [ ] 2a.9 REFACTOR; assert domain coverage ≥80%

## Slice 2b: Prisma schema + repos + mappers (PR3) — depends 2a
- [ ] 2b.1 Write `src/prisma/schema.prisma` (NO tenantId)
- [ ] 2b.2 RED repo integration test → GREEN repo + prisma-mappers
- [ ] 2b.3 Wire repos into DI container; `prisma generate`

## Slice 3: Admin Auth (PR4) — depends PR1
- [ ] 3.1 RED `is-email-allowed.test.ts` → GREEN pure `isEmailAllowed`
- [ ] 3.2 GREEN `auth-config.ts`: Google provider, jwt session, signIn callback
- [ ] 3.3 `src/middleware.ts` matcher `/dashboard/:path*`; `/login` page
- [ ] 3.4 RED/E2E `dashboard-guard.spec.ts` → GREEN

## Slice 4: Config + Theming (PR5) — depends 2b
- [ ] 4.1 RED `format-price.test.ts`: symbol on/off → GREEN `formatPrice`
- [ ] 4.2 RED `get-config.test.ts` → GREEN cached server fn
- [ ] 4.3 RED `build-theme-style.test.ts` → GREEN buildThemeStyle

## Slice 5: Menu Presentation (PR6) — depends 2b, 4
- [ ] 5.1 RED `(menu)/page.test.tsx` → GREEN RSC page
- [ ] 5.2 RED `item-card.test.tsx`: unavailable shown marked → GREEN
- [ ] 5.3 Apply buildThemeStyle to `(menu)` layout

## Slice 6: Optional Landing (PR7) — depends 4, 5
- [ ] 6.1 RED `(landing)/page.test.tsx` → GREEN

## Notes
- Slice 2 split into 2a/2b (combined ~520 lines exceeds 400 budget).
- Chain strategy: stacked-to-main (chosen at apply time for PR1).
