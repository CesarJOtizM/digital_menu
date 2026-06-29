import type { Item } from "@/menu/domain";
import { IMAGE_SOURCE_TYPE } from "@/shared/domain";
import { formatCentavosForInput } from "@/menu/application/admin/parse-price-input";
import type { ItemFormValues } from "@/menu/application/admin/item-form-types";

export function itemToFormValues(item: Item): ItemFormValues {
  const hasImage = item.imageSource.type !== IMAGE_SOURCE_TYPE.PLACEHOLDER;

  return {
    name: item.name,
    nameEn: item.nameEn ?? "",
    description: item.description,
    descriptionEn: item.descriptionEn ?? "",
    price: formatCentavosForInput(item.basePrice.value),
    active: item.active,
    hasImage,
    imageUrl: hasImage ? item.imageSource.url : null,
    variants: item.variants.map((variant) => ({
      id: variant.id,
      label: variant.label,
      labelEn: variant.labelEn ?? "",
      price: formatCentavosForInput(variant.price.value),
    })),
    modifierGroups: item.modifierGroups.map((group) => ({
      id: group.id,
      name: group.name,
      nameEn: group.nameEn ?? "",
      min: String(group.min),
      max: String(group.max),
      options: group.options.map((option) => ({
        id: option.id,
        name: option.name,
        nameEn: option.nameEn ?? "",
        priceDelta: formatCentavosForInput(option.priceDelta.value),
      })),
    })),
    allergenIds: [...item.allergenIds],
  };
}
