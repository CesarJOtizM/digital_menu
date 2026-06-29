import { resolveAdminError, type Translator } from "@/i18n";
import { getTranslations } from "@/i18n/server";
import { GeneralSettingsForm } from "./_components/general-settings-form";
import { PasswordChangeForm } from "./_components/password-change-form";
import { loadDashboardSettings } from "./load-settings";

interface SettingsPageProps {
  searchParams: Promise<{
    error?: string;
    saved?: string;
  }>;
}

export async function generateMetadata() {
  const { t } = await getTranslations();
  return { title: t("dashboard.settings.title") };
}

function resolveSavedMessage(
  t: Translator,
  saved: string | undefined,
): string | null {
  if (saved === "general") {
    return t("dashboard.settings.savedGeneral");
  }
  if (saved === "password") {
    return t("dashboard.settings.savedPassword");
  }
  return null;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const [{ t }, settings, params] = await Promise.all([
    getTranslations(),
    loadDashboardSettings(),
    searchParams,
  ]);

  const errorMessage = resolveAdminError(t, params.error);
  const savedMessage = resolveSavedMessage(t, params.saved);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="border-b border-neutral-200 pb-6">
        <h1 className="text-2xl font-medium">{t("dashboard.settings.title")}</h1>
        <p className="mt-1 text-sm text-neutral-600">
          {t("dashboard.settings.description")}
        </p>
      </header>

      {errorMessage ? (
        <p
          role="alert"
          className="mt-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {errorMessage}
        </p>
      ) : null}

      {savedMessage ? (
        <p
          role="status"
          className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
        >
          {savedMessage}
        </p>
      ) : null}

      <section className="mt-8 space-y-4">
        <div>
          <h2 className="text-lg font-medium">{t("dashboard.settings.regionalSection")}</h2>
          <p className="mt-1 text-sm text-neutral-600">
            {t("dashboard.settings.regionalSectionHint")}
          </p>
        </div>
        <GeneralSettingsForm settings={settings} />
      </section>

      <section className="mt-10 space-y-4">
        <div>
          <h2 className="text-lg font-medium">{t("dashboard.settings.passwordSection")}</h2>
          <p className="mt-1 text-sm text-neutral-600">
            {t("dashboard.settings.passwordSectionHint")}
          </p>
        </div>
        <PasswordChangeForm available={settings.passwordChangeAvailable} />
      </section>
    </main>
  );
}
