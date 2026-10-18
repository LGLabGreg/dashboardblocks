'use client'

import {
  type MrrMovementInput,
  MrrWaterfall,
  getMrrMovement,
  getNetRevenueRetention,
} from '@/registry/components/dashboardblocks/billing'
import {
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { ChartPlaceholder } from '@/registry/components/dashboardblocks/chart'
import { ChartPanelTable } from '@/registry/components/dashboardblocks/chart-panel'
import { KPIChange, KPIValue } from '@/registry/components/dashboardblocks/kpi'
import {
  formatCurrency,
  formatPercent,
  formatSigned,
} from '@/registry/lib/dashboardblocks/format'

interface Billing1Props {
  /** @default 'USD' */
  currency?: string
  description: string
  /** Leave out to show the empty state. */
  movement?: MrrMovementInput
  status?: BlockStatus
  title: string
}

const exampleProps: Billing1Props = {
  description:
    'September 2026. New business and expansion added $27,330, and contraction and churn took $8,200 back.',
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
  const {
    currency = 'USD',
    description,
    movement = { churn: 0, contraction: 0, expansion: 0, newBusiness: 0, starting: 0 },
    status,
    title,
  } = props
  const state = getBlockState(status, props.movement === undefined)
  const { ending, net, steps } = getMrrMovement(movement)
  const retention = getNetRevenueRetention(movement)
  const format = (value: number) => formatCurrency(value, { currency })

  return (
    <BlockStateProvider status={status} empty={props.movement === undefined}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <dl className='grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-4 @lg:grid-cols-3 @lg:items-start'>
          <div className='col-span-2 flex flex-col gap-1 @lg:col-span-1'>
            <dt className='text-muted-foreground text-sm'>Ending MRR</dt>
            <dd>
              <KPIValue className='whitespace-nowrap' value={ending} format={format} />
            </dd>
            <dd>
              <KPIChange
                inline
                comparison='at the start of the month'
                format={format}
                previous={movement.starting}
                value={ending}
              />
            </dd>
          </div>
          {state !== 'empty' && state !== 'error' && (
            <>
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>Net new MRR</dt>
                <dd>
                  <KPIValue
                    className='text-2xl'
                    value={net}
                    format={(value) => formatSigned(value, format)}
                  />
                </dd>
              </div>
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>Net revenue retention</dt>
                <dd>
                  <KPIValue
                    className='text-2xl'
                    value={retention}
                    format={(value) => formatPercent(value)}
                  />
                </dd>
              </div>
            </>
          )}
        </dl>
        {state ? (
          <ChartPlaceholder height={256} />
        ) : (
          <MrrWaterfall
            className='h-64'
            formatter={(value) => formatCurrency(value, { compact: true, currency })}
            label={`${title}: ${description}`}
            steps={steps}
            tooltipFormatter={format}
          />
        )}
        {!state && (
          <ChartPanelTable
            caption={`${title}: ${description}`}
            columns={[
              { key: 'label', label: 'Step' },
              { key: 'change', label: 'Change' },
              { key: 'total', label: 'MRR' },
            ]}
            rows={steps.map((step) => ({
              change: step.kind === 'total' ? '—' : formatSigned(step.value, format),
              label: step.label,
              total: format(step.to),
            }))}
          />
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Billing1, exampleProps as billing1ExampleProps, type Billing1Props }
