import { ItemCard } from "./item-card";
import type { CategoryView } from "../view-model/menu-view-model";

interface CardGridProps {
  readonly categories: readonly CategoryView[];
  readonly unavailableLabel: string;
}

/**
 * The image-forward grid layout. It mirrors {@link CategorySection}'s data
 * handling — one serif heading per category, items rendered in order — but lays
 * the items out as a responsive grid of {@link ItemCard}s instead of editorial
 * rows. Consumes the SAME view-model categories as the list layout.
 */
export function CardGrid({ categories, unavailableLabel }: CardGridProps) {
  return (
    <div>
      {categories.map((category) => (
        <section
          key={category.id}
          className="mt-10 first:mt-0"
          id={`category-${category.id}`}
        >
          <h2 className="font-heading text-2xl font-medium tracking-wide text-stone-800">
            {category.name}
          </h2>
          <div className="mt-2 border-b border-stone-300" />

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {category.items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                unavailableLabel={unavailableLabel}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
