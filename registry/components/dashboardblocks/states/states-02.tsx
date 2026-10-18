'use client'

import {
  BlockBusy,
  BlockBusyIndicator,
  BlockStateProvider,
  BlockStateText,
  type BlockStatus,
  type LoadStatus,
  useBlockData,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  ChartPlaceholder,
  chartActiveDot,
  chartAxisProps,
  chartGridProps,
  chartLastDot,
  chartLineCursor,
  chartReferenceLabel,
  chartReferenceProps,
  ChartTooltipContent,
  chartValueAxisWidth,
  useChartId,
} from '@/registry/components/dashboardblocks/chart'
import {
  ChartPanelFigure,
  ChartPanelTable,
} from '@/registry/components/dashboardblocks/chart-panel'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatCompact, formatCurrency } from '@/registry/lib/dashboardblocks/format'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Button } from '@/components/ui/button'

interface DailyPoint {
  label: string
  value: number
}

interface States2Props {
  description: string
  load: () => Promise<DailyPoint[]>
  title: string
}

let exampleRequests = 0

const exampleProps: States2Props = {
  description: 'Revenue each day in September, against the daily average.',
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

const SERIES_COLOR = 'var(--color-chart-2)'
const currency = (value: number) => formatCurrency(value)

function toBlockStatus(status: LoadStatus): BlockStatus | undefined {
  if (status === 'idle' || status === 'loading') return 'loading'
  if (status === 'error') return 'error'
  return undefined
}

const States2 = (props: States2Props) => {
  const { description, load, title } = props
  const { data, reload, status: loadStatus } = useBlockData(load)
  const status = toBlockStatus(loadStatus)
  const refreshing = loadStatus === 'refreshing'
  const gradient = useChartId()
  const total = data?.reduce((sum, point) => sum + point.value, 0) ?? 0
  const average = data?.length ? total / data.length : 0
  const best = data?.length
    ? data.reduce((top, point) => (point.value > top.value ? point : top))
    : undefined

  return (
    <BlockStateProvider state={getBlockState(status, data)}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </div>
          <div className='flex shrink-0 items-center gap-3'>
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
          </div>
        </header>
        {status || !data?.length ? (
          <div className='flex flex-col gap-4 border-t pt-4'>
            <div className='flex flex-col gap-1'>
              <KPIValue />
              {status === 'loading' && <BlockStateText className='text-sm' />}
            </div>
            <ChartPlaceholder height={224} />
          </div>
        ) : (
          <BlockBusy
            busy={refreshing}
            label={`Updating ${title.toLowerCase()}`}
            className='flex flex-col gap-4 border-t pt-4'
          >
            <div className='flex flex-col gap-1'>
              <p className='text-4xl font-light tracking-tight tabular-nums'>
                {currency(total)}
              </p>
              {best && (
                <p className='text-muted-foreground text-sm'>
                  {best.label} was the best day, at {currency(best.value)}.
                </p>
              )}
            </div>
            <ChartPanelFigure className='h-56'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart
                  aria-label={`${title} chart`}
                  data={data}
                  margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                >
                  <defs>
                    <linearGradient id={gradient} x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='0%' stopColor={SERIES_COLOR} stopOpacity={0.3} />
                      <stop offset='100%' stopColor={SERIES_COLOR} stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                    width={chartValueAxisWidth}
                  />
                  <Tooltip
                    content={(tooltipProps) => (
                      <ChartTooltipContent {...tooltipProps} valueFormatter={currency} />
                    )}
                    cursor={chartLineCursor}
                  />
                  <ReferenceLine
                    {...chartReferenceProps}
                    y={average}
                    label={{
                      ...chartReferenceLabel,
                      value: `avg ${currency(Math.round(average))}`,
                      position: 'insideBottomLeft',
                      dy: -4,
                    }}
                  />
                  <Area
                    activeDot={chartActiveDot}
                    dataKey='value'
                    dot={chartLastDot(data.length, SERIES_COLOR)}
                    fill={`url(#${gradient})`}
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
              caption={`${title}: ${description}`}
              columns={[
                { key: 'label', label: 'Day' },
                { format: currency, key: 'value', label: title },
              ]}
              rows={data}
            />
          </BlockBusy>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { States2, exampleProps as states2ExampleProps, type States2Props }
