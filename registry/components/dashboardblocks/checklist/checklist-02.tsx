'use client'

import {
  type StepState,
  StepIndicator,
  getChecklistProgress,
  getNextStep,
  stepStateConfig,
} from '@/registry/components/dashboardblocks/checklist'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface SetupStage {
  /** A short summary, such as the choice made in a finished stage. */
  detail?: string
  id: string
  state: StepState
  title: string
}

interface Checklist2Props {
  /** @default 'Continue setup' */
  continueLabel?: string
  description: string
  onContinue?: () => void
  stages: SetupStage[]
  title: string
}

const exampleProps: Checklist2Props = {
  description: 'Sync your production database into the warehouse.',
  stages: [
    { detail: 'PostgreSQL 16', id: 'source', state: 'done', title: 'Choose source' },
    { detail: 'db.acme.internal', id: 'connect', state: 'done', title: 'Connect' },
    {
      detail: '12 of 48 tables',
      id: 'tables',
      state: 'current',
      title: 'Select tables',
    },
    { id: 'schedule', state: 'todo', title: 'Schedule sync' },
    { id: 'review', state: 'todo', title: 'Review and launch' },
  ],
  title: 'New connection',
}

const Checklist2 = (props: Checklist2Props) => {
  const {
    continueLabel = 'Continue setup',
    description,
    onContinue,
    stages,
    title,
  } = props
  const progress = getChecklistProgress(stages)
  const next = getNextStep(stages)
  const position = next ? stages.indexOf(next) + 1 : stages.length

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ol aria-label='Setup stages' className='flex flex-col @2xl:flex-row'>
          {stages.map((stage, index) => {
            const config = stepStateConfig[stage.state]
            const isLast = index === stages.length - 1
            return (
              <li
                key={stage.id}
                aria-current={stage.state === 'current' ? 'step' : undefined}
                className='relative flex gap-3 pb-6 last:pb-0 @2xl:flex-1 @2xl:flex-col @2xl:gap-2 @2xl:pr-3 @2xl:pb-0'
              >
                {!isLast && (
                  <span
                    aria-hidden
                    className={cn(
                      'absolute top-8 bottom-1 left-3.5 w-px -translate-x-1/2 @2xl:top-3.5 @2xl:right-2 @2xl:bottom-auto @2xl:left-9 @2xl:h-px @2xl:w-auto @2xl:translate-x-0',
                      stage.state === 'done' ? 'bg-emerald-600' : 'bg-border',
                    )}
                  />
                )}
                <StepIndicator index={index + 1} state={stage.state} />
                <div className='flex min-w-0 flex-col gap-0.5 pt-1 @2xl:pt-0'>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      stage.state === 'todo' && 'text-muted-foreground',
                    )}
                  >
                    {stage.title}
                  </span>
                  <span className={cn('text-xs', config.text)}>{config.label}</span>
                  {stage.detail && (
                    <span className='text-muted-foreground text-xs break-words'>
                      {stage.detail}
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </CardContent>
      <CardFooter className='flex-wrap justify-between gap-3 border-t'>
        <span className='text-muted-foreground text-sm'>
          {progress.remaining === 0
            ? 'All stages done'
            : `Stage ${position} of ${stages.length}`}
        </span>
        {progress.remaining > 0 && (
          <Button size='sm' onClick={onContinue}>
            {continueLabel}
            <IconPlaceholder
              lucide='ArrowRightIcon'
              tabler='IconArrowRight'
              hugeicons='ArrowRight01Icon'
              phosphor='ArrowRightIcon'
              remixicon='RiArrowRightLine'
              data-icon='inline-end'
            />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

export { Checklist2, exampleProps as checklist2ExampleProps, type Checklist2Props }
