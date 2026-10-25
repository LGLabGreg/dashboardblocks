'use client'

import {
  BlockStateProvider,
  type BlockStateProps,
  SkeletonText,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  type StepState,
  describeChecklistProgress,
  getChecklistProgress,
  getNextStep,
} from '@/registry/components/dashboardblocks/checklist'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { ProgressBar } from '@/registry/components/dashboardblocks/progress-bar'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatPercent } from '@/registry/lib/dashboardblocks/format'

import { Button } from '@/components/ui/button'

interface Checklist3Props extends BlockStateProps {
  /** @default 'Continue' */
  continueLabel?: string
  onContinue?: () => void
  /** Leave out, or pass none, to show the empty state. */
  steps?: { duration?: string; id: string; state: StepState; title: string }[]
  title: string
}

const exampleProps: Checklist3Props = {
  steps: [
    { id: 'profile', state: 'done', title: 'Complete your profile' },
    { id: 'domain', state: 'done', title: 'Verify your domain' },
    { id: 'sso', state: 'done', title: 'Turn on single sign-on' },
    { duration: '2 min', id: 'team', state: 'current', title: 'Invite your team' },
    { duration: '5 min', id: 'billing', state: 'todo', title: 'Add a payment method' },
  ],
  title: 'Account setup',
}

const Checklist3 = (props: Checklist3Props) => {
  const {
    continueLabel = 'Continue',
    onContinue,
    errorMessage,
    status,
    steps = [],
    title,
  } = props
  const state = getBlockState(status, steps)
  const progress = getChecklistProgress(steps)
  const next = getNextStep(steps)
  const continueButton = (
    <Button
      size='sm'
      variant='outline'
      className='self-start @xs:self-center'
      disabled={state !== undefined}
      onClick={onContinue}
    >
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
  )

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-3'>
        <h2 className='font-semibold tracking-tight'>{title}</h2>
        <div className='flex flex-col gap-2'>
          <div className='flex flex-wrap items-baseline gap-x-2'>
            <KPIValue
              value={progress.percentage}
              format={(value) => formatPercent(value / 100, { maximumFractionDigits: 0 })}
            />
            {!state && (
              <span className='text-muted-foreground text-sm tabular-nums'>
                {describeChecklistProgress(progress)}
              </span>
            )}
          </div>
          {state === 'loading' && <ProgressBar className='h-1.5' percentage={0} />}
          {!state && (
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
          )}
        </div>
        {state === 'loading' && (
          <div className='flex flex-col gap-3 border-t pt-3 @xs:flex-row @xs:items-center @xs:justify-between'>
            <p className='flex min-w-0 flex-1 flex-col gap-0.5'>
              <span className='text-muted-foreground text-sm'>Up next</span>
              <span className='text-sm'>
                <SkeletonText className='w-2/3' />
              </span>
            </p>
            {continueButton}
          </div>
        )}
        {!state &&
          (next ? (
            <div className='flex flex-col gap-3 border-t pt-3 @xs:flex-row @xs:items-center @xs:justify-between'>
              <p className='flex min-w-0 flex-col gap-0.5'>
                <span className='text-muted-foreground text-sm'>Up next</span>
                <span className='text-sm font-medium'>{next.title}</span>
                {next.duration && (
                  <span className='text-muted-foreground text-sm tabular-nums'>
                    {next.duration}
                  </span>
                )}
              </p>
              {continueButton}
            </div>
          ) : (
            <p className='border-t pt-3 text-sm font-medium text-emerald-700 dark:text-emerald-400'>
              Every step is done.
            </p>
          ))}
      </section>
    </BlockStateProvider>
  )
}

export { Checklist3, exampleProps as checklist3ExampleProps, type Checklist3Props }
