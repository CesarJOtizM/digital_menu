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
import { normalizeOptionalTranslation } from "@/i18n/resolve-localized-text";

const MENU_ORDER_PATH = "/dashboard/menu/order";
const MENU_ITEMS_PATH = "/dashboard/menu/items";
const MENU_CATEGORIES_PATH = "/dashboard/menu/categories";

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
  revalidatePath(MENU_ORDER_PATH);
  revalidatePath(MENU_ITEMS_PATH);
  revalidatePath(MENU_CATEGORIES_PATH);
  revalidatePath("/dashboard/menu/allergens");
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

function readReturnTo(formData: FormData, fallback: string): string {
  const value = String(formData.get("returnTo") ?? "").trim();
  return value.length > 0 ? value : fallback;
}

export async function toggleItemActiveAction(formData: FormData) {
  await requireAuthUser();

  const categoryId = String(formData.get("categoryId") ?? "");
  const itemId = String(formData.get("itemId") ?? "");

  try {
    await createMenuAdminService().toggleItemActive(categoryId, itemId);
    revalidateMenuPages();
  } catch (error) {
    redirectWithAdminError(MENU_ITEMS_PATH, error, "UPDATE_ITEM_FAILED");
  }

  redirect(MENU_ITEMS_PATH);
}

export async function moveCategoryAction(formData: FormData) {
  await requireAuthUser();

  const categoryId = String(formData.get("categoryId") ?? "");
  const direction = String(formData.get("direction") ?? "") as "up" | "down";
  const returnTo = readReturnTo(formData, MENU_ORDER_PATH);

  try {
    await createMenuAdminService().moveCategory(categoryId, direction);
    revalidateMenuPages();
  } catch (error) {
    redirectWithAdminError(returnTo, error, "REORDER_CATEGORY_FAILED");
  }

  redirect(returnTo);
}

export async function moveItemAction(formData: FormData) {
  await requireAuthUser();

  const categoryId = String(formData.get("categoryId") ?? "");
  const itemId = String(formData.get("itemId") ?? "");
  const direction = String(formData.get("direction") ?? "") as "up" | "down";
  const returnTo = readReturnTo(formData, MENU_ORDER_PATH);

  try {
    await createMenuAdminService().moveItem(categoryId, itemId, direction);
    revalidateMenuPages();
  } catch (error) {
    redirectWithAdminError(returnTo, error, "REORDER_ITEM_FAILED");
  }

  redirect(returnTo);
}

export async function reorderCategoriesAction(
  orderedIds: string[],
): Promise<{ error?: string }> {
  await requireAuthUser();

  try {
    await createMenuAdminService().reorderCategories(orderedIds);
    revalidateMenuPages();
    return {};
  } catch (error) {
    if (error instanceof MenuAdminError) {
      return { error: error.code };
    }
    return { error: "REORDER_CATEGORY_FAILED" };
  }
}

export async function reorderCategoryItemsAction(
  categoryId: string,
  orderedIds: string[],
): Promise<{ error?: string }> {
  await requireAuthUser();

  try {
    await createMenuAdminService().reorderCategoryItems(categoryId, orderedIds);
    revalidateMenuPages();
    return {};
  } catch (error) {
    if (error instanceof MenuAdminError) {
      return { error: error.code };
    }
    return { error: "REORDER_ITEM_FAILED" };
  }
}

export async function saveItemAction(formData: FormData) {
  await requireAuthUser();

  const categoryId = String(formData.get("categoryId") ?? "");
  const itemIdRaw = String(formData.get("itemId") ?? "").trim();
  const itemId = itemIdRaw.length > 0 ? itemIdRaw : null;
  const returnTo = readReturnTo(formData, MENU_ITEMS_PATH);
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
      nameEn: normalizeOptionalTranslation(String(formData.get("nameEn") ?? "")),
      description: String(formData.get("description") ?? ""),
      descriptionEn: normalizeOptionalTranslation(
        String(formData.get("descriptionEn") ?? ""),
      ),
      priceCentavos,
      active: readCheckbox(formData, "active"),
      variants,
      modifierGroups,
      imageSource,
      allergenIds: readAllergenIds(formData),
    });

    revalidateMenuPages();
  } catch (error) {
    redirectWithAdminError(
      itemId
        ? `/dashboard/menu/items/${itemId}?categoryId=${encodeURIComponent(categoryId)}`
        : `/dashboard/menu/items/new?categoryId=${encodeURIComponent(categoryId)}`,
      error,
      "SAVE_ITEM_FAILED",
    );
  }

  redirect(returnTo);
}

export async function deleteItemAction(formData: FormData) {
  await requireAuthUser();

  const categoryId = String(formData.get("categoryId") ?? "");
  const itemId = String(formData.get("itemId") ?? "");

  try {
    await createMenuAdminService().deleteItem(categoryId, itemId);
    revalidateMenuPages();
  } catch (error) {
    redirectWithAdminError(MENU_ITEMS_PATH, error, "DELETE_ITEM_FAILED");
  }

  redirect(MENU_ITEMS_PATH);
}

export async function saveCategoryAction(formData: FormData) {
  await requireAuthUser();

  const categoryIdRaw = String(formData.get("categoryId") ?? "").trim();
  const categoryId = categoryIdRaw.length > 0 ? categoryIdRaw : null;
  const returnTo = readReturnTo(formData, MENU_CATEGORIES_PATH);

  try {
    await createMenuAdminService().saveCategory(categoryId, {
      name: String(formData.get("name") ?? ""),
      nameEn: normalizeOptionalTranslation(String(formData.get("nameEn") ?? "")),
    });

    revalidateMenuPages();
  } catch (error) {
    redirectWithAdminError(
      categoryId
        ? `/dashboard/menu/categories/${categoryId}`
        : "/dashboard/menu/categories/new",
      error,
      "SAVE_CATEGORY_FAILED",
    );
  }

  redirect(returnTo);
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAuthUser();

  const categoryId = String(formData.get("categoryId") ?? "");

  try {
    await createMenuAdminService().deleteCategory(categoryId);
    revalidateMenuPages();
  } catch (error) {
    redirectWithAdminError(MENU_CATEGORIES_PATH, error, "DELETE_CATEGORY_FAILED");
  }

  redirect(MENU_CATEGORIES_PATH);
}
