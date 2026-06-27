import Link from "next/link";

export interface HomeLinkView {
  readonly label: string;
  readonly href: string;
}

interface ViewHomeLinkProps {
  readonly homeLink: HomeLinkView;
}

/**
 * Secondary navigation from the public menu back to the landing at `/`.
 * Shown only when the deploy has landing enabled — mirrors {@link ViewMenuCTA}
 * on the landing page. Display-only: no cart/checkout.
 */
export function ViewHomeLink({ homeLink }: ViewHomeLinkProps) {
  return (
    <Link
      href={homeLink.href}
      className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-sm font-medium text-stone-500 transition-colors hover:text-stone-800"
    >
      <span aria-hidden="true">←</span>
      {homeLink.label}
    </Link>
  );
}
