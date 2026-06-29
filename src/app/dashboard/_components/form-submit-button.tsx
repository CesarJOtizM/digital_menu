"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/cn";
import { useTranslations } from "@/i18n";
import { ButtonSpinner } from "./button-spinner";
import {
  adminActionCancelClass,
  adminActionDangerClass,
  adminActionDangerFilledClass,
  adminActionPrimaryClass,
  adminActionSecondaryClass,
  adminActionSecondaryMdClass,
} from "./admin-action-styles";

type FormSubmitButtonVariant =
  | "secondary"
  | "secondaryMd"
  | "danger"
  | "primary"
  | "dangerFilled"
  | "cancel"
  | "custom";

const variantClasses: Record<FormSubmitButtonVariant, string> = {
  secondary: adminActionSecondaryClass,
  secondaryMd: adminActionSecondaryMdClass,
  danger: adminActionDangerClass,
  primary: adminActionPrimaryClass,
  dangerFilled: adminActionDangerFilledClass,
  cancel: adminActionCancelClass,
  custom:
    "inline-flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40",
};

interface FormSubmitButtonProps {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: FormSubmitButtonVariant;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
  /** Keeps button dimensions while pending — shows spinner over invisible label. */
  preserveSizeWhilePending?: boolean;
}

export function FormSubmitButton({
  children,
  pendingLabel,
  variant = "secondary",
  className,
  disabled = false,
  "aria-label": ariaLabel,
  preserveSizeWhilePending = false,
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();
  const t = useTranslations();
  const isDisabled = pending || disabled;
  const label = pendingLabel === undefined ? t("common.processing") : pendingLabel;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      aria-busy={pending}
      aria-label={ariaLabel}
      className={cn(
        variantClasses[variant],
        preserveSizeWhilePending && pending && "relative",
        className,
      )}
    >
      {preserveSizeWhilePending ? (
        <>
          <span
            className={cn(
              "inline-flex items-center justify-center gap-2",
              pending && "invisible",
            )}
            aria-hidden={pending}
          >
            {children}
          </span>
          {pending ? (
            <span className="absolute inset-0 flex items-center justify-center">
              <ButtonSpinner />
            </span>
          ) : null}
        </>
      ) : pending ? (
        <>
          <ButtonSpinner />
          {label ? <span>{label}</span> : null}
        </>
      ) : (
        children
      )}
    </button>
  );
}
