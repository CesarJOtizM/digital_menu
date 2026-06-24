# Capability: menu-presentation

> GLOBAL INVARIANTS: SINGLE-TENANT; DISPLAY-ONLY; MONEY in integer centavos.

## Requirement: Public read-only Azahar-style rendering

The public menu SHALL render categories, items, variants, modifiers, and allergens,
display-only. It MUST NOT expose cart/checkout controls.

### Scenario: Full render
- GIVEN a published menu with items, variants, modifiers, allergens
- WHEN the public page renders
- THEN all are displayed and no add-to-cart/checkout control exists

### Scenario: Empty menu (edge)
- GIVEN a menu with no categories
- WHEN rendered
- THEN an empty-state is shown without error

## Requirement: Availability-aware display

Rendering SHALL reflect AvailabilityResolver: unavailable categories/items SHALL be shown
marked unavailable (default decision; NOT hidden) and not orderable.

### Scenario: Unavailable item at render time (edge)
- GIVEN an Item unavailable at the current instant in the configured tz
- WHEN the menu renders
- THEN that item is shown marked unavailable (not orderable, since display-only)

**Acceptance**: component tests assert no cart controls; availability-driven marking verified
against resolver output.
