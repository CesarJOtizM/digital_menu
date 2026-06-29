"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslations, useUiLocale } from "@/i18n";
import type { PriceInputFormatOptions } from "@/menu/application/admin/price-input-format";
import { adminActionCancelClass } from "../../_components/admin-action-styles";
import { FormSubmitButton } from "../../_components/form-submit-button";
import { PriceInput } from "./price-input";
import {
  ContentLocaleField,
  ContentLocaleTabs,
  ContentLocaleSwitcher,
} from "./content-locale-tabs";
import { resolveAllergenDisplayIcon } from "@/menu/application/admin/allergen-icon";
import type { AllergenOption } from "@/menu/application/admin/allergen-types";
import { localizedName } from "@/menu/presentation/localize-menu-content";
import { saveItemAction } from "../actions";
import type {
  ItemFormValues,
  ModifierGroupFormValue,
  ModifierOptionFormValue,
  VariantFormValue,
} from "@/menu/application/admin/item-form-types";
import type { UiLocale } from "@/i18n/config";

interface ItemFormEditorProps {
  categoryId?: string;
  categoryName?: string;
  categories?: readonly { id: string; name: string }[];
  itemId?: string;
  initial: ItemFormValues;
  allergens: AllergenOption[];
  title: string;
  returnTo?: string;
  error?: string;
  priceFormat: PriceInputFormatOptions;
}

function createVariant(): VariantFormValue {
  return { label: "", labelEn: "", price: "" };
}

function createOption(): ModifierOptionFormValue {
  return { name: "", nameEn: "", priceDelta: "0" };
}

function createModifierGroup(): ModifierGroupFormValue {
  return { name: "", nameEn: "", min: "0", max: "1", options: [createOption()] };
}

