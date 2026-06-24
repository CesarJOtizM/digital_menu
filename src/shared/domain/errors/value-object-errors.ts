import { DOMAIN_ERROR_CODE, DomainError } from "./domain-error";

export class InvalidPrice extends DomainError {
  readonly code = DOMAIN_ERROR_CODE.INVALID_PRICE;
}

export class InvalidSlug extends DomainError {
  readonly code = DOMAIN_ERROR_CODE.INVALID_SLUG;
}

export class InvalidImageType extends DomainError {
  readonly code = DOMAIN_ERROR_CODE.INVALID_IMAGE_TYPE;
}

export class ImageTooLarge extends DomainError {
  readonly code = DOMAIN_ERROR_CODE.IMAGE_TOO_LARGE;
}
