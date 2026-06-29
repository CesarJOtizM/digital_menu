import { ItemFormEditor } from "./item-form-editor";
import { getTranslations } from "@/i18n/server";
import { resolveAdminError, type TranslationParams } from "@/i18n";
import type { ItemFormValues } from "@/menu/application/admin/item-form-types";
import type { AllergenOption } from "@/menu/application/admin/allergen-types";

interface ItemFormProps {
  categoryId?: string;
  categoryName?: string;
  categories?: readonly { id: string; name: string }[];
  itemId?: string;
  initial: ItemFormValues;
  allergens: AllergenOption[];
  title: string;
  returnTo?: string;
  error?: string;
  errorParams?: TranslationParams;
}

export async function ItemForm({
  error,
  errorParams,
  ...props
}: ItemFormProps) {
  const { t } = await getTranslations();
  const errorMessage = resolveAdminError(t, error, errorParams) ?? undefined;

  return <ItemFormEditor {...props} error={errorMessage} />;
}
