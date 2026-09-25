'use client'

import { type ReactNode } from 'react'
import { type TooltipContentProps } from 'recharts'
import {
  type NameType,
  type ValueType,
} from 'recharts/types/component/DefaultTooltipContent'

import { cn } from '@/lib/utils'

type ChartPanelKeyShape = 'line' | 'rect'

type ChartValueFormatter = (value: number) => string

/** Recessive axes: no rules or ticks, muted 12px labels. */
const chartAxisProps = {
  axisLine: false,
  tickLine: false,
  tickMargin: 8,
  tick: { fill: 'var(--color-muted-foreground)', fontSize: 12 },
} as const

/** Solid hairline gridlines on the value axis only. */
const chartGridProps = {
  stroke: 'var(--color-border)',
  vertical: false,
} as const

const compactFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  notation: 'compact',
})

const formatCompact: ChartValueFormatter = (value) => compactFormatter.format(value)

interface ChartPanelKeyProps {
  className?: string
  color: string
  shape?: ChartPanelKeyShape
}

function ChartPanelKey({ className, color, shape = 'rect' }: ChartPanelKeyProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block shrink-0',
        shape === 'line' ? 'h-0.5 w-3 rounded-full' : 'size-2.5 rounded-[3px]',
        className,
      )}
      style={{ backgroundColor: color }}
    />
  )
}

interface ChartPanelLegendItem {
  color: string
  label: string
  shape?: ChartPanelKeyShape
}

interface ChartPanelLegendProps {
  className?: string
  items: ChartPanelLegendItem[]
}

function ChartPanelLegend({ className, items }: ChartPanelLegendProps) {
  return (
    <ul
      className={cn(
        'text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs',
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.label} className='flex items-center gap-1.5'>
          <ChartPanelKey color={item.color} shape={item.shape} />
          {item.label}
        </li>
      ))}
    </ul>
  )
}

type ChartPanelTooltipProps = Partial<
  Pick<TooltipContentProps<ValueType, NameType>, 'active' | 'label' | 'payload'>
> & {
  formatLabel?: (label: string) => string
  valueFormatter?: ChartValueFormatter
}

/** Tooltip content for Recharts: the value leads, the series name follows. */
function ChartPanelTooltip({
  active,
  label,
  formatLabel,
  payload,
  valueFormatter = (value) => value.toLocaleString(),
}: ChartPanelTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const heading = label !== undefined && label !== '' ? String(label) : undefined

  return (
    <div className='bg-popover text-popover-foreground grid min-w-36 gap-1.5 rounded-lg px-3 py-2 text-xs shadow-md ring-1 ring-foreground/10'>
      {heading && (
        <span className='text-muted-foreground'>
          {formatLabel ? formatLabel(heading) : heading}
        </span>
      )}
      {payload.map((item, index) => {
        const color =
          (item.color as string | undefined) ??
          (item.payload as { fill?: string } | undefined)?.fill ??
          'var(--color-foreground)'

        return (
          <div
            key={`${String(item.dataKey ?? item.name)}-${index}`}
            className='flex items-center gap-2'
          >
            <ChartPanelKey color={color} shape='line' />
            <span className='font-medium tabular-nums'>
              {valueFormatter(Number(item.value))}
            </span>
            <span className='text-muted-foreground ml-auto pl-3'>{item.name}</span>
          </div>
        )
      })}
    </div>
  )
}

interface ChartPanelTableColumn {
  format?: ChartValueFormatter
  key: string
  label: string
}

interface ChartPanelTableProps<T extends object> {
  caption: string
  columns: ChartPanelTableColumn[]
  rows: T[]
}

/** The chart's data as a table for assistive technology. */
function ChartPanelTable<T extends object>({
  caption,
  columns,
  rows,
}: ChartPanelTableProps<T>) {
  return (
    <table className='sr-only'>
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} scope='col'>
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((column, columnIndex) => {
              const value = (row as Record<string, unknown>)[column.key]
              const content =
                column.format && typeof value === 'number'
                  ? column.format(value)
                  : String(value)
              return columnIndex === 0 ? (
                <th key={column.key} scope='row'>
                  {content}
                </th>
              ) : (
                <td key={column.key}>{content}</td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

interface ChartPanelFigureProps {
  children: ReactNode
  className?: string
}

/** Wraps a chart so axis ticks and tooltips use tabular figures. */
function ChartPanelFigure({ children, className }: ChartPanelFigureProps) {
  return <div className={cn('w-full tabular-nums', className)}>{children}</div>
}

export {
  ChartPanelFigure,
  ChartPanelKey,
  ChartPanelLegend,
  ChartPanelTable,
  ChartPanelTooltip,
  chartAxisProps,
  chartGridProps,
  formatCompact,
}

export type {
  ChartPanelKeyShape,
  ChartPanelLegendItem,
  ChartPanelTableColumn,
  ChartValueFormatter,
}
