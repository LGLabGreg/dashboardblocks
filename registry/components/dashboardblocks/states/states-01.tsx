'use client'

import { Skeleton, useBlockData } from '@/registry/components/dashboardblocks/block-state'
import {
  Stat,
  StatChange,
  StatGroup,
  StatLabel,
  type StatMetric,
  StatValue,
  formatStatValue,
} from '@/registry/components/dashboardblocks/stat-group'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface States1Props {
  description: string
  /** Fetches the metrics. The skeleton shows until it resolves. */
  load: () => Promise<StatMetric[]>
  /** How many placeholders to show while loading. */
  placeholders?: number
  title: string
}

const exampleProps: States1Props = {
  description: 'Last 30 days, compared with the previous 30 days',
  load: () =>
    new Promise((resolve) =>
      setTimeout(
        () =>
          resolve([
            {
              formatter: (value) => `$${value.toLocaleString('en-US')}`,
              key: 'revenue',
              label: 'Revenue',
              previous: 42_890,
              value: 48_210,
            },
            { key: 'orders', label: 'Orders', previous: 1_210, value: 1_284 },
            {
              changeType: 'points',
              formatter: (value) => `${value}%`,
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

const States1 = (props: States1Props) => {
  const { description, load, placeholders = 3, title } = props
  const { data, reload, status } = useBlockData(load)
  const loading = status === 'loading' || status === 'idle'

  return (
    <Card className='@container gap-0 pb-0'>
      <CardHeader className='border-b'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
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
        </CardAction>
      </CardHeader>
      <div aria-busy={loading}>
        <span role='status' className='sr-only'>
          {loading ? `Loading ${title.toLowerCase()}…` : ''}
        </span>
        {loading || !data ? (
          <div className='bg-border grid gap-px @xl:grid-cols-3'>
            {Array.from({ length: placeholders }, (_, index) => (
              <div key={index} className='bg-card flex flex-col gap-1 p-6'>
                <Skeleton className='my-0.5 h-4 w-20' />
                <Skeleton className='my-0.5 h-8 w-32' />
                <Skeleton className='my-0.5 h-3 w-24' />
              </div>
            ))}
          </div>
        ) : (
          <StatGroup className='@xl:grid-cols-3'>
            {data.map((metric) => (
              <Stat key={metric.key}>
                <StatLabel>{metric.label}</StatLabel>
                <StatValue>{formatStatValue(metric)}</StatValue>
                <StatChange metric={metric} />
              </Stat>
            ))}
          </StatGroup>
        )}
      </div>
    </Card>
  )
}

export { States1, exampleProps as states1ExampleProps, type States1Props }
