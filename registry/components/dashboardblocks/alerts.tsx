'use client'

import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import { cn } from '@/lib/utils'

type AlertSeverity = 'critical' | 'warning' | 'info' | 'resolved'

interface SeverityConfig {
  icon: React.ReactNode
  label: string
  /** Tinted background with readable text, for badges. */
  soft: string
  /** Text colour for icons and inline labels. */
  text: string
  /** Solid fill, for bars and dots. */
  fill: string
}

/** Severity colours are for alerts only, and always come with an icon and a label. */
const severityConfig: Record<AlertSeverity, SeverityConfig> = {
  critical: {
    fill: 'bg-red-600',
    icon: (
      <IconPlaceholder
        lucide='OctagonAlertIcon'
        tabler='IconAlertOctagon'
        hugeicons='AlertDiamondIcon'
        phosphor='WarningOctagonIcon'
        remixicon='RiAlarmWarningLine'
        aria-hidden
      />
    ),
    label: 'Critical',
    soft: 'bg-red-500/10 text-red-700 dark:text-red-400',
    text: 'text-red-700 dark:text-red-400',
  },
  info: {
    fill: 'bg-sky-600',
    icon: (
      <IconPlaceholder
        lucide='InfoIcon'
        tabler='IconInfoCircle'
        hugeicons='AlertCircleIcon'
        phosphor='InfoIcon'
        remixicon='RiInformationLine'
        aria-hidden
      />
    ),
    label: 'Info',
    soft: 'bg-sky-500/10 text-sky-800 dark:text-sky-300',
    text: 'text-sky-800 dark:text-sky-300',
  },
  resolved: {
    fill: 'bg-emerald-600',
    icon: (
      <IconPlaceholder
        lucide='CircleCheckIcon'
        tabler='IconCircleCheck'
        hugeicons='CheckmarkCircle02Icon'
        phosphor='CheckCircleIcon'
        remixicon='RiCheckboxCircleLine'
        aria-hidden
      />
    ),
    label: 'Resolved',
    soft: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  warning: {
    fill: 'bg-amber-500',
    icon: (
      <IconPlaceholder
        lucide='TriangleAlertIcon'
        tabler='IconAlertTriangle'
        hugeicons='Alert02Icon'
        phosphor='WarningIcon'
        remixicon='RiErrorWarningLine'
        aria-hidden
      />
    ),
    label: 'Warning',
    soft: 'bg-amber-500/10 text-amber-800 dark:text-amber-400',
    text: 'text-amber-800 dark:text-amber-400',
  },
}

/** Most severe first. */
const severityOrder: AlertSeverity[] = ['critical', 'warning', 'info', 'resolved']

function SeverityBadge({
  className,
  label,
  severity,
}: {
  className?: string
  label?: string
  severity: AlertSeverity
}) {
  const config = severityConfig[severity]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0',
        config.soft,
        className,
      )}
    >
      {config.icon}
      {label ?? config.label}
    </span>
  )
}

/** The severity icon in a tinted circle. Pair it with the severity in text nearby. */
function SeverityIcon({
  className,
  severity,
}: {
  className?: string
  severity: AlertSeverity
}) {
  const config = severityConfig[severity]
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full [&_svg]:size-4',
        config.soft,
        className,
      )}
    >
      {config.icon}
    </span>
  )
}

const relativeFormatter = new Intl.RelativeTimeFormat('en-US', {
  numeric: 'auto',
  style: 'short',
})

/** "5 min ago", "2 hr ago", "yesterday". Pass a fixed `now` to render the same on server and client. */
function formatRelativeTime(date: Date, now: Date) {
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000)
  const minutes = Math.round(seconds / 60)
  const hours = Math.round(minutes / 60)
  const days = Math.round(hours / 24)
  if (Math.abs(seconds) < 60) return 'just now'
  if (Math.abs(minutes) < 60) return relativeFormatter.format(minutes, 'minute')
  if (Math.abs(hours) < 24) return relativeFormatter.format(hours, 'hour')
  return relativeFormatter.format(days, 'day')
}

export { SeverityBadge, SeverityIcon, formatRelativeTime, severityConfig, severityOrder }

export type { AlertSeverity, SeverityConfig }
