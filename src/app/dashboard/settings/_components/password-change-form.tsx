import { getTranslations } from "@/i18n/server";
import { FormSubmitButton } from "../../_components/form-submit-button";
import { changePasswordAction } from "../actions";

interface PasswordChangeFormProps {
  available: boolean;
}

export async function PasswordChangeForm({ available }: PasswordChangeFormProps) {
  const { t } = await getTranslations();

  if (!available) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-5">
        <p className="text-sm text-neutral-600">
          {t("dashboard.settings.passwordDevBypassHint")}
        </p>
      </div>
    );
  }

  return (
    <form
      action={changePasswordAction}
      className="space-y-5 rounded-lg border border-neutral-200 bg-white p-5"
    >
      <div>
        <label htmlFor="newPassword" className="text-sm font-medium">
          {t("dashboard.settings.newPassword")}
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="mt-2 w-full max-w-md rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          {t("dashboard.settings.confirmPassword")}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="mt-2 w-full max-w-md rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <p className="mt-1 text-sm text-neutral-600">
          {t("dashboard.settings.passwordHint")}
        </p>
      </div>

      <div className="pt-2">
        <FormSubmitButton variant="primary">
          {t("dashboard.settings.changePassword")}
        </FormSubmitButton>
      </div>
    </form>
  );
}
