"use client";

import { useTranslations } from "@/i18n";

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();

  return (
    <div>
      <h2>{t("errors.genericTitle")}</h2>
      <button onClick={() => reset()}>{t("errors.retry")}</button>
    </div>
  );
}
