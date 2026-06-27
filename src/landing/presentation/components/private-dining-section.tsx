import { LandingCta } from "./landing-cta";
import { LandingImage } from "./landing-image";
import type { LandingCalloutView } from "../landing-view-model";

interface PrivateDiningSectionProps {
  readonly callout: LandingCalloutView;
}

/**
 * Private dining callout — split image + accent copy, like azaharpr.com.
 */
export function PrivateDiningSection({ callout }: PrivateDiningSectionProps) {
  const imageAlt = callout.imageAlt ?? callout.heading;

  return (
    <section id="private-dining" className="grid scroll-mt-20 md:grid-cols-2">
      {callout.imageUrl ? (
        <div className="relative min-h-72 md:min-h-[28rem]">
          <LandingImage
            src={callout.imageUrl}
            alt={imageAlt}
            fill
            className="rounded-none border-0 shadow-none"
          />
        </div>
      ) : null}

      <div className="menu-accent-bg flex flex-col justify-center px-6 py-20 text-white md:px-12">
        <div className="mx-auto max-w-lg text-center md:text-left">
          <h2 className="font-heading text-3xl font-medium tracking-wide sm:text-4xl">
            {callout.heading}
          </h2>
          <p className="mt-6 text-base leading-relaxed text-white/90 sm:text-lg">
            {callout.body}
          </p>
          {callout.cta ? (
            <div className="mt-8">
              <LandingCta
                cta={callout.cta}
                variant="outline"
                className="border-white/40 bg-white/10 text-white hover:border-white/70 hover:text-white"
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
