# Design: digital-menu-foundation

> Contract: Engram #576 (proposal) + #575 (locked MVP). SINGLE-TENANT.
> NO tenantId / `?brand=` / cart. Mirrors ws-catalog patterns (verified by inspection).

## Technical Approach

Greenfield single-tenant Next 16 / React 19 / Prisma 7+pg / NextAuth 5 / Tailwind 4 app.
Hexagonal + DDD, dependency rule inward (infra → application → domain). Selective copy from
ws-catalog into a clean tree; build a fresh **Menu** core context, a thin **Identity**
(NextAuth Google + allowlist), and a per-deploy **Config**. Prices integer centavos
end-to-end. Display-only; model is order-extension-ready but exposes no cart use-case.

## 1. Bounded Contexts & Layering

| Context | Role | Layers |
|---|---|---|
| **Menu** (core) | Menu aggregate root → ordered Category → ordered Item; Variant, ModifierGroup/Option, Allergen ref, availability | `src/menu/{domain,application,infrastructure}` |
| **Identity** (thin) | NextAuth 5 Google provider; `authorize`/`signIn` enforces email allowlist; session carries role only | `src/shared/infrastructure/auth/*` |
| **Config** (per-deploy) | DeployConfig: branding/currency/locale/timezone + symbol toggle | `src/config/*` |

Shared kernel `src/shared/domain` (Entity base, Slug promoted, Price, ImageSource,
AvailabilityWindow) + `src/shared/infrastructure/{prisma,auth,http,storage,events}`.
**No tenantId on any signature, row, or port.**

## 2. Domain Model

- **Menu** (aggregate root): id, name, slug, status(draft/published), ordered `Category[]`.
- **Category** (entity): id, name, slug, sortOrder, description, ordered `Item[]`, optional AvailabilityWindow.
- **Item** (entity): id, name, slug, description, basePrice(Price), imageSource, active, sortOrder, allergenIds[], variants[], modifierGroups[], optional AvailabilityWindow.
- **Variant** (child entity): label, price(Price, ABSOLUTE centavos).
- **ModifierGroup** (entity, item-local): name, min, max, required. **ModifierOption** (VO): name, priceDelta(Price, default 0).
- **Allergen** (separate small aggregate): id, name, slug/icon. Items reference by id.
- **VOs**: Price (centavos int ≥0, `toDisplay(formatter)` — formatting injected, NOT hardcoded), Slug, ImageSource, AvailabilityWindow (days[], startMinute, endMinute).

**Effective price** = (selected Variant.price ?? Item.basePrice) + Σ selected ModifierOption.priceDelta.
Pure integer arithmetic; `Item.effectivePrice(variantId?, optionIds[])`.

**Clone-modifiers use-case**: deep-constructs new ModifierGroup/Option with fresh ids on the
target Item; no shared FK/reference.

## 3. Prisma Schema (`src/prisma/schema.prisma`)

cuid ids, centavos `Int`, ordering fields, indexes — NO tenantId. Models: Menu, Category, Item,
Variant, ModifierGroup, ModifierOption, Allergen, ItemAllergen, Settings (singleton id="default").
Cascade deletes child→parent.

## 4. Auth Design

Google provider; `session.strategy:"jwt"`; `pages.signIn:"/login"`. `signIn` callback uses pure
`isEmailAllowed(email, ALLOWED_EMAILS)`. Middleware `matcher:["/dashboard/:path*"]`. Public menu
unauthenticated.

## 5. Config / Theming

`Settings` singleton read via cached server fn. `buildThemeStyle(config)` → CSS custom props
(`--color-accent`, `--color-secondary`). `formatPrice(centavos, {locale, currency, showSymbol})`
— when `showSymbol=false` emit bare number. Price.toDisplay delegates to the injected formatter.

## 6. Availability

Pure `AvailabilityResolver`, no I/O. `isAvailable(window, now, timezone)`. DST-correct via
`Intl.DateTimeFormat(timezone, {weekday, hour, minute, hour12:false})`.

## 7. Frontend

Atomic + container/presentational. `app/(menu)/page.tsx` public RSC; `app/dashboard/*` guarded;
optional `app/(landing)/page.tsx`. Image handling via ported `LocalImageStorage` (dir
`public/uploads/items`). `cn()` + Tailwind 4 theme vars.

## 8. Bootstrap Sequencing

1. Scaffold clean tree; copy & rename config + `.env.example`.
2. Copy shared kernel: entity, prisma client, http response/error, cuid, logging-event-dispatcher,
   error bases, ports.
3. Port VOs into `shared/domain`: Price (formatter injected), Slug, ImageSource.
4. Copy DI factory pattern → `src/menu/infrastructure/di/container.ts`.
5. App shell + de-brand pass.
6. Menu domain (TDD) → schema → repos. 7. Auth. 8. Config. 9. Presentation. 10. Landing.

**EXCLUDE**: catalog entities, whatsapp/discount VOs, catalog repos/use-cases/inventory,
`app/(catalog)/*`, catalog API routes, catalog Prisma models.

## 10. Test Strategy (strict TDD, `pnpm test` / vitest)

| Layer | What |
|---|---|
| Domain unit | Price arithmetic, effectivePrice, AvailabilityResolver (tz/DST), Slug, clone-independence, Menu invariants — ≥80% coverage |
| Application | use-cases incl. copy-modifiers (no shared FK) |
| Infra integration | Prisma repos round-trip, cascade deletes |
| E2E | Public menu availability-aware; allowlist guards /dashboard |
