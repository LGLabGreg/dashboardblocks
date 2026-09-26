'use client'

import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type KeyboardEvent, type PointerEvent, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

type StatusLevel =
  | 'operational'
  | 'degraded'
  | 'partial'
  | 'major'
  | 'maintenance'
  | 'unknown'

interface StatusConfig {
  /** Solid fill for dots and uptime bars. */
  fill: string
  icon: React.ReactNode
  label: string
  /** Tinted background with readable foreground, for badges. */
  soft: string
  /** Readable foreground on the card surface. */
  text: string
}

/** Reserved status colors. Always shown with an icon or label, never color alone. */
const statusConfig: Record<StatusLevel, StatusConfig> = {
  operational: {
    fill: 'bg-emerald-500',
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
    label: 'Operational',
    soft: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  degraded: {
    fill: 'bg-amber-400',
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
    label: 'Degraded performance',
    soft: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    text: 'text-amber-700 dark:text-amber-400',
  },
  partial: {
    fill: 'bg-orange-500',
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
    label: 'Partial outage',
    soft: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
    text: 'text-orange-700 dark:text-orange-400',
  },
  major: {
    fill: 'bg-red-500',
    icon: (
      <IconPlaceholder
        lucide='CircleXIcon'
        tabler='IconCircleX'
        hugeicons='CancelCircleIcon'
        phosphor='XCircleIcon'
        remixicon='RiCloseCircleLine'
        aria-hidden
      />
    ),
    label: 'Major outage',
    soft: 'bg-red-500/10 text-red-700 dark:text-red-400',
    text: 'text-red-700 dark:text-red-400',
  },
  maintenance: {
    fill: 'bg-sky-500',
    icon: (
      <IconPlaceholder
        lucide='WrenchIcon'
        tabler='IconTool'
        hugeicons='Wrench01Icon'
        phosphor='WrenchIcon'
        remixicon='RiToolsLine'
        aria-hidden
      />
    ),
    label: 'Maintenance',
    soft: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
    text: 'text-sky-700 dark:text-sky-400',
  },
  unknown: {
    fill: 'bg-muted-foreground/25',
    icon: (
      <IconPlaceholder
        lucide='CircleDashedIcon'
        tabler='IconCircleDashed'
        hugeicons='DashedLineCircleIcon'
        phosphor='CircleDashedIcon'
        remixicon='RiLoaderLine'
        aria-hidden
      />
    ),
    label: 'No data',
    soft: 'bg-muted text-muted-foreground',
    text: 'text-muted-foreground',
  },
}

/** Severity order, used to find the worst status in a set. */
const severity: StatusLevel[] = [
  'unknown',
  'operational',
  'maintenance',
  'degraded',
  'partial',
  'major',
]

function getWorstStatus(statuses: StatusLevel[]): StatusLevel {
  return statuses.reduce<StatusLevel>(
    (worst, status) =>
      severity.indexOf(status) > severity.indexOf(worst) ? status : worst,
    'unknown',
  )
}

interface StatusIndicatorProps {
  className?: string
  /** Hide the label visually but keep it for assistive technology. */
  hideLabel?: boolean
  label?: string
  status: StatusLevel
}

/** A status dot with its label. */
function StatusIndicator({
  className,
  hideLabel = false,
  label,
  status,
}: StatusIndicatorProps) {
  const config = statusConfig[status]
  return (
    <span
      className={cn('inline-flex items-center gap-2 text-sm', config.text, className)}
    >
      <span aria-hidden className={cn('size-2 shrink-0 rounded-full', config.fill)} />
      <span className={cn(hideLabel && 'sr-only')}>{label ?? config.label}</span>
    </span>
  )
}

interface StatusBadgeProps {
  className?: string
  label?: string
  status: StatusLevel
}

/** A tinted pill with the status icon and label. */
function StatusBadge({ className, label, status }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0',
        config.soft,
        className,
      )}
    >
      {config.icon}
      {label ?? config.label}
    </span>
  )
}

interface StatusLegendProps {
  className?: string
  statuses: StatusLevel[]
}

function StatusLegend({ className, statuses }: StatusLegendProps) {
  return (
    <ul
      className={cn(
        'text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs',
        className,
      )}
    >
      {statuses.map((status) => (
        <li key={status} className='flex items-center gap-1.5'>
          <span
            aria-hidden
            className={cn('h-2.5 w-1 rounded-[1px]', statusConfig[status].fill)}
          />
          {statusConfig[status].label}
        </li>
      ))}
    </ul>
  )
}

