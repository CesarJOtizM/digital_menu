import Link from "next/link";
import { cn } from "@/lib/cn";
import type { LandingCtaView } from "../landing-view-model";

interface LandingCtaProps {
  readonly cta: LandingCtaView;
  readonly variant?: "primary" | "outline";
  readonly className?: string;
}

function isInternalHref(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

const variantClasses = {
  primary:
    "menu-accent-bg text-white shadow-sm hover:-translate-y-0.5",
  outline:
    "border border-stone-300 bg-white/70 text-stone-700 hover:border-stone-400 hover:text-stone-900",
} as const;

/**
 * Config-driven landing call to action. Supports internal routes (`/menu`) and
 * external links (`mailto:`, `tel:`, https). Display-only — no cart/checkout.
 */
export function LandingCta({
  cta,
  variant = "primary",
  className,
}: LandingCtaProps) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-medium uppercase tracking-[0.18em] transition-transform",
    variantClasses[variant],
    className,
  );

  if (isInternalHref(cta.href)) {
    return (
      <Link href={cta.href} className={classes}>
        {cta.label}
      </Link>
    );
  }

  const opensNewTab = cta.href.startsWith("http");

  return (
    <a
      href={cta.href}
      className={classes}
      {...(opensNewTab
        ? { target: "_blank", rel: "noreferrer noopener" }
        : undefined)}
    >
      {cta.label}
    </a>
  );
}
