/**
 * Builds a Google Maps embed URL from an address or an existing maps link.
 * Uses the public embed endpoint — no API key required.
 */
export function buildGoogleMapsEmbedUrl(
  address: string,
  mapUrl?: string | null,
): string {
  const query = extractMapsQuery(mapUrl, address);
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`;
}

function extractMapsQuery(mapUrl: string | null | undefined, address: string): string {
  if (!mapUrl) {
    return address;
  }

  try {
    const url = new URL(mapUrl);
    const q = url.searchParams.get("q");
    if (q) {
      return q;
    }
  } catch {
    // Fall through to regex / address.
  }

  const match = mapUrl.match(/[?&]q=([^&]+)/);
  if (match?.[1]) {
    return decodeURIComponent(match[1].replace(/\+/g, " "));
  }

  return address;
}
