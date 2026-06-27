import "server-only";

import type { Menu } from "@/menu/domain";
import { MenuAdminService } from "@/menu/application/admin/menu-admin-service";
import { CuidIdGenerator, PrismaMenuRepository } from "@/menu/infrastructure/persistence";
import { LocalImageStorage } from "@/shared/infrastructure/storage";
import { prisma } from "@/shared/infrastructure/prisma/client";

export async function loadAdminMenu(): Promise<Menu | null> {
  try {
    const service = new MenuAdminService(
      new PrismaMenuRepository(prisma),
      new CuidIdGenerator(),
      new LocalImageStorage(),
    );
    return await service.loadMenu();
  } catch {
    return null;
  }
}
