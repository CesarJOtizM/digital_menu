"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useFormStatus } from "react-dom";
import { useTranslations } from "@/i18n";
import {
  adminActionCancelClass,
  adminActionDangerClass,
  adminActionDangerMdClass,
} from "../../_components/admin-action-styles";
import { FormSubmitButton } from "../../_components/form-submit-button";

interface ConfirmDeleteButtonProps {
  action: (formData: FormData) => void | Promise<void>;
  fields: Record<string, string>;
  itemName: string;
  buttonClassName?: string;
  size?: "sm" | "md";
}

function DeleteModalActions({ onCancel }: { onCancel: () => void }) {
  const t = useTranslations();
  const { pending } = useFormStatus();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!pending) {
      cancelRef.current?.focus();
    }
  }, [pending]);

  return (
    <div className="mt-6 flex flex-wrap justify-end gap-3">
      <button
        ref={cancelRef}
        type="button"
        onClick={onCancel}
        disabled={pending}
        className={adminActionCancelClass}
      >
        {t("common.cancel")}
      </button>
      <FormSubmitButton variant="dangerFilled">
        {t("common.delete")}
      </FormSubmitButton>
    </div>
  );
}

export function ConfirmDeleteButton({
  action,
  fields,
  itemName,
  buttonClassName,
  size = "md",
}: ConfirmDeleteButtonProps) {
  const t = useTranslations();
  const titleId = useId();
  const descriptionId = useId();
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    },
    [close],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, handleKeyDown]);

  const triggerClass =
    buttonClassName ??
    (size === "sm" ? adminActionDangerClass : adminActionDangerMdClass);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClass}
      >
        {t("common.delete")}
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                role="presentation"
                className="absolute inset-0 bg-neutral-900/40 transition-opacity"
                onClick={close}
              />

              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
                className="relative w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-xl"
              >
                <h2 id={titleId} className="text-lg font-medium text-neutral-900">
                  {t("common.confirmDeleteTitle")}
                </h2>
                <p id={descriptionId} className="mt-2 text-sm text-neutral-600">
                  {t("common.confirmDeleteMessage", { name: itemName })}
                </p>

                <form action={action}>
                  {Object.entries(fields).map(([name, value]) => (
                    <input key={name} type="hidden" name={name} value={value} />
                  ))}
                  <DeleteModalActions onCancel={close} />
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
