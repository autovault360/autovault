/** Aligns mock data filters with the reference period (May 2025). Replace when wiring live data. */
export function isSoldInReferenceMonth(date: string): boolean {
  return date.startsWith("2025-05");
}

export function isSoldInReferenceYear(date: string): boolean {
  return date.startsWith("2025");
}
