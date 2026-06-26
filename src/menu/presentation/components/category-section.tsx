import { ItemRow } from "./item-row";
import type { CategoryView } from "../view-model/menu-view-model";

interface CategorySectionProps {
  readonly category: CategoryView;
}

/**
 * An Azahar-style category block: a serif heading with a divider rule beneath
 * it, followed by the item rows separated by thin hairline rules. Editorial,
 * spacious — not a card grid.
 */
export function CategorySection({ category }: CategorySectionProps) {
  return (
    <section className="mt-10 first:mt-0" id={`category-${category.id}`}>
      <h2 className="font-heading text-2xl font-medium tracking-wide text-stone-800">
        {category.name}
      </h2>
      <div className="mt-2 border-b border-stone-300" />

      <div className="divide-y divide-stone-200/70">
        {category.items.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
