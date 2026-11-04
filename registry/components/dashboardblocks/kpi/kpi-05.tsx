'use client'

import {
  BlockStateProvider,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { KPI1, type KPI1Props } from '@/registry/components/dashboardblocks/kpi/kpi-01'

interface KPI5Props extends BlockStateProps {
  /** One card each, in order. A metric without a `value` shows its card's empty state. */
  metrics: (Omit<KPI1Props, keyof BlockStateProps> & { key: string })[]
}

const exampleProps: KPI5Props = {
  metrics: [
    {
      comparison: 'last month',
      format: 'currency',
      key: 'revenue',
      previous: 37_660,
      title: 'Total revenue',
      value: 45_231,
    },
    {
      comparison: 'last month',
      key: 'customers',
      previous: 1_402,
      title: 'New customers',
      value: 1_284,
    },
    {
      comparison: 'last month',
      key: 'accounts',
      previous: 4_183,
      title: 'Active accounts',
      value: 4_512,
    },
    {
      comparison: 'last month',
      format: 'currency',
      key: 'order',
      previous: 118,
      title: 'Average order',
      value: 126,
    },
  ],
}

const KPI5 = ({ errorMessage, metrics, status }: KPI5Props) => (
  <BlockStateProvider errorMessage={errorMessage} state={getBlockState(status, metrics)}>
    <section className='@container'>
      <div className='grid gap-4 @xl:grid-cols-2 @5xl:grid-cols-4'>
        {metrics.map(({ key, ...metric }) => (
          <KPI1 key={key} {...metric} errorMessage={errorMessage} status={status} />
        ))}
      </div>
    </section>
  </BlockStateProvider>
)

export { KPI5, exampleProps as kpi5ExampleProps, type KPI5Props }
