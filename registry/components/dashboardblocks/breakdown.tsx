'use client'

import { useBlockState } from '@/registry/components/dashboardblocks/block-state'
import {
  ChartPanelKey,
  ChartPanelLegend,
} from '@/registry/components/dashboardblocks/chart-panel'
import { useReveal } from '@/registry/hooks/use-reveal'
import { formatPercent } from '@/registry/lib/dashboardblocks/format'

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

export {
  BREAKDOWN_OTHER_COLOR,
  BreakdownBar,
  BreakdownKey,
  BreakdownLegend,
  formatShare,
  getTotal,
}

export type { BreakdownBarProps, BreakdownSegment }
