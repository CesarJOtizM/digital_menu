"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { useTranslations } from "@/i18n";
import {
  moveCategoryAction,
  moveItemAction,
  reorderCategoriesAction,
  reorderCategoryItemsAction,
} from "../actions";
import { OrderButtons } from "./order-buttons";
import {
  type MenuOrderCategory,
  reorderById,
} from "./menu-order-types";

interface MenuOrderEditorProps {
  initialCategories: MenuOrderCategory[];
}

function resolveErrorMessage(
  t: ReturnType<typeof useTranslations>,
  code: string | undefined,
): string {
  if (!code) {
    return t("admin.errors.generic");
  }
  const message = t(`admin.errors.${code}`);
  return message !== `admin.errors.${code}` ? message : t("admin.errors.generic");
}

function DragHandle({ label }: { label: string }) {
  return (
    <span
      draggable={false}
      aria-hidden
      className="cursor-grab select-none text-stone-400 active:cursor-grabbing"
      title={label}
    >
      ⠿
    </span>
  );
}

export function MenuOrderEditor({ initialCategories }: MenuOrderEditorProps) {
  const t = useTranslations();
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<{
    categoryId: string;
    itemId: string;
  } | null>(null);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const persistCategories = useCallback(
    (next: MenuOrderCategory[]) => {
      const previous = categories;
      setCategories(next);
      startTransition(async () => {
        const result = await reorderCategoriesAction(next.map((category) => category.id));
        if (result.error) {
          setCategories(previous);
          setError(resolveErrorMessage(t, result.error));
        } else {
          setError(null);
          router.refresh();
        }
      });
    },
    [categories, router, t],
  );

  const persistItems = useCallback(
    (categoryId: string, nextItems: MenuOrderCategory["items"]) => {
      const previous = categories;
      setCategories((current) =>
        current.map((category) =>
          category.id === categoryId ? { ...category, items: nextItems } : category,
        ),
      );
      startTransition(async () => {
        const result = await reorderCategoryItemsAction(
          categoryId,
          nextItems.map((item) => item.id),
        );
        if (result.error) {
          setCategories(previous);
          setError(resolveErrorMessage(t, result.error));
        } else {
          setError(null);
          router.refresh();
        }
      });
    },
    [categories, router, t],
  );

  return (
    <div
      className={
        isPending ? "opacity-80 transition-opacity" : "transition-opacity"
      }
    >
      {error ? (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-gradient-to-b from-stone-50 to-white shadow-sm">
        <div className="border-b border-stone-200/80 bg-white/80 px-5 py-4 sm:px-8">
          <p className="text-sm text-stone-600">{t("dashboard.orderPreviewHint")}</p>
          <p className="mt-1 text-xs text-stone-500">{t("dashboard.dragToReorder")}</p>
        </div>

        <div className="space-y-0 px-5 py-8 sm:px-8">
          {categories.map((category, categoryIndex) => (
            <section
              key={category.id}
              draggable
              onDragStart={() => setDraggedCategoryId(category.id)}
              onDragEnd={() => setDraggedCategoryId(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (!draggedCategoryId) {
                  return;
                }
                persistCategories(
                  reorderById(categories, draggedCategoryId, category.id),
                );
                setDraggedCategoryId(null);
              }}
              className={
                draggedCategoryId === category.id
                  ? "border-b border-stone-200/60 pb-10 opacity-60 last:border-b-0 last:pb-0"
                  : "border-b border-stone-200/60 pb-10 last:border-b-0 last:pb-0"
              }
            >
              <div className="flex items-start gap-4">
                <div className="flex shrink-0 flex-col items-center gap-2 pt-1">
                  <DragHandle label={t("dashboard.dragCategory")} />
                  <OrderButtons
                    variant="prominent"
                    action={moveCategoryAction}
                    hiddenFields={{ categoryId: category.id }}
                    isFirst={categoryIndex === 0}
                    isLast={categoryIndex === categories.length - 1}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-heading text-2xl font-medium tracking-wide text-stone-800">
                    {category.name}
                  </h3>
                  <div className="mt-2 border-b border-stone-300" />

                  {category.items.length === 0 ? (
                    <p className="mt-4 text-sm italic text-stone-500">
                      {t("dashboard.orderEmptyCategory")}
                    </p>
                  ) : (
                    <ul className="mt-1 divide-y divide-stone-200/70">
                      {category.items.map((item, itemIndex) => (
                        <li
                          key={item.id}
                          draggable
                          onDragStart={(event) => {
                            event.stopPropagation();
                            setDraggedItem({
                              categoryId: category.id,
                              itemId: item.id,
                            });
                          }}
                          onDragEnd={() => setDraggedItem(null)}
                          onDragOver={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                          }}
                          onDrop={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            if (
                              !draggedItem ||
                              draggedItem.categoryId !== category.id ||
                              draggedItem.itemId === item.id
                            ) {
                              return;
                            }
                            persistItems(
                              category.id,
                              reorderById(
                                category.items,
                                draggedItem.itemId,
                                item.id,
                              ),
                            );
                            setDraggedItem(null);
                          }}
                          className={
                            draggedItem?.itemId === item.id
                              ? "flex items-start gap-4 py-4 opacity-60 first:pt-5"
                              : "flex items-start gap-4 py-4 first:pt-5"
                          }
                        >
                          <div className="flex shrink-0 flex-col items-center gap-2 pt-1">
                            <DragHandle label={t("dashboard.dragItem")} />
                            <OrderButtons
                              variant="prominent"
                              action={moveItemAction}
                              hiddenFields={{
                                categoryId: category.id,
                                itemId: item.id,
                              }}
                              isFirst={itemIndex === 0}
                              isLast={itemIndex === category.items.length - 1}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                              <p className="font-medium text-stone-900">{item.name}</p>
                              <p className="text-sm tabular-nums text-stone-700">
                                {item.price}
                              </p>
                            </div>
                            {item.description ? (
                              <p className="mt-1 line-clamp-2 text-sm text-stone-500">
                                {item.description}
                              </p>
                            ) : null}
                            {!item.active ? (
                              <span className="mt-2 inline-flex rounded-full bg-stone-200/80 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-stone-600">
                                {t("dashboard.inactive")}
                              </span>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
