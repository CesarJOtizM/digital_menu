import Image from "next/image";
import { cn } from "@/lib/cn";
import type { ItemDetailLabels } from "../menu-ui-labels";
import type { ItemView } from "../view-model/menu-view-model";

const PLACEHOLDER_IMAGE = "/uploads/items/placeholder.svg";

export interface ItemDetailContentProps {
  readonly item: ItemView;
  readonly labels: ItemDetailLabels;
  /** When true, renders a large hero image suited for the detail sheet. */
  readonly hero?: boolean;
}

/**
 * Full presentation of a menu item: hero image, name, price, description,
 * variants, modifier groups and allergens. Shared by the lateral detail sheet.
 */
export function ItemDetailContent({ item, labels, hero = false }: ItemDetailContentProps) {
  const imageSrc = item.hasImage && item.imageUrl ? item.imageUrl : PLACEHOLDER_IMAGE;

  return (
    <div className={cn(item.unavailable && "opacity-90")}>
      {hero ? (
        <div className="relative aspect-[4/3] w-full bg-stone-100">
          <Image
            src={imageSrc}
            alt={item.name}
            fill
            sizes="(min-width: 640px) 28rem, 100vw"
            className="object-cover"
            priority
          />
          {item.unavailable ? (
            <span className="absolute left-4 top-4 rounded-full border border-stone-400 bg-stone-50/90 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-stone-500">
              {labels.unavailable}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className={cn("space-y-4", hero ? "px-5 py-5 sm:px-6" : "")}>
        <div className="flex items-baseline gap-3">
          <h2 className="font-heading text-2xl font-semibold leading-snug text-stone-800">
            {item.name}
          </h2>
          {!hero && item.unavailable ? (
            <span className="rounded-full border border-stone-400 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-stone-500">
              {labels.unavailable}
            </span>
          ) : null}
          <span
            aria-hidden="true"
            className="hidden flex-1 self-center border-b border-dotted border-stone-300 sm:block"
          />
          <span className="font-heading text-lg font-medium tabular-nums text-stone-700">
            {item.priceDisplay}
          </span>
        </div>

        {item.description ? (
          <p className="text-base leading-relaxed text-stone-600">{item.description}</p>
        ) : null}

        {item.variants.length > 0 ? (
          <section aria-label={labels.variantsSection}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              {labels.variantsSection}
            </h3>
            <ul className="mt-2 space-y-2">
              {item.variants.map((variant) => (
                <li
                  key={variant.label}
                  className="flex items-baseline justify-between gap-4 text-sm text-stone-700"
                >
                  <span className="font-medium">{variant.label}</span>
                  <span className="tabular-nums text-stone-500">{variant.priceDisplay}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {item.modifierGroups.length > 0 ? (
          <section aria-label={labels.modifiersSection}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              {labels.modifiersSection}
            </h3>
            <div className="mt-2 space-y-3">
              {item.modifierGroups.map((group) => (
                <div key={group.name}>
                  <p className="text-sm font-medium text-stone-700">{group.name}</p>
                  <ul className="mt-1 space-y-1">
                    {group.options.map((option) => (
                      <li
                        key={option.name}
                        className="flex items-baseline justify-between gap-4 text-sm text-stone-600"
                      >
                        <span>{option.name}</span>
                        {option.priceDeltaDisplay ? (
                          <span className="tabular-nums text-stone-400">
                            {option.priceDeltaDisplay}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {item.allergens.length > 0 ? (
          <section aria-label={labels.allergensSection}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              {labels.allergensSection}
            </h3>
            <p className="mt-2 text-sm text-stone-600">{item.allergens.join(" · ")}</p>
          </section>
        ) : null}
      </div>
    </div>
  );
}
