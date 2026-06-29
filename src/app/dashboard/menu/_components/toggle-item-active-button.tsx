"use client";

import { useTranslations } from "@/i18n";
import { ActionForm } from "../../_components/action-form";
import { FormSubmitButton } from "../../_components/form-submit-button";
import { toggleItemActiveAction } from "../actions";
import { itemsTableToggleActionClass } from "./items-table-styles";

interface ToggleItemActiveButtonProps {
  categoryId: string;
  itemId: string;
  active: boolean;
}

export function ToggleItemActiveButton({
  categoryId,
  itemId,
  active,
}: ToggleItemActiveButtonProps) {
  const t = useTranslations();

  return (
    <ActionForm
      action={toggleItemActiveAction}
      fields={{ categoryId, itemId }}
      className="shrink-0"
    >
      <FormSubmitButton
        variant="secondary"
        className={itemsTableToggleActionClass}
        preserveSizeWhilePending
        aria-label={active ? t("dashboard.deactivate") : t("dashboard.activate")}
      >
        {active ? t("dashboard.deactivate") : t("dashboard.activate")}
      </FormSubmitButton>
    </ActionForm>
  );
}
