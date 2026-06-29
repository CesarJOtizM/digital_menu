import Image from "next/image";
import { cn } from "@/lib/cn";
import type { ItemView } from "../view-model/menu-view-model";

const PLACEHOLDER_IMAGE = "/uploads/items/placeholder.svg";

interface ItemCardProps {
  readonly item: ItemView;
  readonly unavailableLabel: string;
}

/**
 * An image-forward card for the grid layout: a large dish photo crowns the card,
 * with the serif name, grey description, bare-number price and condensed
 * variants / modifiers / allergens beneath. It consumes the SAME {@link ItemView}
 * fields and labels as {@link ItemRow} — only the composition differs.
 *
 * Display-only: NO cart / quantity / order controls. Text-only items keep the
 * grid visually consistent by falling back to the local placeholder graphic.
 * Out-of-window items are SHOWN MARKED unavailable (dimmed + badge), never hidden.
 */
export function ItemCard({ item, unavailableLabel }: ItemCardProps) {
  const imageSrc = item.hasImage && item.imageUrl ? item.imageUrl : PLACEHOLDER_IMAGE;

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-sm border border-stone-300 bg-stone-50/80 shadow-sm transition-shadow hover:shadow-md",
        item.unavailable && "opacity-55",
      )}
    >
      <div className="relative aspect-[4/3] w-full bg-stone-100">
        <Image
          src={imageSrc}
          alt={item.name}
          fill
          sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 90vw"
          className="object-cover"
        />
        {item.unavailable ? (
          <span className="absolute left-3 top-3 rounded-full border border-stone-400 bg-stone-50/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-stone-500">
            {unavailableLabel}
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="flex items-baseline gap-3">
          <h3 className="font-heading text-lg font-semibold leading-snug text-stone-800">
            {item.name}
          </h3>
          <span
            aria-hidden="true"
            className="hidden flex-1 self-center border-b border-dotted border-stone-300 sm:block"
          />
          <span className="font-heading text-base font-medium tabular-nums text-stone-700">
            {item.priceDisplay}
          </span>
        </div>

        {item.description ? (
          <p className="mt-1 text-sm leading-relaxed text-stone-500">
            {item.description}
          </p>
        ) : null}

        {item.variants.length > 0 ? (
          <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-600">
            {item.variants.map((variant) => (
              <li key={variant.label} className="flex items-baseline gap-1.5">
                <span className="font-medium">{variant.label}</span>
                <span className="tabular-nums text-stone-500">
                  {variant.priceDisplay}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {item.modifierGroups.length > 0 ? (
          <div className="mt-2.5 space-y-1">
            {item.modifierGroups.map((group) => (
              <div key={group.name} className="text-xs text-stone-500">
                <span className="font-semibold uppercase tracking-wide text-stone-600">
                  {group.name}
                </span>
                <span className="ml-2">
                  {group.options.map((option, index) => (
                    <span key={option.name}>
                      {index > 0 ? " · " : ""}
                      {option.name}
                      {option.priceDeltaDisplay ? (
                        <span className="ml-1 tabular-nums text-stone-400">
                          {option.priceDeltaDisplay}
                        </span>
                      ) : null}
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        {item.allergens.length > 0 ? (
          <p className="mt-2.5 text-[11px] uppercase tracking-wide text-stone-400">
            {item.allergens.join(" · ")}
          </p>
        ) : null}
      </div>
    </article>
  );
}
