// Shared formatting helpers used across dashboard and admin views.

/**
 * Formats a remaining-time duration (in milliseconds) as "Xm Ys".
 * Returns `fallback` for non-positive or non-finite values.
 */
export function formatRemaining(ms: number, fallback = "—"): string {
  if (!Number.isFinite(ms) || ms <= 0) return fallback;
  const totalSeconds = Math.floor(ms / 1000);
  return `${Math.floor(totalSeconds / 60)}m ${totalSeconds % 60}s`;
}

/**
 * Formats a timestamp (epoch ms or ISO string) as a locale date-time string.
 * Returns `fallback` when the value is missing.
 */
export function formatDateTime(
  value: number | string | undefined | null,
  fallback = "Not recorded",
): string {
  return value ? new Date(value).toLocaleString() : fallback;
}
