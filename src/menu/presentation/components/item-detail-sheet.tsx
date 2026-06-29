"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import type { ItemDetailLabels } from "../menu-ui-labels";
import type { ItemView } from "../view-model/menu-view-model";
import { ItemDetailContent } from "./item-detail-content";

export interface ItemDetailSheetProps {
  readonly item: ItemView | null;
  readonly labels: ItemDetailLabels;
  readonly onClose: () => void;
}

/**
 * Lateral slide-out panel for a single menu item. Opens from the right with a
 * dimmed backdrop; closes via the close button, backdrop click, or Escape.
 */
export function ItemDetailSheet({ item, labels, onClose }: ItemDetailSheetProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const open = item !== null;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, handleKeyDown]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        role="presentation"
        className="absolute inset-0 bg-stone-900/40 animate-sheet-backdrop"
        onClick={onClose}
        onKeyDown={undefined}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative flex h-full w-full max-w-md flex-col overflow-y-auto",
          "border-l border-stone-300 bg-stone-50 shadow-xl",
          "animate-sheet-panel",
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-end border-b border-stone-200/80 bg-stone-50/95 px-4 py-3 backdrop-blur-sm">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded-sm px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200/60 hover:text-stone-900"
          >
            {labels.closeDetail}
          </button>
        </div>

        <div id={titleId} className="sr-only">
          {labels.detailSheetAria}: {item.name}
        </div>

        <ItemDetailContent item={item} labels={labels} hero />
      </aside>
    </div>,
    document.body,
  );
}
