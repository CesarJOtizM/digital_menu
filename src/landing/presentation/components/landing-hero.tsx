import Image from "next/image";
import type { LandingHeroView } from "../landing-view-model";

interface LandingHeroProps {
  readonly hero: LandingHeroView;
}

/**
 * Azahar-style hero: a full-bleed food image (when configured) with the
 * restaurant name in a large serif over it, plus an optional tagline. When no
 * image is set it degrades to an editorial centered title band on the cream
 * surface. Display-only — there are no actions here except the page CTA below.
 */
export function LandingHero({ hero }: LandingHeroProps) {
  const hasImage = hero.imageUrl !== null;

  return (
    <header className="relative isolate overflow-hidden">
      {hasImage ? (
        <>
          <Image
            src={hero.imageUrl as string}
            alt={hero.restaurantName}
            fill
            priority
            sizes="100vw"
            className="-z-10 object-cover"
          />
          <div className="-z-10 absolute inset-0 bg-gradient-to-b from-stone-900/30 via-stone-900/45 to-stone-900/70" />
        </>
      ) : null}

      <div
        className={
          hasImage
            ? "mx-auto flex min-h-[68vh] max-w-4xl flex-col items-center justify-center px-6 py-24 text-center text-white"
            : "mx-auto flex max-w-4xl flex-col items-center justify-center px-6 py-28 text-center text-stone-800"
        }
      >
        <p className="text-xs font-medium uppercase tracking-[0.4em] opacity-80">
          Restaurante
        </p>
        <h1 className="mt-4 font-heading text-6xl font-light leading-none tracking-wide sm:text-7xl">
          {hero.restaurantName}
        </h1>
        {hero.tagline ? (
          <p className="mt-6 max-w-xl font-heading text-xl font-light italic tracking-wide opacity-90 sm:text-2xl">
            {hero.tagline}
          </p>
        ) : null}
      </div>
    </header>
  );
}
