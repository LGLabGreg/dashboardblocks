'use client'

import { useBlockState } from '@/registry/components/dashboardblocks/block-state'
import { useReveal } from '@/registry/hooks/use-reveal'
import { formatPercent } from '@/registry/lib/dashboardblocks/format'

import { cn } from '@/lib/utils'

interface FunnelStage {
  label: string
  value: number
}

interface FunnelStep extends FunnelStage {
  dropped: number
  /** Share of the first stage that reached this one (0–1). */
  fromStart: number
  /** Share of the previous stage that reached this one (0–1). */
  fromPrevious: number
}

const FUNNEL_COLOR = 'var(--color-chart-2)'

const FUNNEL_TRACK_COLOR = 'color-mix(in oklab, var(--color-chart-2) 14%, transparent)'

function getFunnelSteps(stages: FunnelStage[]): FunnelStep[] {
  const first = stages[0]?.value ?? 0
  return stages.map((stage, index) => {
    const previous = index === 0 ? stage.value : stages[index - 1].value
    return {
      ...stage,
      dropped: Math.max(0, previous - stage.value),
      fromPrevious: previous > 0 ? stage.value / previous : 0,
      fromStart: first > 0 ? stage.value / first : 0,
    }
  })
}

function formatRate(rate: number, fractionDigits = 1) {
  return formatPercent(rate, {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  })
}

function getBiggestDropIndex(steps: FunnelStep[]) {
  let index = -1
  for (let i = 1; i < steps.length; i++) {
    if (index === -1 || steps[i].fromPrevious < steps[index].fromPrevious) index = i
  }
  return index
}

interface FunnelBarProps {
  animated?: boolean
  className?: string
  color?: string
  delay?: number
  /** Fill as a percentage of the track (0–100). */
  value: number
}

function FunnelBar({
  animated = true,
  className,
  color = FUNNEL_COLOR,
  delay = 0,
  value,
}: FunnelBarProps) {
  const { ref, revealed } = useReveal<HTMLDivElement>(animated)
  const state = useBlockState()
  const size = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0))

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        'h-2 w-full overflow-hidden rounded-full',
        state === 'loading' && 'animate-pulse motion-reduce:animate-none',
        className,
      )}
      style={{ backgroundColor: FUNNEL_TRACK_COLOR }}
    >
      <div
        className='h-full rounded-full transition-[width] duration-1000 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none'
        style={{
          backgroundColor: color,
          transitionDelay: animated ? `${delay}ms` : undefined,
          width: `${revealed && !state ? size : 0}%`,
        }}
      />
    </div>
  )
}

export {
  FUNNEL_COLOR,
  FUNNEL_TRACK_COLOR,
  FunnelBar,
  formatRate,
  getBiggestDropIndex,
  getFunnelSteps,
}

export type { FunnelBarProps, FunnelStage, FunnelStep }
