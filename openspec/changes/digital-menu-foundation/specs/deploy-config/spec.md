# Capability: deploy-config

> GLOBAL INVARIANTS: SINGLE-TENANT; DISPLAY-ONLY; MONEY in integer centavos.

## Requirement: Per-deploy single-tenant config

DeployConfig SHALL provide branding (logo, colors, restaurant name) and currency/locale/timezone
from ENV/config (NOT a tenant DB row). It MUST NOT be a multi-tenant lookup.

### Scenario: Config drives theme
- GIVEN config with brand color and name
- WHEN the app shell renders
- THEN theme CSS custom properties and restaurant name reflect config

## Requirement: Centavos storage, config-driven display

Prices SHALL always be stored/computed in integer centavos. Display formatting SHALL follow
currency/locale config. Currency-symbol display SHALL be toggleable.

### Scenario: Symbol shown
- GIVEN currency USD, locale en-US, symbol display ON, price 2450
- WHEN formatted
- THEN output shows a currency symbol (e.g. "$24.50")

### Scenario: Bare-number display (edge, Azahar-style)
- GIVEN symbol display OFF, price 2450, locale en-US
- WHEN formatted
- THEN output shows the bare number "24.50" with no currency symbol

**Acceptance**: formatter unit-tested for symbol-on and symbol-off paths; config read asserts
no tenant lookup.
