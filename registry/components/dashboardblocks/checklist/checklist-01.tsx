'use client'

import {
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  SkeletonText,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  type StepState,
  StepIndicator,
  StepStateLabel,
  describeChecklistProgress,
  getChecklistProgress,
  getNextStep,
  skipStep,
} from '@/registry/components/dashboardblocks/checklist'
import { Details } from '@/registry/components/dashboardblocks/details'
import { ProgressBar } from '@/registry/components/dashboardblocks/progress-bar'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useId, useState } from 'react'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

interface OnboardingStep {
  action?: string
  description: string
  duration?: string
  id: string
  optional?: boolean
  state: StepState
  title: string
}

interface Checklist1Props {
  onAction?: (id: string) => void
  onSkip?: (id: string) => void
  status?: BlockStatus
  /** Leave out, or pass none, to show the empty state. */
  steps?: OnboardingStep[]
  title: string
}

interface ChecklistStepsProps extends Omit<Checklist1Props, 'status' | 'steps'> {
  steps: OnboardingStep[]
}

const exampleProps: Checklist1Props = {
  steps: [
    {
      description: 'Name your workspace and pick a default currency and time zone.',
      duration: '1 min',
      id: 'workspace',
      state: 'done',
      title: 'Create your workspace',
    },
    {
      action: 'Connect a source',
      description: 'Sync data from Postgres, Stripe, HubSpot or 40 other sources.',
      duration: '3 min',
      id: 'source',
      state: 'done',
      title: 'Connect a data source',
    },
    {
      action: 'Invite people',
      description: 'Add teammates so they can view and edit dashboards.',
      duration: '1 min',
      id: 'team',
      optional: true,
      state: 'skipped',
      title: 'Invite your team',
    },
    {
      action: 'Create dashboard',
      description:
        'Start from a template or a blank canvas, then add the metrics you track every week.',
      duration: '5 min',
      id: 'dashboard',
      state: 'current',
      title: 'Build your first dashboard',
    },
    {
      action: 'Set up alert',
      description: 'Get an email or Slack message when a metric crosses a threshold.',
      duration: '2 min',
      id: 'alert',
      optional: true,
      state: 'todo',
      title: 'Set up an alert',
    },
    {
      action: 'Schedule report',
      description: 'Send a weekly summary to your inbox every Monday morning.',
      duration: '2 min',
      id: 'report',
      state: 'todo',
      title: 'Schedule a report',
    },
  ],
  title: 'Get started',
}

function ChecklistSteps(props: ChecklistStepsProps) {
  const { onAction, onSkip, title } = props
  const id = useId()
  const [steps, setSteps] = useState(props.steps)
  const [expanded, setExpanded] = useState(() => {
    const next = getNextStep(props.steps)
    return new Set(next ? [next.id] : [])
  })
  const [announcement, setAnnouncement] = useState('')
  const progress = getChecklistProgress(steps)
  const nextStep = getNextStep(steps)

  const toggle = (stepId: string) => {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(stepId)) next.delete(stepId)
      else next.add(stepId)
      return next
    })
  }

  const skip = (step: OnboardingStep) => {
    const nextSteps = skipStep(steps, step.id)
    const next = getNextStep(nextSteps)
    setSteps(nextSteps)
    setExpanded((current) => {
      const updated = new Set(current)
      updated.delete(step.id)
      if (next) updated.add(next.id)
      return updated
    })
    setAnnouncement(
      next ? `Skipped ${step.title}. Next: ${next.title}` : `Skipped ${step.title}`,
    )
    onSkip?.(step.id)
  }

  return (
    <section className='@container flex flex-col gap-3'>
      <header className='flex flex-col gap-0.5'>
        <h2 className='font-semibold tracking-tight'>{title}</h2>
        <p className='text-muted-foreground text-sm'>
          {describeChecklistProgress(progress)}.{nextStep && ` Next: ${nextStep.title}.`}
        </p>
      </header>
      <div
        role='progressbar'
        aria-label={title}
        aria-valuemax={progress.total}
        aria-valuemin={0}
        aria-valuenow={progress.done}
        aria-valuetext={describeChecklistProgress(progress)}
      >
        <ProgressBar
          className='h-1.5'
          fillClassName='motion-reduce:transition-none'
          percentage={progress.percentage}
        />
      </div>
      <p role='status' className='sr-only'>
        {announcement}
      </p>
      <ol className='border-t'>
        {steps.map((step, index) => {
          const isOpen = expanded.has(step.id)
          const panelId = `${id}-${step.id}`
          return (
            <li key={step.id} className='border-b'>
              <button
                type='button'
                aria-controls={panelId}
                aria-current={step.state === 'current' ? 'step' : undefined}
                aria-expanded={isOpen}
                onClick={() => toggle(step.id)}
                className='group/step focus-visible:ring-ring/50 flex w-full items-center gap-3 rounded-md py-2.5 text-left outline-none focus-visible:ring-3'
              >
                <StepIndicator index={index + 1} state={step.state} />
                <span className='flex min-w-0 flex-1 flex-col gap-0.5'>
                  <span
                    className={cn(
                      'text-sm font-medium group-hover/step:underline group-hover/step:underline-offset-4',
                      (step.state === 'done' || step.state === 'skipped') &&
                        'text-muted-foreground',
                    )}
                  >
                    {step.title}
                  </span>
                  <Details className='text-muted-foreground text-sm'>
                    <StepStateLabel state={step.state} />
                    {step.optional && 'Optional'}
                  </Details>
                </span>
                {step.duration && (
                  <span className='text-muted-foreground shrink-0 text-sm tabular-nums'>
                    {step.duration}
                  </span>
                )}
                <IconPlaceholder
                  lucide='ChevronDownIcon'
                  tabler='IconChevronDown'
                  hugeicons='ArrowDownIcon'
                  phosphor='CaretDownIcon'
                  remixicon='RiArrowDownSLine'
                  aria-hidden
                  className={cn(
                    'text-muted-foreground size-4 shrink-0 transition-transform motion-reduce:transition-none',
                    isOpen && 'rotate-180',
                  )}
                />
              </button>
              <div id={panelId} hidden={!isOpen} className='pr-7 pb-3 pl-9'>
                <p className='text-muted-foreground text-sm'>{step.description}</p>
                {step.state !== 'done' && (step.action || step.optional) && (
                  <div className='mt-3 flex flex-wrap gap-2'>
                    {step.action && (
                      <Button
                        size='sm'
                        variant={step.state === 'current' ? 'default' : 'outline'}
                        onClick={() => onAction?.(step.id)}
                      >
                        {step.action}
                      </Button>
                    )}
                    {step.optional && step.state !== 'skipped' && (
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => skip(step)}
                        aria-label={`Skip ${step.title}`}
                      >
                        Skip
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

const Checklist1 = (props: Checklist1Props) => {
  const { status, steps = [], title } = props
  const state = getBlockState(status, steps.length === 0)

  return (
    <BlockStateProvider status={status} empty={steps.length === 0}>
      {state ? (
        <section className='@container flex flex-col gap-3'>
          <header className='flex flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            {state === 'loading' && (
              <span className='text-sm'>
                <SkeletonText className='w-2/3' />
              </span>
            )}
          </header>
          {state === 'loading' && <ProgressBar className='h-1.5' percentage={0} />}
          <BlockStateRows className='border-t' rows={6} />
        </section>
      ) : (
        <ChecklistSteps {...props} steps={steps} />
      )}
    </BlockStateProvider>
  )
}

export { Checklist1, exampleProps as checklist1ExampleProps, type Checklist1Props }
