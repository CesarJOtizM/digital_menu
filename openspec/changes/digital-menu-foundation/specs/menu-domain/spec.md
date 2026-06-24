# Capability: menu-domain

> GLOBAL INVARIANTS: SINGLE-TENANT; DISPLAY-ONLY; MONEY in integer centavos.

## Requirement: Menu aggregate with ordered children

The Menu aggregate root SHALL contain ordered Categories, each containing ordered Items.
Order MUST be deterministic and explicit (position).

### Scenario: Ordering preserved
- GIVEN a Menu with categories [C2,C1] positioned [1,0] and items positioned
- WHEN the menu is read
- THEN categories and items return sorted by ascending position

### Scenario: Empty menu (edge)
- GIVEN a Menu with zero categories
- WHEN read
- THEN it returns an empty ordered list and does NOT error

## Requirement: Variants carry absolute price

A Variant SHALL hold an absolute Price in integer centavos. An Item without variants SHALL
price from its base price.

### Scenario: Item with no variants (edge)
- GIVEN an Item with base price 1500 and no variants
- WHEN effective price is computed with no modifiers
- THEN result is 1500 centavos

### Scenario: Variant overrides base
- GIVEN an Item base 1500 with Variant "Large" absolute 2000
- WHEN "Large" is selected
- THEN base price contribution is 2000 (absolute, not additive)

## Requirement: Item-local modifiers with group bounds

Modifiers SHALL be item-local. Each ModifierGroup SHALL define min/max selectable. Each
ModifierOption SHALL carry priceDelta in centavos. Selection violating min/max MUST be rejected.

### Scenario: Min violation (edge)
- GIVEN a group min=1 max=2 with zero options selected
- WHEN validated
- THEN validation fails with a min-violation error

### Scenario: Max violation (edge)
- GIVEN a group min=0 max=1 with two options selected
- WHEN validated
- THEN validation fails with a max-violation error

### Scenario: Within bounds
- GIVEN a group min=1 max=2 with one option selected
- WHEN validated
- THEN validation passes

## Requirement: Effective price composition

Effective item price SHALL equal (selected Variant absolute price OR Item base price) plus
the sum of selected ModifierOption priceDeltas, computed in integer centavos.

### Scenario: Composed price
- GIVEN base 1500, Variant "Large" 2000, options +300 and +150
- WHEN computed with Large + both options
- THEN result is 2450 centavos
- AND no floating-point arithmetic is used

## Requirement: Copy-modifiers clone is independent

The "copy modifiers from another item" use-case SHALL deep-clone groups/options into the
target with NO shared reference or FK to the source.

### Scenario: Clone independence (edge)
- GIVEN item Source with modifiers and item Target
- WHEN modifiers are copied to Target then a Target option delta is edited
- THEN Source modifiers are unchanged
- AND no shared id/FK links Source and Target groups

## Requirement: Allergens referenced by id

Items SHALL reference allergens from a reference vocabulary by id; the vocabulary is a
separate aggregate.

### Scenario: Allergen link
- GIVEN allergen "gluten" in the vocabulary
- WHEN an Item references it by id
- THEN the Item exposes "gluten" and the vocabulary entry is unchanged

**Acceptance**: pure unit tests on price composition + min/max + clone independence;
domain coverage ≥ 80%.
