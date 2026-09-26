'use client'

import {
  type StepState,
  StepIndicator,
  getChecklistProgress,
  getNextStep,
  skipStep,
  stepStateConfig,
} from '@/registry/components/dashboardblocks/checklist'
import { Ring } from '@/registry/components/dashboardblocks/ring'
import { ChevronDownIcon } from 'lucide-react'
import { useId, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface OnboardingStep {
  /** The label of the button that starts the step. */
  action?: string
  description: string
  /** Roughly how long the step takes, such as "2 min". */
  duration?: string
  id: string
  /** Optional steps can be skipped. */
  optional?: boolean
  state: StepState
  title: string
}

interface Checklist1Props {
  onAction?: (id: string) => void
  onSkip?: (id: string) => void
  steps: OnboardingStep[]
  title: string
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

const Checklist1 = (props: Checklist1Props) => {
  const { onAction, onSkip, title } = props
  const id = useId()
  const [steps, setSteps] = useState(props.steps)
  const [expanded, setExpanded] = useState(() => {
    const next = getNextStep(props.steps)
    return new Set(next ? [next.id] : [])
  })
  const [announcement, setAnnouncement] = useState('')
  const progress = getChecklistProgress(steps)

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
    <Card className='@container gap-0 pb-0'>
      <CardHeader className='border-b'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {progress.done} of {progress.total} steps done
          {progress.skipped > 0 && `, ${progress.skipped} skipped`}
        </CardDescription>
        <CardAction>
          <Ring
            ariaLabel={`${Math.round(progress.percentage)}% complete`}
            className='size-12'
            percentage={progress.percentage}
            strokeWidth={10}
          >
            <span aria-hidden className='text-xs font-semibold tabular-nums'>
              {Math.round(progress.percentage)}%
            </span>
          </Ring>
        </CardAction>
      </CardHeader>
      <CardContent className='px-0'>
        <p role='status' className='sr-only'>
          {announcement}
        </p>
        <ol>
          {steps.map((step, index) => {
            const config = stepStateConfig[step.state]
            const isOpen = expanded.has(step.id)
            const panelId = `${id}-${step.id}`
            return (
              <li key={step.id} className='border-b last:border-b-0'>
                <button
                  type='button'
                  aria-controls={panelId}
                  aria-current={step.state === 'current' ? 'step' : undefined}
                  aria-expanded={isOpen}
                  onClick={() => toggle(step.id)}
                  className='hover:bg-muted/50 focus-visible:ring-ring/50 flex w-full items-center gap-3 px-6 py-3 text-left outline-none focus-visible:ring-3 focus-visible:ring-inset'
                >
                  <StepIndicator index={index + 1} state={step.state} />
                  <span className='flex min-w-0 flex-1 flex-col gap-0.5'>
                    <span
                      className={cn(
                        'text-sm font-medium',
                        step.state !== 'current' &&
                          step.state !== 'todo' &&
                          'text-muted-foreground',
                      )}
                    >
                      {step.title}
                    </span>
                    <span className='text-muted-foreground text-xs'>
                      <span className={config.text}>{config.label}</span>
                      {step.duration && ` · ${step.duration}`}
                      {step.optional && ' · Optional'}
                    </span>
                  </span>
                  <ChevronDownIcon
                    aria-hidden
                    className={cn(
                      'text-muted-foreground size-4 shrink-0 transition-transform motion-reduce:transition-none',
                      isOpen && 'rotate-180',
                    )}
                  />
                </button>
                <div id={panelId} hidden={!isOpen} className='pr-6 pb-4 pl-16'>
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
      </CardContent>
    </Card>
  )
}

export { Checklist1, exampleProps as checklist1ExampleProps, type Checklist1Props }
