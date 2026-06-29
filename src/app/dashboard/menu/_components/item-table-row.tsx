import Link from "next/link";
import type { UiLocale } from "@/i18n/config";
import type { PriceFormatter } from "@/shared/domain";
import type { Category, Item } from "@/menu/domain";
import {
  localizedDescription,
  localizedName,
} from "@/menu/presentation/localize-menu-content";
import { adminActionDangerClass, adminActionSecondaryClass } from "../../_components/admin-action-styles";
import { deleteItemAction } from "../actions";
import { ConfirmDeleteButton } from "./confirm-delete-button";
import { ItemStatusIcon } from "./item-status-icon";
import {
  itemsTableActionsCellClass,
  itemsTableColWidths,
  itemsTableDeleteActionClass,
  itemsTableEditActionClass,
} from "./items-table-styles";
import { ToggleItemActiveButton } from "./toggle-item-active-button";

interface ItemRowActionsProps {
  categoryId: string;
  itemId: string;
  itemName: string;
  active: boolean;
  editLabel: string;
}

export function ItemRowActions({
  categoryId,
  itemId,
  itemName,
  active,
  editLabel,
}: ItemRowActionsProps) {
  return (
    <>
      <ToggleItemActiveButton
        categoryId={categoryId}
        itemId={itemId}
        active={active}
      />
      <Link
        href={`/dashboard/menu/items/${itemId}?categoryId=${categoryId}`}
        className={`${adminActionSecondaryClass} ${itemsTableEditActionClass}`}
      >
        {editLabel}
      </Link>
      <ConfirmDeleteButton
        action={deleteItemAction}
        fields={{ categoryId, itemId }}
        itemName={itemName}
        size="sm"
        buttonClassName={`${adminActionDangerClass} ${itemsTableDeleteActionClass}`}
      />
    </>
  );
}

interface ItemTableRowProps {
  category: Category;
  item: Item;
  locale: UiLocale;
  formatPrice: PriceFormatter;
  labels: {
    active: string;
    inactive: string;
    edit: string;
  };
}

export function ItemTableRow({
  category,
  item,
  locale,
  formatPrice,
  labels,
}: ItemTableRowProps) {
  const itemName = localizedName(item, locale);
  const itemDescription = localizedDescription(item, locale);
  const categoryName = localizedName(category, locale);

  return (
    <tr className="hover:bg-neutral-50/50">
      <td className="px-4 py-4 align-middle md:px-5">
        <p className="truncate font-medium text-neutral-900">{itemName}</p>
        {itemDescription ? (
          <p className="mt-0.5 truncate text-sm text-neutral-500">{itemDescription}</p>
        ) : null}
      </td>

      <td className="px-4 py-4 align-middle md:px-5">
        <span className="inline-flex max-w-full truncate rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
          {categoryName}
        </span>
      </td>

      <td className="px-4 py-4 align-middle text-sm tabular-nums text-neutral-700 md:px-5">
        {item.basePrice.toDisplay(formatPrice)}
      </td>

      <td className="px-2 py-4 align-middle md:px-3">
        <div className="flex justify-center">
          <ItemStatusIcon
            active={item.active}
            activeLabel={labels.active}
            inactiveLabel={labels.inactive}
          />
        </div>
      </td>

      <td className="px-4 py-4 align-middle md:px-5">
        <div className={itemsTableActionsCellClass}>
          <ItemRowActions
            categoryId={category.id}
            itemId={item.id}
            itemName={itemName}
            active={item.active}
            editLabel={labels.edit}
          />
        </div>
      </td>
    </tr>
  );
}

interface ItemMobileCardProps extends ItemTableRowProps {}

export function ItemMobileCard(props: ItemTableRowProps) {
  const { category, item, locale, formatPrice, labels } = props;
  const itemName = localizedName(item, locale);
  const itemDescription = localizedDescription(item, locale);
  const categoryName = localizedName(category, locale);

  return (
    <li className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-neutral-900">{itemName}</p>
          {itemDescription ? (
            <p className="mt-0.5 line-clamp-2 text-sm text-neutral-500">
              {itemDescription}
            </p>
          ) : null}
        </div>
        <ItemStatusIcon
          active={item.active}
          activeLabel={labels.active}
          inactiveLabel={labels.inactive}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
          {categoryName}
        </span>
        <span className="text-sm tabular-nums text-neutral-700">
          {item.basePrice.toDisplay(formatPrice)}
        </span>
      </div>

      <div className={`mt-4 ${itemsTableActionsCellClass} flex-wrap justify-start`}>
        <ItemRowActions
          categoryId={category.id}
          itemId={item.id}
          itemName={itemName}
          active={item.active}
          editLabel={labels.edit}
        />
      </div>
    </li>
  );
}
