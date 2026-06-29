import { cn } from "@/lib/cn";

interface ItemStatusIconProps {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
  className?: string;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden>
      <path
        d="M3.5 8.25 6.25 11 12.5 5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HiddenIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden>
      <path
        d="M4 8h8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ItemStatusIcon({
  active,
  activeLabel,
  inactiveLabel,
  className,
}: ItemStatusIconProps) {
  const label = active ? activeLabel : inactiveLabel;

  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-full",
        active
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80"
          : "bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200",
        className,
      )}
    >
      {active ? <CheckIcon /> : <HiddenIcon />}
    </span>
  );
}
