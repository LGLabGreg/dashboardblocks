'use client'

import {
  FunnelBar,
  type FunnelStage,
  formatRate,
  getFunnelSteps,
} from '@/registry/components/dashboardblocks/funnel'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Funnel2Props {
  description: string
  stages: FunnelStage[]
  title: string
}

const exampleProps: Funnel2Props = {
  description: 'Sessions that reached each checkout step, last 7 days',
  stages: [
    { label: 'Cart', value: 12_480 },
    { label: 'Shipping', value: 7_730 },
    { label: 'Payment', value: 5_910 },
    { label: 'Review', value: 5_120 },
    { label: 'Purchase', value: 4_380 },
  ],
  title: 'Checkout funnel',
}

const Funnel2 = (props: Funnel2Props) => {
  const { description, stages, title } = props
  const steps = getFunnelSteps(stages)
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
          <span className='text-muted-foreground text-xs'>
            of carts completed a purchase
          </span>
        </div>
        <ol className='flex items-stretch gap-2'>
          {steps.map((step, index) => (
            <li key={step.label} className='flex min-w-0 flex-1 flex-col gap-2'>
              <div className='flex min-h-9 flex-col'>
                <span className='text-sm font-medium tabular-nums'>
                  {formatRate(step.fromStart, 0)}
                </span>
                {index > 0 && (
                  <span className='text-muted-foreground text-xs tabular-nums'>
                    <span className='sr-only'>Dropped </span>−
                    {formatRate(1 - step.fromPrevious, 0)}
                  </span>
                )}
              </div>
              <div className='h-40'>
                <FunnelBar
                  delay={index * 80}
                  orientation='vertical'
                  value={step.fromStart * 100}
                />
              </div>
              <div className='flex min-w-0 flex-col'>
                <span className='truncate text-sm' title={step.label}>
                  {step.label}
                </span>
                <span className='text-muted-foreground text-xs tabular-nums'>
                  {step.value.toLocaleString()}
                  <span className='sr-only'> sessions</span>
                </span>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}

export { Funnel2, exampleProps as funnel2ExampleProps, type Funnel2Props }
