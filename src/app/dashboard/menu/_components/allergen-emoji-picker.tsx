"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { EmojiClickData } from "emoji-picker-react";
import { Theme } from "emoji-picker-react";
import { useTranslations } from "@/i18n";
import { resolveAllergenDisplayIcon } from "@/menu/application/admin/allergen-icon";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

interface AllergenEmojiPickerProps {
  initialIcon?: string;
  inputName?: string;
}

export function AllergenEmojiPicker({
  initialIcon = "",
  inputName = "icon",
}: AllergenEmojiPickerProps) {
  const t = useTranslations();
  const containerRef = useRef<HTMLDivElement>(null);
  const resolvedInitial = resolveAllergenDisplayIcon(initialIcon);
  const [selected, setSelected] = useState(resolvedInitial ?? "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const handleEmojiClick = (data: EmojiClickData) => {
    setSelected(data.emoji);
    setOpen(false);
  };

  return (
    <div className="space-y-3" ref={containerRef}>
      <input type="hidden" name={inputName} value={selected} />

      {selected ? (
        <div
          className="flex items-center justify-center gap-4 rounded-xl border border-neutral-200 bg-neutral-50/80 px-4 py-5"
          aria-live="polite"
        >
          <span className="text-3xl leading-none" aria-hidden>
            {selected}
          </span>
          <p className="text-center text-sm text-neutral-600">
            {t("allergens.emojiSelected")}
          </p>
          <span className="text-3xl leading-none" aria-hidden>
            {selected}
          </span>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 px-4 py-5 text-center text-sm text-neutral-500">
          {t("allergens.emojiOptionalEmpty")}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            aria-haspopup="dialog"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-800 shadow-sm hover:bg-neutral-50"
          >
            <span className="text-xl leading-none" aria-hidden>
              😀
            </span>
            {selected ? t("allergens.changeEmoji") : t("allergens.openEmojiPicker")}
          </button>

          {open ? (
            <div
              role="dialog"
              aria-label={t("allergens.emojiPickerLabel")}
              className="absolute left-0 z-30 mt-2 w-full min-w-[min(100%,320px)] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg sm:left-auto sm:right-0"
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme={Theme.LIGHT}
                width="100%"
                height={380}
                searchPlaceholder={t("allergens.emojiSearch")}
                previewConfig={{ showPreview: false }}
                lazyLoadEmojis
              />
            </div>
          ) : null}
        </div>

        {selected ? (
          <button
            type="button"
            onClick={() => setSelected("")}
            className="rounded-xl border border-neutral-300 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            {t("allergens.clearEmoji")}
          </button>
        ) : null}
      </div>

      <p className="text-xs text-neutral-500">{t("allergens.emojiHint")}</p>
    </div>
  );
}
