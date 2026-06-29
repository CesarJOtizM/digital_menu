"use client";

import { useTranslations } from "@/i18n";
import { ActionForm } from "../../_components/action-form";
import { FormSubmitButton } from "../../_components/form-submit-button";

type MoveAction = (formData: FormData) => Promise<void>;

interface OrderButtonsProps {
  action: MoveAction;
  hiddenFields: Record<string, string>;
  isFirst: boolean;
  isLast: boolean;
  variant?: "default" | "prominent";
}

function DirectionButton({
  direction,
  disabled,
  variant,
}: {
  direction: "up" | "down";
  disabled: boolean;
  variant: "default" | "prominent";
}) {
  const t = useTranslations();
  const prominent = variant === "prominent";
  const buttonClass = prominent
    ? "flex h-10 w-10 items-center justify-center rounded-lg border border-stone-300 bg-white text-base text-stone-700 shadow-sm transition-colors hover:border-stone-400 hover:bg-stone-50 disabled:cursor-not-allowed disabled:border-stone-200 disabled:bg-stone-100 disabled:text-stone-400"
    : "flex h-7 w-7 items-center justify-center rounded border border-neutral-300 bg-white text-xs text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400";

  return (
    <FormSubmitButton
      variant="custom"
      disabled={disabled}
      className={buttonClass}
      pendingLabel=""
      aria-label={direction === "up" ? t("dashboard.moveUp") : t("dashboard.moveDown")}
    >
      {direction === "up" ? "↑" : "↓"}
    </FormSubmitButton>
  );
}

export function OrderButtons({
  action,
  hiddenFields,
  isFirst,
  isLast,
  variant = "default",
}: OrderButtonsProps) {
  const t = useTranslations();
  const prominent = variant === "prominent";

  const renderForm = (direction: "up" | "down", disabled: boolean) => (
    <ActionForm
      action={action}
      fields={{
        ...hiddenFields,
        returnTo: "/dashboard/menu/order",
        direction,
      }}
    >
      <DirectionButton direction={direction} disabled={disabled} variant={variant} />
    </ActionForm>
  );

  return (
    <div
      className={
        prominent
          ? "flex shrink-0 flex-col gap-1.5"
          : "flex shrink-0 flex-col gap-0.5"
      }
      aria-label={t("dashboard.reorderControls")}
    >
      {renderForm("up", isFirst)}
      {renderForm("down", isLast)}
    </div>
  );
}
