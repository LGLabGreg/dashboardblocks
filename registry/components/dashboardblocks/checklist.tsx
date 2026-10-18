'use client'

import {
  StatusLabel,
  type StatusTone,
} from '@/registry/components/dashboardblocks/status-label'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

type StepState = 'done' | 'current' | 'todo' | 'skipped'

interface StepStateConfig {
  icon: React.ReactNode
  label: string
  tone: StatusTone
}

const stepStateConfig: Record<StepState, StepStateConfig> = {
  current: {
    icon: (
      <IconPlaceholder
        lucide='CircleDotIcon'
        tabler='IconCircleDot'
        hugeicons='RecordIcon'
        phosphor='RecordIcon'
        remixicon='RiRecordCircleLine'
        aria-hidden
      />
    ),
    label: 'In progress',
    tone: 'info',
  },
  done: {
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
    label: 'Done',
    tone: 'good',
  },
  skipped: {
    icon: (
      <IconPlaceholder
        lucide='CircleDashedIcon'
        tabler='IconCircleDashed'
        hugeicons='DashedLineCircleIcon'
        phosphor='CircleDashedIcon'
        remixicon='RiLoaderLine'
        aria-hidden
      />
    ),
    label: 'Skipped',
    tone: 'neutral',
  },
  todo: {
    icon: (
      <IconPlaceholder
        lucide='CircleIcon'
        tabler='IconCircle'
        hugeicons='CircleIcon'
        phosphor='CircleIcon'
        remixicon='RiCircleLine'
        aria-hidden
      />
    ),
    label: 'To do',
    tone: 'neutral',
  },
}

interface ChecklistProgress {
  done: number
  remaining: number
  skipped: number
  total: number
  /** `done` as a share of `total`, 0–100. */
  percentage: number
}

function getChecklistProgress(steps: { state: StepState }[]): ChecklistProgress {
  const done = steps.filter((step) => step.state === 'done').length
  const skipped = steps.filter((step) => step.state === 'skipped').length
  const total = steps.length - skipped
  let percentage = 0
  if (total > 0) percentage = (done / total) * 100
  else if (steps.length > 0) percentage = 100
  return { done, percentage, remaining: total - done, skipped, total }
}

interface ChecklistNoun {
  one: string
  other: string
}

function describeChecklistProgress(
  progress: ChecklistProgress,
  noun: ChecklistNoun = { one: 'step', other: 'steps' },
) {
  const done = `${progress.done} of ${progress.total} ${progress.total === 1 ? noun.one : noun.other} done`
  return progress.skipped > 0 ? `${done}, ${progress.skipped} skipped` : done
}

function getNextStep<T extends { state: StepState }>(steps: T[]): T | undefined {
  return (
    steps.find((step) => step.state === 'current') ??
    steps.find((step) => step.state === 'todo')
  )
}

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
  index?: number
  state: StepState
}

function StepIndicator({ className, index, state }: StepIndicatorProps) {
  return (
    <span
      aria-hidden
      data-state={state}
      className={cn(
        'flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium tabular-nums [&_svg]:size-3.5',
        state === 'done' && 'border-current text-emerald-700 dark:text-emerald-400',
        state === 'current' && 'border-foreground text-foreground border-2',
        state === 'todo' && 'text-muted-foreground border-border',
        state === 'skipped' && 'text-muted-foreground border-border border-dashed',
        className,
      )}
    >
      {state === 'done' && (
        <IconPlaceholder
          lucide='CheckIcon'
          tabler='IconCheck'
          hugeicons='Tick02Icon'
          phosphor='CheckIcon'
          remixicon='RiCheckLine'
          strokeWidth={3}
        />
      )}
      {state === 'skipped' && (
        <IconPlaceholder
          lucide='MinusIcon'
          tabler='IconMinus'
          hugeicons='MinusSignIcon'
          phosphor='MinusIcon'
          remixicon='RiSubtractLine'
        />
      )}
      {(state === 'current' || state === 'todo') &&
        (index === undefined
          ? state === 'current' && <span className='bg-foreground size-2 rounded-full' />
          : index)}
    </span>
  )
}

function StepStateLabel({
  className,
  state,
  ...props
}: Omit<ComponentProps<typeof StatusLabel>, 'tone'> & { state: StepState }) {
  const config = stepStateConfig[state]
  return (
    <StatusLabel tone={config.tone} className={className} {...props}>
      {config.label}
    </StatusLabel>
  )
}

function TaskCheckbox({ className, ...props }: Omit<ComponentProps<'input'>, 'type'>) {
  return (
    <span className={cn('relative inline-flex size-4 shrink-0', className)}>
      <input
        type='checkbox'
        className='peer border-muted-foreground/80 focus-visible:border-ring focus-visible:ring-ring/50 checked:border-primary checked:bg-primary dark:bg-input/30 dark:checked:bg-primary size-4 shrink-0 cursor-pointer appearance-none rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50'
        {...props}
      />
      <IconPlaceholder
        lucide='CheckIcon'
        tabler='IconCheck'
        hugeicons='Tick02Icon'
        phosphor='CheckIcon'
        remixicon='RiCheckLine'
        aria-hidden
        strokeWidth={3}
        className='text-primary-foreground pointer-events-none absolute inset-0 m-auto hidden size-3 peer-checked:block'
      />
    </span>
  )
}

export {
  StepIndicator,
  StepStateLabel,
  TaskCheckbox,
  describeChecklistProgress,
  getChecklistProgress,
  getNextStep,
  skipStep,
  stepStateConfig,
}

export type {
  ChecklistNoun,
  ChecklistProgress,
  StepIndicatorProps,
  StepState,
  StepStateConfig,
}
