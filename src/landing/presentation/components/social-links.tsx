import type { LandingSocialLink } from "../landing-view-model";

interface SocialLinksProps {
  readonly links: readonly LandingSocialLink[];
}

/**
 * A row of social links rendered as understated uppercase labels. Renders
 * nothing when there are no links, so the page can include it unconditionally.
 */
export function SocialLinks({ links }: SocialLinksProps) {
  if (links.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Social links"
      className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
    >
      {links.map((link) => (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noreferrer noopener"
          className="text-xs font-medium uppercase tracking-[0.25em] text-stone-500 underline-offset-4 transition-colors hover:text-stone-900 hover:underline"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}
