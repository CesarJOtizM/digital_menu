interface CategoryNavItem {
  readonly id: string;
  readonly name: string;
}

interface CategoryNavProps {
  readonly categories: readonly CategoryNavItem[];
}

/**
 * Azahar-style category filter strip near the top of the menu. Renders each
 * category as an in-page anchor pill linking to its section. Pure navigation —
 * no ordering controls. Renders nothing when there are no categories.
 */
export function CategoryNav({ categories }: CategoryNavProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Categorías de la carta"
      className="flex flex-wrap justify-center gap-2 border-y border-stone-200 py-3"
    >
      {categories.map((category) => (
        <a
          key={category.id}
          href={`#category-${category.id}`}
          className="rounded-full border border-stone-300 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-stone-600 transition-colors hover:border-stone-500 hover:text-stone-900"
        >
          {category.name}
        </a>
      ))}
    </nav>
  );
}
