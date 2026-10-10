'use client'

import { getHeatColor } from '@/registry/components/dashboardblocks/heatmap'
import { useInView } from '@/registry/hooks/use-in-view'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type ReactNode, type RefObject, useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

interface RetentionCohort {
  label: string
  size: number
  /** How many were still active in each period since joining, starting with period 0. */
  retained: number[]
}

function getRetentionRates(cohort: RetentionCohort) {
  return cohort.retained.map((count) => (cohort.size > 0 ? count / cohort.size : 0))
}

function getAverageRetention(cohorts: RetentionCohort[]) {
  const periods = Math.max(0, ...cohorts.map((cohort) => cohort.retained.length))
  return Array.from({ length: periods }, (_, period) => {
    let retained = 0
    let size = 0
    for (const cohort of cohorts) {
      if (period >= cohort.retained.length) continue
      retained += cohort.retained[period]
      size += cohort.size
    }
    return size > 0 ? retained / size : null
  })
}

function getPlateau(rates: (number | null)[], threshold = 0.02) {
  for (let period = 1; period < rates.length - 1; period++) {
    const rate = rates[period]
    const next = rates[period + 1]
    if (rate === null || next === null) return null
    if (rate - next < threshold) return { period, rate }
  }
  return null
}

interface GrowthAccountingInput {
  churned: number
  new: number
  resurrected: number
}

function getQuickRatio({ churned, new: added, resurrected }: GrowthAccountingInput) {
  const gained = added + resurrected
  return churned > 0 ? gained / churned : gained > 0 ? Infinity : 0
}

function formatRetention(rate: number, digits = 0) {
  return `${(rate * 100).toFixed(digits)}%`
}

function formatPoints(difference: number, digits = 1) {
  const points = Math.abs(difference * 100).toFixed(digits)
  if (Number(points) === 0) return `0 pts`
  return `${difference > 0 ? '+' : '−'}${points} pts`
}

interface RetentionChangeProps {
  className?: string
  /** The difference between two 0–1 shares, e.g. */
  difference: number
  versus?: string
}

function RetentionChange({ className, difference, versus }: RetentionChangeProps) {
  const rounded = Math.round(difference * 1000) / 1000
  const direction = rounded > 0 ? 'up' : rounded < 0 ? 'down' : 'flat'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-medium whitespace-nowrap tabular-nums [&_svg]:size-3.5 [&_svg]:shrink-0',
        direction === 'up' && 'text-emerald-700 dark:text-emerald-400',
        direction === 'down' && 'text-red-700 dark:text-red-400',
        direction === 'flat' && 'text-muted-foreground',
        className,
      )}
    >
      {direction === 'up' && (
        <IconPlaceholder
          lucide='ArrowUpIcon'
          tabler='IconArrowUp'
          hugeicons='ArrowUpIcon'
          phosphor='ArrowUpIcon'
          remixicon='RiArrowUpLine'
          aria-hidden
        />
      )}
      {direction === 'down' && (
        <IconPlaceholder
          lucide='ArrowDownIcon'
          tabler='IconArrowDown'
          hugeicons='ArrowDown01Icon'
          phosphor='ArrowDownIcon'
          remixicon='RiArrowDownLine'
          aria-hidden
        />
      )}
      <span aria-hidden>{formatPoints(difference)}</span>
      <span className='sr-only'>
        {direction === 'flat'
          ? 'No change'
          : `${direction === 'up' ? 'Up' : 'Down'} ${Math.abs(difference * 100).toFixed(1)} points`}
        {versus ? ` vs ${versus}` : ''}
      </span>
    </span>
  )
}

interface CohortCell {
  period: number
  row: number | 'average'
}

interface CohortTableProps {
  /** Shown under the table when no cell is hovered, such as a summary. */
  children?: ReactNode
  average?: boolean
  caption: string
  className?: string
  /** @default 'Cohort' */
  cohortHeader?: string
  cohorts: RetentionCohort[]
  /** @default 'var(--chart-2)' */
  color?: string
  describeCell?: (cell: {
    cohort: RetentionCohort | null
    period: number
    rate: number
  }) => string
  formatCount?: (value: number) => string
  footer?: ReactNode
  label?: string
  /** Keeps cells legible in narrow cards: below this width the table scrolls sideways. */
  minWidth?: string
  mode?: 'percent' | 'count'
  periodName?: string
  scaleMax?: number
  /** The share that gets the faintest colour, for tables whose shares sit in a narrow band, such as revenue around 100%. */
  scaleMin?: number
  /** @default 'Users' */
  sizeHeader?: string
}

