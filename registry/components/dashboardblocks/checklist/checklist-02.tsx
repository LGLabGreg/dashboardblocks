'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  type StepState,
  StepStateLabel,
  getChecklistProgress,
  getNextStep,
} from '@/registry/components/dashboardblocks/checklist'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

interface SetupStage {
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
  /** Leave out, or pass none, to show the empty state. */
  stages?: SetupStage[]
  status?: BlockStatus
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
    stages = [],
    status,
    title,
  } = props
  const state = getBlockState(status, stages)
  const progress = getChecklistProgress(stages)
  const next = getNextStep(stages)
  const position = next ? stages.indexOf(next) + 1 : stages.length

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-wrap items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <p className='text-muted-foreground text-sm'>
              {description}{' '}
              <BlockReady className='text-sm'>
                {progress.remaining === 0
                  ? 'Every stage is done.'
                  : `Stage ${position} of ${stages.length}.`}
              </BlockReady>
            </p>
          </div>
          {(state || progress.remaining > 0) && (
            <Button size='sm' disabled={state !== undefined} onClick={onContinue}>
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
        </header>
        <BlockStateRows className='border-t' rows={stages.length || 5} />
        {!state && (
          <ol aria-label='Setup stages' className='flex flex-col gap-3 @xl:flex-row'>
            {stages.map((stage, index) => (
              <li
                key={stage.id}
                aria-current={stage.state === 'current' ? 'step' : undefined}
                data-state={stage.state}
                className='border-border data-[state=current]:border-foreground data-[state=done]:border-foreground flex min-w-0 flex-col gap-0.5 border-l-2 pl-3 data-[state=skipped]:border-dashed @xl:flex-1 @xl:border-t-2 @xl:border-l-0 @xl:pt-2 @xl:pl-0'
              >
                <span className='flex min-w-0 items-baseline gap-1.5 text-sm'>
                  {stage.state === 'done' ? (
                    <IconPlaceholder
                      lucide='CheckIcon'
                      tabler='IconCheck'
                      hugeicons='Tick02Icon'
                      phosphor='CheckIcon'
                      remixicon='RiCheckLine'
                      aria-hidden
                      className='text-muted-foreground size-3.5 shrink-0 self-center'
                    />
                  ) : (
                    <span aria-hidden className='text-muted-foreground tabular-nums'>
                      {index + 1}
                    </span>
                  )}
                  <span
                    className={cn(
                      'min-w-0 font-medium break-words',
                      (stage.state === 'todo' || stage.state === 'skipped') &&
                        'text-muted-foreground',
                    )}
                  >
                    {stage.title}
                  </span>
                </span>
                <StepStateLabel state={stage.state} />
                {stage.detail && (
                  <span className='text-muted-foreground text-sm break-words'>
                    {stage.detail}
                  </span>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Checklist2, exampleProps as checklist2ExampleProps, type Checklist2Props }
