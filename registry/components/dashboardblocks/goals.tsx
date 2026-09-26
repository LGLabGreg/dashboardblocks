'use client'

import { useInView } from '@/registry/hooks/use-in-view'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type RefObject, useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

type PaceStatus = 'ahead' | 'on-track' | 'behind' | 'met'

interface Pace {
  /** Where the value should be by now, assuming steady progress. */
  expected: number
  /** Share of the period that has passed, 0–1. */
  elapsed: number
  /** The value at the end of the period if progress continues at the current rate. */
  projected: number
  status: PaceStatus
}

interface PaceInput {
  current: number
  /** Share of the period that has passed, 0–1. */
  elapsed: number
  target: number
  /**
   * How far from the expected value still counts as on track.
   * @default 0.05
   */
  tolerance?: number
}

/** Compares progress with a straight line from zero to the target. */
function getPace({ current, elapsed, target, tolerance = 0.05 }: PaceInput): Pace {
  const clamped = Math.min(1, Math.max(0, elapsed))
  const expected = target * clamped
  const projected = clamped > 0 ? current / clamped : current
  let status: PaceStatus = 'on-track'
  if (current >= target) status = 'met'
  else if (current > expected * (1 + tolerance)) status = 'ahead'
  else if (current < expected * (1 - tolerance)) status = 'behind'
  return { elapsed: clamped, expected, projected, status }
}

/** Share of the period between `start` and `end` that has passed at `now`. */
function getElapsed(start: Date, end: Date, now: Date) {
  const total = end.getTime() - start.getTime()
  return total > 0 ? (now.getTime() - start.getTime()) / total : 1
}

const paceConfig: Record<
  PaceStatus,
  { className: string; icon: React.ReactNode; label: string }
> = {
  ahead: {
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    icon: (
      <IconPlaceholder
        lucide='TrendingUpIcon'
        tabler='IconTrendingUp'
        hugeicons='ChartUpIcon'
        phosphor='TrendUpIcon'
        remixicon='RiLineChartLine'
        aria-hidden
      />
    ),
    label: 'Ahead',
  },
  behind: {
    className: 'bg-amber-500/10 text-amber-800 dark:text-amber-400',
    icon: (
      <IconPlaceholder
        lucide='TriangleAlertIcon'
        tabler='IconAlertTriangle'
        hugeicons='Alert02Icon'
        phosphor='WarningIcon'
        remixicon='RiErrorWarningLine'
        aria-hidden
      />
    ),
    label: 'Behind',
  },
  met: {
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    icon: (
      <IconPlaceholder
        lucide='CircleCheckIcon'
        tabler='IconCircleCheck'
        hugeicons='CheckmarkCircle02Icon'
        phosphor='CheckCircleIcon'
        remixicon='RiCheckboxCircleLine'
        aria-hidden
      />
    ),
    label: 'Goal met',
  },
  'on-track': {
    className: 'bg-muted text-muted-foreground',
    icon: (
      <IconPlaceholder
        lucide='CircleCheckIcon'
        tabler='IconCircleCheck'
        hugeicons='CheckmarkCircle02Icon'
        phosphor='CheckCircleIcon'
        remixicon='RiCheckboxCircleLine'
        aria-hidden
      />
    ),
    label: 'On track',
  },
}

/** The pace status with its icon and label. Colour never carries it alone. */
function PaceBadge({ className, status }: { className?: string; status: PaceStatus }) {
  const config = paceConfig[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0',
        config.className,
        className,
      )}
    >
      {config.icon}
      {config.label}
    </span>
  )
}

interface GoalProgressProps {
  animated?: boolean
  className?: string
  /** @default 'var(--chart-1)' */
  color?: string
  current: number
  /** Marks where the value should be by now, from `getPace`. */
  expected?: number
  /** @default 'md' */
  size?: 'sm' | 'md'
  target: number
}

/**
 * Progress towards a target, with an optional tick where the value should be
 * by now. Decorative: show the values as text beside it.
 */
function GoalProgress({
  animated = true,
  className,
  color = 'var(--chart-1)',
  current,
  expected,
  size = 'md',
  target,
}: GoalProgressProps) {
  const { isInView, ref } = useInView({ threshold: 0.3 })
  const [revealed, setRevealed] = useState(!animated)

  useEffect(() => {
    if (!animated || !isInView) return
    const frame = requestAnimationFrame(() => setRevealed(true))
    return () => cancelAnimationFrame(frame)
  }, [animated, isInView])

  const share = target > 0 ? Math.min(1, Math.max(0, current / target)) : 0
  const marker =
    expected !== undefined && target > 0 ? Math.min(1, expected / target) : null

  return (
    <div
      ref={ref as RefObject<HTMLDivElement>}
      aria-hidden
      className={cn('relative w-full', size === 'md' ? 'h-2.5' : 'h-1.5', className)}
    >
      <div className='bg-muted h-full w-full overflow-hidden rounded-full'>
        <div
          className='h-full rounded-full transition-[width] duration-1000 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none'
          style={{ backgroundColor: color, width: `${(revealed ? share : 0) * 100}%` }}
        />
      </div>
      {marker !== null && (
        <span
          className='bg-foreground ring-card absolute top-1/2 h-[calc(100%+8px)] w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2'
          style={{ left: `${marker * 100}%` }}
        />
      )}
    </div>
  )
}

/** A short legend for the expected-by-now tick. */
function GoalProgressKey({
  className,
  label = 'Expected by today',
}: {
  className?: string
  label?: string
}) {
  return (
    <span
      className={cn(
        'text-muted-foreground inline-flex items-center gap-1.5 text-xs',
        className,
      )}
    >
      <span aria-hidden className='bg-foreground h-3 w-0.5 rounded-full' />
      {label}
    </span>
  )
}

export { GoalProgress, GoalProgressKey, PaceBadge, getElapsed, getPace, paceConfig }

export type { GoalProgressProps, Pace, PaceInput, PaceStatus }