function CohortTable({
  average = true,
  caption,
  children,
  className,
  cohortHeader = 'Cohort',
  cohorts,
  color,
  describeCell,
  footer,
  formatCount = (value) => value.toLocaleString(),
  label = caption,
  minWidth,
  mode = 'percent',
  periodName = 'Period',
  scaleMax: scaleMaxProp,
  scaleMin: scaleMinProp = 0,
  sizeHeader = 'Users',
}: CohortTableProps) {
  const [active, setActive] = useState<CohortCell | null>(null)

  const averages = getAverageRetention(cohorts)
  const periods = averages.length
  const total = cohorts.reduce((sum, cohort) => sum + cohort.size, 0)
  const later = cohorts.flatMap((cohort) => getRetentionRates(cohort).slice(1))
  const scaleMax = scaleMaxProp ?? (later.length > 0 ? Math.max(...later) : 1)
  const scaleMin = scaleMinProp < scaleMax ? scaleMinProp : 0
  const scaleRange = scaleMax - scaleMin
  const unit = periodName.toLowerCase()
  const shortName = periodName.charAt(0).toUpperCase()

  const describe = ({ period, row }: CohortCell) => {
    const cohort = row === 'average' ? null : cohorts[row]
    const rate = cohort
      ? (getRetentionRates(cohort)[period] ?? 0)
      : (averages[period] ?? 0)
    if (describeCell) return describeCell({ cohort, period, rate })
    if (!cohort) {
      return `Average, ${unit} ${period}: ${formatRetention(rate, 1)} retained`
    }
    return `${cohort.label}, ${unit} ${period}: ${formatCount(cohort.retained[period])} of ${formatCount(cohort.size)} (${formatRetention(rate, 1)})`
  }

  const renderCell = (
    row: CohortCell['row'],
    period: number,
    rate: number,
    label: string,
  ) => {
    const isActive = active?.row === row && active.period === period
    return (
      <td
        key={period}
        onPointerEnter={() => setActive({ period, row })}
        onPointerDown={() => setActive({ period, row })}
        className={cn(
          'ring-offset-card h-8 min-w-11 rounded-[3px] px-1 text-center font-medium whitespace-nowrap',
          row === 'average' && 'font-semibold',
          isActive && 'ring-foreground ring-2 ring-offset-1',
        )}
        style={{
          backgroundColor: getHeatColor(
            scaleRange > 0 ? (rate - scaleMin) / scaleRange : 0,
            color,
          ),
        }}
      >
        {label}
      </td>
    )
  }

  const emptyCell = (period: number) => (
    <td key={period}>
      <span className='sr-only'>Not reached yet</span>
    </td>
  )

  const labelCell = cn(
    'pr-2 text-left whitespace-nowrap',
    minWidth && 'bg-card sticky left-0 z-10',
  )

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div
        role={minWidth ? 'region' : undefined}
        aria-label={minWidth ? label : undefined}
        tabIndex={minWidth ? 0 : undefined}
        className={cn(
          minWidth &&
            'focus-visible:ring-ring/50 relative -my-1 overflow-x-auto rounded-sm py-1 outline-none focus-visible:ring-3',
        )}
        onPointerLeave={() => setActive(null)}
      >
        <table
          className='w-full border-separate border-spacing-[3px] text-xs tabular-nums'
          style={{ minWidth }}
        >
          <caption className='sr-only'>{caption}</caption>
          <thead>
            <tr className='text-muted-foreground text-[11px]'>
              <th scope='col' className={cn(labelCell, 'font-normal')}>
                {cohortHeader}
              </th>
              <th scope='col' className='pr-2 text-right font-normal whitespace-nowrap'>
                {sizeHeader}
              </th>
              {averages.map((_, period) => (
                <th key={period} scope='col' className='font-normal whitespace-nowrap'>
                  <span aria-hidden>
                    {shortName}
                    {period}
                  </span>
                  <span className='sr-only'>
                    {periodName} {period}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohorts.map((cohort, row) => (
              <tr key={cohort.label}>
                <th
                  scope='row'
                  className={cn(labelCell, 'text-muted-foreground font-normal')}
                >
                  {cohort.label}
                </th>
                <td className='text-muted-foreground pr-2 text-right whitespace-nowrap'>
                  {formatCount(cohort.size)}
                </td>
                {Array.from({ length: periods }, (_, period) => {
                  if (period >= cohort.retained.length) return emptyCell(period)
                  const count = cohort.retained[period]
                  const rate = cohort.size > 0 ? count / cohort.size : 0
                  const label =
                    mode === 'percent' ? formatRetention(rate) : formatCount(count)
                  return renderCell(row, period, rate, label)
                })}
              </tr>
            ))}
          </tbody>
          {average && (
            <tfoot>
              <tr>
                <th scope='row' className={cn(labelCell, 'font-medium')}>
                  Average
                </th>
                <td className='pr-2 text-right font-medium whitespace-nowrap'>
                  {formatCount(total)}
                </td>
                {averages.map((rate, period) =>
                  rate === null
                    ? emptyCell(period)
                    : renderCell('average', period, rate, formatRetention(rate)),
                )}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <div className='flex flex-wrap items-center justify-between gap-x-6 gap-y-2'>
        <p className='text-muted-foreground min-h-5 text-sm'>
          {active ? (
            <span className='text-foreground'>{describe(active)}</span>
          ) : (
            children
          )}
        </p>
        {footer}
      </div>
    </div>
  )
}

interface RetentionBarProps {
  animated?: boolean
  className?: string
  /** @default 'var(--chart-2)' */
  color?: string
  /** Marks an earlier value to compare against, 0–1. */
  previous?: number
  /** 0–1. */
  value: number
}

function RetentionBar({
  animated = true,
  className,
  color = 'var(--chart-2)',
  previous,
  value,
}: RetentionBarProps) {
  const { isInView, ref } = useInView({ threshold: 0.3 })
  const [revealed, setRevealed] = useState(!animated)

  useEffect(() => {
    if (!animated || !isInView) return
    const frame = requestAnimationFrame(() => setRevealed(true))
    return () => cancelAnimationFrame(frame)
  }, [animated, isInView])

  const clamp = (share: number) => Math.min(1, Math.max(0, share))

  return (
    <div
      ref={ref as RefObject<HTMLDivElement>}
      aria-hidden
      className={cn('relative h-2 w-full', className)}
    >
      <div className='bg-muted h-full w-full overflow-hidden rounded-full'>
        <div
          className='h-full rounded-full transition-[width] duration-1000 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none'
          style={{
            backgroundColor: color,
            width: `${(revealed ? clamp(value) : 0) * 100}%`,
          }}
        />
      </div>
      {previous !== undefined && (
        <span
          className='bg-foreground ring-card absolute top-1/2 h-[calc(100%+8px)] w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2'
          style={{ left: `${clamp(previous) * 100}%` }}
        />
      )}
    </div>
  )
}

function RetentionBarKey({
  className,
  label = 'Previous cohort',
}: {
  className?: string
  label?: string
}) {
  return (
    <span
      className={cn(
        'text-muted-foreground inline-flex items-center gap-1.5 text-xs',
        className,
      )}
    >
      <span aria-hidden className='bg-foreground h-3 w-0.5 rounded-full' />
      {label}
    </span>
  )
}

const growthColors = {
  churned: 'var(--destructive)',
  new: 'var(--chart-3)',
  resurrected: 'var(--chart-4)',
} as const

export {
  CohortTable,
  RetentionBar,
  RetentionBarKey,
  RetentionChange,
  formatPoints,
  formatRetention,
  getAverageRetention,
  getPlateau,
  getQuickRatio,
  getRetentionRates,
  growthColors,
}

export type {
  CohortTableProps,
  GrowthAccountingInput,
  RetentionBarProps,
  RetentionChangeProps,
  RetentionCohort,
}
