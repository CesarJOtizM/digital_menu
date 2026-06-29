/** Legacy seed/admin slugs → emoji for display and picker defaults. */
const LEGACY_ALLERGEN_ICONS: Readonly<Record<string, string>> = {
  wheat: "🌾",
  gluten: "🌾",
  milk: "🥛",
  dairy: "🥛",
  shrimp: "🦐",
  shellfish: "🦐",
  fish: "🐟",
  egg: "🥚",
  nut: "🥜",
  nuts: "🥜",
  soy: "🫘",
  sesame: "🌿",
  celery: "🥬",
  mustard: "🟡",
  lupin: "🌸",
  mollusc: "🐚",
  sulphite: "🍷",
  sulfite: "🍷",
};

export function resolveAllergenDisplayIcon(
  icon: string | null | undefined,
): string | null {
  if (!icon?.trim()) {
    return null;
  }

  const trimmed = icon.trim();
  const legacy = LEGACY_ALLERGEN_ICONS[trimmed.toLowerCase()];
  if (legacy) {
    return legacy;
  }

  if (/^[a-z0-9_-]+$/i.test(trimmed)) {
    return null;
  }

  return trimmed;
}

export function normalizeAllergenIconForSave(
  icon: string | null | undefined,
): string | null {
  const trimmed = icon?.trim() ?? "";
  if (!trimmed) {
    return null;
  }

  return resolveAllergenDisplayIcon(trimmed) ?? null;
}
