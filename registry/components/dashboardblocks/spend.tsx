'use client'

import { useBlockState } from '@/registry/components/dashboardblocks/block-state'
import {
  StatusLabel,
  type StatusTone,
} from '@/registry/components/dashboardblocks/status-label'
import { useReveal } from '@/registry/hooks/use-reveal'

import { cn } from '@/lib/utils'

type BudgetStatus = 'under' | 'on-track' | 'at-risk' | 'over'

interface BudgetPaceInput {
  budget: number
  /** Share of the period that has passed, 0–1. */
  elapsed: number
  spent: number
  /** How far over budget the projection can land and stay on track, and how far under counts as under budget, 0.05 by default. */
  tolerance?: number
}

interface BudgetPace {
  budget: number
  expected: number
  projected: number
  /** Budget left, negative once over. */
  remaining: number
  spent: number
  status: BudgetStatus
}

function getBudgetPace({
  budget,
  elapsed,
  spent,
  tolerance = 0.05,
}: BudgetPaceInput): BudgetPace {
  const clamped = Math.min(1, Math.max(0, elapsed))
  const projected = clamped > 0 ? spent / clamped : spent
  let status: BudgetStatus = 'on-track'
  if (spent > budget) status = 'over'
  else if (projected > budget * (1 + tolerance)) status = 'at-risk'
  else if (projected < budget * (1 - tolerance)) status = 'under'
  return {
    budget,
    expected: budget * clamped,
    projected,
    remaining: budget - spent,
    spent,
    status,
  }
}

function getElapsed(start: Date, end: Date, now: Date) {
  const total = end.getTime() - start.getTime()
  return total > 0 ? (now.getTime() - start.getTime()) / total : 1
}

interface RunwayInput {
  cash: number
  /** Cash in minus cash out per month; negative while burning. */
  monthlyNet: number
  now: Date
}

function getRunway({ cash, monthlyNet, now }: RunwayInput) {
  if (monthlyNet >= 0 || cash <= 0) {
    return { date: null, months: cash <= 0 ? 0 : Infinity }
  }
  const months = cash / -monthlyNet
  const date = new Date(now.getTime())
  const whole = Math.floor(months)
  date.setUTCMonth(date.getUTCMonth() + whole)
  date.setUTCDate(date.getUTCDate() + Math.round((months - whole) * 30.4))
  return { date, months }
}

const budgetStatusConfig: Record<BudgetStatus, { label: string; tone: StatusTone }> = {
  'at-risk': { label: 'At risk', tone: 'warning' },
  'on-track': { label: 'On track', tone: 'good' },
  over: { label: 'Over budget', tone: 'bad' },
  under: { label: 'Under budget', tone: 'good' },
}

function BudgetStatusLabel({
  className,
  status,
}: {
  className?: string
  status: BudgetStatus
}) {
  const state = useBlockState()
  if (state) return null
  const config = budgetStatusConfig[status]
  return (
    <StatusLabel className={className} tone={config.tone}>
      {config.label}
    </StatusLabel>
  )
}

const spendColors = {
  over: 'var(--color-destructive)',
  spent: 'var(--color-chart-2)',
} as const

function projectedFill(color: string) {
  return `repeating-linear-gradient(-45deg, color-mix(in oklab, ${color} 55%, transparent) 0 2px, color-mix(in oklab, ${color} 18%, transparent) 2px 5px)`
}

interface BudgetBarProps {
  animated?: boolean
  budget: number
  className?: string
  /** @default 'var(--color-chart-2)' */
  color?: string
  projected?: number
  /** @default 'md' */
  size?: 'sm' | 'md'
  spent: number
}

const SCALE_HEADROOM = 1.04

function BudgetBar({
  animated = true,
  budget,
  className,
  color = spendColors.spent,
  projected,
  size = 'md',
  spent,
}: BudgetBarProps) {
  const { ref, revealed } = useReveal(animated)
  const state = useBlockState()

  if (state) {
    return (
      <div
        aria-hidden
        className={cn(
          'bg-muted w-full rounded-full',
          size === 'md' ? 'h-3' : 'h-2',
          state === 'loading' && 'animate-pulse motion-reduce:animate-none',
          className,
        )}
      />
    )
  }

  const scale = Math.max(budget, spent, projected ?? 0) * SCALE_HEADROOM || 1
  const at = (value: number) => `${(Math.max(0, value) / scale) * 100}%`
  const withinBudget = Math.min(spent, budget)
  const overspend = Math.max(0, spent - budget)
  const projectedExtra = projected !== undefined ? Math.max(0, projected - spent) : 0

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn('relative w-full', size === 'md' ? 'h-3' : 'h-2', className)}
    >
      <div
        className='bg-muted flex h-full w-full origin-left overflow-hidden rounded-full transition-[clip-path] duration-1000 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none'
        style={{ clipPath: `inset(0 ${revealed ? 0 : 100}% 0 0)` }}
      >
        <span
          className='h-full'
          style={{ backgroundColor: color, width: at(withinBudget) }}
        />
        {overspend > 0 && (
          <span
            className='h-full'
            style={{ backgroundColor: spendColors.over, width: at(overspend) }}
          />
        )}
        {projectedExtra > 0 && (
          <span
            className='h-full'
            style={{
              background: projectedFill(
                spent + projectedExtra > budget ? spendColors.over : color,
              ),
              width: at(projectedExtra),
            }}
          />
        )}
      </div>
      <span
        className='bg-foreground ring-background absolute top-1/2 h-[calc(100%+8px)] w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2'
        style={{ left: at(budget) }}
      />
    </div>
  )
}

type SpendKeyShape = 'spent' | 'projected' | 'over' | 'budget'

function SpendKey({
  className,
  color = spendColors.spent,
  shape,
}: {
  className?: string
  color?: string
  shape: SpendKeyShape
}) {
  if (shape === 'budget') {
    return (
      <span
        aria-hidden
        className={cn(
          'bg-foreground inline-block h-3 w-0.5 shrink-0 rounded-full',
          className,
        )}
      />
    )
  }
  return (
    <span
      aria-hidden
      className={cn('inline-block size-2.5 shrink-0 rounded-[3px]', className)}
      style={{
        background:
          shape === 'projected'
            ? projectedFill(color)
            : shape === 'over'
              ? spendColors.over
              : color,
      }}
    />
  )
}

export {
  BudgetBar,
  BudgetStatusLabel,
  SpendKey,
  budgetStatusConfig,
  getBudgetPace,
  getElapsed,
  getRunway,
  projectedFill,
  spendColors,
}

export type {
  BudgetBarProps,
  BudgetPace,
  BudgetPaceInput,
  BudgetStatus,
  RunwayInput,
  SpendKeyShape,
}
