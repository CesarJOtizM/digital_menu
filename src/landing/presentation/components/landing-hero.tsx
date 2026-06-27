import { LandingCta } from "./landing-cta";
import { LandingHeroCarousel } from "./landing-hero-carousel";
import type { LandingHeroView } from "../landing-view-model";

interface LandingHeroProps {
  readonly hero: LandingHeroView;
}

/**
 * Azahar-style hero: crossfading food slides, editorial headline, copy and CTA.
 */
export function LandingHero({ hero }: LandingHeroProps) {
  const hasImages = hero.imageUrls.length > 0;

  return (
    <header className="relative isolate overflow-hidden">
      {hasImages ? (
        <>
          <LandingHeroCarousel
            images={hero.imageUrls}
            alt={hero.restaurantName}
          />
          <div className="-z-10 absolute inset-0 bg-gradient-to-b from-stone-900/35 via-stone-900/50 to-stone-900/75" />
        </>
      ) : (
        <div className="menu-accent-bg -z-10 absolute inset-0 opacity-95" />
      )}

      <div className="mx-auto flex min-h-[72vh] max-w-4xl flex-col items-center justify-center px-6 py-24 text-center text-white">
        <h1 className="max-w-3xl font-heading text-5xl font-light leading-tight tracking-wide sm:text-6xl lg:text-7xl">
          {hero.headline}
        </h1>
        {hero.description ? (
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
            {hero.description}
          </p>
        ) : null}
        <div className="mt-10">
          <LandingCta cta={hero.cta} />
        </div>
      </div>
    </header>
  );
}
