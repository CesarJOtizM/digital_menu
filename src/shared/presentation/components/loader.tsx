import { cn } from "@/lib/cn";

export interface LoaderProps {
  /** Visible status text — announced to screen readers via role="status". */
  readonly label?: string;
  readonly className?: string;
  /** Full-page centered surface vs compact inline spinner. */
  readonly variant?: "page" | "inline";
}

/**
 * Branded loading indicator. Uses the deploy accent (`--color-accent`) and the
 * same editorial typography as the public menu / landing surfaces.
 */
export function Loader({
  label = "Un momento",
  className,
  variant = "page",
}: LoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        variant === "page" &&
          "animate-menu-enter menu-surface flex min-h-screen flex-col items-center justify-center px-4 py-24",
        variant === "inline" && "inline-flex items-center gap-2.5",
        className,
      )}
    >
      <div className="loader-spinner" aria-hidden="true" />
      <p
        className={cn(
          variant === "page" &&
            "mt-6 text-center font-heading text-xl font-medium tracking-wide text-stone-600",
          variant === "inline" && "text-sm font-medium text-stone-500",
        )}
      >
        {label}
      </p>
    </div>
  );
}
