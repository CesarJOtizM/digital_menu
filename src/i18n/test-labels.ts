import { createTranslator, getMessages } from "./translate";
import type { LandingNavLabels } from "@/landing/presentation/landing-navigation";
import type { MenuUiLabels } from "@/menu/presentation/menu-ui-labels";

const t = createTranslator(getMessages("es"));

export const testLandingNavLabels: LandingNavLabels = {
  menu: t("landing.menu"),
  about: t("landing.about"),
  contact: t("landing.contact"),
  reservations: t("landing.reservations"),
  viewMenu: t("landing.viewMenu"),
};

export const testLandingPageLabels = {
  nav: testLandingNavLabels,
  footerMenu: t("landing.footerMenu"),
  footerPage: t("landing.footerPage"),
  followUs: t("landing.followUs"),
  copyright: t("landing.copyright", { year: 2026 }),
  mainNavAria: t("landing.mainNavAria"),
  socialLinksAria: t("landing.socialLinksAria"),
  mapTitle: (address: string) => t("landing.mapTitle", { address }),
  openInMaps: t("landing.openInMaps"),
};

export const testMenuUiLabels: MenuUiLabels = {
  subtitle: t("menu.subtitle"),
  emptyTitle: t("menu.emptyTitle"),
  emptyBody: t("menu.emptyBody"),
  categoryNavAria: t("menu.categoryNavAria"),
  unavailable: t("menu.unavailable"),
  home: t("common.home"),
};

export const testUnavailableLabel = t("menu.unavailable");
