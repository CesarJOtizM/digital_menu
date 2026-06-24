export { Menu, MENU_STATUS } from "./entities/menu";
export type { MenuProps, MenuStatus } from "./entities/menu";
export { Category } from "./entities/category";
export type { CategoryProps } from "./entities/category";
export { Item } from "./entities/item";
export type { ItemProps } from "./entities/item";
export { Variant } from "./entities/variant";
export type { VariantProps } from "./entities/variant";
export { ModifierGroup } from "./entities/modifier-group";
export type { ModifierGroupProps, IdFactory } from "./entities/modifier-group";
export { Allergen } from "./entities/allergen";
export type { AllergenProps } from "./entities/allergen";

export { ModifierOption } from "./value-objects/modifier-option";
export type { ModifierOptionProps } from "./value-objects/modifier-option";
export { AvailabilityWindow } from "./value-objects/availability-window";
export type { AvailabilityWindowProps } from "./value-objects/availability-window";

export { AvailabilityResolver } from "./services/availability-resolver";

export {
  MenuDomainError,
  MENU_ERROR_CODE,
  InvalidAvailabilityWindow,
  InvalidModifierGroup,
  ModifierSelectionBelowMin,
  ModifierSelectionAboveMax,
  UnknownModifierOption,
  UnknownVariant,
  DuplicatePosition,
} from "./errors";
export type { MenuErrorCode } from "./errors";
