import { cookies } from "next/headers";
import { getConfig } from "@/config/infrastructure";
import {
  UI_LOCALE_COOKIE,
  defaultLocale,
  isUiLocale,
  uiLocaleFromDeployLocale,
  type UiLocale,
} from "./config";

export async function getUiLocale(): Promise<UiLocale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(UI_LOCALE_COOKIE)?.value;

  if (cookieLocale && isUiLocale(cookieLocale)) {
    return cookieLocale;
  }

  try {
    const config = await getConfig();
    return uiLocaleFromDeployLocale(config.locale);
  } catch {
    return defaultLocale;
  }
}
