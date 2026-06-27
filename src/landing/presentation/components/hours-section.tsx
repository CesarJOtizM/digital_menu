import type { LandingHoursView } from "../landing-view-model";

interface HoursSectionProps {
  readonly hours: LandingHoursView;
}

/**
 * Opening-hours band: a serif heading over a simple day/hours list with a dotted
 * leader rule between each label and its time, echoing the menu's printed style.
 */
export function HoursSection({ hours }: HoursSectionProps) {
  return (
    <section className="mx-auto max-w-lg px-6 py-16 text-center">
      <h2 className="font-heading text-2xl font-medium tracking-wide text-stone-800 sm:text-3xl">
        {hours.heading}
      </h2>
      <div className="mx-auto mt-4 h-px w-16 bg-stone-300" />
      <dl className="mt-8 space-y-3 text-left">
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
