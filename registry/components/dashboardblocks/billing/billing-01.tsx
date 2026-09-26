'use client'

import {
  type MrrMovementInput,
  MrrStepSwatch,
  MrrWaterfall,
  formatCurrency,
  getMrrMovement,
  getNetRevenueRetention,
} from '@/registry/components/dashboardblocks/billing'
import { ChartPanelTable } from '@/registry/components/dashboardblocks/chart-panel'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface Billing1Props {
  /** @default 'USD' */
  currency?: string
  description: string
  movement: MrrMovementInput
  title: string
}

const exampleProps: Billing1Props = {
  description: 'September 2026',
  movement: {
    churn: 5_260,
    contraction: 2_940,
    expansion: 12_480,
    newBusiness: 14_850,
    starting: 182_400,
  },
  title: 'MRR movement',
}

const Billing1 = (props: Billing1Props) => {
  const { currency = 'USD', description, movement, title } = props
  const { ending, net, steps } = getMrrMovement(movement)
  const retention = getNetRevenueRetention(movement)
  const format = (value: number) => formatCurrency(value, { currency })
  const formatSigned = (value: number) =>
    formatCurrency(value, { currency, signed: true })

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-6'>
        <dl className='flex flex-wrap gap-x-8 gap-y-3'>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Ending MRR</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {format(ending)}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Net new MRR</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {formatSigned(net)}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Net revenue retention</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {(retention * 100).toFixed(1)}%
            </dd>
          </div>
        </dl>
        <div className='flex flex-col gap-4'>
          <MrrWaterfall
            className='h-44 @xl:h-52'
            formatter={(value) => formatCurrency(value, { compact: true, currency })}
            steps={steps}
          />
          {/* The chart's legend, with values. The table below reads the same values, with running totals, to screen readers. */}
          <ul
            aria-hidden
            className='grid grid-cols-2 gap-x-2 gap-y-3 @sm:grid-cols-3 @xl:grid-cols-6'
          >
            {steps.map((step) => (
              <li
                key={step.key}
                className='flex min-w-0 flex-col gap-0.5 @xl:items-center @xl:text-center'
              >
                <span className='text-muted-foreground flex items-center gap-1.5 text-xs'>
                  <MrrStepSwatch kind={step.kind} />
                  <span className='truncate'>{step.label}</span>
                </span>
                <span
                  className={cn(
                    'text-sm tabular-nums',
                    step.kind === 'total' && 'font-medium',
                  )}
                >
                  {step.kind === 'total' ? format(step.value) : formatSigned(step.value)}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <ChartPanelTable
          caption={`${title}, ${description}: starting MRR plus new and expansion, minus contraction and churn, gives ending MRR.`}
          columns={[
            { key: 'label', label: 'Step' },
            { key: 'change', label: 'Change' },
            { key: 'total', label: 'MRR' },
          ]}
          rows={steps.map((step) => ({
            change: step.kind === 'total' ? '—' : formatSigned(step.value),
            label: step.label,
            total: format(step.to),
          }))}
        />
      </CardContent>
    </Card>
  )
}

export { Billing1, exampleProps as billing1ExampleProps, type Billing1Props }
