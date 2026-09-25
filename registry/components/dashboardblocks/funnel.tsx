'use client'

import { useInView } from '@/registry/hooks/use-in-view'
import { type RefObject, useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

interface FunnelStage {
  label: string
  value: number
}

interface FunnelStep extends FunnelStage {
  /** Users lost since the previous stage. */
  dropped: number
  /** Share of the first stage that reached this one (0–1). */
  fromStart: number
  /** Share of the previous stage that reached this one (0–1). */
  fromPrevious: number
}

/** Fill for a funnel stage. */
const FUNNEL_COLOR = 'var(--chart-1)'

/** Lighter step of the same hue, for the track behind a stage. */
const FUNNEL_TRACK_COLOR = 'color-mix(in oklab, var(--chart-1) 14%, transparent)'

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
  return `${(rate * 100).toFixed(fractionDigits)}%`
}

/** Index of the step with the lowest conversion from the previous stage. */
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
  orientation?: 'horizontal' | 'vertical'
  track?: boolean
  /** Fill as a percentage of the track (0–100). */
  value: number
}

function FunnelBar({
  animated = true,
  className,
  color = FUNNEL_COLOR,
  delay = 0,
  orientation = 'horizontal',
  track = true,
  value,
}: FunnelBarProps) {
  const { isInView, ref } = useInView({ threshold: 0.3 })
  const [revealed, setRevealed] = useState(!animated)
  const size = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0))
  const vertical = orientation === 'vertical'

  useEffect(() => {
    if (!animated || !isInView) return
    const frame = requestAnimationFrame(() => setRevealed(true))
    return () => cancelAnimationFrame(frame)
  }, [animated, isInView])

  return (
    <div
      ref={ref as RefObject<HTMLDivElement>}
      aria-hidden
      className={cn(
        'relative overflow-hidden',
        vertical
          ? 'flex h-full w-full items-end rounded-t-[4px]'
          : 'h-2.5 w-full rounded-full',
        className,
      )}
      style={{ backgroundColor: track ? FUNNEL_TRACK_COLOR : undefined }}
    >
      <div
        className={cn(
          'duration-1000 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none',
          vertical
            ? 'w-full rounded-t-[4px] transition-[height]'
            : 'h-full rounded-full transition-[width]',
        )}
        style={{
          backgroundColor: color,
          [vertical ? 'height' : 'width']: `${revealed ? size : 0}%`,
          transitionDelay: animated ? `${delay}ms` : undefined,
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
