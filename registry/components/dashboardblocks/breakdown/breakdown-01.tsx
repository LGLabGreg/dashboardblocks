'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  BREAKDOWN_OTHER_COLOR,
  BreakdownBar,
  type BreakdownSegment,
  BreakdownTable,
  formatShare,
  getTotal,
} from '@/registry/components/dashboardblocks/breakdown'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { formatCurrency, formatNumber } from '@/registry/lib/dashboardblocks/format'

interface Breakdown1Props {
  description: string
  formatter?: (value: number) => string
  /** Leave out, or pass none, to show the empty state. */
  segments?: BreakdownSegment[]
  status?: BlockStatus
  title: string
}

const exampleProps: Breakdown1Props = {
  description: 'Monthly recurring revenue, split by plan.',
  formatter: (value) => formatCurrency(value),
  segments: [
    { color: 'var(--color-chart-2)', label: 'Enterprise', value: 28_400 },
    { color: 'var(--color-chart-3)', label: 'Pro', value: 19_750 },
    { color: 'var(--color-chart-4)', label: 'Starter', value: 8_320 },
    { color: BREAKDOWN_OTHER_COLOR, label: 'Add-ons', value: 2_930 },
  ],
  title: 'Revenue by plan',
}

const Breakdown1 = (props: Breakdown1Props) => {
  const {
    description,
    formatter = (value) => formatNumber(value),
    segments = [],
    status,
    title,
  } = props
  const state = getBlockState(status, segments)
  const total = getTotal(segments)
  const largest = segments.reduce<BreakdownSegment | undefined>(
    (best, segment) => (best && best.value >= segment.value ? best : segment),
    undefined,
  )

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <div className='flex flex-col gap-1 border-t pt-4'>
          <KPIValue value={total} format={formatter} />
          <BlockReady className='text-sm'>
            {largest && total > 0 && (
              <p className='text-muted-foreground text-sm'>
                <span className='text-foreground font-medium'>{largest.label}</span> is{' '}
                {formatShare(largest.value, total)} of the total.
              </p>
            )}
          </BlockReady>
        </div>
        <BreakdownBar segments={segments} />
        {state === 'loading' && <BlockStateRows rows={4} />}
        {!state && (
          <BreakdownTable
            caption={`${title}: ${description}`}
            format={formatter}
            segments={segments}
          />
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Breakdown1, exampleProps as breakdown1ExampleProps, type Breakdown1Props }
