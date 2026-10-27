'use client'

import {
  BlockStateText,
  useBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  ChartFloatingTooltip,
  chartHatchFill,
  ChartTooltipItem,
} from '@/registry/components/dashboardblocks/chart'
import { getHeatColor } from '@/registry/components/dashboardblocks/heatmap'
import { useReveal } from '@/registry/hooks/use-reveal'
import {
  formatNumber,
  formatPercent,
  formatPoints,
} from '@/registry/lib/dashboardblocks/format'
import {
  type FocusEvent,
  Fragment,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'

import { cn } from '@/lib/utils'

interface RetentionCohort {
  label: string
  size: number
  /** How many were still active in each period since joining, starting with period 0. */
  retained: number[]
  /** A swatch before the label, tying the row to its line in a chart. */
  color?: string
  /** Shown before the label, after the swatch, such as a country's flag. */
  icon?: ReactNode
  /**
   * How many were old enough to reach each period, starting with period 0. A row that groups
   * cohorts (one per source, say) needs it: its later periods count only its older cohorts.
   * @default `size` for every period
   */
  eligible?: number[]
  /** `true` when the last period hasn't ended, so its count can still grow: it's striped and left out of the average. */
  filling?: boolean
}

function getEligible(cohort: RetentionCohort, period: number) {
  return cohort.eligible?.[period] ?? cohort.size
}

function getRetentionRates(cohort: RetentionCohort) {
  return cohort.retained.map((count, period) => {
    const eligible = getEligible(cohort, period)
    return eligible > 0 ? count / eligible : 0
  })
}

function getAverageRetention(cohorts: RetentionCohort[]) {
  const periods = Math.max(0, ...cohorts.map((cohort) => cohort.retained.length))
  return Array.from({ length: periods }, (_, period) => {
    let retained = 0
    let size = 0
    for (const cohort of cohorts) {
      const complete = cohort.filling
        ? cohort.retained.length - 1
        : cohort.retained.length
      if (period >= Math.max(complete, 1)) continue
      retained += cohort.retained[period]
      size += getEligible(cohort, period)
    }
    return size > 0 ? retained / size : null
  })
}

/**
 * The first period after which retention holds: the next period drops by less than `threshold` of
 * the rate, and no later one falls more than twice that below it. `null` when it never does.
 */
function getPlateau(rates: (number | null)[], threshold = 0.05) {
  for (let period = 1; period < rates.length - 1; period++) {
    const rate = rates[period]
    const next = rates[period + 1]
    if (rate === null || next === null) return null
    if (rate - next >= rate * threshold) continue
    const later = rates.slice(period + 1).filter((value) => value !== null)
    if (Math.min(...later) >= rate * (1 - 2 * threshold)) return { period, rate }
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

/** A cohort's cell: `row` is the cohort's index in `cohorts`, `period` counts from 0. */
interface CohortCellPosition {
  period: number
  row: number
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
  /** @default 'Average' */
  averageLabel?: string
  /** The count beside the average row. @default the mean cohort size */
  averageSize?: number
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
  /**
   * Makes each cohort's cells after period 0 buttons. Called with the cell clicked, or `null` when
   * the selected cell is clicked again.
   */
  onCellSelect?: (cell: CohortCellPosition | null) => void
  /** Called with the cohort row under the pointer, or `null` when it leaves the table. */
  onRowHover?: (row: number | null) => void
  periodName?: string
  scaleMax?: number
  /** The share that gets the faintest colour, for tables whose shares sit in a narrow band, such as revenue around 100%. */
  scaleMin?: number
  /** The open cell, drawn in `color` while the rest fade. */
  selected?: CohortCellPosition | null
  /** Shown across the table under the open cell's row, such as the people in it. It stays in view while the cells scroll sideways. */
  selectedDetail?: ReactNode
  /** @default 'Users' */
  sizeHeader?: string
}

function CohortTable({
  average = true,
  averageLabel = 'Average',
  averageSize: averageSizeProp,
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
  onCellSelect,
  onRowHover,
  periodName = 'Period',
  scaleMax: scaleMaxProp,
  scaleMin: scaleMinProp = 0,
  selected = null,
  selectedDetail,
  sizeHeader = 'Users',
}: CohortTableProps) {
  const frame = useRef<HTMLDivElement>(null)
  const view = useRef<HTMLDivElement>(null)
  const [viewWidth, setViewWidth] = useState<number>()
  const [hovered, setHovered] = useState<HoveredCell | null>(null)
  const [open, setOpen] = useState(false)

  const averages = getAverageRetention(cohorts)
  const periods = averages.length
  const total = cohorts.reduce((sum, cohort) => sum + cohort.size, 0)
  const averageSize =
    averageSizeProp ?? (cohorts.length > 0 ? Math.round(total / cohorts.length) : 0)
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
    `${row === 'average' ? averageLabel : cohorts[row].label}, ${unit} ${period}`

  const describe = (cell: CohortCell) => {
    const cohort = cell.row === 'average' ? null : cohorts[cell.row]
    const rate = rateOf(cell)
    if (describeCell) return describeCell({ cohort, period: cell.period, rate })
    if (!cohort) return `${cellName(cell)}: ${formatPercent(rate)} retained`
    return `${cellName(cell)}: ${formatCount(cohort.retained[cell.period])} of ${formatCount(getEligible(cohort, cell.period))} (${formatPercent(rate)})`
  }

  const buttonName = (cell: CohortCell, label: string) => {
    const cohort = cell.row === 'average' ? null : cohorts[cell.row]
    if (describeCell || !cohort) return `${label}, ${describe(cell)}`
    return `${label}, ${cellName(cell)}: ${formatCount(cohort.retained[cell.period])} of ${formatCount(getEligible(cohort, cell.period))}`
  }

  const tooltipValue = (cell: CohortCell) => {
    const text = describe(cell)
    const prefix = `${cellName(cell)}: `
    return text.startsWith(prefix) ? text.slice(prefix.length) : text
  }

  const showTooltip = (cell: CohortCell, target: HTMLElement) => {
    const origin = frame.current?.getBoundingClientRect()
    if (!origin) return
    const box = target.getBoundingClientRect()
    const x = box.left - origin.left + box.width / 2
    setHovered({
      ...cell,
      flip: x > origin.width / 2,
      x,
      y: box.top - origin.top + box.height / 2,
    })
    setOpen(true)
  }

  const renderCell = (
    row: CohortCell['row'],
    period: number,
    rate: number,
    label: string,
    filling = false,
  ) => {
    const cell = { period, row }
    const isSelected = selected?.row === row && selected.period === period
    const selectable = onCellSelect && row !== 'average' && period > 0
    const hover = (event: PointerEvent<HTMLElement> | FocusEvent<HTMLElement>) =>
      showTooltip(cell, event.currentTarget)
    const base = color ?? 'var(--color-chart-2)'
    const faded = selected !== null && !isSelected
    const fade = (fill: string) =>
      faded
        ? `color-mix(in oklab, ${fill} var(--cohort-fade), var(--color-background))`
        : fill
    const style = {
      backgroundColor: isSelected
        ? `color-mix(in oklab, ${base} 80%, var(--color-foreground))`
        : fade(heatOf(rate)),
      backgroundImage: filling && !isSelected ? chartHatchFill(fade(base)) : undefined,
    }
    const tile = cn(
      'h-8 min-w-11 rounded-[3px] px-1 text-center font-medium whitespace-nowrap transition-colors duration-200',
      row === 'average' && 'font-semibold',
      isSelected && 'text-background',
    )
    if (selectable) {
      return (
        // Not a data table: a tile of the cohort heatmap.
        <td key={period} className='p-0'>
          <button
            type='button'
            aria-label={buttonName(cell, label)}
            aria-pressed={isSelected}
            onPointerEnter={hover}
            onFocus={hover}
            onBlur={() => setOpen(false)}
            onClick={() => {
              setOpen(false)
              onCellSelect(isSelected ? null : { period, row })
            }}
            className={cn(
              tile,
              'focus-visible:ring-ring/50 w-full cursor-pointer outline-none focus-visible:ring-3',
            )}
            style={style}
          >
            {label}
          </button>
        </td>
      )
    }
    return (
      // Not a data table: a tile of the cohort heatmap.
      <td
        key={period}
        onPointerEnter={hover}
        onPointerDown={hover}
        className={tile}
        style={style}
      >
        {label}
      </td>
    )
  }

  const hasDetail = Boolean(selectedDetail) && selected !== null
  useEffect(() => {
    const node = view.current
    if (!node || !minWidth || !hasDetail) return
    const observer = new ResizeObserver(() => setViewWidth(node.clientWidth))
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasDetail, minWidth])

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
      <div
        ref={frame}
        className='relative'
        onPointerLeave={() => {
          setOpen(false)
          onRowHover?.(null)
        }}
      >
        <div
          ref={view}
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
            className='w-full border-separate border-spacing-(--cohort-gap) text-xs tabular-nums [--cohort-fade:25%] [--cohort-gap:3px] dark:[--cohort-fade:55%]'
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
                <Fragment key={cohort.label}>
                  <tr onPointerEnter={onRowHover && (() => onRowHover(row))}>
                    <th
                      scope='row'
                      className={cn(
                        labelCell,
                        'font-normal transition-colors',
                        selected?.row === row
                          ? 'text-foreground font-medium'
                          : 'text-muted-foreground',
                      )}
                    >
                      {cohort.color || cohort.icon ? (
                        <span className='flex items-center gap-2'>
                          {cohort.color && (
                            <span
                              aria-hidden
                              className='size-2 shrink-0 rounded-xs'
                              style={{ background: cohort.color }}
                            />
                          )}
                          {cohort.icon}
                          {cohort.label}
                        </span>
                      ) : (
                        cohort.label
                      )}
                    </th>
                    <td className='text-muted-foreground pr-2 text-right whitespace-nowrap'>
                      {formatCount(cohort.size)}
                    </td>
                    {Array.from({ length: periods }, (_, period) => {
                      if (period >= cohort.retained.length) return emptyCell(period)
                      const count = cohort.retained[period]
                      const eligible = getEligible(cohort, period)
                      const rate = eligible > 0 ? count / eligible : 0
                      const label =
                        mode === 'percent'
                          ? formatPercent(rate, { maximumFractionDigits: 0 })
                          : formatCount(count)
                      const filling =
                        cohort.filling &&
                        period > 0 &&
                        period === cohort.retained.length - 1
                      return renderCell(row, period, rate, label, filling)
                    })}
                  </tr>
                  {hasDetail && selected?.row === row && (
                    <tr
                      onPointerEnter={() => {
                        setOpen(false)
                        onRowHover?.(null)
                      }}
                    >
                      <td colSpan={periods + 2} className='p-0'>
                        <div
                          className='sticky left-0 text-sm'
                          style={{
                            width:
                              minWidth && viewWidth !== undefined
                                ? `calc(${viewWidth}px - 2 * var(--cohort-gap))`
                                : undefined,
                          }}
                        >
                          {selectedDetail}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
            {average && (
              <tfoot>
                <tr>
                  <th scope='row' className={cn(labelCell, 'font-medium')}>
                    {averageLabel}
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
  getEligible,
  getPlateau,
  getQuickRatio,
  getRetentionRates,
  growthColors,
}

export type {
  CohortCellPosition,
  CohortTableProps,
  GrowthAccountingInput,
  RetentionBarProps,
  RetentionChangeProps,
  RetentionCohort,
}
