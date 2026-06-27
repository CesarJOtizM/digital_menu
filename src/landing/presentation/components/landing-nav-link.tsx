import Link from "next/link";
import { cn } from "@/lib/cn";
import type { LandingNavLink } from "../landing-navigation";

interface LandingNavLinkItemProps {
  readonly link: LandingNavLink;
  readonly className?: string;
  readonly variant?: "header" | "footer";
}

function isInternalRoute(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

/**
 * Shared nav link for landing header/footer — routes, anchors, mailto and WhatsApp.
 */
export function LandingNavLinkItem({
  link,
  className,
  variant = "header",
}: LandingNavLinkItemProps) {
  const classes = cn(
    "transition-colors",
    variant === "header" &&
      "text-xs font-medium uppercase tracking-[0.18em] text-stone-600 hover:text-stone-900",
    variant === "footer" &&
      "text-sm text-white/75 hover:text-white",
    className,
  );

  if (isInternalRoute(link.href)) {
    return (
      <Link href={link.href} className={classes}>
        {link.label}
      </Link>
    );
  }

  const opensNewTab =
    link.href.startsWith("http") || link.href.startsWith("mailto:");

  return (
    <a
      href={link.href}
      className={classes}
      {...(opensNewTab
        ? { target: "_blank", rel: "noreferrer noopener" }
        : undefined)}
    >
      {link.label}
    </a>
  );
}
