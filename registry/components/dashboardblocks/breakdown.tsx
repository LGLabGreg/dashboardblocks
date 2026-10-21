'use client'

import { useBlockState } from '@/registry/components/dashboardblocks/block-state'
import {
  ChartPanelKey,
  ChartPanelLegend,
} from '@/registry/components/dashboardblocks/chart-panel'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  DataTableRowHead,
} from '@/registry/components/dashboardblocks/table'
import { useReveal } from '@/registry/hooks/use-reveal'
import { formatNumber, formatPercent } from '@/registry/lib/dashboardblocks/format'

import { cn } from '@/lib/utils'

interface BreakdownSegment {
  color: string
  label: string
  value: number
}

const BREAKDOWN_OTHER_COLOR =
  'color-mix(in oklab, var(--color-muted-foreground) 35%, transparent)'

function getTotal(segments: BreakdownSegment[]) {
  return segments.reduce((sum, segment) => sum + Math.max(0, segment.value), 0)
}

function formatShare(value: number, total: number, fractionDigits = 0) {
  return formatPercent(total > 0 ? value / total : 0, {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  })
}

interface BreakdownBarProps {
  animated?: boolean
  className?: string
  segments: BreakdownSegment[]
}

function BreakdownBar({ animated = true, className, segments }: BreakdownBarProps) {
  const { ref, revealed } = useReveal<HTMLDivElement>(animated)
  const state = useBlockState()
  const total = getTotal(segments)

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        'flex h-3 w-full gap-0.5 overflow-hidden rounded-full',
        state && 'bg-muted',
        state === 'loading' && 'animate-pulse motion-reduce:animate-none',
        className,
      )}
    >
      {!state &&
        segments.map((segment) => {
          const share = total > 0 ? Math.max(0, segment.value) / total : 0
          return (
            <div
              key={segment.label}
              className='h-full min-w-0 transition-[flex-grow] duration-1000 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none'
              style={{
                backgroundColor: segment.color,
                flexBasis: 0,
                flexGrow: revealed ? share : 0,
              }}
            />
          )
        })}
    </div>
  )
}

interface BreakdownKeyProps {
  className?: string
  color: string
}

function BreakdownKey({ className, color }: BreakdownKeyProps) {
  return <ChartPanelKey className={className} color={color} />
}

interface BreakdownLegendProps {
  className?: string
  items: Pick<BreakdownSegment, 'color' | 'label'>[]
}

function BreakdownLegend({ className, items }: BreakdownLegendProps) {
  return <ChartPanelLegend className={className} items={items} />
}

interface BreakdownTableProps {
  caption: string
  /** @default formatNumber */
  format?: (value: number) => string
  highlightIndex?: number | null
  /** Names the columns for screen readers. @default ['Category', 'Value', 'Share'] */
  labels?: [string, string, string]
  segments: BreakdownSegment[]
}

function BreakdownTable({
  caption,
  format = (value) => formatNumber(value),
  highlightIndex = null,
  labels = ['Category', 'Value', 'Share'],
  segments,
}: BreakdownTableProps) {
  const total = getTotal(segments)

  return (
    <DataTable density='compact' caption={caption}>
      <DataTableHeader className='sr-only'>
        <DataTableRow>
          <DataTableHead>{labels[0]}</DataTableHead>
          <DataTableHead align='end'>{labels[1]}</DataTableHead>
          <DataTableHead align='end'>{labels[2]}</DataTableHead>
        </DataTableRow>
      </DataTableHeader>
      <DataTableBody>
        {segments.map((segment, index) => (
          <DataTableRow key={segment.label} highlighted={highlightIndex === index}>
            <DataTableRowHead>
              <span className='flex items-center gap-2'>
                <BreakdownKey color={segment.color} />
                {segment.label}
              </span>
            </DataTableRowHead>
            <DataTableCell align='end'>{format(segment.value)}</DataTableCell>
            <DataTableCell align='end' className='text-muted-foreground w-16'>
              {formatShare(segment.value, total)}
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTableBody>
    </DataTable>
  )
}

export {
  BREAKDOWN_OTHER_COLOR,
  BreakdownBar,
  BreakdownKey,
  BreakdownLegend,
  BreakdownTable,
  formatShare,
  getTotal,
}

export type { BreakdownBarProps, BreakdownSegment, BreakdownTableProps }
