import "server-only";

import { getConfig } from "@/config/infrastructure";
import type { UiLocale } from "@/i18n/config";
import { normalizeMenuViewMode } from "@/menu/presentation/view-model/menu-view-mode";
import { prisma } from "@/shared/infrastructure/prisma/client";
import {
  hasDevBypassCookieValue,
  DEV_BYPASS_COOKIE,
  getDevBypassConfig,
} from "@/shared/infrastructure/auth/dev-bypass";
import { cookies } from "next/headers";
import { deployLocaleToLanguage } from "./settings-options";

const SETTINGS_SINGLETON_ID = "default";

export interface DashboardSettingsView {
  currency: string;
  language: UiLocale;
  showCurrencySymbol: boolean;
  defaultMenuViewMode: ReturnType<typeof normalizeMenuViewMode>;
  passwordChangeAvailable: boolean;
}

export async function loadDashboardSettings(): Promise<DashboardSettingsView> {
  const [config, row, cookieStore] = await Promise.all([
    getConfig(),
    prisma.settings.findUnique({ where: { id: SETTINGS_SINGLETON_ID } }),
    cookies(),
  ]);

  const bypassConfig = getDevBypassConfig();
  const passwordChangeAvailable =
    !bypassConfig ||
    !hasDevBypassCookieValue(cookieStore.get(DEV_BYPASS_COOKIE)?.value);

  const deployLocale = row?.locale ?? config.locale;

  return {
    currency: row?.currency ?? config.currency,
    language: deployLocaleToLanguage(deployLocale),
    showCurrencySymbol: row?.showCurrencySymbol ?? config.showCurrencySymbol,
    defaultMenuViewMode: normalizeMenuViewMode(
      row?.defaultMenuViewMode ?? config.defaultMenuViewMode,
    ),
    passwordChangeAvailable,
  };
}
