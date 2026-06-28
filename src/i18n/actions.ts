"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { UI_LOCALE_COOKIE, isUiLocale, type UiLocale } from "./config";

export async function setUiLocaleAction(locale: UiLocale): Promise<void> {
  if (!isUiLocale(locale)) {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(UI_LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
}
