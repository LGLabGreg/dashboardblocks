'use client'

import {
  type StepState,
  getChecklistProgress,
  getNextStep,
  stepStateConfig,
} from '@/registry/components/dashboardblocks/checklist'
import { ProgressBar } from '@/registry/components/dashboardblocks/progress-bar'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface Checklist3Props {
  /** @default 'Continue' */
  continueLabel?: string
  onContinue?: () => void
  steps: { duration?: string; id: string; state: StepState; title: string }[]
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
  const { continueLabel = 'Continue', onContinue, steps, title } = props
  const progress = getChecklistProgress(steps)
  const next = getNextStep(steps)

  return (
    <Card className='@container py-4'>
      <CardContent className='flex flex-col gap-4 px-4'>
        <div className='flex flex-col gap-2'>
          <div className='flex items-baseline justify-between gap-3'>
            <span className='text-sm font-medium'>{title}</span>
            <span className='text-muted-foreground text-sm tabular-nums'>
              {Math.round(progress.percentage)}%
            </span>
          </div>
          <div
            role='progressbar'
            aria-label={title}
            aria-valuemax={progress.total}
            aria-valuemin={0}
            aria-valuenow={progress.done}
            aria-valuetext={`${progress.done} of ${progress.total} done`}
          >
            <ProgressBar
              fillClassName='motion-reduce:transition-none'
              percentage={progress.percentage}
            />
          </div>
          <p className='text-muted-foreground text-xs tabular-nums'>
            <span className='text-foreground font-medium'>
              {progress.done} of {progress.total}
            </span>{' '}
            done
            {progress.skipped > 0 && `, ${progress.skipped} skipped`}
          </p>
        </div>
        {next ? (
          <div className='flex flex-col gap-3 border-t pt-4 @xs:flex-row @xs:items-center @xs:justify-between'>
            <div className='flex min-w-0 flex-col gap-0.5'>
              <span className='text-muted-foreground text-xs'>Up next</span>
              <span className='text-sm font-medium'>
                {next.title}
                {next.duration && (
                  <span className='text-muted-foreground font-normal'>
                    {' '}
                    · {next.duration}
                  </span>
                )}
              </span>
            </div>
            <Button
              size='sm'
              variant='outline'
              className='self-start @xs:self-center'
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
          </div>
        ) : (
          <p className='flex items-center gap-1.5 border-t pt-4 text-sm font-medium'>
            <span className={cn('flex [&_svg]:size-4', stepStateConfig.done.text)}>
              {stepStateConfig.done.icon}
            </span>
            All steps done
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export { Checklist3, exampleProps as checklist3ExampleProps, type Checklist3Props }
