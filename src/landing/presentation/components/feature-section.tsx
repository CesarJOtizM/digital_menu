import { cn } from "@/lib/cn";
import { LandingCta } from "./landing-cta";
import { LandingImage } from "./landing-image";
import { featureSectionId } from "../landing-navigation";
import type { LandingFeatureView } from "../landing-view-model";

interface FeatureSectionProps {
  readonly feature: LandingFeatureView;
  readonly index: number;
  readonly variant?: "default" | "muted";
}

/**
 * Split editorial feature block — text and image side by side, alternating
 * like the story sections on azaharpr.com.
 */
export function FeatureSection({
  feature,
  index,
  variant = "default",
}: FeatureSectionProps) {
  const imageOnLeft = index % 2 === 1;
  const imageAlt = feature.imageAlt ?? feature.heading;
  const isPortrait =
    feature.imageAlt?.toLowerCase().includes("chef") ||
    feature.imageUrl?.includes("feature-chef") === true;

  return (
    <section
      id={featureSectionId(feature.heading)}
      className={cn(
        "scroll-mt-20 px-6 py-16 sm:py-20",
        variant === "muted" && "bg-stone-100/70",
      )}
    >
      <div
        className={cn(
          "mx-auto grid max-w-5xl items-center gap-10",
          feature.imageUrl ? "md:grid-cols-2" : "max-w-2xl",
        )}
      >
        <div
          className={cn(
            "text-center md:text-left",
            feature.imageUrl && imageOnLeft && "md:order-2",
          )}
        >
          <h2 className="font-heading text-3xl font-medium tracking-wide text-stone-800 sm:text-4xl">
            {feature.heading}
          </h2>
          <div
            className={cn(
              "mt-4 h-px w-16 bg-stone-300",
              !feature.imageUrl && "mx-auto",
            )}
          />
          <p className="mt-8 text-base leading-relaxed text-stone-600 sm:text-lg">
            {feature.body}
          </p>
          {feature.cta ? (
            <div className="mt-8">
              <LandingCta cta={feature.cta} variant="outline" />
            </div>
          ) : null}
        </div>

        {feature.imageUrl ? (
          <LandingImage
            src={feature.imageUrl}
            alt={imageAlt}
            aspect={isPortrait ? "portrait" : "video"}
            className={cn(imageOnLeft && "md:order-1")}
            priority={index === 0}
          />
        ) : null}
      </div>
    </section>
  );
}
