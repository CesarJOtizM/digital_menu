import { ItemRow } from "./item-row";
import type { CategoryView, ItemView } from "../view-model/menu-view-model";

interface CategorySectionProps {
  readonly category: CategoryView;
  readonly unavailableLabel: string;
  readonly onItemSelect?: (item: ItemView) => void;
  readonly viewDetailAria?: string;
}

/**
 * An Azahar-style category block: a serif heading with a divider rule beneath
 * it, followed by the item rows separated by thin hairline rules. Editorial,
 * spacious — not a card grid.
 */
export function CategorySection({
  category,
  unavailableLabel,
  onItemSelect,
  viewDetailAria,
}: CategorySectionProps) {
  return (
    <section className="mt-10 first:mt-0">
      <h2
        id={`category-${category.id}`}
        className="scroll-mt-28 font-heading text-2xl font-medium tracking-wide text-stone-800"
      >
        {category.name}
      </h2>
      <div className="mt-2 border-b border-stone-300" />

      <div className="divide-y divide-stone-200/70">
        {category.items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            unavailableLabel={unavailableLabel}
            onSelect={onItemSelect}
            viewDetailAria={viewDetailAria}
          />
        ))}
      </div>
    </section>
  );
}
