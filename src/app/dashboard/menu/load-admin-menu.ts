import "server-only";

import type { Menu } from "@/menu/domain";
import { PrismaMenuRepository } from "@/menu/infrastructure/persistence";
import { prisma } from "@/shared/infrastructure/prisma/client";

export async function loadAdminMenu(): Promise<Menu | null> {
  try {
    const repository = new PrismaMenuRepository(prisma);
    return await repository.findForAdmin();
  } catch {
    return null;
  }
}
