# Capability: foundation-bootstrap

> GLOBAL INVARIANTS: SINGLE-TENANT (no tenantId/`?brand=`); DISPLAY-ONLY (no cart/checkout);
> MONEY in integer centavos (no float).

## Requirement: Clean-tree scaffold without catalog domain

The system SHALL be bootstrapped by selective copy into a clean tree (NOT git clone) and
SHALL exclude every ws-catalog catalog-domain artifact.

### Scenario: Catalog domain excluded
- GIVEN the bootstrapped tree
- WHEN the source tree is scanned
- THEN no Product/Category/Settings catalog entity, whatsapp/discount VO, inventory module,
  or `app/(catalog)`/catalog API route exists
- AND `src/shared` (Entity base, Price, Slug, ImageSource VOs, http, storage, events ports) exists

### Scenario: De-brand pass complete
- GIVEN the bootstrapped tree
- WHEN scanned for brand/locale literals
- THEN no "WS Catalog" string and no hardcoded `es-CO`/`COP` literal remain
  (locale/currency MUST be configurable)

### Scenario: Toolchain green
- GIVEN the clean tree
- WHEN `pnpm test`, `pnpm lint`, and `tsc --noEmit` run
- THEN all three exit zero

## Requirement: Single-tenant invariant in scaffold

The system MUST NOT introduce tenantId, `?brand=`, or multi-tenant scoping during bootstrap.

### Scenario: No multi-tenant tokens
- GIVEN the tree
- WHEN grepped for `tenantId` / `?brand=`
- THEN zero matches

**Acceptance**: tree scan asserts excluded paths absent; grep asserts zero brand/tenant/locale
literals; CI commands green.
