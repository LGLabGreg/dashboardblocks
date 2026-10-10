'use client'

import {
  type CSSProperties,
  type FocusEvent,
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

function getHeatColor(t: number, color = 'var(--chart-2)') {
  const share = Math.round(8 + Math.min(1, Math.max(0, t)) * 62)
  return `color-mix(in oklab, ${color} ${share}%, var(--muted))`
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

interface HeatmapGridProps {
  children?: ReactNode
  className?: string
  cellClassName?: string
  cellLabels?: boolean
  /** @default 'var(--chart-2)' */
  color?: string
  columnLabelEvery?: number
  columns: string[]
  describe: (position: HeatmapCellPosition, value: HeatmapValue) => string
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
  rows: string[]
  /** Full row names for assistive technology, when `rows` are abbreviated or blank. */
  rowNames?: string[]
  values: HeatmapValue[][]
}

function HeatmapGrid({
  cellClassName,
  cellLabels = false,
  children,
  className,
  color,
  columnLabelEvery = 1,
  columns,
  describe,
  footer,
  format = (value) => value.toLocaleString(),
  label,
  max: maxProp,
  min: minProp,
  minWidth,
  rowHeader,
  rowLabelClassName,
  rowNames,
  rows,
  values,
}: HeatmapGridProps) {
  const [active, setActive] = useState<HeatmapCellPosition | null>(null)
  const [cursor, setCursor] = useState<HeatmapCellPosition>({ column: 0, row: 0 })
  const grid = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = scroller.current
    if (element) element.scrollLeft = element.scrollWidth
  }, [])

  const extent = getExtent(values)
  const min = minProp ?? extent.min
  const max = maxProp ?? extent.max
  const range = max - min || 1

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
      <div
        ref={scroller}
        className={cn('relative', minWidth && '-my-1 overflow-x-auto py-1')}
      >
        <div
          ref={grid}
          role='grid'
          tabIndex={-1}
          aria-label={label}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          onPointerLeave={() => setActive(null)}
          className='grid gap-[3px]'
          style={{
            gridTemplateColumns: `auto repeat(${columns.length}, minmax(0, 1fr))`,
            minWidth,
          }}
        >
          <div role='row' className='col-span-full grid grid-cols-subgrid'>
            <span
              role='columnheader'
              className={cn(minWidth && 'bg-card sticky left-0 z-10')}
            >
              <span className='sr-only'>{rowHeader}</span>
            </span>
            {columns.map((column, index) => (
              <span
                key={index}
                role='columnheader'
                className='text-muted-foreground overflow-visible text-[10px] leading-4 font-normal whitespace-nowrap tabular-nums'
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
                  minWidth && 'bg-card sticky left-0 z-10',
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
                const style: CSSProperties =
                  value === null
                    ? {}
                    : { backgroundColor: getHeatColor((value - min) / range, color) }
                return (
                  <span
                    key={column}
                    role='gridcell'
                    tabIndex={isCursor ? 0 : -1}
                    data-cell={`${rowIndex}-${column}`}
                    aria-label={describe(position, value)}
                    onFocus={() => {
                      setCursor(position)
                      setActive(position)
                    }}
                    onPointerEnter={() => setActive(position)}
                    onPointerDown={() => setActive(position)}
                    className={cn(
                      'ring-offset-card flex min-h-3 items-center justify-center rounded-[3px] text-[11px] font-medium tabular-nums outline-none',
                      value === null && 'border border-dashed',
                      isActive && 'ring-foreground ring-2 ring-offset-1',
                      cellClassName,
                    )}
                    style={style}
                  >
                    {cellLabels && value !== null ? (
                      <span aria-hidden>{format(value)}</span>
                    ) : null}
                  </span>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <div className='flex flex-wrap items-center justify-between gap-x-6 gap-y-2'>
        <p className='text-muted-foreground min-h-5 text-sm'>
          {active ? (
            <span className='text-foreground'>{describe(active, activeValue)}</span>
          ) : (
            children
          )}
        </p>
        {footer}
      </div>
    </div>
  )
}

interface HeatmapLegendProps {
  className?: string
  /** @default 'var(--chart-2)' */
  color?: string
  high?: string
  low?: string
  /** @default 5 */
  steps?: number
}

function HeatmapLegend({
  className,
  color,
  high = 'More',
  low = 'Less',
  steps = 5,
}: HeatmapLegendProps) {
  return (
    <div
      aria-hidden
      className={cn('text-muted-foreground flex items-center gap-1.5 text-xs', className)}
    >
      <span className='mr-0.5'>{low}</span>
      {Array.from({ length: steps }, (_, index) => (
        <span
          key={index}
          className='size-3 rounded-[3px]'
          style={{ backgroundColor: getHeatColor(index / (steps - 1), color) }}
        />
      ))}
      <span className='ml-0.5'>{high}</span>
    </div>
  )
}

export { HeatmapGrid, HeatmapLegend, getExtent, getHeatColor, getPeak }

export type {
  HeatmapCellPosition,
  HeatmapFormatter,
  HeatmapGridProps,
  HeatmapLegendProps,
  HeatmapValue,
}
