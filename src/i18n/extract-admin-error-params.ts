import type { TranslationParams } from "./translate";

export function extractAdminErrorParams(
  searchParams: Record<string, string | undefined>,
): TranslationParams | undefined {
  const params: TranslationParams = {};

  for (const [key, value] of Object.entries(searchParams)) {
    if (key.startsWith("error_") && value) {
      params[key.slice("error_".length)] = value;
    }
  }

  return Object.keys(params).length > 0 ? params : undefined;
}
