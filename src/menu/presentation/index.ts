export {
  localizedDescription,
  localizedLabel,
  localizedName,
} from "./localize-menu-content";

export {
  buildMenuViewModel,
  type MenuViewModel,
  type HomeLinkView,
  type CategoryView,
  type ItemView,
  type VariantView,
  type ModifierGroupView,
  type ModifierOptionView,
  type BuildMenuViewModelDeps,
} from "./view-model/menu-view-model";

export {
  MENU_VIEW_MODES,
  DEFAULT_MENU_VIEW_MODE,
  isMenuViewMode,
  normalizeMenuViewMode,
  type MenuViewMode,
} from "./view-model/menu-view-mode";

export { type ItemDetailLabels, type MenuUiLabels } from "./menu-ui-labels";
export { MenuPage } from "./components/menu-page";
export { CategorySection } from "./components/category-section";
export { CardGrid } from "./components/card-grid";
export { ItemRow } from "./components/item-row";
export { ItemCard } from "./components/item-card";
export { MenuViewSwitcher } from "./components/menu-view-switcher";
export { EmptyMenuState } from "./components/empty-menu-state";
export { CategoryNav } from "./components/category-nav";
