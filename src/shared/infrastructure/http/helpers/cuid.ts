const CUID_PATTERN = /^c[a-z0-9]{24,}$/;

export function isCuid(value: string): boolean {
  return CUID_PATTERN.test(value);
}
