'use client'

import { useBlockState } from '@/registry/components/dashboardblocks/block-state'
import {
  ChartFloatingTooltip,
  ChartPlaceholder,
  ChartTooltipItem,
} from '@/registry/components/dashboardblocks/chart'
import {
  StatusLabel,
  type StatusTone,
} from '@/registry/components/dashboardblocks/status-label'
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
  /** A CSS colour for marks drawn with `style`, such as a tooltip swatch. */
  color: string
  fill: string
  label: string
  /** Follows a service's name in a sentence, such as `is running slowly`. */
  phrase: string
  tone: StatusTone
}

const statusConfig: Record<StatusLevel, StatusConfig> = {
  operational: {
    color: 'var(--color-emerald-500)',
    fill: 'bg-emerald-500',
    label: 'Operational',
    phrase: 'is operational',
    tone: 'good',
  },
  degraded: {
    color: 'var(--color-amber-400)',
    fill: 'bg-amber-400',
    label: 'Degraded performance',
    phrase: 'is running slowly',
    tone: 'warning',
  },
  partial: {
    color: 'var(--color-orange-500)',
    fill: 'bg-orange-500',
    label: 'Partial outage',
    phrase: 'has a partial outage',
    tone: 'bad',
  },
  major: {
    color: 'var(--color-red-500)',
    fill: 'bg-red-500',
    label: 'Major outage',
    phrase: 'is down',
    tone: 'bad',
  },
  maintenance: {
    color: 'var(--color-sky-500)',
    fill: 'bg-sky-500',
    label: 'Maintenance',
    phrase: 'is in maintenance',
    tone: 'info',
  },
  unknown: {
    color: 'color-mix(in oklab, var(--color-muted-foreground) 25%, transparent)',
    fill: 'bg-muted-foreground/25',
    label: 'No data',
    phrase: 'isn’t reporting',
    tone: 'neutral',
  },
}

const severityOrder: StatusLevel[] = [
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
      severityOrder.indexOf(status) > severityOrder.indexOf(worst) ? status : worst,
    'unknown',
  )
}

interface StatusIndicatorProps {
  className?: string
  hideLabel?: boolean
  label?: string
  status: StatusLevel
}

function StatusIndicator({
  className,
  hideLabel = false,
  label,
  status,
}: StatusIndicatorProps) {
  const config = statusConfig[status]
  return (
    <span
      data-slot='status-indicator'
      data-status={status}
      className={cn('inline-flex items-center gap-2', className)}
    >
      <span aria-hidden className={cn('size-2 shrink-0 rounded-full', config.fill)} />
      <StatusLabel tone={config.tone} className={cn(hideLabel && 'sr-only')}>
        {label ?? config.label}
      </StatusLabel>
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

const UPTIME_BAR_HEIGHT = 32

interface UptimeBarProps {
  className?: string
  days: UptimeDay[]
  label: string
}

function UptimeBar({ className, days, label }: UptimeBarProps) {
  const [active, setActive] = useState<number | null>(null)
  const [shown, setShown] = useState({ index: 0, x: 0 })
  const ref = useRef<HTMLDivElement>(null)
  const state = useBlockState()
  const last = days.length - 1
  const shownDay = days[shown.index]

  if (state) {
    return <ChartPlaceholder className={className} height={UPTIME_BAR_HEIGHT} />
  }

  const show = (index: number) => {
    const width = ref.current?.offsetWidth ?? 0
    setActive(index)
    setShown({ index, x: ((index + 0.5) / days.length) * width })
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect || days.length === 0) return
    const ratio = (event.clientX - rect.left) / rect.width
    show(Math.min(last, Math.max(0, Math.floor(ratio * days.length))))
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
    show(Math.min(last, Math.max(0, next)))
  }

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
        style={{ height: UPTIME_BAR_HEIGHT }}
        className='focus-visible:ring-ring/50 flex cursor-default gap-px rounded-[3px] outline-none focus-visible:ring-[3px] @md:gap-[2px]'
        onBlur={() => setActive(null)}
        onFocus={() => show(active ?? last)}
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
      {shownDay && (
        <ChartFloatingTooltip
          active={active !== null}
          flip={shown.index > days.length / 2}
          x={shown.x}
          y={UPTIME_BAR_HEIGHT}
        >
          <span className='font-medium'>{shownDay.label}</span>
          <ChartTooltipItem
            color={statusConfig[shownDay.status].color}
            name={statusConfig[shownDay.status].label}
            value={
              shownDay.uptime !== undefined && shownDay.status !== 'unknown'
                ? formatUptime(shownDay.uptime)
                : ''
            }
          />
          {shownDay.note && (
            <span className='text-muted-foreground max-w-48'>{shownDay.note}</span>
          )}
        </ChartFloatingTooltip>
      )}
    </div>
  )
}

export {
  StatusIndicator,
  StatusLegend,
  UptimeBar,
  formatUptime,
  getUptime,
  getWorstStatus,
  statusConfig,
}

export type { StatusConfig, StatusLevel, UptimeBarProps, UptimeDay }
