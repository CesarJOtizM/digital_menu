"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { saveItemAction } from "../actions";
import type {
  ItemFormValues,
  ModifierGroupFormValue,
  ModifierOptionFormValue,
  VariantFormValue,
} from "@/menu/application/admin/item-form-types";
import type { AllergenOption } from "@/menu/infrastructure/persistence/load-allergens";

interface ItemFormEditorProps {
  categoryId: string;
  itemId?: string;
  initial: ItemFormValues;
  allergens: AllergenOption[];
  title: string;
  returnTo?: string;
  error?: string;
}

function createVariant(): VariantFormValue {
  return { label: "", price: "" };
}

function createOption(): ModifierOptionFormValue {
  return { name: "", priceDelta: "0" };
}

function createModifierGroup(): ModifierGroupFormValue {
  return { name: "", min: "0", max: "1", options: [createOption()] };
}

export function ItemFormEditor({
  categoryId,
  itemId,
  initial,
  allergens,
  title,
  returnTo = "/dashboard/menu",
  error,
}: ItemFormEditorProps) {
  const [variants, setVariants] = useState(initial.variants);
  const [modifierGroups, setModifierGroups] = useState(initial.modifierGroups);
  const [removeImage, setRemoveImage] = useState(false);

  const variantsJson = useMemo(() => JSON.stringify(variants), [variants]);
  const modifierGroupsJson = useMemo(
    () => JSON.stringify(modifierGroups),
    [modifierGroups],
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/dashboard/menu"
        className="text-sm text-neutral-500 hover:text-neutral-800"
      >
        ← Volver a gestionar carta
      </Link>

      <h1 className="mt-4 text-2xl font-medium">{title}</h1>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <form
        action={saveItemAction}
        encType="multipart/form-data"
        className="mt-8 space-y-8"
      >
        <input type="hidden" name="categoryId" value={categoryId} />
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
          <h2 className="text-lg font-medium">Datos básicos</h2>

          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium">
              Nombre
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={initial.name}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="description" className="text-sm font-medium">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={initial.description}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="price" className="text-sm font-medium">
              Precio base
            </label>
            <input
              id="price"
              name="price"
              required
              inputMode="decimal"
              placeholder="12.50"
              defaultValue={initial.price}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
            <p className="text-xs text-neutral-500">
              Usado cuando el plato no tiene variantes seleccionadas.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="active"
              defaultChecked={initial.active}
              className="rounded border-neutral-300"
            />
            Visible en la carta pública
          </label>
        </section>

        <section className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5">
          <div>
            <h2 className="text-lg font-medium">Alérgenos</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Marca los alérgenos presentes en este plato. Se muestran en la carta
              pública.
            </p>
          </div>

          {allergens.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No hay alérgenos configurados. Ejecuta{" "}
              <code className="rounded bg-neutral-100 px-1.5 py-0.5">pnpm db:seed</code>.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {allergens.map((allergen) => (
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
                  <span>{allergen.name}</span>
                </label>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5">
          <div>
            <h2 className="text-lg font-medium">Imagen</h2>
            <p className="mt-1 text-sm text-neutral-500">
              JPG, PNG o WebP. Máximo 5 MB.
            </p>
          </div>

          {initial.hasImage && initial.imageUrl && !removeImage ? (
            <div className="flex items-start gap-4">
              <div className="relative h-24 w-24 overflow-hidden rounded-md border border-neutral-200">
                <Image
                  src={initial.imageUrl}
                  alt={initial.name || "Imagen del plato"}
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
                Quitar imagen actual
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
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium">Variantes</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Tamaños u opciones con precio absoluto (ej. Personal / Mediana).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setVariants((current) => [...current, createVariant()])}
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
            >
              Agregar variante
            </button>
          </div>

          {variants.length === 0 ? (
            <p className="text-sm text-neutral-500">Sin variantes configuradas.</p>
          ) : (
            <ul className="space-y-3">
              {variants.map((variant, index) => (
                <li
                  key={variant.id ?? `variant-${index}`}
                  className="grid gap-3 rounded-md border border-neutral-100 p-3 sm:grid-cols-[1fr_140px_auto]"
                >
                  <input
                    value={variant.label}
                    onChange={(event) =>
                      setVariants((current) =>
                        current.map((entry, entryIndex) =>
                          entryIndex === index
                            ? { ...entry, label: event.target.value }
                            : entry,
                        ),
                      )
                    }
                    placeholder="Ej. Mediana"
                    className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
                  />
                  <input
                    value={variant.price}
                    onChange={(event) =>
                      setVariants((current) =>
                        current.map((entry, entryIndex) =>
                          entryIndex === index
                            ? { ...entry, price: event.target.value }
                            : entry,
                        ),
                      )
                    }
                    placeholder="Precio"
                    inputMode="decimal"
                    className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
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
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium">Modificadores</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Extras, salsas o opciones con precio adicional.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setModifierGroups((current) => [...current, createModifierGroup()])
              }
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
            >
              Agregar grupo
            </button>
          </div>

          {modifierGroups.length === 0 ? (
            <p className="text-sm text-neutral-500">Sin grupos de modificadores.</p>
          ) : (
            <ul className="space-y-4">
              {modifierGroups.map((group, groupIndex) => (
                <li
                  key={group.id ?? `group-${groupIndex}`}
                  className="rounded-md border border-neutral-100 p-4"
                >
                  <div className="grid gap-3 sm:grid-cols-[1fr_80px_80px_auto]">
                    <input
                      value={group.name}
                      onChange={(event) =>
                        setModifierGroups((current) =>
                          current.map((entry, entryIndex) =>
                            entryIndex === groupIndex
                              ? { ...entry, name: event.target.value }
                              : entry,
                          ),
                        )
                      }
                      placeholder="Nombre del grupo"
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
                      placeholder="Mín"
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
                      placeholder="Máx"
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
                      Eliminar grupo
                    </button>
                  </div>

                  <div className="mt-4 space-y-2">
                    {group.options.map((option, optionIndex) => (
                      <div
                        key={option.id ?? `option-${groupIndex}-${optionIndex}`}
                        className="grid gap-2 sm:grid-cols-[1fr_140px_auto]"
                      >
                        <input
                          value={option.name}
                          onChange={(event) =>
                            setModifierGroups((current) =>
                              current.map((entry, entryIndex) =>
                                entryIndex === groupIndex
                                  ? {
                                      ...entry,
                                      options: entry.options.map(
                                        (optionEntry, optionEntryIndex) =>
                                          optionEntryIndex === optionIndex
                                            ? {
                                                ...optionEntry,
                                                name: event.target.value,
                                              }
                                            : optionEntry,
                                      ),
                                    }
                                  : entry,
                              ),
                            )
                          }
                          placeholder="Opción"
                          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
                        />
                        <input
                          value={option.priceDelta}
                          onChange={(event) =>
                            setModifierGroups((current) =>
                              current.map((entry, entryIndex) =>
                                entryIndex === groupIndex
                                  ? {
                                      ...entry,
                                      options: entry.options.map(
                                        (optionEntry, optionEntryIndex) =>
                                          optionEntryIndex === optionIndex
                                            ? {
                                                ...optionEntry,
                                                priceDelta: event.target.value,
                                              }
                                            : optionEntry,
                                      ),
                                    }
                                  : entry,
                              ),
                            )
                          }
                          placeholder="+0.00"
                          inputMode="decimal"
                          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
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
                          Quitar
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
                    + Agregar opción
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Guardar plato
          </button>
          <Link
            href="/dashboard/menu"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </main>
  );
}
