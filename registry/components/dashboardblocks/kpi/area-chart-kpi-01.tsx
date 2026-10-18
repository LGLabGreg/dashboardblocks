'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
} from '@/registry/components/dashboardblocks/block-state'
import { TinyAreaChart } from '@/registry/components/dashboardblocks/chart'
import {
  KPI,
  KPIChange,
  KPIChart,
  KPIContent,
  KPITitle,
  type KPIFormat,
  KPIValue,
  getKPIFormatter,
} from '@/registry/components/dashboardblocks/kpi'
import { formatPercent } from '@/registry/lib/dashboardblocks/format'

interface DailyProfit {
  label: string
  profit: number
  revenue: number
}

interface AreaChartKPI1Props {
  comparison: string
  /** Leave out, or pass no days, to show the empty state. */
  data?: DailyProfit[]
  format?: KPIFormat
  /** @default 112 */
  height?: number
  previous?: number
  status?: BlockStatus
  title: string
}

const exampleProps: AreaChartKPI1Props = {
  comparison: 'last week',
  data: [
    { label: 'Mon', profit: 1_200, revenue: 4_200 },
    { label: 'Tue', profit: 1_500, revenue: 5_100 },
    { label: 'Wed', profit: 800, revenue: 2_800 },
    { label: 'Thu', profit: 1_600, revenue: 5_600 },
    { label: 'Fri', profit: 1_800, revenue: 6_300 },
    { label: 'Sat', profit: 1_400, revenue: 5_400 },
    { label: 'Sun', profit: 2_000, revenue: 6_900 },
  ],
  format: 'currency',
  previous: 9_550,
  title: 'Gross profit',
}

const AreaChartKPI1 = (props: AreaChartKPI1Props) => {
  const { comparison, data = [], format, height = 112, previous, status, title } = props
  const formatter = getKPIFormatter(format)
  const profit = data.reduce((sum, point) => sum + point.profit, 0)
  const revenue = data.reduce((sum, point) => sum + point.revenue, 0)
  const margin = (point: { profit: number; revenue: number }) =>
    point.revenue > 0 ? point.profit / point.revenue : 0
  const best = data.reduce(
    (top, point) => (margin(point) > margin(top) ? point : top),
    data[0],
  )

  return (
    <BlockStateProvider status={status} empty={data.length === 0}>
      <KPI>
        <KPIContent className='gap-3'>
          <div className='flex flex-col gap-1'>
            <KPITitle>{title}</KPITitle>
            <KPIValue value={profit} format={format} animated />
            <KPIChange
              comparison={comparison}
              format={format}
              previous={previous}
              value={profit}
            />
          </div>
          <KPIChart
            label={`Revenue and profit by day: ${data
              .map(
                (point) =>
                  `${point.label} ${formatter(point.revenue)} revenue, ${formatter(point.profit)} profit`,
              )
              .join('; ')}`}
          >
            <TinyAreaChart
              accessibilityLayer={false}
              areas={[
                {
                  dataKey: 'revenue',
                  fill: 'var(--color-chart-2)',
                  fillOpacity: 0.12,
                  name: 'Revenue',
                  stroke: 'color-mix(in oklab, var(--color-chart-2) 40%, transparent)',
                  strokeWidth: 1.5,
                },
                {
                  dataKey: 'profit',
                  fill: 'var(--color-chart-2)',
                  fillOpacity: 0.45,
                  name: 'Profit',
                  stroke: 'var(--color-chart-2)',
                },
              ]}
              data={data}
              formatter={formatter}
              height={height}
              markLast='profit'
              xAxisKey='label'
            />
          </KPIChart>
          <BlockReady className='text-xs'>
            <p className='text-muted-foreground text-xs'>
              <span className='text-foreground font-medium tabular-nums'>
                {formatPercent(margin({ profit, revenue }))}
              </span>{' '}
              margin on {formatter(revenue)} revenue
              {best && (
                <>
                  , best on {best.label} at{' '}
                  <span className='tabular-nums'>{formatPercent(margin(best))}</span>
                </>
              )}
              . The light area is revenue, the dark one profit.
            </p>
          </BlockReady>
        </KPIContent>
      </KPI>
    </BlockStateProvider>
  )
}

export {
  AreaChartKPI1,
  exampleProps as areaChartKpi1ExampleProps,
  type AreaChartKPI1Props,
  type DailyProfit,
}
