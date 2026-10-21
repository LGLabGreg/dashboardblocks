'use client'

import {
  BlockStateText,
  useBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  ChartFloatingTooltip,
  ChartTooltipItem,
} from '@/registry/components/dashboardblocks/chart'
import { getHeatColor } from '@/registry/components/dashboardblocks/heatmap'
import { useReveal } from '@/registry/hooks/use-reveal'
import {
  formatNumber,
  formatPercent,
  formatPoints,
} from '@/registry/lib/dashboardblocks/format'
import { type PointerEvent, type ReactNode, useRef, useState } from 'react'

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

interface RetentionChangeProps {
  className?: string
  /** The difference between two 0–1 shares, e.g. */
  difference: number
  /** Ends the sentence, such as `from 56.1% in July`. */
  versus?: string
}

function RetentionChange({ className, difference, versus }: RetentionChangeProps) {
  const state = useBlockState()
  const points = Math.round(difference * 1000) / 10
  if (state === 'loading') {
    return <BlockStateText className={cn('text-sm', className)} />
  }
  if (state) return null

  return (
    <span className={cn('text-muted-foreground text-sm', className)}>
      <span
        className={cn(
          'font-medium tabular-nums',
          points > 0 && 'text-emerald-700 dark:text-emerald-400',
          points < 0 && 'text-red-700 dark:text-red-400',
        )}
      >
        {points === 0
          ? 'No change'
          : `${points > 0 ? 'Up' : 'Down'} ${formatPoints(Math.abs(points))}`}
      </span>
      {versus && <> {versus}</>}
    </span>
  )
}

interface CohortCell {
  period: number
  row: number | 'average'
}

interface HoveredCell extends CohortCell {
  flip: boolean
  x: number
  y: number
}

