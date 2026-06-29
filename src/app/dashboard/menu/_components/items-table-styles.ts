/** Fixed column widths — keep in sync with <colgroup> in items-master-list. */
export const itemsTableColWidths = {
  name: "32%",
  category: "16%",
  price: "11%",
  status: "6%",
  actions: "35%",
} as const;

/** Action buttons: fixed width so loaders never shift the table. */
export const itemsTableToggleActionClass =
  "relative w-[7.25rem] shrink-0 justify-center overflow-hidden whitespace-nowrap";

export const itemsTableEditActionClass =
  "w-[4.75rem] shrink-0 justify-center";

export const itemsTableDeleteActionClass =
  "w-[5.5rem] shrink-0 justify-center";

export const itemsTableActionsCellClass =
  "flex flex-nowrap items-center justify-end gap-2";
