'use client'

import { useInView } from '@/registry/hooks/use-in-view'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type RefObject, useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

type BudgetStatus = 'under' | 'on-track' | 'at-risk' | 'over'

interface BudgetPaceInput {
  budget: number
  /** Share of the period that has passed, 0–1. */
  elapsed: number
  spent: number
  /**
   * How far over the budget the projection can land and still count as on
   * track, and how far under it counts as under budget.
   * @default 0.05
   */
  tolerance?: number
}

interface BudgetPace {
  budget: number
  /** Where spend should be by now, spending evenly. */
  expected: number
  /** The period total if spending continues at the current rate. */
  projected: number
  /** Budget left, negative once over. */
  remaining: number
  spent: number
  status: BudgetStatus
}

/** Compares spend so far with an even spend of the budget over the period. */
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

/** Share of the period between `start` and `end` that has passed at `now`. */
function getElapsed(start: Date, end: Date, now: Date) {
  const total = end.getTime() - start.getTime()
  return total > 0 ? (now.getTime() - start.getTime()) / total : 1
}

interface RunwayInput {
  /** Cash on hand. */
  cash: number
  /** Cash in minus cash out per month; negative while burning. */
  monthlyNet: number
  /** Where the runway starts. */
  now: Date
}

/**
 * Months until cash runs out at the current net burn, and the date it does.
 * `Infinity` months and no date while cash isn't falling.
 */
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

const budgetStatusConfig: Record<
  BudgetStatus,
  { className: string; icon: React.ReactNode; label: string }
> = {
  'at-risk': {
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
    label: 'At risk',
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
  over: {
    className: 'bg-red-500/10 text-red-700 dark:text-red-400',
    icon: (
      <IconPlaceholder
        lucide='OctagonAlertIcon'
        tabler='IconAlertOctagon'
        hugeicons='AlertDiamondIcon'
        phosphor='WarningOctagonIcon'
        remixicon='RiAlarmWarningLine'
        aria-hidden
      />
    ),
    label: 'Over budget',
  },
  under: {
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
    label: 'Under budget',
  },
}

/** The budget status with its icon and label. Colour never carries it alone. */
function BudgetStatusBadge({
  className,
  status,
}: {
  className?: string
  status: BudgetStatus
}) {
  const config = budgetStatusConfig[status]
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

/**
 * Spend uses the primary colour rather than a chart colour: some themes'
 * chart colours are orange or red, too close to the overspend red.
 */
const spendColors = {
  over: 'var(--destructive)',
  spent: 'var(--primary)',
} as const

/** A striped fill for projected spend, in the spent colour. */
function projectedFill(color: string) {
  return `repeating-linear-gradient(-45deg, color-mix(in oklab, ${color} 55%, transparent) 0 2px, color-mix(in oklab, ${color} 18%, transparent) 2px 5px)`
}

interface BudgetBarProps {
  animated?: boolean
  budget: number
  className?: string
  /** @default 'var(--primary)' */
  color?: string
  /** Adds a striped segment from spent to the projected total. */
  projected?: number
  /** @default 'md' */
  size?: 'sm' | 'md'
  spent: number
}

/**
 * Spend against a budget: the bar fills to what's spent, turns red past the
 * budget line, and a striped segment runs on to the projected total.
 * Decorative: show the values as text beside it.
 */
function BudgetBar({
  animated = true,
  budget,
  className,
  color = spendColors.spent,
  projected,
  size = 'md',
  spent,
}: BudgetBarProps) {
  const { isInView, ref } = useInView({ threshold: 0.3 })
  const [revealed, setRevealed] = useState(!animated)

  useEffect(() => {
    if (!animated || !isInView) return
    const frame = requestAnimationFrame(() => setRevealed(true))
    return () => cancelAnimationFrame(frame)
  }, [animated, isInView])

  // Leave room past the budget so overspend and projections stay visible.
  const scale = Math.max(budget, spent, projected ?? 0) * 1.04 || 1
  const at = (value: number) => `${(Math.max(0, value) / scale) * 100}%`
  const withinBudget = Math.min(spent, budget)
  const overspend = Math.max(0, spent - budget)
  const projectedExtra = projected !== undefined ? Math.max(0, projected - spent) : 0

  return (
    <div
      ref={ref as RefObject<HTMLDivElement>}
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
        className='bg-foreground ring-card absolute top-1/2 h-[calc(100%+8px)] w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2'
        style={{ left: at(budget) }}
      />
    </div>
  )
}

type SpendKeyShape = 'spent' | 'projected' | 'over' | 'budget'

/** A legend swatch matching a `BudgetBar` mark. */
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
  BudgetStatusBadge,
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
