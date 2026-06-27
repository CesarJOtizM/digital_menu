"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  parseModifierGroupsFromJson,
  parseVariantsFromJson,
} from "@/menu/application/admin/parse-item-form-extras";
import { resolveItemImageSource } from "@/menu/application/admin/resolve-item-image";
import {
  MenuAdminError,
  MenuAdminService,
} from "@/menu/application/admin/menu-admin-service";
import { parsePriceInputToCentavos } from "@/menu/application/admin/parse-price-input";
import { CuidIdGenerator, PrismaMenuRepository } from "@/menu/infrastructure/persistence";
import { LocalImageStorage } from "@/shared/infrastructure/storage";
import { prisma } from "@/shared/infrastructure/prisma/client";
import { requireAuthUser } from "@/shared/infrastructure/auth/require-auth-user";

function createMenuAdminService(): MenuAdminService {
  return new MenuAdminService(
    new PrismaMenuRepository(prisma),
    new CuidIdGenerator(),
    new LocalImageStorage(),
  );
}

function revalidateMenuPages(): void {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/menu", "layout");
  revalidatePath("/menu");
  revalidatePath("/");
}

function redirectWithError(path: string, error: string): never {
  redirect(`${path}?error=${encodeURIComponent(error)}`);
}

function readCheckbox(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}

function readAllergenIds(formData: FormData): string[] {
  return formData
    .getAll("allergenIds")
    .map((value) => String(value))
    .filter((value) => value.length > 0);
}

export async function toggleItemActiveAction(formData: FormData) {
  await requireAuthUser();

  const categoryId = String(formData.get("categoryId") ?? "");
  const itemId = String(formData.get("itemId") ?? "");

  try {
    await createMenuAdminService().toggleItemActive(categoryId, itemId);
    revalidateMenuPages();
  } catch (error) {
    redirectWithError(
      "/dashboard/menu",
      error instanceof MenuAdminError ? error.message : "No se pudo actualizar el plato",
    );
  }

  redirect("/dashboard/menu");
}

export async function saveItemAction(formData: FormData) {
  await requireAuthUser();

  const categoryId = String(formData.get("categoryId") ?? "");
  const itemIdRaw = String(formData.get("itemId") ?? "").trim();
  const itemId = itemIdRaw.length > 0 ? itemIdRaw : null;
  const returnTo = String(formData.get("returnTo") ?? "/dashboard/menu");
  const service = createMenuAdminService();
  const ids = new CuidIdGenerator();
  const storage = new LocalImageStorage();

  try {
    const menu = await service.loadMenu();
    const existing = itemId ? menu.findItem(categoryId, itemId) : undefined;
    const priceCentavos = parsePriceInputToCentavos(
      String(formData.get("price") ?? ""),
    );
    const variants = parseVariantsFromJson(
      String(formData.get("variantsJson") ?? "[]"),
      ids,
    );
    const modifierGroups = parseModifierGroupsFromJson(
      String(formData.get("modifierGroupsJson") ?? "[]"),
      ids,
    );
    const imageSource = await resolveItemImageSource(
      formData,
      existing?.imageSource,
      storage,
    );

    await service.saveItem(categoryId, itemId, {
      name: String(formData.get("name") ?? ""),
      description: String(formData.get("description") ?? ""),
      priceCentavos,
      active: readCheckbox(formData, "active"),
      variants,
      modifierGroups,
      imageSource,
      allergenIds: readAllergenIds(formData),
    });

    revalidateMenuPages();
    redirect(returnTo);
  } catch (error) {
    const message =
      error instanceof MenuAdminError
        ? error.message
        : error instanceof Error
          ? error.message
          : "No se pudo guardar el plato";

    redirectWithError(
      itemId
        ? `/dashboard/menu/items/${itemId}?categoryId=${encodeURIComponent(categoryId)}`
        : `/dashboard/menu/items/new?categoryId=${encodeURIComponent(categoryId)}`,
      message,
    );
  }
}

export async function deleteItemAction(formData: FormData) {
  await requireAuthUser();

  const categoryId = String(formData.get("categoryId") ?? "");
  const itemId = String(formData.get("itemId") ?? "");

  try {
    await createMenuAdminService().deleteItem(categoryId, itemId);
    revalidateMenuPages();
  } catch (error) {
    redirectWithError(
      "/dashboard/menu",
      error instanceof MenuAdminError ? error.message : "No se pudo eliminar el plato",
    );
  }

  redirect("/dashboard/menu");
}

export async function saveCategoryAction(formData: FormData) {
  await requireAuthUser();

  const categoryIdRaw = String(formData.get("categoryId") ?? "").trim();
  const categoryId = categoryIdRaw.length > 0 ? categoryIdRaw : null;
  const returnTo = String(formData.get("returnTo") ?? "/dashboard/menu");

  try {
    await createMenuAdminService().saveCategory(categoryId, {
      name: String(formData.get("name") ?? ""),
    });

    revalidateMenuPages();
    redirect(returnTo);
  } catch (error) {
    const message =
      error instanceof MenuAdminError
        ? error.message
        : "No se pudo guardar la categoría";

    redirectWithError(
      categoryId
        ? `/dashboard/menu/categories/${categoryId}`
        : "/dashboard/menu/categories/new",
      message,
    );
  }
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAuthUser();

  const categoryId = String(formData.get("categoryId") ?? "");

  try {
    await createMenuAdminService().deleteCategory(categoryId);
    revalidateMenuPages();
  } catch (error) {
    redirectWithError(
      "/dashboard/menu",
      error instanceof MenuAdminError ? error.message : "No se pudo eliminar la categoría",
    );
  }

  redirect("/dashboard/menu");
}
