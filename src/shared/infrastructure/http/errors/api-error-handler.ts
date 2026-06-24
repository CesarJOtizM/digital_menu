import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  DomainError,
  DOMAIN_ERROR_CODE,
  type DomainErrorCode,
} from "@/shared/domain/errors";

const DOMAIN_STATUS_MAP: Record<DomainErrorCode, number> = {
  [DOMAIN_ERROR_CODE.INVALID_PRICE]: 400,
  [DOMAIN_ERROR_CODE.INVALID_SLUG]: 400,
  [DOMAIN_ERROR_CODE.INVALID_IMAGE_TYPE]: 400,
  [DOMAIN_ERROR_CODE.IMAGE_TOO_LARGE]: 400,
};

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation error",
          details: error.issues,
        },
      },
      { status: 400 },
    );
  }

  if (error instanceof DomainError) {
    const status = DOMAIN_STATUS_MAP[error.code] ?? 400;
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status },
    );
  }

  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
    { status: 500 },
  );
}
