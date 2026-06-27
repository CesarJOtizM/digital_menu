import "server-only";

import { prisma } from "@/shared/infrastructure/prisma/client";

export interface AllergenOption {
  id: string;
  name: string;
  icon: string | null;
}

export async function loadAllergenOptions(): Promise<AllergenOption[]> {
  try {
    return await prisma.allergen.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, icon: true },
    });
  } catch {
    return [];
  }
}

export async function loadAllergenNameMap(): Promise<Record<string, string>> {
  const options = await loadAllergenOptions();
  return Object.fromEntries(options.map((option) => [option.id, option.name]));
}
