import Link from "next/link";
import { getTranslations } from "@/i18n/server";
import { resolveAllergenDisplayIcon } from "@/menu/application/admin/allergen-icon";
import type { AllergenOption } from "@/menu/application/admin/allergen-types";
import { localizedName } from "@/menu/presentation/localize-menu-content";
import { adminActionSecondaryMdClass } from "../../_components/admin-action-styles";
import { deleteAllergenAction } from "../allergen-actions";
import { ConfirmDeleteButton } from "./confirm-delete-button";

interface AllergensMasterListProps {
  allergens: AllergenOption[];
}

export async function AllergensMasterList({ allergens }: AllergensMasterListProps) {
  const { t, locale } = await getTranslations();

  if (allergens.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/80 px-6 py-12 text-center">
        <p className="text-sm text-neutral-600">{t("allergens.empty")}</p>
        <Link
          href="/dashboard/menu/allergens/new"
          className="mt-4 inline-flex rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          {t("allergens.addFirst")}
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      {allergens.map((allergen) => {
        const emoji = resolveAllergenDisplayIcon(allergen.icon);
        const allergenName = localizedName(allergen, locale);

        return (
          <li
            key={allergen.id}
            className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 hover:bg-neutral-50/50"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {emoji ? (
                <span className="text-2xl leading-none" aria-hidden>
                  {emoji}
                </span>
              ) : null}
              <p className="min-w-0 flex-1 font-medium text-neutral-900">{allergenName}</p>
              {emoji ? (
                <span className="text-2xl leading-none opacity-30" aria-hidden>
                  {emoji}
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/dashboard/menu/allergens/${allergen.id}`}
                className={adminActionSecondaryMdClass}
              >
                {t("common.edit")}
              </Link>
              <ConfirmDeleteButton
                action={deleteAllergenAction}
                fields={{ allergenId: allergen.id }}
                itemName={allergenName}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
