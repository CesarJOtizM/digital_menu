/** Parses a decimal price string (e.g. "12.50") into integer centavos. */
export function parsePriceInputToCentavos(raw: string): number {
  const normalized = raw.trim().replace(",", ".");
  if (!normalized) {
    throw new Error("Precio requerido");
  }

  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Precio inválido");
  }

  return Math.round(amount * 100);
}

/** Formats centavos as a decimal string for HTML number/text inputs. */
export function formatCentavosForInput(centavos: number): string {
  return (centavos / 100).toFixed(2);
}
