'use client'

import { useBlockState } from '@/registry/components/dashboardblocks/block-state'
import {
  StatusLabel,
  type StatusTone,
} from '@/registry/components/dashboardblocks/status-label'
import { useReveal } from '@/registry/hooks/use-reveal'

import { cn } from '@/lib/utils'

type PaceStatus = 'ahead' | 'on-track' | 'behind' | 'met'

interface Pace {
  expected: number
  /** Share of the period that has passed, 0–1. */
  elapsed: number
  projected: number
  status: PaceStatus
}

interface PaceInput {
  current: number
  /** Share of the period that has passed, 0–1. */
  elapsed: number
  target: number
  /** How far from the expected value still counts as on track, 0.05 by default. */
  tolerance?: number
}

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

function getElapsed(start: Date, end: Date, now: Date) {
  const total = end.getTime() - start.getTime()
  return total > 0 ? (now.getTime() - start.getTime()) / total : 1
}

const paceConfig: Record<PaceStatus, { label: string; tone: StatusTone }> = {
  ahead: { label: 'Ahead', tone: 'good' },
  behind: { label: 'Behind', tone: 'warning' },
  met: { label: 'Goal met', tone: 'good' },
  'on-track': { label: 'On track', tone: 'good' },
}

function PaceLabel({ className, status }: { className?: string; status: PaceStatus }) {
  const config = paceConfig[status]
  return (
    <StatusLabel className={className} tone={config.tone}>
      {config.label}
    </StatusLabel>
  )
}

function projectedFill(color: string) {
  return `repeating-linear-gradient(-45deg, color-mix(in oklab, ${color} 55%, transparent) 0 2px, color-mix(in oklab, ${color} 18%, transparent) 2px 5px)`
}

interface GoalProgressProps {
  animated?: boolean
  className?: string
  /** @default 'var(--color-chart-2)' */
  color?: string
  current: number
  expected?: number
  /** Where the current pace ends up, drawn hatched past `current`. */
  projected?: number
  /** @default 'md' */
  size?: 'sm' | 'md'
  target: number
}

function GoalProgress({
  animated = true,
  className,
  color = 'var(--color-chart-2)',
  current,
  expected,
  projected,
  size = 'md',
  target,
}: GoalProgressProps) {
  const { ref, revealed } = useReveal(animated)
  const state = useBlockState()

  const clamp = (value: number) =>
    target > 0 ? Math.min(1, Math.max(0, value / target)) : 0
  const share = clamp(current)
  const ahead = projected !== undefined ? Math.max(0, clamp(projected) - share) : 0
  const marker =
    expected !== undefined && target > 0 ? Math.min(1, expected / target) : null

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn('relative w-full', size === 'md' ? 'h-2.5' : 'h-1.5', className)}
    >
      {state ? (
        <div
          className={cn(
            'bg-muted h-full w-full rounded-full',
            state === 'loading' && 'animate-pulse motion-reduce:animate-none',
          )}
        />
      ) : (
        <div
          className='bg-muted flex h-full w-full overflow-hidden rounded-full transition-[clip-path] duration-1000 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none'
          style={{ clipPath: `inset(0 ${revealed ? 0 : 100}% 0 0)` }}
        >
          <span
            className='h-full'
            style={{ backgroundColor: color, width: `${share * 100}%` }}
          />
          {ahead > 0 && (
            <span
              className='h-full'
              style={{ background: projectedFill(color), width: `${ahead * 100}%` }}
            />
          )}
        </div>
      )}
      {!state && marker !== null && (
        <span
          className='bg-foreground ring-background absolute top-1/2 h-[calc(100%+8px)] w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2'
          style={{ left: `${marker * 100}%` }}
        />
      )}
    </div>
  )
}

function GoalProgressKey({
  className,
  color = 'var(--color-chart-2)',
  label = 'Expected by today',
  shape = 'expected',
}: {
  className?: string
  /** @default 'var(--color-chart-2)' */
  color?: string
  label?: string
  /** @default 'expected' */
  shape?: 'expected' | 'progress' | 'projected'
}) {
  const state = useBlockState()
  if (state === 'empty' || state === 'error') return null

  return (
    <span
      className={cn(
        'text-muted-foreground inline-flex items-center gap-1.5 text-xs',
        className,
      )}
    >
      {shape === 'expected' ? (
        <span aria-hidden className='bg-foreground h-3 w-0.5 rounded-full' />
      ) : (
        <span
          aria-hidden
          className='h-2 w-3 rounded-full'
          style={{
            background: shape === 'projected' ? projectedFill(color) : color,
          }}
        />
      )}
      {label}
    </span>
  )
}

export { GoalProgress, GoalProgressKey, PaceLabel, getElapsed, getPace, paceConfig }

export type { GoalProgressProps, Pace, PaceInput, PaceStatus }