interface CohortTableProps {
  /** A note under the table, such as a summary. */
  children?: ReactNode
  average?: boolean
  caption: string
  className?: string
  /** @default 'Cohort' */
  cohortHeader?: string
  cohorts: RetentionCohort[]
  /** @default 'var(--color-chart-2)' */
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
  formatCount = (value) => formatNumber(value),
  label = caption,
  minWidth,
  mode = 'percent',
  periodName = 'Period',
  scaleMax: scaleMaxProp,
  scaleMin: scaleMinProp = 0,
  sizeHeader = 'Users',
}: CohortTableProps) {
  const frame = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<HoveredCell | null>(null)
  const [open, setOpen] = useState(false)

  const averages = getAverageRetention(cohorts)
  const periods = averages.length
  const total = cohorts.reduce((sum, cohort) => sum + cohort.size, 0)
  const averageSize = cohorts.length > 0 ? Math.round(total / cohorts.length) : 0
  const later = cohorts.flatMap((cohort) => getRetentionRates(cohort).slice(1))
  const scaleMax = scaleMaxProp ?? (later.length > 0 ? Math.max(...later) : 1)
  const scaleMin = scaleMinProp < scaleMax ? scaleMinProp : 0
  const scaleRange = scaleMax - scaleMin
  const unit = periodName.toLowerCase()
  const shortName = periodName.charAt(0).toUpperCase()

  const rateOf = ({ period, row }: CohortCell) =>
    row === 'average'
      ? (averages[period] ?? 0)
      : (getRetentionRates(cohorts[row])[period] ?? 0)

  const heatOf = (rate: number) =>
    getHeatColor(scaleRange > 0 ? (rate - scaleMin) / scaleRange : 0, color)

  const cellName = ({ period, row }: CohortCell) =>
    `${row === 'average' ? 'Average' : cohorts[row].label}, ${unit} ${period}`

  const describe = (cell: CohortCell) => {
    const cohort = cell.row === 'average' ? null : cohorts[cell.row]
    const rate = rateOf(cell)
    if (describeCell) return describeCell({ cohort, period: cell.period, rate })
    if (!cohort) return `${cellName(cell)}: ${formatPercent(rate)} retained`
    return `${cellName(cell)}: ${formatCount(cohort.retained[cell.period])} of ${formatCount(cohort.size)} (${formatPercent(rate)})`
  }

  const tooltipValue = (cell: CohortCell) => {
    const text = describe(cell)
    const prefix = `${cellName(cell)}: `
    return text.startsWith(prefix) ? text.slice(prefix.length) : text
  }

  const renderCell = (
    row: CohortCell['row'],
    period: number,
    rate: number,
    label: string,
  ) => {
    const isActive = open && hovered?.row === row && hovered.period === period
    const hover = (event: PointerEvent<HTMLTableCellElement>) => {
      const origin = frame.current?.getBoundingClientRect()
      if (!origin) return
      const box = event.currentTarget.getBoundingClientRect()
      const x = box.left - origin.left + box.width / 2
      setHovered({
        flip: x > origin.width / 2,
        period,
        row,
        x,
        y: box.top - origin.top + box.height / 2,
      })
      setOpen(true)
    }
    return (
      // Not a data table: a tile of the cohort heatmap.
      <td
        key={period}
        onPointerEnter={hover}
        onPointerDown={hover}
        className={cn(
          'ring-offset-background h-8 min-w-11 rounded-[3px] px-1 text-center font-medium whitespace-nowrap',
          row === 'average' && 'font-semibold',
          isActive && 'ring-foreground ring-2 ring-offset-1',
        )}
        style={{ backgroundColor: heatOf(rate) }}
      >
        {label}
      </td>
    )
  }

  const emptyCell = (period: number) => (
    // Not a data table: a tile of the cohort heatmap.
    <td key={period}>
      <span className='sr-only'>Not reached yet</span>
    </td>
  )

  const labelCell = cn(
    'pr-2 text-left whitespace-nowrap',
    minWidth && 'bg-background sticky left-0 z-10',
  )

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div ref={frame} className='relative' onPointerLeave={() => setOpen(false)}>
        <div
          role={minWidth ? 'region' : undefined}
          aria-label={minWidth ? label : undefined}
          tabIndex={minWidth ? 0 : undefined}
          className={cn(
            minWidth &&
              'focus-visible:ring-ring/50 relative -my-1 overflow-x-auto rounded-sm py-1 outline-none focus-visible:ring-3',
          )}
        >
          {/* Not a data table: a heatmap chart, each cell a coloured tile with its own tooltip. */}
          <table
            className='w-full border-separate border-spacing-[3px] text-xs tabular-nums'
            style={{ minWidth }}
          >
            <caption className='sr-only'>{caption}</caption>
            <thead>
              <tr className='text-muted-foreground'>
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
                      mode === 'percent'
                        ? formatPercent(rate, { maximumFractionDigits: 0 })
                        : formatCount(count)
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
                    {formatCount(averageSize)}
                  </td>
                  {averages.map((rate, period) =>
                    rate === null
                      ? emptyCell(period)
                      : renderCell(
                          'average',
                          period,
                          rate,
                          formatPercent(rate, { maximumFractionDigits: 0 }),
                        ),
                  )}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        {hovered && (
          <ChartFloatingTooltip
            active={open}
            flip={hovered.flip}
            x={hovered.x}
            y={hovered.y}
          >
            <span className='font-medium'>{cellName(hovered)}</span>
            <ChartTooltipItem
              color={heatOf(rateOf(hovered))}
              value={tooltipValue(hovered)}
            />
          </ChartFloatingTooltip>
        )}
      </div>
      {(children || footer) && (
        <div className='flex flex-wrap items-center justify-between gap-x-6 gap-y-2'>
          {children && <p className='text-muted-foreground text-sm'>{children}</p>}
          {footer}
        </div>
      )}
    </div>
  )
}

interface RetentionBarProps {
  animated?: boolean
  className?: string
  /** @default 'var(--color-chart-2)' */
  color?: string
  /** 0–1. */
  value: number
}

function RetentionBar({
  animated = true,
  className,
  color = 'var(--color-chart-2)',
  value,
}: RetentionBarProps) {
  const { ref, revealed } = useReveal(animated)
  const state = useBlockState()

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        'bg-muted h-2 w-full overflow-hidden rounded-full',
        state === 'loading' && 'animate-pulse motion-reduce:animate-none',
        className,
      )}
    >
      <div
        className='h-full rounded-full transition-[width] duration-1000 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none'
        style={{
          backgroundColor: color,
          width: `${(revealed && !state ? Math.min(1, Math.max(0, value)) : 0) * 100}%`,
        }}
      />
    </div>
  )
}

const growthColors = {
  churned: 'color-mix(in oklab, var(--color-destructive) 75%, var(--color-background))',
  new: 'var(--color-chart-3)',
  resurrected: 'var(--color-chart-4)',
} as const

export {
  CohortTable,
  RetentionBar,
  RetentionChange,
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
