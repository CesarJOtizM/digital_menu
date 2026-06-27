import type { LandingHoursView } from "../landing-view-model";
import { cn } from "@/lib/cn";

interface HoursSectionProps {
  readonly hours: LandingHoursView;
  readonly className?: string;
  readonly align?: "center" | "left";
  readonly id?: string;
}

/**
 * Opening-hours band: day/hours list with dotted leaders.
 */
export function HoursSection({
  hours,
  className,
  align = "center",
  id,
}: HoursSectionProps) {
  return (
    <section
      id={id}
      className={cn(align === "center" && "text-center", "scroll-mt-20", className)}
    >
      <h2 className="font-heading text-2xl font-medium tracking-wide text-stone-800 sm:text-3xl">
        {hours.heading}
      </h2>
      <div
        className={cn(
          "mt-4 h-px w-16 bg-stone-300",
          align === "center" ? "mx-auto" : "w-12",
        )}
      />
      <dl className="mt-8 space-y-3">
        {hours.rows.map((row) => (
          <div key={row.day} className="flex items-baseline gap-3">
            <dt className="font-medium text-stone-700">{row.day}</dt>
            <span
              aria-hidden="true"
              className="flex-1 self-center border-b border-dotted border-stone-300"
            />
            <dd className="tabular-nums text-stone-600">{row.hours}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
