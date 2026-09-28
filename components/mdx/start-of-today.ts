/** Midnight UTC today, so every date range ends on the current day. */
export function startOfToday() {
  const now = new Date()
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
}
