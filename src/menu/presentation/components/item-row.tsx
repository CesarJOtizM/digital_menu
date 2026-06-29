import Image from "next/image";
import { formatLabel } from "@/i18n/translate";
import { cn } from "@/lib/cn";
import type { ItemView } from "../view-model/menu-view-model";

interface ItemRowProps {
  readonly item: ItemView;
  readonly unavailableLabel: string;
  readonly onSelect?: (item: ItemView) => void;
  readonly viewDetailAria?: string;
}

/**
 * A single Azahar-style menu row: an optional square thumbnail on the left, the
 * item name (serif) + grey description, and a right-aligned bare-number price.
 * Variants, modifiers and allergens render subtly beneath. Display-only — there
 * are NO cart/quantity/order controls anywhere in this component.
 *
 * Out-of-window items are SHOWN MARKED unavailable (dimmed + badge), never hidden.
 */
export function ItemRow({
  item,
  unavailableLabel,
  onSelect,
  viewDetailAria,
}: ItemRowProps) {
  const interactive = Boolean(onSelect);
  const Wrapper = interactive ? "button" : "article";

  return (
    <Wrapper
      type={interactive ? "button" : undefined}
      onClick={interactive ? () => onSelect?.(item) : undefined}
      aria-label={
        interactive && viewDetailAria
          ? formatLabel(viewDetailAria, { name: item.name })
          : undefined
      }
      className={cn(
        "flex w-full items-start gap-4 py-3 text-left",
        interactive &&
          "cursor-pointer rounded-sm transition-colors hover:bg-stone-100/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400",
        item.unavailable && "opacity-55",
      )}
    >
      {item.hasImage && item.imageUrl ? (
        <Image
          src={item.imageUrl}
          alt={item.name}
          width={56}
          height={56}
          className="h-14 w-14 flex-shrink-0 rounded-sm object-cover"
        />
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-3">
          <h3 className="font-heading text-lg font-semibold leading-snug text-stone-800">
            {item.name}
          </h3>
          {item.unavailable ? (
            <span className="rounded-full border border-stone-400 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-stone-500">
              {unavailableLabel}
            </span>
          ) : null}
          <span
            aria-hidden="true"
            className="mx-1 hidden flex-1 self-center border-b border-dotted border-stone-300 sm:block"
          />
          <span className="font-heading text-base font-medium tabular-nums text-stone-700">
            {item.priceDisplay}
          </span>
        </div>

        {item.description ? (
          <p className="mt-0.5 text-sm leading-relaxed text-stone-500">
            {item.description}
          </p>
        ) : null}

        {item.variants.length > 0 ? (
          <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-600">
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
          <div className="mt-1.5 space-y-1">
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
          <p className="mt-1.5 text-[11px] uppercase tracking-wide text-stone-400">
            {item.allergens.join(" · ")}
          </p>
        ) : null}
      </div>
    </Wrapper>
  );
}
