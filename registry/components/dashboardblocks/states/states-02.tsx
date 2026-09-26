'use client'

import {
  BlockBusy,
  BlockBusyIndicator,
  Skeleton,
  useBlockData,
} from '@/registry/components/dashboardblocks/block-state'
import {
  ChartPanelFigure,
  ChartPanelTable,
  ChartPanelTooltip,
  chartAxisProps,
  chartGridProps,
  formatCompact,
} from '@/registry/components/dashboardblocks/chart-panel'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface DailyPoint {
  label: string
  value: number
}

interface States2Props {
  description: string
  /** Fetches the series. While it refreshes, the previous chart stays in place, dimmed. */
  load: () => Promise<DailyPoint[]>
  title: string
}

let exampleRequests = 0

const exampleProps: States2Props = {
  description: 'Sep 1 – 30',
  load: () => {
    const shift = exampleRequests++ * 0.9
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve(
            Array.from({ length: 30 }, (_, day) => ({
              label: `Sep ${day + 1}`,
              value: Math.round(
                1_450 +
                  day * 14 +
                  Math.sin(day / 2.4 + shift) * 190 -
                  (day % 7 > 4 ? 260 : 0),
              ),
            })),
          ),
        1_200,
      ),
    )
  },
  title: 'Revenue',
}

const SERIES_COLOR = 'var(--chart-1)'
const currency = (value: number) => `$${value.toLocaleString('en-US')}`

const States2 = (props: States2Props) => {
  const { description, load, title } = props
  const { data, reload, status } = useBlockData(load)
  const refreshing = status === 'refreshing'
  const total = data?.reduce((sum, point) => sum + point.value, 0) ?? 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction className='flex items-center gap-3'>
          {refreshing && <BlockBusyIndicator />}
          <Button
            variant='outline'
            size='sm'
            disabled={status === 'loading' || refreshing}
            onClick={() => void reload()}
          >
            <IconPlaceholder
              lucide='RefreshCwIcon'
              tabler='IconRefresh'
              hugeicons='RefreshIcon'
              phosphor='ArrowClockwiseIcon'
              remixicon='RiRefreshLine'
            />
            Refresh
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {!data ? (
          <div aria-busy className='flex flex-col gap-5'>
            <span role='status' className='sr-only'>
              Loading {title.toLowerCase()}…
            </span>
            <Skeleton className='my-0.5 h-8 w-36' />
            <Skeleton className='h-56 w-full' />
          </div>
        ) : (
          <BlockBusy
            busy={refreshing}
            label={`Updating ${title.toLowerCase()}`}
            className='flex flex-col gap-5'
          >
            <span className='text-3xl font-semibold tracking-tight'>
              {currency(total)}
            </span>
            <ChartPanelFigure className='h-56'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid {...chartGridProps} />
                  <XAxis
                    {...chartAxisProps}
                    dataKey='label'
                    interval='preserveStartEnd'
                    minTickGap={40}
                  />
                  <YAxis
                    {...chartAxisProps}
                    tickFormatter={(value: number) => formatCompact(value)}
                    width={40}
                  />
                  <Tooltip
                    content={(tooltipProps) => (
                      <ChartPanelTooltip {...tooltipProps} valueFormatter={currency} />
                    )}
                    cursor={{ stroke: 'var(--color-border)' }}
                  />
                  <Area
                    activeDot={{ r: 4, stroke: 'var(--color-card)', strokeWidth: 2 }}
                    dataKey='value'
                    fill={SERIES_COLOR}
                    fillOpacity={0.1}
                    name={title}
                    stroke={SERIES_COLOR}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    type='monotone'
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartPanelFigure>
            <ChartPanelTable
              caption={`${title} by day, ${description}`}
              columns={[
                { key: 'label', label: 'Day' },
                { format: currency, key: 'value', label: title },
              ]}
              rows={data}
            />
          </BlockBusy>
        )}
      </CardContent>
    </Card>
  )
}

export { States2, exampleProps as states2ExampleProps, type States2Props }
