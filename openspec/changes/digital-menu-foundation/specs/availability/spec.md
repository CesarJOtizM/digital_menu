# Capability: availability

> GLOBAL INVARIANTS: SINGLE-TENANT; DISPLAY-ONLY; MONEY in integer centavos.

## Requirement: Availability windows at category and item level

The system SHALL support AvailabilityWindow at Category AND Item level. A pure
AvailabilityResolver SHALL decide available/unavailable at a given instant.

### Scenario: No window means always available
- GIVEN a Category and Item with no windows
- WHEN resolved at any instant
- THEN both are available

### Scenario: Category window gates item
- GIVEN a Category unavailable at instant T and an Item available at T
- WHEN resolved
- THEN the Item is unavailable (category gates child)

## Requirement: Timezone-aware, DST-correct evaluation

Windows SHALL be evaluated in the deploy's configured timezone and MUST be DST-correct.

### Scenario: Boundary at window edge (edge)
- GIVEN a window 09:00–17:00 in the configured tz
- WHEN resolved exactly at 09:00:00 (inclusive start) and 17:00:00 (exclusive end)
- THEN 09:00:00 is available and 17:00:00 is unavailable

### Scenario: DST spring-forward gap (edge)
- GIVEN a tz with DST transition and a window crossing the skipped local hour
- WHEN resolved at instants around the transition
- THEN availability matches wall-clock intent in the configured tz (no off-by-one-hour error)

**Acceptance**: AvailabilityResolver is pure (no I/O); exhaustive unit tests cover
inclusive/exclusive edges + a DST transition.
