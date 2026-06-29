import "server-only";

import type { UiLocale } from "@/i18n/config";
import type { AllergenOption } from "@/menu/application/admin/allergen-types";
import { localizedName } from "@/menu/presentation/localize-menu-content";
import { prisma } from "@/shared/infrastructure/prisma/client";

export type { AllergenOption } from "@/menu/application/admin/allergen-types";

export async function loadAllergenOptions(): Promise<AllergenOption[]> {
  try {
    return await prisma.allergen.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, nameEn: true, icon: true },
    });
  } catch {
    return [];
  }
}

export async function loadAllergenNameMap(
  locale: UiLocale = "es",
): Promise<Record<string, string>> {
  const options = await loadAllergenOptions();
  return Object.fromEntries(
    options.map((option) => [option.id, localizedName(option, locale)]),
  );
}
