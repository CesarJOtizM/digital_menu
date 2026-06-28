import "server-only";

import { Slug } from "@/shared/domain";
import { CuidIdGenerator } from "@/menu/infrastructure/persistence";
import type { IdGenerator } from "@/menu/application/ports/id-generator";
import { prisma } from "@/shared/infrastructure/prisma/client";
import { MenuAdminError } from "./menu-admin-service";

export interface AllergenInput {
  name: string;
  icon?: string | null;
}

async function resolveUniqueSlug(
  name: string,
  excludeId?: string,
): Promise<string> {
  let slug = Slug.fromName(name);
  let suffix = 2;

  while (true) {
    const existing = await prisma.allergen.findUnique({
      where: { slug: slug.value },
    });

    if (!existing || existing.id === excludeId) {
      return slug.value;
    }

    slug = slug.withSuffix(suffix++);
  }
}

export class AllergenAdminService {
  constructor(private readonly ids: IdGenerator = new CuidIdGenerator()) {}

  async save(allergenId: string | null, input: AllergenInput): Promise<string> {
    const name = input.name.trim();
    if (!name) {
      throw new MenuAdminError("ALLERGEN_NAME_REQUIRED");
    }

    const icon = input.icon?.trim() || null;

    if (allergenId) {
      const existing = await prisma.allergen.findUnique({
        where: { id: allergenId },
      });
      if (!existing) {
        throw new MenuAdminError("ALLERGEN_NOT_FOUND");
      }

      const slug =
        existing.name === name
          ? existing.slug
          : await resolveUniqueSlug(name, allergenId);

      await prisma.allergen.update({
        where: { id: allergenId },
        data: { name, slug, icon },
      });
      return allergenId;
    }

    const created = await prisma.allergen.create({
      data: {
        id: this.ids.next(),
        name,
        slug: await resolveUniqueSlug(name),
        icon,
      },
    });
    return created.id;
  }

  async delete(allergenId: string): Promise<void> {
    const existing = await prisma.allergen.findUnique({
      where: { id: allergenId },
    });
    if (!existing) {
      throw new MenuAdminError("ALLERGEN_NOT_FOUND");
    }

    await prisma.allergen.delete({ where: { id: allergenId } });
  }
}
