"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/cn";
import {
  formatPriceInputMaskWhileTyping,
  type PriceInputFormatOptions,
} from "@/menu/application/admin/price-input-format";

interface PriceInputProps {
  readonly name?: string;
  readonly id?: string;
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  readonly priceFormat: PriceInputFormatOptions;
  readonly required?: boolean;
  readonly className?: string;
  readonly placeholder?: string;
  readonly showPlusPrefix?: boolean;
}

function toLiveMaskedDisplay(
  raw: string,
  priceFormat: PriceInputFormatOptions,
  showPlusPrefix: boolean,
): string {
  const masked = formatPriceInputMaskWhileTyping(raw, priceFormat);
  if (!masked) {
    return "";
  }

  const centavos = Number(raw.replace(/\D/g, ""));
  return showPlusPrefix && centavos > 0 ? `+${masked}` : masked;
}

export function PriceInput({
  name,
  id,
  value,
  defaultValue = "",
  onValueChange,
  priceFormat,
  required,
  className,
  placeholder,
  showPlusPrefix = false,
}: PriceInputProps) {
  const isControlled = value !== undefined;
  const [display, setDisplay] = useState(() =>
    toLiveMaskedDisplay(defaultValue, priceFormat, showPlusPrefix),
  );

  const applyLiveMask = useCallback(
    (raw: string) => {
      const masked = toLiveMaskedDisplay(raw, priceFormat, showPlusPrefix);

      if (isControlled) {
        onValueChange?.(masked);
      } else {
        setDisplay(masked);
      }

      return masked;
    },
    [isControlled, onValueChange, priceFormat, showPlusPrefix],
  );

  const currentDisplay = isControlled ? value : display;

  return (
    <input
      id={id}
      name={name}
      type="text"
      inputMode="decimal"
      required={required}
      placeholder={placeholder}
      value={currentDisplay}
      onChange={(event) => {
        applyLiveMask(event.target.value);
      }}
      className={cn(
        "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm tabular-nums",
        className,
      )}
    />
  );
}
