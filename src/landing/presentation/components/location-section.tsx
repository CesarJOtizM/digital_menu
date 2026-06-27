import type { LandingLocationView } from "../landing-view-model";
import { cn } from "@/lib/cn";

interface LocationSectionProps {
  readonly location: LandingLocationView;
  readonly className?: string;
  readonly align?: "center" | "left";
  readonly id?: string;
}

/**
 * Location band: address, embedded Google Maps, and an optional external link.
 */
export function LocationSection({
  location,
  className,
  align = "center",
  id,
}: LocationSectionProps) {
  const directionsHref =
    location.mapUrl ??
    `https://maps.google.com/?q=${encodeURIComponent(location.address)}`;

  return (
    <section
      id={id}
      className={cn(align === "center" && "text-center", "scroll-mt-20", className)}
    >
      <h2 className="font-heading text-2xl font-medium tracking-wide text-stone-800 sm:text-3xl">
        {location.heading}
      </h2>
      <div
        className={cn(
          "mt-4 h-px w-16 bg-stone-300",
          align === "center" ? "mx-auto" : "w-12",
        )}
      />
      <address className="mt-8 text-base not-italic leading-relaxed text-stone-600 sm:text-lg">
        {location.address}
      </address>

      <div
        className={cn(
          "mt-6 overflow-hidden rounded-sm border border-stone-300/80 bg-stone-100 shadow-sm",
          align === "center" ? "mx-auto max-w-md" : "w-full",
        )}
      >
        <iframe
          title={`Mapa — ${location.address}`}
          src={location.mapEmbedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="aspect-[4/3] w-full border-0"
          allowFullScreen
        />
      </div>

      <a
        href={directionsHref}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-4 inline-block text-sm font-medium uppercase tracking-[0.2em] text-stone-500 underline-offset-4 transition-colors hover:text-stone-800 hover:underline"
      >
        Abrir en Google Maps
      </a>
    </section>
  );
}
