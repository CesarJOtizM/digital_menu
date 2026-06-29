"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DEFAULT_DEPLOY_CONFIG } from "@/config/infrastructure/settings-config-mapper";
import { UI_LOCALE_COOKIE } from "@/i18n/config";
import { normalizeMenuViewMode } from "@/menu/presentation/view-model/menu-view-mode";
import { prisma } from "@/shared/infrastructure/prisma/client";
import { requireAuthUser } from "@/shared/infrastructure/auth/require-auth-user";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";
import {
  hasDevBypassCookieValue,
  DEV_BYPASS_COOKIE,
  getDevBypassConfig,
} from "@/shared/infrastructure/auth/dev-bypass";
import { cookies } from "next/headers";
import {
  isSettingsCurrency,
  isSettingsLanguage,
  languageToDeployLocale,
  SETTINGS_MENU_VIEW_MODES,
} from "./settings-options";

const SETTINGS_PATH = "/dashboard/settings";
const SETTINGS_SINGLETON_ID = "default";
const MIN_PASSWORD_LENGTH = 8;

function redirectWithSettingsFeedback(
  params: Record<string, string>,
): never {
  const url = new URL(SETTINGS_PATH, "http://localhost");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  redirect(`${url.pathname}${url.search}`);
}

function revalidateSettingsPages(): void {
  revalidatePath(SETTINGS_PATH);
  revalidatePath("/dashboard");
  revalidatePath("/menu");
  revalidatePath("/", "layout");
}

function readCheckbox(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}

export async function updateGeneralSettingsAction(formData: FormData) {
  await requireAuthUser();

  const currency = String(formData.get("currency") ?? "").trim();
  const language = String(formData.get("language") ?? "").trim();
  const defaultMenuViewMode = normalizeMenuViewMode(
    String(formData.get("defaultMenuViewMode") ?? ""),
  );
  const showCurrencySymbol = readCheckbox(formData, "showCurrencySymbol");

  if (!isSettingsCurrency(currency)) {
    redirectWithSettingsFeedback({ error: "INVALID_CURRENCY" });
  }

  if (!isSettingsLanguage(language)) {
    redirectWithSettingsFeedback({ error: "INVALID_LANGUAGE" });
  }

  const locale = languageToDeployLocale(language);

  if (!(SETTINGS_MENU_VIEW_MODES as readonly string[]).includes(defaultMenuViewMode)) {
    redirectWithSettingsFeedback({ error: "INVALID_MENU_VIEW" });
  }

  const existing = await prisma.settings.findUnique({
    where: { id: SETTINGS_SINGLETON_ID },
  });

  if (existing) {
    await prisma.settings.update({
      where: { id: SETTINGS_SINGLETON_ID },
      data: {
        currency,
        locale,
        showCurrencySymbol,
        defaultMenuViewMode,
      },
    });
  } else {
    await prisma.settings.create({
      data: {
        id: SETTINGS_SINGLETON_ID,
        restaurantName: DEFAULT_DEPLOY_CONFIG.restaurantName,
        primaryColor: DEFAULT_DEPLOY_CONFIG.primaryColor,
        secondaryColor: DEFAULT_DEPLOY_CONFIG.secondaryColor,
        timezone: DEFAULT_DEPLOY_CONFIG.timezone,
        currency,
        locale,
        showCurrencySymbol,
        defaultMenuViewMode,
      },
    });
  }

  const cookieStore = await cookies();
  cookieStore.set(UI_LOCALE_COOKIE, language, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidateSettingsPages();
  redirectWithSettingsFeedback({ saved: "general" });
}

export async function changePasswordAction(formData: FormData) {
  await requireAuthUser();

  const cookieStore = await cookies();
  const bypassConfig = getDevBypassConfig();
  if (
    bypassConfig &&
    hasDevBypassCookieValue(cookieStore.get(DEV_BYPASS_COOKIE)?.value)
  ) {
    redirectWithSettingsFeedback({ error: "PASSWORD_DEV_BYPASS" });
  }

  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!newPassword || !confirmPassword) {
    redirectWithSettingsFeedback({ error: "PASSWORD_REQUIRED" });
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    redirectWithSettingsFeedback({ error: "PASSWORD_TOO_SHORT" });
  }

  if (newPassword !== confirmPassword) {
    redirectWithSettingsFeedback({ error: "PASSWORD_MISMATCH" });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    redirectWithSettingsFeedback({ error: "PASSWORD_UPDATE_FAILED" });
  }

  redirectWithSettingsFeedback({ saved: "password" });
}
