const MENU_ERROR_CODE = {
  INVALID_AVAILABILITY_WINDOW: "INVALID_AVAILABILITY_WINDOW",
  INVALID_MODIFIER_GROUP: "INVALID_MODIFIER_GROUP",
  MODIFIER_SELECTION_BELOW_MIN: "MODIFIER_SELECTION_BELOW_MIN",
  MODIFIER_SELECTION_ABOVE_MAX: "MODIFIER_SELECTION_ABOVE_MAX",
  UNKNOWN_MODIFIER_OPTION: "UNKNOWN_MODIFIER_OPTION",
  UNKNOWN_VARIANT: "UNKNOWN_VARIANT",
  DUPLICATE_POSITION: "DUPLICATE_POSITION",
} as const;

type MenuErrorCode = (typeof MENU_ERROR_CODE)[keyof typeof MENU_ERROR_CODE];

/**
 * Base error for the Menu bounded context. Kept context-local (not extending the
 * shared DomainError) so the shared DomainErrorCode union stays closed to the
 * shared kernel — menu codes do not leak into the kernel's vocabulary.
 */
abstract class MenuDomainError extends Error {
  abstract readonly code: MenuErrorCode;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidAvailabilityWindow extends MenuDomainError {
  readonly code = MENU_ERROR_CODE.INVALID_AVAILABILITY_WINDOW;
}

export class InvalidModifierGroup extends MenuDomainError {
  readonly code = MENU_ERROR_CODE.INVALID_MODIFIER_GROUP;
}

export class ModifierSelectionBelowMin extends MenuDomainError {
  readonly code = MENU_ERROR_CODE.MODIFIER_SELECTION_BELOW_MIN;
}

export class ModifierSelectionAboveMax extends MenuDomainError {
  readonly code = MENU_ERROR_CODE.MODIFIER_SELECTION_ABOVE_MAX;
}

export class UnknownModifierOption extends MenuDomainError {
  readonly code = MENU_ERROR_CODE.UNKNOWN_MODIFIER_OPTION;
}

export class UnknownVariant extends MenuDomainError {
  readonly code = MENU_ERROR_CODE.UNKNOWN_VARIANT;
}

export class DuplicatePosition extends MenuDomainError {
  readonly code = MENU_ERROR_CODE.DUPLICATE_POSITION;
}

export { MenuDomainError, MENU_ERROR_CODE };
export type { MenuErrorCode };
