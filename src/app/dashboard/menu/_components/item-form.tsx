import { ItemFormEditor } from "./item-form-editor";
import type { ItemFormValues } from "@/menu/application/admin/item-form-types";
import type { AllergenOption } from "@/menu/infrastructure/persistence/load-allergens";

interface ItemFormProps {
  categoryId: string;
  itemId?: string;
  initial: ItemFormValues;
  allergens: AllergenOption[];
  title: string;
  returnTo?: string;
  error?: string;
}

export function ItemForm(props: ItemFormProps) {
  return <ItemFormEditor {...props} />;
}
