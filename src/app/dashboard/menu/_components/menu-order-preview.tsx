import { createPriceFormatter } from "@/config/domain";
import { getConfig } from "@/config/infrastructure";
import { getTranslations } from "@/i18n/server";
import type { Menu } from "@/menu/domain";
import {
  localizedDescription,
  localizedName,
} from "@/menu/presentation/localize-menu-content";
import { MenuOrderEditor } from "./menu-order-editor";
import type { MenuOrderCategory } from "./menu-order-types";

interface MenuOrderPreviewProps {
  menu: Menu;
}

export async function MenuOrderPreview({ menu }: MenuOrderPreviewProps) {
  const [{ t, locale }, config] = await Promise.all([getTranslations(), getConfig()]);
  const formatPrice = createPriceFormatter({
    locale: config.locale,
    currency: config.currency,
    showSymbol: config.showCurrencySymbol,
  });
  const categories = menu.categories;

  if (categories.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/70 px-6 py-12 text-center">
        <p className="text-sm text-stone-600">{t("dashboard.orderEmptyCategories")}</p>
      </div>
    );
  }

  const initialCategories: MenuOrderCategory[] = categories.map((category) => ({
    id: category.id,
    name: localizedName(category, locale),
    items: category.items.map((item) => ({
      id: item.id,
      name: localizedName(item, locale),
      description: localizedDescription(item, locale),
      price: item.basePrice.toDisplay(formatPrice),
      active: item.active,
    })),
  }));

  return <MenuOrderEditor initialCategories={initialCategories} />;
}