export function ItemFormEditor({
  categoryId,
  categoryName,
  categories = [],
  itemId,
  initial,
  allergens,
  title,
  returnTo = "/dashboard/menu/items",
  error,
  priceFormat,
}: ItemFormEditorProps) {
  const t = useTranslations();
  const uiLocale = useUiLocale();
  const [variants, setVariants] = useState(initial.variants);
  const [modifierGroups, setModifierGroups] = useState(initial.modifierGroups);
  const [removeImage, setRemoveImage] = useState(false);
  const [contentLocale, setContentLocale] = useState<UiLocale>("es");

  const variantsJson = useMemo(() => JSON.stringify(variants), [variants]);
  const modifierGroupsJson = useMemo(
    () => JSON.stringify(modifierGroups),
    [modifierGroups],
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-medium">{title}</h1>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <form action={saveItemAction} className="space-y-8">
        {itemId && categoryId ? (
          <input type="hidden" name="categoryId" value={categoryId} />
        ) : null}
        {itemId ? <input type="hidden" name="itemId" value={itemId} /> : null}
        <input type="hidden" name="returnTo" value={returnTo} />
        <input type="hidden" name="variantsJson" value={variantsJson} readOnly />
        <input
          type="hidden"
          name="modifierGroupsJson"
          value={modifierGroupsJson}
          readOnly
        />

        <section className="space-y-5 rounded-lg border border-neutral-200 bg-white p-5">
          <h2 className="text-lg font-medium">{t("itemForm.basics")}</h2>

          {itemId && categoryName ? (
            <div className="space-y-1">
              <p className="text-sm font-medium">{t("itemForm.category")}</p>
              <p className="text-sm text-neutral-600">{categoryName}</p>
            </div>
          ) : (
            <div className="space-y-1">
              <label htmlFor="categoryId" className="text-sm font-medium">
                {t("itemForm.category")}
              </label>
              <select
                id="categoryId"
                name="categoryId"
                required
                defaultValue={categoryId ?? ""}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              >
                <option value="" disabled>
                  {t("itemForm.selectCategory")}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <ContentLocaleTabs
            onLocaleChange={setContentLocale}
            esPanel={
              <div className="space-y-4">
                <ContentLocaleField
                  id="name"
                  label={t("itemForm.name")}
                  name="name"
                  defaultValue={initial.name}
                  required
                />
                <ContentLocaleField
                  id="description"
                  label={t("itemForm.description")}
                  name="description"
                  defaultValue={initial.description}
                  multiline
                />
              </div>
            }
            enPanel={
              <div className="space-y-4">
                <ContentLocaleField
                  id="nameEn"
                  label={t("itemForm.name")}
                  name="nameEn"
                  defaultValue={initial.nameEn}
                  hint={t("contentLocale.optionalHint")}
                />
                <ContentLocaleField
                  id="descriptionEn"
                  label={t("itemForm.description")}
                  name="descriptionEn"
                  defaultValue={initial.descriptionEn}
                  multiline
                  hint={t("contentLocale.optionalHint")}
                />
              </div>
            }
          />

          <div className="space-y-1">
            <label htmlFor="price" className="text-sm font-medium">
              {t("itemForm.basePrice")}
            </label>
            <PriceInput
              id="price"
              name="price"
              required
              defaultValue={initial.price}
              priceFormat={priceFormat}
            />
            <p className="text-xs text-neutral-500">{t("itemForm.basePriceHint")}</p>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="active"
              defaultChecked={initial.active}
              className="rounded border-neutral-300"
            />
            {t("itemForm.visibleOnMenu")}
          </label>
        </section>

        <section className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium">{t("itemForm.allergens")}</h2>
              <p className="mt-1 text-sm text-neutral-500">{t("itemForm.allergensHint")}</p>
            </div>
            <Link
              href="/dashboard/menu/allergens"
              className="text-sm text-neutral-700 underline-offset-2 hover:underline"
            >
              {t("allergens.manage")}
            </Link>
          </div>

          {allergens.length === 0 ? (
            <p className="text-sm text-neutral-500">
              {t("allergens.emptyShort")}{" "}
              <Link
                href="/dashboard/menu/allergens/new"
                className="font-medium text-neutral-900 underline-offset-2 hover:underline"
              >
                {t("allergens.addFirst")}
              </Link>
              .
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {allergens.map((allergen) => {
                const emoji = resolveAllergenDisplayIcon(allergen.icon);
                const allergenName = localizedName(allergen, uiLocale);

                return (
                <label
                  key={allergen.id}
                  className="flex items-center gap-2 rounded-md border border-neutral-100 px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    name="allergenIds"
                    value={allergen.id}
                    defaultChecked={initial.allergenIds.includes(allergen.id)}
                    className="rounded border-neutral-300"
                  />
                  {emoji ? (
                    <span className="text-lg leading-none" aria-hidden>
                      {emoji}
                    </span>
                  ) : null}
                  <span className="flex-1">{allergenName}</span>
                  {emoji ? (
                    <span className="text-lg leading-none opacity-40" aria-hidden>
                      {emoji}
                    </span>
                  ) : null}
                </label>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5">
          <div>
            <h2 className="text-lg font-medium">{t("itemForm.image")}</h2>
            <p className="mt-1 text-sm text-neutral-500">{t("itemForm.imageHint")}</p>
          </div>

          {initial.hasImage && initial.imageUrl && !removeImage ? (
            <div className="flex items-start gap-4">
              <div className="relative h-24 w-24 overflow-hidden rounded-md border border-neutral-200">
                <Image
                  src={initial.imageUrl}
                  alt={initial.name || t("itemForm.imageAlt")}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-red-700">
                <input
                  type="checkbox"
                  name="removeImage"
                  checked={removeImage}
                  onChange={(event) => setRemoveImage(event.target.checked)}
                />
                {t("itemForm.removeImage")}
              </label>
            </div>
          ) : null}

          {!removeImage ? (
            <input
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/webp"
              className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-md file:border file:border-neutral-300 file:px-3 file:py-1.5 file:text-sm"
            />
          ) : null}
        </section>

        <section className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium">{t("itemForm.variants")}</h2>
              <p className="mt-1 text-sm text-neutral-500">{t("itemForm.variantsHint")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ContentLocaleSwitcher value={contentLocale} onChange={setContentLocale} />
              <button
                type="button"
                onClick={() => setVariants((current) => [...current, createVariant()])}
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
              >
                {t("itemForm.addVariant")}
              </button>
            </div>
          </div>

          {variants.length === 0 ? (
            <p className="text-sm text-neutral-500">{t("itemForm.noVariants")}</p>
          ) : (
            <ul className="space-y-3">
              {variants.map((variant, index) => (
                <li
                  key={variant.id ?? `variant-${index}`}
                  className="grid gap-3 rounded-md border border-neutral-100 p-3 sm:grid-cols-[1fr_140px_auto]"
                >
                  <input
                    value={contentLocale === "es" ? variant.label : (variant.labelEn ?? "")}
                    onChange={(event) =>
                      setVariants((current) =>
                        current.map((entry, entryIndex) =>
                          entryIndex === index
                            ? contentLocale === "es"
                              ? { ...entry, label: event.target.value }
                              : { ...entry, labelEn: event.target.value }
                            : entry,
                        ),
                      )
                    }
                    placeholder={
                      contentLocale === "es"
                        ? t("itemForm.variantPlaceholder")
                        : t("itemForm.variantPlaceholderEn")
                    }
                    className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
                  />
                  <PriceInput
                    value={variant.price}
                    onValueChange={(next) =>
                      setVariants((current) =>
                        current.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, price: next } : entry,
                        ),
                      )
                    }
                    priceFormat={priceFormat}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setVariants((current) =>
                        current.filter((_, entryIndex) => entryIndex !== index),
                      )
                    }
                    className="text-sm text-red-700 hover:underline"
                  >
                    {t("itemForm.remove")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium">{t("itemForm.modifiers")}</h2>
              <p className="mt-1 text-sm text-neutral-500">{t("itemForm.modifiersHint")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ContentLocaleSwitcher value={contentLocale} onChange={setContentLocale} />
              <button
                type="button"
                onClick={() =>
                  setModifierGroups((current) => [...current, createModifierGroup()])
                }
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
              >
                {t("itemForm.addGroup")}
              </button>
            </div>
          </div>

          {modifierGroups.length === 0 ? (
            <p className="text-sm text-neutral-500">{t("itemForm.noModifierGroups")}</p>
          ) : (
            <ul className="space-y-4">
              {modifierGroups.map((group, groupIndex) => (
                <li
                  key={group.id ?? `group-${groupIndex}`}
                  className="rounded-md border border-neutral-100 p-4"
                >
                  <div className="grid gap-3 sm:grid-cols-[1fr_80px_80px_auto]">
                    <input
                      value={contentLocale === "es" ? group.name : (group.nameEn ?? "")}
                      onChange={(event) =>
                        setModifierGroups((current) =>
                          current.map((entry, entryIndex) =>
                            entryIndex === groupIndex
                              ? contentLocale === "es"
                                ? { ...entry, name: event.target.value }
                                : { ...entry, nameEn: event.target.value }
                              : entry,
                          ),
                        )
                      }
                      placeholder={
                        contentLocale === "es"
                          ? t("itemForm.groupNamePlaceholder")
                          : t("itemForm.groupNamePlaceholderEn")
                      }
                      className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
                    />
                    <input
                      value={group.min}
                      onChange={(event) =>
                        setModifierGroups((current) =>
                          current.map((entry, entryIndex) =>
                            entryIndex === groupIndex
                              ? { ...entry, min: event.target.value }
                              : entry,
                          ),
                        )
                      }
                      placeholder={t("itemForm.min")}
                      inputMode="numeric"
                      className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
                    />
                    <input
                      value={group.max}
                      onChange={(event) =>
                        setModifierGroups((current) =>
                          current.map((entry, entryIndex) =>
                            entryIndex === groupIndex
                              ? { ...entry, max: event.target.value }
                              : entry,
                          ),
                        )
                      }
                      placeholder={t("itemForm.max")}
                      inputMode="numeric"
                      className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setModifierGroups((current) =>
                          current.filter((_, entryIndex) => entryIndex !== groupIndex),
                        )
                      }
                      className="text-sm text-red-700 hover:underline"
                    >
                      {t("itemForm.deleteGroup")}
                    </button>
                  </div>

                  <div className="mt-4 space-y-2">
                    {group.options.map((option, optionIndex) => (
                      <div
                        key={option.id ?? `option-${groupIndex}-${optionIndex}`}
                        className="grid gap-2 sm:grid-cols-[1fr_140px_auto]"
                      >
                        <input
                          value={contentLocale === "es" ? option.name : (option.nameEn ?? "")}
                          onChange={(event) =>
                            setModifierGroups((current) =>
                              current.map((entry, entryIndex) =>
                                entryIndex === groupIndex
                                  ? {
                                      ...entry,
                                      options: entry.options.map(
                                        (optionEntry, optionEntryIndex) =>
                                          optionEntryIndex === optionIndex
                                            ? contentLocale === "es"
                                              ? {
                                                  ...optionEntry,
                                                  name: event.target.value,
                                                }
                                              : {
                                                  ...optionEntry,
                                                  nameEn: event.target.value,
                                                }
                                            : optionEntry,
                                      ),
                                    }
                                  : entry,
                              ),
                            )
                          }
                          placeholder={
                            contentLocale === "es"
                              ? t("itemForm.optionPlaceholder")
                              : t("itemForm.optionPlaceholderEn")
                          }
                          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
                        />
                        <PriceInput
                          value={option.priceDelta}
                          onValueChange={(next) =>
                            setModifierGroups((current) =>
                              current.map((entry, entryIndex) =>
                                entryIndex === groupIndex
                                  ? {
                                      ...entry,
                                      options: entry.options.map(
                                        (optionEntry, optionEntryIndex) =>
                                          optionEntryIndex === optionIndex
                                            ? { ...optionEntry, priceDelta: next }
                                            : optionEntry,
                                      ),
                                    }
                                  : entry,
                              ),
                            )
                          }
                          priceFormat={priceFormat}
                          showPlusPrefix
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setModifierGroups((current) =>
                              current.map((entry, entryIndex) =>
                                entryIndex === groupIndex
                                  ? {
                                      ...entry,
                                      options: entry.options.filter(
                                        (_, optionEntryIndex) =>
                                          optionEntryIndex !== optionIndex,
                                      ),
                                    }
                                  : entry,
                              ),
                            )
                          }
                          className="text-sm text-red-700 hover:underline"
                        >
                          {t("itemForm.remove")}
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setModifierGroups((current) =>
                        current.map((entry, entryIndex) =>
                          entryIndex === groupIndex
                            ? {
                                ...entry,
                                options: [...entry.options, createOption()],
                              }
                            : entry,
                        ),
                      )
                    }
                    className="mt-3 text-sm text-neutral-700 hover:underline"
                  >
                    {t("itemForm.addOption")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex flex-wrap gap-3">
          <FormSubmitButton variant="primary">
            {t("itemForm.saveItem")}
          </FormSubmitButton>
          <Link
            href="/dashboard/menu/items"
            className={adminActionCancelClass}
          >
            {t("common.cancel")}
          </Link>
        </div>
      </form>
    </div>
  );
}
