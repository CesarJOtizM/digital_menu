"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AllergenAdminService } from "@/menu/application/admin/allergen-admin-service";
import { MenuAdminError } from "@/menu/application/admin/menu-admin-service";
import { requireAuthUser } from "@/shared/infrastructure/auth/require-auth-user";
import { normalizeOptionalTranslation } from "@/i18n/resolve-localized-text";

function revalidateAllergenPages(): void {
  revalidatePath("/dashboard/menu");
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

export async function saveAllergenAction(formData: FormData) {
  await requireAuthUser();

  const allergenIdRaw = String(formData.get("allergenId") ?? "").trim();
  const allergenId = allergenIdRaw.length > 0 ? allergenIdRaw : null;
  const returnTo = String(formData.get("returnTo") ?? "/dashboard/menu/allergens");
  const iconRaw = String(formData.get("icon") ?? "").trim();

  try {
    await new AllergenAdminService().save(allergenId, {
      name: String(formData.get("name") ?? ""),
      nameEn: normalizeOptionalTranslation(String(formData.get("nameEn") ?? "")),
      icon: iconRaw.length > 0 ? iconRaw : null,
    });

    revalidateAllergenPages();
  } catch (error) {
    redirectWithAdminError(
      allergenId
        ? `/dashboard/menu/allergens/${allergenId}`
        : "/dashboard/menu/allergens/new",
      error,
      "SAVE_ALLERGEN_FAILED",
    );
  }

  redirect(returnTo);
}

export async function deleteAllergenAction(formData: FormData) {
  await requireAuthUser();

  const allergenId = String(formData.get("allergenId") ?? "");

  try {
    await new AllergenAdminService().delete(allergenId);
    revalidateAllergenPages();
  } catch (error) {
    redirectWithAdminError("/dashboard/menu/allergens", error, "DELETE_ALLERGEN_FAILED");
  }

  redirect("/dashboard/menu/allergens");
}
