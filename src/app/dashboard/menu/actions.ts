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
import { createImageStorage } from "@/shared/infrastructure/storage/create-image-storage";
import { prisma } from "@/shared/infrastructure/prisma/client";
import { requireAuthUser } from "@/shared/infrastructure/auth/require-auth-user";

function createMenuAdminService(): MenuAdminService {
  return new MenuAdminService(
    new PrismaMenuRepository(prisma),
    new CuidIdGenerator(),
    createImageStorage(),
  );
}

function revalidateMenuPages(): void {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/menu", "layout");
  revalidatePath("/menu");
  revalidatePath("/");
}

function redirectWithAdminError(
  path: string,
  error: unknown,
  fallbackCode: string,
): never {
  const url = new URL(path, "http://localhost");

  if (error instanceof MenuAdminError) {
    url.searchParams.set("error", error.code);
    for (const [key, value] of Object.entries(error.params ?? {})) {
      url.searchParams.set(`error_${key}`, String(value));
    }
  } else {
    url.searchParams.set("error", fallbackCode);
  }

  redirect(`${url.pathname}${url.search}`);
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
    redirectWithAdminError("/dashboard/menu", error, "UPDATE_ITEM_FAILED");
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
  const storage = createImageStorage();

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
    redirectWithAdminError(
      itemId
        ? `/dashboard/menu/items/${itemId}?categoryId=${encodeURIComponent(categoryId)}`
        : `/dashboard/menu/items/new?categoryId=${encodeURIComponent(categoryId)}`,
      error,
      "SAVE_ITEM_FAILED",
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
    redirectWithAdminError("/dashboard/menu", error, "DELETE_ITEM_FAILED");
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
    redirectWithAdminError(
      categoryId
        ? `/dashboard/menu/categories/${categoryId}`
        : "/dashboard/menu/categories/new",
      error,
      "SAVE_CATEGORY_FAILED",
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
    redirectWithAdminError("/dashboard/menu", error, "DELETE_CATEGORY_FAILED");
  }

  redirect("/dashboard/menu");
}
