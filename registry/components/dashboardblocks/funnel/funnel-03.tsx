'use client'

import {
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { Details } from '@/registry/components/dashboardblocks/details'
import {
  type FunnelStage,
  formatRate,
  getBiggestDropIndex,
  getFunnelSteps,
} from '@/registry/components/dashboardblocks/funnel'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { StatusLabel } from '@/registry/components/dashboardblocks/status-label'
import { formatNumber } from '@/registry/lib/dashboardblocks/format'

import { cn } from '@/lib/utils'

interface Funnel3Props {
  description: string
  /** Leave out, or pass none, to show the empty state. */
  stages?: FunnelStage[]
  status?: BlockStatus
  title: string
}

const exampleProps: Funnel3Props = {
  description: 'New workspaces completing each setup step.',
  stages: [
    { label: 'Created workspace', value: 3_640 },
    { label: 'Invited a teammate', value: 2_510 },
    { label: 'Connected a data source', value: 1_120 },
    { label: 'Built first dashboard', value: 890 },
    { label: 'Shared a dashboard', value: 662 },
  ],
  title: 'Onboarding funnel',
}

const Funnel3 = (props: Funnel3Props) => {
  const { description, stages = [], status, title } = props
  const state = getBlockState(status, stages)
  const steps = getFunnelSteps(stages)
  const biggestDrop = getBiggestDropIndex(steps)
  const last = steps.at(-1)

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <dl className='flex flex-col gap-1 border-t pt-4'>
          <dt className='text-muted-foreground text-sm'>Finish every step</dt>
          <dd>
            <KPIValue value={last?.fromStart} format={(value) => formatRate(value)} />
          </dd>
        </dl>
        {state === 'loading' && <BlockStateRows rows={5} />}
        {!state && (
          <ol className='flex flex-col'>
            {steps.map((step, index) => {
              const isLast = index === steps.length - 1
              const isBiggestDrop = index === biggestDrop
              return (
                <li key={step.label} className='relative flex gap-3 pb-5 last:pb-0'>
                  {!isLast && (
                    <span
                      aria-hidden
                      className='bg-border absolute top-7 bottom-1 left-3 w-px -translate-x-1/2'
                    />
                  )}
                  <span
                    className={cn(
                      'relative flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium tabular-nums',
                      isBiggestDrop
                        ? 'bg-foreground text-background'
                        : 'bg-muted text-foreground',
                    )}
                  >
                    <span className='sr-only'>Step </span>
                    {index + 1}
                  </span>
                  <div className='flex min-w-0 flex-1 flex-col gap-1'>
                    <div className='flex items-baseline justify-between gap-3'>
                      <span className='text-sm font-medium'>{step.label}</span>
                      <span className='text-sm font-medium tabular-nums'>
                        {formatNumber(step.value)}
                      </span>
                    </div>
                    {index > 0 && (
                      <Details className='text-muted-foreground text-xs tabular-nums'>
                        {`${formatRate(step.fromPrevious)} of previous step`}
                        {`${formatNumber(step.dropped)} dropped`}
                        {isBiggestDrop && (
                          <StatusLabel variant='text' tone='bad' className='text-xs'>
                            Biggest drop-off
                          </StatusLabel>
                        )}
                      </Details>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Funnel3, exampleProps as funnel3ExampleProps, type Funnel3Props }
