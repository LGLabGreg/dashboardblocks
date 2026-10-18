import type { Provenance } from '@/registry/components/dashboardblocks/kpi-provenance'

function formatProvenanceWindow(
  window: Provenance['window'],
  locale = 'en-US',
  timeZone?: string,
) {
  if (!window) return 'All time'
  const format = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone })
  // Client only: the window shows in the details popover, after someone opens it.
  return format.formatRange(window.from, window.to)
}

function formatProvenanceFilters(filters: Provenance['filters']) {
  return Object.entries(filters).map(([name, value]) => `${name}: ${value}`)
}

export { formatProvenanceFilters, formatProvenanceWindow }
