import { IMAGE_SOURCE_TYPE } from "@/shared/domain";
import type { PriceFormatter } from "@/shared/domain";
import type {
  AvailabilityResolver,
  Category,
  Item,
  Menu,
  ModifierGroup,
  Variant,
} from "@/menu/domain";

/** A variant shaped for display: a label and its absolute price string. */
export interface VariantView {
  readonly label: string;
  readonly priceDisplay: string;
}

/** A modifier option shaped for display. `priceDeltaDisplay` is null for +0. */
export interface ModifierOptionView {
  readonly name: string;
  readonly priceDeltaDisplay: string | null;
}

/** A modifier group shaped for display. */
export interface ModifierGroupView {
  readonly name: string;
  readonly options: readonly ModifierOptionView[];
}

/** A single menu item shaped for the Azahar-style row. */
export interface ItemView {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** Effective base price (variant-less) formatted via the config formatter. */
  readonly priceDisplay: string;
  /** Resolved image URL/path, or null for a text-only row. */
  readonly imageUrl: string | null;
  readonly hasImage: boolean;
  /** True when the item is outside its (or its category's) availability window. */
  readonly unavailable: boolean;
  readonly variants: readonly VariantView[];
  readonly modifierGroups: readonly ModifierGroupView[];
  /** Resolved allergen display names (subtle). Empty when none/no lookup. */
  readonly allergens: readonly string[];
}

/** A category section shaped for display: serif heading + its item rows. */
export interface CategoryView {
  readonly id: string;
  readonly name: string;
  readonly items: readonly ItemView[];
}

/** Link back to the landing at `/` when the deploy has landing enabled. */
export interface HomeLinkView {
  readonly label: string;
  readonly href: string;
}

/** The full public menu shaped for rendering. */
export interface MenuViewModel {
  readonly restaurantName: string;
  readonly isEmpty: boolean;
  readonly categories: readonly CategoryView[];
  /** Present when the root route serves the landing; omitted/null otherwise. */
  readonly homeLink?: HomeLinkView | null;
}

/** Inputs needed to project a domain Menu into presentation props. */
export interface BuildMenuViewModelDeps {
  readonly resolver: AvailabilityResolver;
  /** Render instant (request time). */
  readonly now: Date;
  /** IANA timezone for availability resolution. */
  readonly timezone: string;
  /** Centavos -> display string (bare number or symbol, per config). */
  readonly formatPrice: PriceFormatter;
  /** Optional allergen id -> display name lookup. */
  readonly allergenNames?: Readonly<Record<string, string>>;
}

function isRealImage(item: Item): boolean {
  return item.imageSource.type !== IMAGE_SOURCE_TYPE.PLACEHOLDER;
}

function toVariantView(variant: Variant, formatPrice: PriceFormatter): VariantView {
  return {
    label: variant.label,
    priceDisplay: variant.price.toDisplay(formatPrice),
  };
}

function toModifierGroupView(
  group: ModifierGroup,
  formatPrice: PriceFormatter,
): ModifierGroupView {
  return {
    name: group.name,
    options: group.options.map((option) => ({
      name: option.name,
      priceDeltaDisplay:
        option.priceDelta.value === 0
          ? null
          : `+${option.priceDelta.toDisplay(formatPrice)}`,
    })),
  };
}

function resolveAllergens(
  item: Item,
  allergenNames: Readonly<Record<string, string>> | undefined,
): string[] {
  if (!allergenNames) {
    return [];
  }
  return item.allergenIds
    .map((id) => allergenNames[id])
    .filter((name): name is string => Boolean(name));
}

function toItemView(
  item: Item,
  categoryAvailable: boolean,
  deps: BuildMenuViewModelDeps,
): ItemView {
  const { resolver, now, timezone, formatPrice, allergenNames } = deps;
  const itemAvailable = resolver.isAvailable(item.availability, now, timezone);
  // Category window gates its items: an item is available only when BOTH the
  // category window and the item window include `now`. Unavailable items are
  // SHOWN MARKED (not hidden) — the locked default.
  const unavailable = !(categoryAvailable && itemAvailable);
  const hasImage = isRealImage(item);

  return {
    id: item.id,
    name: item.name,
    description: item.description,
    priceDisplay: item.basePrice.toDisplay(formatPrice),
    imageUrl: hasImage ? item.imageSource.url : null,
    hasImage,
    unavailable,
    variants: item.variants.map((variant) => toVariantView(variant, formatPrice)),
    modifierGroups: item.modifierGroups.map((group) =>
      toModifierGroupView(group, formatPrice),
    ),
    allergens: resolveAllergens(item, allergenNames),
  };
}

function toCategoryView(category: Category, deps: BuildMenuViewModelDeps): CategoryView {
  const categoryAvailable = deps.resolver.isAvailable(
    category.availability,
    deps.now,
    deps.timezone,
  );
  return {
    id: category.id,
    name: category.name,
    items: category.items
      .filter((item) => item.active)
      .map((item) => toItemView(item, categoryAvailable, deps)),
  };
}

/**
 * Pure projection of the Menu aggregate into Azahar-style presentation props.
 *
 * - Prices are formatted via the injected config formatter (bare number when the
 *   currency symbol is off).
 * - Availability is resolved at the render instant: out-of-window items/categories
 *   are flagged `unavailable` and kept in place (SHOWN MARKED, never hidden).
 * - Order is preserved from the aggregate (already position-sorted).
 *
 * No I/O, no clock access — `now`, formatter, and resolver are all injected.
 */
export function buildMenuViewModel(
  menu: Menu,
  deps: BuildMenuViewModelDeps,
): MenuViewModel {
  const categories = menu.categories.map((category) => toCategoryView(category, deps));
  const hasItems = categories.some((category) => category.items.length > 0);

  return {
    restaurantName: menu.name,
    isEmpty: !hasItems,
    categories,
  };
}
