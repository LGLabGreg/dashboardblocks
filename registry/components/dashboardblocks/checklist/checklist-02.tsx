'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  type StepState,
  StepRail,
  StepRailItem,
  getChecklistProgress,
  getNextStep,
} from '@/registry/components/dashboardblocks/checklist'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface SetupStage {
  id: string
  state: StepState
  title: string
}

interface Checklist2Props extends BlockStateProps {
  /** @default 'Continue setup' */
  continueLabel?: string
  description: string
  onContinue?: () => void
  /** Leave out, or pass none, to show the empty state. */
  stages?: SetupStage[]
  title: string
}

const exampleProps: Checklist2Props = {
  description: 'Sync your production database into the warehouse.',
  stages: [
    { id: 'source', state: 'done', title: 'Choose source' },
    { id: 'connect', state: 'done', title: 'Connect' },
    { id: 'tables', state: 'current', title: 'Select tables' },
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
    errorMessage,
    status,
    title,
  } = props
  const state = getBlockState(status, stages)
  const progress = getChecklistProgress(stages)
  const next = getNextStep(stages)
  const position = next ? stages.indexOf(next) + 1 : stages.length

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <Card>
        <CardContent>
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
              <StepRail aria-label='Setup stages'>
                {stages.map((stage, index) => (
                  <StepRailItem
                    key={stage.id}
                    index={index + 1}
                    state={stage.state}
                    title={stage.title}
                  />
                ))}
              </StepRail>
            )}
          </section>
        </CardContent>
      </Card>
    </BlockStateProvider>
  )
}

export { Checklist2, exampleProps as checklist2ExampleProps, type Checklist2Props }
