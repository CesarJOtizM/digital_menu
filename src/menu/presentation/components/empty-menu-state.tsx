/**
 * Shown when no published menu exists yet (or the menu has no items). Graceful,
 * non-error state so the public page always renders — including before the
 * database is seeded. Display-only: no controls.
 */
export function EmptyMenuState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <p className="font-heading text-2xl font-medium text-stone-700">
        Our menu is being prepared
      </p>
      <p className="max-w-md text-sm text-stone-500">
        Please check back soon — we&apos;re plating something special.
      </p>
    </div>
  );
}
