'use client'

import { useBlockState } from '@/registry/components/dashboardblocks/block-state'
import {
  ChartPlaceholder,
  type ChartValueFormatter,
} from '@/registry/components/dashboardblocks/chart'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type ChartPanelKeyShape = 'line' | 'rect'

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
  const state = useBlockState()
  if (state === 'empty' || state === 'error') return null

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

function ChartPanelTable<T extends object>({
  caption,
  columns,
  rows,
}: ChartPanelTableProps<T>) {
  const state = useBlockState()
  if (state) return null

  return (
    <div className='sr-only'>
      <table>
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
    </div>
  )
}

interface ChartPanelFigureProps {
  children: ReactNode
  className?: string
}

function ChartPanelFigure({ children, className }: ChartPanelFigureProps) {
  const state = useBlockState()

  return (
    <div className={cn('w-full tabular-nums', className)}>
      {state ? <ChartPlaceholder height='100%' /> : children}
    </div>
  )
}

export { ChartPanelFigure, ChartPanelKey, ChartPanelLegend, ChartPanelTable }

export type { ChartPanelKeyShape, ChartPanelLegendItem, ChartPanelTableColumn }
