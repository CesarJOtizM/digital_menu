import { CategoryNav } from "./category-nav";
import { EmptyMenuState } from "./empty-menu-state";
import { MenuViewSwitcher } from "./menu-view-switcher";
import { ViewHomeLink } from "./view-home-link";
import type { MenuUiLabels } from "../menu-ui-labels";
import type { MenuViewModel } from "../view-model/menu-view-model";

interface MenuPageProps {
  readonly viewModel: MenuViewModel;
  readonly labels: MenuUiLabels;
}

export function MenuPage({ viewModel, labels }: MenuPageProps) {
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
          {labels.subtitle}
        </p>
        <h1 className="menu-brand-name mt-2 font-heading text-4xl font-medium tracking-wide sm:text-5xl">
          {viewModel.restaurantName}
        </h1>
      </header>

      <div className="rounded-sm border border-stone-300 bg-stone-50/60 p-6 shadow-sm sm:p-10">
        {viewModel.isEmpty ? (
          <EmptyMenuState title={labels.emptyTitle} body={labels.emptyBody} />
        ) : (
          <>
            <CategoryNav
              categories={navCategories}
              ariaLabel={labels.categoryNavAria}
            />
            <MenuViewSwitcher
              categories={viewModel.categories}
              labels={labels}
            />
          </>
        )}
      </div>
    </main>
  );
}
