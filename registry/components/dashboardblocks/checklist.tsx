'use client'

import {
  CheckIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  CircleDotIcon,
  CircleIcon,
  MinusIcon,
} from 'lucide-react'
import { type ComponentProps } from 'react'

import { cn } from '@/lib/utils'

type StepState = 'done' | 'current' | 'todo' | 'skipped'

interface StepStateConfig {
  /** A standalone icon, for inline use next to the label. */
  icon: typeof CircleIcon
  label: string
  /** Text colour for the label. */
  text: string
}

/** Every state has its own icon shape and a label, so colour never carries it alone. */
const stepStateConfig: Record<StepState, StepStateConfig> = {
  current: {
    icon: CircleDotIcon,
    label: 'In progress',
    text: 'text-foreground font-medium',
  },
  done: {
    icon: CircleCheckIcon,
    label: 'Done',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  skipped: {
    icon: CircleDashedIcon,
    label: 'Skipped',
    text: 'text-muted-foreground',
  },
  todo: {
    icon: CircleIcon,
    label: 'To do',
    text: 'text-muted-foreground',
  },
}

interface ChecklistProgress {
  done: number
  /** Steps still to do, including the current one. */
  remaining: number
  skipped: number
  /** Steps that count towards progress: every step except skipped ones. */
  total: number
  /** `done` as a share of `total`, 0–100. */
  percentage: number
}

/**
 * Counts done, skipped and remaining steps. Skipped steps are left out of the
 * total, so skipping an optional step doesn't hold progress back.
 */
function getChecklistProgress(steps: { state: StepState }[]): ChecklistProgress {
  const done = steps.filter((step) => step.state === 'done').length
  const skipped = steps.filter((step) => step.state === 'skipped').length
  const total = steps.length - skipped
  let percentage = 0
  if (total > 0) percentage = (done / total) * 100
  else if (steps.length > 0) percentage = 100
  return { done, percentage, remaining: total - done, skipped, total }
}

/** The step in progress, or else the first step still to do. */
function getNextStep<T extends { state: StepState }>(steps: T[]): T | undefined {
  return (
    steps.find((step) => step.state === 'current') ??
    steps.find((step) => step.state === 'todo')
  )
}

/**
 * Marks a step skipped. If it was the current step, the next step still to do
 * becomes current.
 */
function skipStep<T extends { id: string; state: StepState }>(
  steps: T[],
  id: string,
): T[] {
  const next = steps.map((step) =>
    step.id === id ? { ...step, state: 'skipped' as const } : step,
  )
  if (next.some((step) => step.state === 'current')) return next
  const index = next.findIndex((step) => step.state === 'todo')
  return next.map((step, i) =>
    i === index ? { ...step, state: 'current' as const } : step,
  )
}

interface StepIndicatorProps {
  className?: string
  /** Shows the step number on current and to-do steps. */
  index?: number
  state: StepState
}

/**
 * A round step marker: a check when done, a thick ring when current, a thin
 * ring when to do and a dashed ring when skipped. Decorative: pair it with the
 * state label in text.
 */
function StepIndicator({ className, index, state }: StepIndicatorProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'bg-card flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium tabular-nums [&_svg]:size-3.5',
        state === 'done' && 'bg-emerald-600 text-white',
        state === 'current' && 'border-primary text-foreground border-2',
        state === 'todo' && 'text-muted-foreground border-muted-foreground/40 border',
        state === 'skipped' &&
          'text-muted-foreground border-muted-foreground/60 border border-dashed',
        className,
      )}
    >
      {state === 'done' && <CheckIcon strokeWidth={3} />}
      {state === 'skipped' && <MinusIcon />}
      {(state === 'current' || state === 'todo') &&
        (index === undefined
          ? state === 'current' && <span className='bg-primary size-2 rounded-full' />
          : index)}
    </span>
  )
}

/**
 * A native checkbox styled to match the other form controls. Pass `id` and
 * point a `<label htmlFor>` at it.
 */
function TaskCheckbox({ className, ...props }: Omit<ComponentProps<'input'>, 'type'>) {
  return (
    <span className={cn('relative inline-flex size-4 shrink-0', className)}>
      <input
        type='checkbox'
        className='peer border-muted-foreground/80 focus-visible:border-ring focus-visible:ring-ring/50 checked:border-primary checked:bg-primary dark:bg-input/30 dark:checked:bg-primary size-4 shrink-0 cursor-pointer appearance-none rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50'
        {...props}
      />
      <CheckIcon
        aria-hidden
        strokeWidth={3}
        className='text-primary-foreground pointer-events-none absolute inset-0 m-auto hidden size-3 peer-checked:block'
      />
    </span>
  )
}

export {
  StepIndicator,
  TaskCheckbox,
  getChecklistProgress,
  getNextStep,
  skipStep,
  stepStateConfig,
}

export type { ChecklistProgress, StepIndicatorProps, StepState, StepStateConfig }
