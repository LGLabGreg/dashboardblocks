'use client'

import {
  BlockStateProvider,
  type BlockStatus,
  type LoadStatus,
  useBlockData,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  Stat,
  StatChange,
  StatGroup,
  StatLabel,
  type StatMetric,
  StatValue,
  formatStatValue,
  getStatPlaceholders,
} from '@/registry/components/dashboardblocks/stat-group'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatCurrency, formatPercent } from '@/registry/lib/dashboardblocks/format'

import { Button } from '@/components/ui/button'

interface States1Props {
  /** Follows the change, such as `the previous 30 days`. */
  comparison: string
  description: string
  load: () => Promise<StatMetric[]>
  placeholders?: number
  title: string
}

const exampleProps: States1Props = {
  comparison: 'the previous 30 days',
  description: 'The last 30 days, compared with the 30 days before.',
  load: () =>
    new Promise((resolve) =>
      setTimeout(
        () =>
          resolve([
            {
              formatter: (value) => formatCurrency(value),
              key: 'revenue',
              label: 'Revenue',
              previous: 42_890,
              value: 48_210,
            },
            { key: 'orders', label: 'Orders', previous: 1_210, value: 1_284 },
            {
              changeType: 'points',
              formatter: (value) => formatPercent(value / 100),
              goodDirection: 'down',
              key: 'refunds',
              label: 'Refund rate',
              previous: 2.1,
              value: 1.8,
            },
          ]),
        1_500,
      ),
    ),
  placeholders: 3,
  title: 'Overview',
}

function toBlockStatus(status: LoadStatus): BlockStatus | undefined {
  if (status === 'idle' || status === 'loading') return 'loading'
  if (status === 'error') return 'error'
  return undefined
}

const States1 = (props: States1Props) => {
  const { comparison, description, load, placeholders = 3, title } = props
  const { data = [], reload, status: loadStatus } = useBlockData(load)
  const status = toBlockStatus(loadStatus)
  const loading = status === 'loading'
  const shown = loading ? getStatPlaceholders(placeholders) : data

  return (
    <BlockStateProvider state={getBlockState(status, data)}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </div>
          <Button
            variant='outline'
            size='sm'
            disabled={loading}
            onClick={() => void reload({ clear: true })}
          >
            <IconPlaceholder
              lucide='RotateCwIcon'
              tabler='IconRotateClockwise2'
              hugeicons='Rotate01Icon'
              phosphor='ArrowClockwiseIcon'
              remixicon='RiRefreshLine'
            />
            Reload
          </Button>
        </header>
        <StatGroup className='@xl:grid-cols-3'>
          {shown.map((metric) => (
            <Stat key={metric.key}>
              <StatLabel>{metric.label}</StatLabel>
              <StatValue>{formatStatValue(metric)}</StatValue>
              <StatChange comparison={comparison} metric={metric} variant='short' />
            </Stat>
          ))}
        </StatGroup>
      </section>
    </BlockStateProvider>
  )
}

export { States1, exampleProps as states1ExampleProps, type States1Props }
