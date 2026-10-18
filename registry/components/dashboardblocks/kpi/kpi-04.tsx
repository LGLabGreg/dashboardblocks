'use client'

import {
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  KPI,
  KPIChange,
  type KPIFormat,
  KPITitle,
  KPIValue,
} from '@/registry/components/dashboardblocks/kpi'
import {
  KPIProvenance,
  type Provenance,
} from '@/registry/components/dashboardblocks/kpi-provenance'
import { joinDetails } from '@/registry/lib/dashboardblocks/format'

interface KPI4Props {
  comparison: string
  format?: KPIFormat
  previous?: number
  provenance: Provenance
  status?: BlockStatus
  title: string
  /** Leave out to show the empty state. */
  value?: number
}

const exampleProps: KPI4Props = {
  comparison: 'in August',
  format: 'currency',
  previous: 45_100,
  provenance: {
    query: 'billing.monthly_recurring_revenue',
    description:
      'Recurring revenue from active subscriptions, normalised to a month, before refunds',
    window: { from: new Date(2026, 8, 1), to: new Date(2026, 8, 30) },
    filters: { Plan: 'Pro', Region: 'Europe' },
    href: '/dashboard/billing/subscriptions?plan=pro&region=europe',
  },
  title: 'Monthly recurring revenue',
  value: 48_200,
}

const KPI4 = (props: KPI4Props) => {
  const { comparison, format, previous, provenance, status, title, value } = props
  const filters = Object.values(provenance.filters)

  return (
    <BlockStateProvider state={getBlockState(status, value)}>
      <KPI className='gap-1'>
        <KPITitle>{title}</KPITitle>
        <div className='flex min-w-0 items-center gap-1'>
          <KPIValue className='truncate' value={value} format={format} animated />
          <KPIProvenance
            label={`How is ${title.toLowerCase()} computed?`}
            provenance={provenance}
          />
        </div>
        <KPIChange
          comparison={comparison}
          format={format}
          previous={previous}
          value={value}
        />
        {filters.length > 0 && (
          <p className='text-muted-foreground text-sm'>{joinDetails(...filters)}</p>
        )}
      </KPI>
    </BlockStateProvider>
  )
}

export { KPI4, exampleProps as kpi4ExampleProps, type KPI4Props }
