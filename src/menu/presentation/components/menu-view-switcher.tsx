"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import { CardGrid } from "./card-grid";
import { CategorySection } from "./category-section";
import { ItemDetailSheet } from "./item-detail-sheet";
import type { MenuUiLabels } from "../menu-ui-labels";
import {
  DEFAULT_MENU_VIEW_MODE,
  normalizeMenuViewMode,
  type MenuViewMode,
} from "../view-model/menu-view-mode";
import type { CategoryView, ItemView } from "../view-model/menu-view-model";

const STORAGE_KEY = "menu:view-mode";

function createViewModeStore(defaultMode: MenuViewMode) {
  return {
    subscribe(onChange: () => void): () => void {
      if (typeof window === "undefined") {
        return () => {};
      }
      window.addEventListener("storage", onChange);
      window.addEventListener("menu:view-mode-change", onChange);
      return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener("menu:view-mode-change", onChange);
      };
    },
    getSnapshot(): MenuViewMode {
      return normalizeMenuViewMode(
        window.localStorage.getItem(STORAGE_KEY),
        defaultMode,
      );
    },
    getServerSnapshot(): MenuViewMode {
      return defaultMode;
    },
    set(mode: MenuViewMode): void {
      window.localStorage.setItem(STORAGE_KEY, mode);
      window.dispatchEvent(new Event("menu:view-mode-change"));
    },
  };
}

interface MenuViewSwitcherProps {
  readonly categories: readonly CategoryView[];
  readonly labels: MenuUiLabels;
  readonly defaultViewMode?: MenuViewMode;
}

interface ViewToggleProps {
  readonly mode: MenuViewMode;
  readonly onSelect: (mode: MenuViewMode) => void;
  readonly labels: MenuUiLabels;
}

function ViewToggle({ mode, onSelect, labels }: ViewToggleProps) {
  const options: ReadonlyArray<{ value: MenuViewMode; label: string }> = [
    { value: "list", label: labels.listView },
    { value: "cards", label: labels.cardsView },
  ];

  return (
    <div
      role="group"
      aria-label={labels.viewToggleAria}
      className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-stone-50/80 p-1"
    >
      {options.map((option) => {
        const active = option.value === mode;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(option.value)}
            className={cn(
              "rounded-full px-3.5 py-1 text-xs font-medium uppercase tracking-wide transition-colors",
              active
                ? "bg-stone-800 text-stone-50"
                : "text-stone-500 hover:text-stone-800",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Client-side layout switcher for the public menu. It is the ONLY interactive
 * piece in the menu tree: the server builds the pure {@link CategoryView} array
 * (plain serializable data) and hands it down as a prop, so the rest of the tree
 * stays server-rendered.
 *
 * SSR-safe: the first render ALWAYS uses the brand default ({@link
 * DEFAULT_MENU_VIEW_MODE} = "list"), matching what the server emits. A mount
 * effect then reads the persisted preference from localStorage and updates the
 * mode — so there is no hydration mismatch, only a possible post-hydration
 * switch when the visitor previously chose cards.
 */
export function MenuViewSwitcher({
  categories,
  labels,
  defaultViewMode = DEFAULT_MENU_VIEW_MODE,
}: MenuViewSwitcherProps) {
  const [selectedItem, setSelectedItem] = useState<ItemView | null>(null);
  const viewModeStore = useMemo(
    () => createViewModeStore(defaultViewMode),
    [defaultViewMode],
  );

  const mode = useSyncExternalStore(
    viewModeStore.subscribe,
    viewModeStore.getSnapshot,
    viewModeStore.getServerSnapshot,
  );

  const selectMode = useCallback(
    (next: MenuViewMode) => {
      viewModeStore.set(next);
    },
    [viewModeStore],
  );

  const handleItemSelect = useCallback((item: ItemView) => {
    setSelectedItem(item);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const viewDetailAria = labels.itemDetail.viewDetailAria;

  return (
    <div>
      <div className="mt-6 flex justify-center">
        <ViewToggle mode={mode} onSelect={selectMode} labels={labels} />
      </div>

      <div className="mt-6">
        {mode === "cards" ? (
          <CardGrid
            categories={categories}
            unavailableLabel={labels.unavailable}
            onItemSelect={handleItemSelect}
            viewDetailAria={viewDetailAria}
          />
        ) : (
          <div>
            {categories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                unavailableLabel={labels.unavailable}
                onItemSelect={handleItemSelect}
                viewDetailAria={viewDetailAria}
              />
            ))}
          </div>
        )}
      </div>

      <ItemDetailSheet
        item={selectedItem}
        labels={labels.itemDetail}
        onClose={handleCloseDetail}
      />
    </div>
  );
}
