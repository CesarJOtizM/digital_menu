const DOMAIN_ERROR_CODE = {
  INVALID_PRICE: "INVALID_PRICE",
  INVALID_SLUG: "INVALID_SLUG",
  INVALID_IMAGE_TYPE: "INVALID_IMAGE_TYPE",
  IMAGE_TOO_LARGE: "IMAGE_TOO_LARGE",
} as const;

type DomainErrorCode = (typeof DOMAIN_ERROR_CODE)[keyof typeof DOMAIN_ERROR_CODE];

abstract class DomainError extends Error {
  abstract readonly code: DomainErrorCode;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { DOMAIN_ERROR_CODE, DomainError };
export type { DomainErrorCode };
