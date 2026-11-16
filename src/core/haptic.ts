/** Soft haptic feedback for mobile Web (no-op when unsupported). */
export function haptic(pattern: number | number[]): void {
  try {
    const nav = typeof navigator !== 'undefined' ? navigator : null;
    if (nav && typeof nav.vibrate === 'function') nav.vibrate(pattern);
  } catch {
    // Ignore permission / platform failures.
  }
}
