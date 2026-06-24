# Capability: landing-page

> GLOBAL INVARIANTS: SINGLE-TENANT; DISPLAY-ONLY; MONEY in integer centavos.

## Requirement: Optional config-driven landing with redirect fallback

The landing page SHALL be optional via config (hero/about/hours/contact). When disabled, the
root route SHALL redirect to the menu.

### Scenario: Landing enabled
- GIVEN landing enabled in config
- WHEN root `/` is requested
- THEN the landing renders with config-driven hero/about/hours/contact

### Scenario: Landing disabled redirects (edge)
- GIVEN landing disabled in config
- WHEN root `/` is requested
- THEN the response redirects to the menu route

**Acceptance**: route test asserts render-when-enabled and redirect-when-disabled.
