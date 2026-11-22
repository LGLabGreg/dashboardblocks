'use client'

import {
  StatusLabel,
  type StatusTone,
} from '@/registry/components/dashboardblocks/status-label'
import { Tag } from '@/registry/components/dashboardblocks/tag'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type ComponentProps, createContext, type ReactNode, useContext } from 'react'

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
    <Tag
      aria-hidden
      data-state={state}
      className={cn(
        '[&_svg]:size-3',
        (state === 'done' || state === 'skipped') && 'px-1',
        state === 'done' && 'text-chart-2 bg-chart-2/10 dark:bg-chart-2/15',
        state === 'current' && 'bg-foreground text-background',
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
          strokeWidth={2.5}
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
          ? state === 'current' && <span className='size-1.5 rounded-full bg-current' />
          : index)}
    </Tag>
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

const stepRailRow = {
  never: { item: '', list: '' },
  md: {
    item: '@md:flex-1 @md:border-t-2 @md:border-l-0 @md:pt-3 @md:pl-0',
    list: '@md:flex-row',
  },
  xl: {
    item: '@xl:flex-1 @xl:border-t-2 @xl:border-l-0 @xl:pt-3 @xl:pl-0',
    list: '@xl:flex-row',
  },
}

type StepRailRow = keyof typeof stepRailRow

const StepRailContext = createContext<StepRailRow>('xl')

/** Steps in a column, each with a line at its start, that turn into a row with a line over each once the container is `row` wide, or never with `row='never'`. */
function StepRail({
  className,
  row = 'xl',
  ...props
}: ComponentProps<'ol'> & { row?: StepRailRow }) {
  return (
    <StepRailContext.Provider value={row}>
      <ol
        data-slot='step-rail'
        className={cn('flex flex-col gap-3', stepRailRow[row].list, className)}
        {...props}
      />
    </StepRailContext.Provider>
  )
}

interface StepRailItemProps extends Omit<ComponentProps<'li'>, 'title'> {
  /** A line under the title, such as when the step happened. */
  description?: ReactNode
  index: number
  state: StepState
  title: ReactNode
}

function StepRailItem({
  className,
  description,
  index,
  state,
  title,
  ...props
}: StepRailItemProps) {
  const row = useContext(StepRailContext)
  return (
    <li
      aria-current={state === 'current' ? 'step' : undefined}
      data-slot='step-rail-item'
      data-state={state}
      className={cn(
        'border-border data-[state=current]:border-foreground data-[state=done]:border-chart-2 flex min-w-0 items-start gap-2 border-l-2 pl-3 text-sm data-[state=skipped]:border-dashed',
        stepRailRow[row].item,
        className,
      )}
      {...props}
    >
      <StepIndicator index={index} state={state} />
      <span className='flex min-w-0 flex-col gap-0.5'>
        <span
          className={cn(
            'min-w-0 font-medium break-words',
            (state === 'todo' || state === 'skipped') && 'text-muted-foreground',
          )}
        >
          {title}
          <span className='sr-only'>, {stepStateConfig[state].label}</span>
        </span>
        {description && (
          <span className='text-muted-foreground text-xs tabular-nums'>
            {description}
          </span>
        )}
      </span>
    </li>
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
        className='text-primary-foreground pointer-events-none absolute inset-0 z-10 m-auto hidden size-3 peer-checked:block'
      />
    </span>
  )
}

export {
  StepIndicator,
  StepRail,
  StepRailItem,
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
  StepRailItemProps,
  StepState,
  StepStateConfig,
}
