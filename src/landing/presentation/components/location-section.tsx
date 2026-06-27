import type { LandingLocationView } from "../landing-view-model";

interface LocationSectionProps {
  readonly location: LandingLocationView;
}

/**
 * Location band: a serif heading over the address, with an optional "Get
 * directions" link to the configured map URL. Display-only and editorial.
 */
export function LocationSection({ location }: LocationSectionProps) {
  return (
    <section className="mx-auto max-w-lg px-6 py-16 text-center">
      <h2 className="font-heading text-2xl font-medium tracking-wide text-stone-800 sm:text-3xl">
        {location.heading}
      </h2>
      <div className="mx-auto mt-4 h-px w-16 bg-stone-300" />
      <address className="mt-8 text-base not-italic leading-relaxed text-stone-600 sm:text-lg">
        {location.address}
      </address>
      {location.mapUrl ? (
        <a
          href={location.mapUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-4 inline-block text-sm font-medium uppercase tracking-[0.2em] text-stone-500 underline-offset-4 transition-colors hover:text-stone-800 hover:underline"
        >
          Get directions
        </a>
      ) : null}
    </section>
  );
}