interface UptimeDay {
  label: string
  note?: string
  status: StatusLevel
  /** Share of the day the service was up, 0–100. */
  uptime?: number
}

/** Average uptime across days that have data, as a percentage. */
function getUptime(days: UptimeDay[]) {
  const measured = days.filter((day) => day.status !== 'unknown')
  if (measured.length === 0) return 0
  const total = measured.reduce(
    (sum, day) => sum + (day.uptime ?? (day.status === 'major' ? 0 : 100)),
    0,
  )
  return total / measured.length
}

/** Truncates rather than rounds, so any downtime never displays as 100%. */
function formatUptime(value: number) {
  if (value >= 100) return '100%'
  return `${(Math.floor(value * 100) / 100).toFixed(2)}%`
}

function describeDay(day: UptimeDay | undefined) {
  if (!day) return ''
  const parts = [day.label, statusConfig[day.status].label]
  if (day.uptime !== undefined && day.status !== 'unknown') {
    parts.push(`${formatUptime(day.uptime)} uptime`)
  }
  if (day.note) parts.push(day.note)
  return parts.join(', ')
}

interface UptimeBarProps {
  className?: string
  days: UptimeDay[]
  /** Names the service for assistive technology. */
  label: string
}

/**
 * One bar per day, colored by status. Hover or use the arrow keys to read a day.
 */
function UptimeBar({ className, days, label }: UptimeBarProps) {
  const [active, setActive] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const last = days.length - 1
  const activeDay = active === null ? undefined : days[active]

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect || days.length === 0) return
    const ratio = (event.clientX - rect.left) / rect.width
    setActive(Math.min(last, Math.max(0, Math.floor(ratio * days.length))))
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = active ?? last
    const next =
      event.key === 'ArrowLeft'
        ? current - 1
        : event.key === 'ArrowRight'
          ? current + 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : null
    if (next === null) return
    event.preventDefault()
    setActive(Math.min(last, Math.max(0, next)))
  }

  const position = active === null ? 0 : ((active + 0.5) / days.length) * 100
  const align = position < 15 ? 'start' : position > 85 ? 'end' : 'center'

  return (
    <div className={cn('@container relative', className)}>
      <div
        ref={ref}
        role='slider'
        tabIndex={0}
        aria-label={`${label}, daily status`}
        aria-orientation='horizontal'
        aria-valuemax={days.length}
        aria-valuemin={1}
        aria-valuenow={(active ?? last) + 1}
        aria-valuetext={describeDay(days[active ?? last])}
        className='focus-visible:ring-ring/50 flex h-8 cursor-default gap-px rounded-[3px] @md:gap-[2px] outline-none focus-visible:ring-[3px]'
        onBlur={() => setActive(null)}
        onFocus={() => setActive((value) => value ?? last)}
        onKeyDown={onKeyDown}
        onPointerLeave={() => setActive(null)}
        onPointerMove={onPointerMove}
      >
        {days.map((day, index) => (
          <span
            key={`${day.label}-${index}`}
            aria-hidden
            className={cn(
              'h-full min-w-0 flex-1 rounded-[2px] transition-opacity duration-150',
              statusConfig[day.status].fill,
              active !== null && active !== index && 'opacity-50',
            )}
          />
        ))}
      </div>
      {activeDay && (
        <div
          aria-hidden
          className={cn(
            'bg-popover text-popover-foreground pointer-events-none absolute bottom-full z-10 mb-2 grid w-max max-w-56 gap-1 rounded-lg px-3 py-2 text-xs shadow-md ring-1 ring-foreground/10',
            align === 'center' && '-translate-x-1/2',
            align === 'end' && '-translate-x-full',
          )}
          style={{ left: `${position}%` }}
        >
          <span className='text-muted-foreground'>{activeDay.label}</span>
          <StatusIndicator className='text-xs font-medium' status={activeDay.status} />
          {activeDay.uptime !== undefined && activeDay.status !== 'unknown' && (
            <span className='tabular-nums'>{formatUptime(activeDay.uptime)} uptime</span>
          )}
          {activeDay.note && (
            <span className='text-muted-foreground'>{activeDay.note}</span>
          )}
        </div>
      )}
    </div>
  )
}

export {
  StatusBadge,
  StatusIndicator,
  StatusLegend,
  UptimeBar,
  formatUptime,
  getUptime,
  getWorstStatus,
  statusConfig,
}

export type { StatusConfig, StatusLevel, UptimeBarProps, UptimeDay }
