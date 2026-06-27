import type { LandingContactView } from "../landing-view-model";

interface ContactSectionProps {
  readonly contact: LandingContactView;
  readonly id?: string;
}

/**
 * Contact band: phone and email links, shown beside hours and location.
 */
export function ContactSection({ contact, id }: ContactSectionProps) {
  return (
    <section id={id} className="scroll-mt-20 text-left">
      <h2 className="font-heading text-2xl font-medium tracking-wide text-stone-800">
        {contact.heading}
      </h2>
      <div className="mt-4 h-px w-12 bg-stone-300" />
      <ul className="mt-6 space-y-3 text-stone-600">
        {contact.phone ? (
          <li>
            <a
              href={`tel:${contact.phone.replace(/\D/g, "")}`}
              className="transition-colors hover:text-stone-900"
            >
              {contact.phone}
            </a>
          </li>
        ) : null}
        {contact.email ? (
          <li>
            <a
              href={`mailto:${contact.email}`}
              className="transition-colors hover:text-stone-900"
            >
              {contact.email}
            </a>
          </li>
        ) : null}
      </ul>
    </section>
  );
}
