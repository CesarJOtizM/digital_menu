import { ModifierGroup, ModifierOption, Variant } from "@/menu/domain";
import type { IdGenerator } from "@/menu/application/ports/id-generator";
import { Price } from "@/shared/domain";
import { MenuAdminError } from "./menu-admin-service";
import { parsePriceInputToCentavos } from "./parse-price-input";
import type {
  ModifierGroupFormValue,
  ModifierOptionFormValue,
  VariantFormValue,
} from "./item-form-types";

function parseJsonArray<T>(raw: string, errorCode: string): T[] {
  if (!raw.trim()) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new MenuAdminError(errorCode);
    }
    return parsed as T[];
  } catch (error) {
    if (error instanceof MenuAdminError) throw error;
    throw new MenuAdminError(errorCode);
  }
}

export function parseVariantsFromJson(
  raw: string,
  ids: IdGenerator,
): Variant[] {
  const values = parseJsonArray<VariantFormValue>(raw, "INVALID_VARIANTS_JSON");

  return values
    .filter((value) => value.label.trim().length > 0)
    .map((value, index) =>
      Variant.create({
        id: value.id?.trim() || ids.next(),
        label: value.label.trim(),
        price: Price.create(parsePriceInputToCentavos(value.price)),
        position: index,
      }),
    );
}

function parseModifierOptions(
  options: ModifierOptionFormValue[],
  ids: IdGenerator,
): ModifierOption[] {
  return options
    .filter((option) => option.name.trim().length > 0)
    .map((option) =>
      ModifierOption.create({
        id: option.id?.trim() || ids.next(),
        name: option.name.trim(),
        priceDelta: Price.create(parsePriceInputToCentavos(option.priceDelta || "0")),
      }),
    );
}

export function parseModifierGroupsFromJson(
  raw: string,
  ids: IdGenerator,
): ModifierGroup[] {
  const values = parseJsonArray<ModifierGroupFormValue>(
    raw,
    "INVALID_MODIFIERS_JSON",
  );

  return values
    .filter((group) => group.name.trim().length > 0)
    .map((group, index) => {
      const options = parseModifierOptions(group.options ?? [], ids);
      const min = Number(group.min);
      const max = Number(group.max);
      const groupName = group.name.trim();

      if (!Number.isInteger(min) || min < 0) {
        throw new MenuAdminError("MODIFIER_MIN_INVALID", { groupName });
      }
      if (!Number.isInteger(max) || max < min) {
        throw new MenuAdminError("MODIFIER_MAX_INVALID", { groupName });
      }

      try {
        return ModifierGroup.create({
          id: group.id?.trim() || ids.next(),
          name: groupName,
          min,
          max,
          position: index,
          options,
        });
      } catch {
        throw new MenuAdminError("MODIFIER_GROUP_INVALID", { groupName });
      }
    });
}
