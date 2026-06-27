import { CategoryNav } from "./category-nav";
import { CategorySection } from "./category-section";
import { EmptyMenuState } from "./empty-menu-state";
import { ViewHomeLink } from "./view-home-link";
import type { MenuViewModel } from "../view-model/menu-view-model";

interface MenuPageProps {
  readonly viewModel: MenuViewModel;
}

/**
 * The public, read-only Azahar-style menu page. An editorial "printed carte":
 * a hero with the restaurant name, a category filter strip, then serif category
 * sections framed by a thin border. Display-only — no cart/checkout anywhere.
 *
 * When the menu is empty (no published menu / no items) it shows a graceful
 * empty state instead of erroring.
 */
export function MenuPage({ viewModel }: MenuPageProps) {
  const navCategories = viewModel.categories.map((category) => ({
    id: category.id,
    name: category.name,
  }));

  return (
    <main className="animate-menu-enter relative mx-auto max-w-3xl px-4 py-8 sm:py-12">
      {viewModel.homeLink ? (
        <div className="absolute left-4 top-6 sm:top-8">
          <ViewHomeLink homeLink={viewModel.homeLink} />
        </div>
      ) : null}
      <header className="mb-8 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-stone-400">
          Carta
        </p>
        <h1 className="menu-brand-name mt-2 font-heading text-4xl font-medium tracking-wide sm:text-5xl">
          {viewModel.restaurantName}
        </h1>
      </header>

      <div className="rounded-sm border border-stone-300 bg-stone-50/60 p-6 shadow-sm sm:p-10">
        {viewModel.isEmpty ? (
          <EmptyMenuState />
        ) : (
          <>
            <CategoryNav categories={navCategories} />
            <div className="mt-8">
              {viewModel.categories.map((category) => (
                <CategorySection key={category.id} category={category} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
