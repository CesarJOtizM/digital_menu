import Link from "next/link";
import { createPriceFormatter } from "@/config/domain";
import { getConfig } from "@/config/infrastructure";
import { getTranslations } from "@/i18n/server";
import type { Menu } from "@/menu/domain";
import { ItemMobileCard, ItemTableRow } from "./item-table-row";
import { itemsTableColWidths } from "./items-table-styles";

interface ItemsMasterListProps {
  menu: Menu;
}

export async function ItemsMasterList({ menu }: ItemsMasterListProps) {
  const [{ t, locale }, config] = await Promise.all([getTranslations(), getConfig()]);
  const formatPrice = createPriceFormatter({
    locale: config.locale,
    currency: config.currency,
    showSymbol: config.showCurrencySymbol,
  });

  const rows = menu.categories.flatMap((category) =>
    category.items.map((item) => ({ category, item })),
  );

  const labels = {
    active: t("dashboard.active"),
    inactive: t("dashboard.inactive"),
    edit: t("common.edit"),
  };

  if (menu.categories.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/80 px-6 py-12 text-center">
        <p className="text-sm text-neutral-600">{t("dashboard.noCategoriesForItems")}</p>
        <Link
          href="/dashboard/menu/categories/new"
          className="mt-4 inline-flex rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-white"
        >
          {t("dashboard.newCategory")}
        </Link>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/80 px-6 py-12 text-center">
        <p className="text-sm text-neutral-600">{t("dashboard.noItemsYet")}</p>
        <Link
          href="/dashboard/menu/items/new"
          className="mt-4 inline-flex rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          {t("dashboard.addFirstItem")}
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      {/* Mobile: cards */}
      <ul className="divide-y divide-neutral-100 md:hidden">
        {rows.map(({ category, item }) => (
          <ItemMobileCard
            key={item.id}
            category={category}
            item={item}
            locale={locale}
            formatPrice={formatPrice}
            labels={labels}
          />
        ))}
      </ul>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] table-fixed border-collapse">
          <colgroup>
            <col style={{ width: itemsTableColWidths.name }} />
            <col style={{ width: itemsTableColWidths.category }} />
            <col style={{ width: itemsTableColWidths.price }} />
            <col style={{ width: itemsTableColWidths.status }} />
            <col style={{ width: itemsTableColWidths.actions }} />
          </colgroup>
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50/80 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3 font-medium md:px-5">{t("dashboard.itemsTableName")}</th>
              <th className="px-4 py-3 font-medium md:px-5">
                {t("dashboard.itemsTableCategory")}
              </th>
              <th className="px-4 py-3 font-medium md:px-5">{t("dashboard.itemsTablePrice")}</th>
              <th className="px-2 py-3 text-center font-medium md:px-3">
                {t("dashboard.itemsTableStatus")}
              </th>
              <th className="px-4 py-3 text-right font-medium md:px-5">
                {t("dashboard.itemsTableActions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map(({ category, item }) => (
              <ItemTableRow
                key={item.id}
                category={category}
                item={item}
                locale={locale}
                formatPrice={formatPrice}
                labels={labels}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
