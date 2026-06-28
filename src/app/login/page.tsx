import { redirect } from "next/navigation";
import { getTranslations } from "@/i18n/server";
import { LanguageSwitcher, resolveLoginError } from "@/i18n";
import {
  getAuthUser,
  isDevBypassAvailable,
  signInWithDevBypassAction,
  signInWithGoogleAction,
  signInWithPasswordAction,
} from "@/shared/infrastructure/auth";

export async function generateMetadata() {
  const { t } = await getTranslations();
  return { title: t("login.title") };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ t }, user, { error }] = await Promise.all([
    getTranslations(),
    getAuthUser(),
    searchParams,
  ]);

  if (user) {
    redirect("/dashboard");
  }

  const errorMessage = resolveLoginError(t, error);
  const devBypassAvailable = isDevBypassAvailable();

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-sm">
        <div className="text-center">
          <h1 className="text-2xl font-medium">{t("login.heading")}</h1>
          <p className="mt-1 text-sm text-neutral-500">{t("login.subtitle")}</p>
        </div>

        {errorMessage ? (
          <p
            role="alert"
            className="mt-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {errorMessage}
          </p>
        ) : null}

        {devBypassAvailable ? (
          <form action={signInWithDevBypassAction} className="mt-8">
            <button
              type="submit"
              className="w-full rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100"
            >
              {t("login.devBypass")}
            </button>
            <p className="mt-2 text-xs text-amber-700">{t("login.devBypassHint")}</p>
          </form>
        ) : null}

        <form action={signInWithGoogleAction} className="mt-8">
          <button
            type="submit"
            className="w-full rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            {t("login.google")}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-neutral-200" />
          <span className="text-xs text-neutral-400">{t("login.divider")}</span>
          <span className="h-px flex-1 bg-neutral-200" />
        </div>

        <form action={signInWithPasswordAction} className="space-y-4">
          <div className="space-y-1 text-left">
            <label htmlFor="email" className="text-sm font-medium">
              {t("login.email")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />
          </div>

          <div className="space-y-1 text-left">
            <label htmlFor="password" className="text-sm font-medium">
              {t("login.password")}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            {t("login.submit")}
          </button>
        </form>
      </div>
    </main>
  );
}
