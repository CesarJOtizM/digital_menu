export interface VariantFormValue {
  id?: string;
  label: string;
  labelEn?: string;
  price: string;
}

export interface ModifierOptionFormValue {
  id?: string;
  name: string;
  nameEn?: string;
  priceDelta: string;
}

export interface ModifierGroupFormValue {
  id?: string;
  name: string;
  nameEn?: string;
  min: string;
  max: string;
  options: ModifierOptionFormValue[];
}

export interface ItemFormValues {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: string;
  active: boolean;
  hasImage: boolean;
  imageUrl: string | null;
  variants: VariantFormValue[];
  modifierGroups: ModifierGroupFormValue[];
  allergenIds: string[];
}

export const EMPTY_ITEM_FORM_VALUES: ItemFormValues = {
  name: "",
  nameEn: "",
  description: "",
  descriptionEn: "",
  price: "",
  active: true,
  hasImage: false,
  imageUrl: null,
  variants: [],
  modifierGroups: [],
  allergenIds: [],
};
