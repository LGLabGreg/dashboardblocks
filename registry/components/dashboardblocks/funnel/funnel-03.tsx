'use client'

import {
  type FunnelStage,
  formatRate,
  getBiggestDropIndex,
  getFunnelSteps,
} from '@/registry/components/dashboardblocks/funnel'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface Funnel3Props {
  description: string
  stages: FunnelStage[]
  title: string
}

const exampleProps: Funnel3Props = {
  description: 'New workspaces completing each setup step',
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
  const { description, stages, title } = props
  const steps = getFunnelSteps(stages)
  const biggestDrop = getBiggestDropIndex(steps)
  const last = steps.at(-1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-6'>
        <div className='flex flex-col gap-0.5'>
          <span className='text-3xl font-semibold tracking-tight'>
            {last ? formatRate(last.fromStart) : '—'}
          </span>
          <span className='text-muted-foreground text-xs'>finish every step</span>
        </div>
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
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  <span className='sr-only'>Step </span>
                  {index + 1}
                </span>
                <div className='flex min-w-0 flex-1 flex-col gap-1'>
                  <div className='flex items-baseline justify-between gap-3'>
                    <span className='text-sm font-medium'>{step.label}</span>
                    <span className='text-sm font-medium tabular-nums'>
                      {step.value.toLocaleString()}
                    </span>
                  </div>
                  {index > 0 && (
                    <div className='text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs'>
                      <span className='tabular-nums'>
                        {formatRate(step.fromPrevious)} of previous step
                      </span>
                      <span aria-hidden>·</span>
                      <span className='tabular-nums'>
                        {step.dropped.toLocaleString()} dropped
                      </span>
                      {isBiggestDrop && (
                        <Badge variant='outline' className='text-foreground'>
                          <IconPlaceholder
                            lucide='TrendingDownIcon'
                            tabler='IconTrendingDown'
                            hugeicons='ChartDownIcon'
                            phosphor='TrendDownIcon'
                            remixicon='RiArrowDownLine'
                            data-icon='inline-start'
                          />
                          Biggest drop-off
                        </Badge>
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

export { Funnel3, exampleProps as funnel3ExampleProps, type Funnel3Props }
