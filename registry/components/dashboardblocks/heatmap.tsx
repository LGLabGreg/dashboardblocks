'use client'

import {
  Skeleton,
  useBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  ChartFloatingTooltip,
  ChartPlaceholder,
  ChartTooltipItem,
  type ChartValueFormatter,
  TinyBarChart,
} from '@/registry/components/dashboardblocks/chart'
import { formatCompact, formatNumber } from '@/registry/lib/dashboardblocks/format'
import {
  type CSSProperties,
  type FocusEvent,
  Fragment,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'

import { cn } from '@/lib/utils'

type HeatmapValue = number | null

type HeatmapFormatter = (value: number) => string

interface HeatmapCellPosition {
  column: number
  row: number
}

interface ActiveCell extends HeatmapCellPosition {
  flip: boolean
  x: number
  y: number
}

function getHeatColor(t: number, color = 'var(--color-chart-2)') {
  const share = Math.round(8 + Math.min(1, Math.max(0, t)) * 62)
  return `color-mix(in oklab, ${color} ${share}%, var(--color-muted))`
}

function getExtent(values: HeatmapValue[][]) {
  let min = Infinity
  let max = -Infinity
  for (const row of values) {
    for (const value of row) {
      if (value === null) continue
      min = Math.min(min, value)
      max = Math.max(max, value)
    }
  }
  return min === Infinity ? { max: 0, min: 0 } : { max, min }
}

function getPeak(values: HeatmapValue[][]) {
  let peak: (HeatmapCellPosition & { value: number }) | null = null
  values.forEach((row, rowIndex) =>
    row.forEach((value, column) => {
      if (value !== null && (peak === null || value > peak.value)) {
        peak = { column, row: rowIndex, value }
      }
    }),
  )
  return peak as (HeatmapCellPosition & { value: number }) | null
}

function getColumnTotals(values: HeatmapValue[][]) {
  const totals: number[] = []
  for (const row of values) {
    row.forEach((value, column) => {
      totals[column] = (totals[column] ?? 0) + (value ?? 0)
    })
  }
  return totals
}

interface HeatmapColumnSummary {
  format?: ChartValueFormatter
  /** Draws this bar in full colour, with its value above it. */
  highlightIndex?: number
  /** Names the bars for screen readers, such as `Sessions by hour, all week`. */
  label: string
  /** Names each bar in its tooltip; defaults to the column labels. */
  labels?: string[]
  /** One per column, such as the column's total. */
  values: number[]
}

interface HeatmapGridProps {
  /** A sentence under the grid, such as the busiest cell. */
  children?: ReactNode
  className?: string
  cellClassName?: string
  cellLabels?: boolean
  /** Names a cell in its tooltip, such as `Tue, 14:00–15:00`. */
  cellName: (position: HeatmapCellPosition) => string
  /** @default 'var(--color-chart-2)' */
  color?: string
  columnLabelEvery?: number
  columns: string[]
  /** Bars above the grid, lined up with its columns. */
  columnSummary?: HeatmapColumnSummary
  /** What screen readers say for a cell; defaults to its name and value. */
  describe?: (position: HeatmapCellPosition, value: HeatmapValue) => string
  /** Marks a cell with a dot, such as one over a target; name the dot with `HeatmapLegend`'s `flag`. */
  flagged?: (position: HeatmapCellPosition, value: number) => boolean
  footer?: ReactNode
  format?: HeatmapFormatter
  label: string
  /** Fixes the colour scale. */
  max?: number
  min?: number
  /** Keeps cells legible in narrow cards: below this width the grid scrolls sideways, starting at the end (the most recent columns). */
  minWidth?: string
  rowHeader: string
  rowLabelClassName?: string
  /** While loading with none, five blank rows are sketched. */
  rows: string[]
  /** Full row names for assistive technology, when `rows` are abbreviated or blank. */
  rowNames?: string[]
  /** Names the value in the tooltip, such as `Sessions`. */
  valueName?: string
  values: HeatmapValue[][]
}

function HeatmapGrid({
  cellClassName,
  cellLabels = false,
  cellName,
  children,
  className,
  color,
  columnLabelEvery = 1,
  columns,
  columnSummary,
  describe,
  flagged,
  footer,
  format = (value) => formatNumber(value),
  label,
  max: maxProp,
  min: minProp,
  minWidth,
  rowHeader,
  rowLabelClassName,
  rowNames,
  rows,
  valueName,
  values,
}: HeatmapGridProps) {
  const [active, setActive] = useState<ActiveCell | null>(null)
  const [cursor, setCursor] = useState<HeatmapCellPosition>({ column: 0, row: 0 })
  const frame = useRef<HTMLDivElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const state = useBlockState()

  useEffect(() => {
    const element = scroller.current
    if (element) element.scrollLeft = element.scrollWidth
  }, [state])

  const stickyLabel = minWidth && 'bg-background sticky left-0 z-10'

  if (state) {
    const sketched = rows.length > 0 ? rows : Array.from({ length: 5 }, () => '')
    return (
      <div aria-hidden className={cn('flex flex-col gap-3', className)}>
        <div ref={scroller} className={cn(minWidth && '-my-1 overflow-x-auto py-1')}>
          <div
            className='grid gap-[3px]'
            style={{
              gridTemplateColumns: `auto repeat(${columns.length}, minmax(0, 1fr))`,
              minWidth,
            }}
          >
            {columnSummary && (
              <div className='col-span-full grid grid-cols-subgrid pb-1'>
                <span className={cn(stickyLabel)} />
                <ChartPlaceholder className='col-span-full col-start-2' height={56} />
              </div>
            )}
            <span className={cn(stickyLabel)} />
            {columns.map((column, index) => (
              <span
                key={index}
                className='text-muted-foreground overflow-visible text-xs leading-4 whitespace-nowrap tabular-nums'
              >
                {index % columnLabelEvery === 0 && column}
              </span>
            ))}
            {sketched.map((row, rowIndex) => (
              <Fragment key={rowIndex}>
                <span
                  className={cn(
                    'text-muted-foreground flex items-center pr-2 text-xs whitespace-nowrap',
                    stickyLabel,
                    rowLabelClassName,
                  )}
                >
                  {row}
                </span>
                {columns.map((_, column) =>
                  state === 'loading' ? (
                    <Skeleton
                      key={column}
                      className={cn('min-h-3 rounded-[3px]', cellClassName)}
                    />
                  ) : (
                    <span
                      key={column}
                      className={cn(
                        'min-h-3 rounded-[3px] border border-dashed',
                        cellClassName,
                      )}
                    />
                  ),
                )}
              </Fragment>
            ))}
          </div>
        </div>
        {state === 'loading' && footer}
      </div>
    )
  }

  const extent = getExtent(values)
  const min = minProp ?? extent.min
  const max = maxProp ?? extent.max
  const range = max - min || 1
  const heat = (value: number) => getHeatColor((value - min) / range, color)
  const describeCell = (position: HeatmapCellPosition, value: HeatmapValue) =>
    describe?.(position, value) ??
    `${cellName(position)}: ${value === null ? 'no data' : format(value)}`

  const show = (position: HeatmapCellPosition, cell: HTMLElement) => {
    const origin = frame.current?.getBoundingClientRect()
    if (!origin) return
    const box = cell.getBoundingClientRect()
    const x = box.left - origin.left + box.width / 2
    setActive({
      ...position,
      flip: x > origin.width / 2,
      x,
      y: box.top - origin.top + box.height / 2,
    })
  }

  const focusCell = (position: HeatmapCellPosition) => {
    setCursor(position)
    grid.current
      ?.querySelector<HTMLElement>(`[data-cell="${position.row}-${position.column}"]`)
      ?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = { column: columns.length - 1, row: rows.length - 1 }
    const next = { ...cursor }
    switch (event.key) {
      case 'ArrowRight':
        next.column = Math.min(last.column, cursor.column + 1)
        break
      case 'ArrowLeft':
        next.column = Math.max(0, cursor.column - 1)
        break
      case 'ArrowDown':
        next.row = Math.min(last.row, cursor.row + 1)
        break
      case 'ArrowUp':
        next.row = Math.max(0, cursor.row - 1)
        break
      case 'Home':
        next.column = 0
        if (event.ctrlKey) next.row = 0
        break
      case 'End':
        next.column = last.column
        if (event.ctrlKey) next.row = last.row
        break
      default:
        return
    }
    event.preventDefault()
    focusCell(next)
  }

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setActive(null)
  }

  const activeValue = active ? (values[active.row]?.[active.column] ?? null) : null

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div ref={frame} className='relative' onPointerLeave={() => setActive(null)}>
        <div ref={scroller} className={cn(minWidth && '-my-1 overflow-x-auto py-1')}>
          <div
            className='grid gap-[3px]'
            style={{
              gridTemplateColumns: `auto repeat(${columns.length}, minmax(0, 1fr))`,
              minWidth,
            }}
          >
            {columnSummary && (
              <div className='col-span-full grid grid-cols-subgrid pb-1'>
                <span className={cn(stickyLabel)} />
                <div
                  role='img'
                  aria-label={columnSummary.label}
                  className='col-span-full col-start-2'
                >
                  <TinyBarChart
                    accessibilityLayer={false}
                    bars={[
                      {
                        dataKey: 'value',
                        fill: color ?? 'var(--color-chart-2)',
                        radius: [2, 2, 0, 0],
                      },
                    ]}
                    data={columnSummary.values.map((value, index) => ({
                      label: columnSummary.labels?.[index] ?? columns[index],
                      value,
                    }))}
                    formatter={columnSummary.format ?? formatCompact}
                    height={56}
                    highlightIndex={columnSummary.highlightIndex}
                  />
                </div>
              </div>
            )}
            <div
              ref={grid}
              role='grid'
              tabIndex={-1}
              aria-label={label}
              onBlur={onBlur}
              onKeyDown={onKeyDown}
              className='col-span-full grid grid-cols-subgrid gap-[3px]'
            >
              <div role='row' className='col-span-full grid grid-cols-subgrid'>
                <span role='columnheader' className={cn(stickyLabel)}>
                  <span className='sr-only'>{rowHeader}</span>
                </span>
                {columns.map((column, index) => (
                  <span
                    key={index}
                    role='columnheader'
                    className='text-muted-foreground overflow-visible text-xs leading-4 font-normal whitespace-nowrap tabular-nums'
                  >
                    {index % columnLabelEvery === 0 ? (
                      column
                    ) : (
                      <span className='sr-only'>{column}</span>
                    )}
                  </span>
                ))}
              </div>
              {rows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  role='row'
                  className='col-span-full grid grid-cols-subgrid'
                >
                  <span
                    role='rowheader'
                    className={cn(
                      'text-muted-foreground flex items-center pr-2 text-xs whitespace-nowrap',
                      stickyLabel,
                      rowLabelClassName,
                    )}
                  >
                    {row || <span className='sr-only'>{rowNames?.[rowIndex]}</span>}
                  </span>
                  {columns.map((_, column) => {
                    const value = values[rowIndex]?.[column] ?? null
                    const position = { column, row: rowIndex }
                    const isActive = active?.row === rowIndex && active.column === column
                    const isCursor = cursor.row === rowIndex && cursor.column === column
                    const isFlagged = value !== null && flagged?.(position, value)
                    const style: CSSProperties =
                      value === null ? {} : { backgroundColor: heat(value) }
                    return (
                      <span
                        key={column}
                        role='gridcell'
                        tabIndex={isCursor ? 0 : -1}
                        data-cell={`${rowIndex}-${column}`}
                        aria-label={describeCell(position, value)}
                        onFocus={(event) => {
                          setCursor(position)
                          show(position, event.currentTarget)
                        }}
                        onPointerEnter={(event) => show(position, event.currentTarget)}
                        onPointerDown={(event) => show(position, event.currentTarget)}
                        className={cn(
                          'ring-offset-background relative flex min-h-3 items-center justify-center rounded-[3px] text-xs font-medium tabular-nums outline-none',
                          value === null && 'border border-dashed',
                          isActive && 'ring-foreground ring-2 ring-offset-1',
                          cellClassName,
                        )}
                        style={style}
                      >
                        {cellLabels && value !== null ? (
                          <span aria-hidden>{format(value)}</span>
                        ) : null}
                        {isFlagged && <HeatmapFlag className='absolute top-1 right-1' />}
                      </span>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        {active && (
          <ChartFloatingTooltip active flip={active.flip} x={active.x} y={active.y}>
            <span className='font-medium'>{cellName(active)}</span>
            <ChartTooltipItem
              color={activeValue === null ? undefined : heat(activeValue)}
              name={valueName}
              value={activeValue === null ? 'No data' : format(activeValue)}
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

function HeatmapFlag({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'ring-background block size-1.5 rounded-full bg-red-600 ring-1 dark:bg-red-400',
        className,
      )}
    />
  )
}

interface HeatmapLegendProps {
  className?: string
  /** @default 'var(--color-chart-2)' */
  color?: string
  /** Names the dot `HeatmapGrid` draws on `flagged` cells, such as `Over target`. */
  flag?: string
  high?: string
  low?: string
  /** @default 5 */
  steps?: number
}

function HeatmapLegend({
  className,
  color,
  flag,
  high = 'More',
  low = 'Less',
  steps = 5,
}: HeatmapLegendProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-xs',
        className,
      )}
    >
      {flag && (
        <span className='flex items-center gap-1.5'>
          <HeatmapFlag />
          {flag}
        </span>
      )}
      <span className='flex items-center gap-1.5'>
        <span className='mr-0.5'>{low}</span>
        {Array.from({ length: steps }, (_, index) => (
          <span
            key={index}
            className='size-3 rounded-[3px]'
            style={{ backgroundColor: getHeatColor(index / (steps - 1), color) }}
          />
        ))}
        <span className='ml-0.5'>{high}</span>
      </span>
    </div>
  )
}

export {
  HeatmapFlag,
  HeatmapGrid,
  HeatmapLegend,
  getColumnTotals,
  getExtent,
  getHeatColor,
  getPeak,
}

export type {
  HeatmapCellPosition,
  HeatmapColumnSummary,
  HeatmapFormatter,
  HeatmapGridProps,
  HeatmapLegendProps,
  HeatmapValue,
}
