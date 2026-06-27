import type { LandingAboutView } from "../landing-view-model";

interface AboutSectionProps {
  readonly about: LandingAboutView;
}

/**
 * Editorial "about" band: a serif heading over justified prose, centered and
 * generously spaced — the printed-carte voice of the Azahar brand.
 */
export function AboutSection({ about }: AboutSectionProps) {
  return (
    <section className="mx-auto max-w-2xl px-6 py-20 text-center">
      <h2 className="font-heading text-3xl font-medium tracking-wide text-stone-800 sm:text-4xl">
        {about.heading}
      </h2>
      <div className="mx-auto mt-4 h-px w-16 bg-stone-300" />
      <div className="mt-8 space-y-5">
        {about.paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className="text-base leading-relaxed text-stone-600 sm:text-lg"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
