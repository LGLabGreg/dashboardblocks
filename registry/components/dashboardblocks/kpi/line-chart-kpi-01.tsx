'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStateProps,
  getBlockState,
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
  describeSeries,
  getKPIFormatter,
} from '@/registry/components/dashboardblocks/kpi'
import { formatList } from '@/registry/lib/dashboardblocks/format'

interface DailyComparison {
  label: string
  previous: number
  value: number
}

interface LineChartKPI1Props extends BlockStateProps {
  comparison: string
  /** @default 'This week' */
  currentLabel?: string
  /** Leave out, or pass no days, to show the empty state. */
  data?: DailyComparison[]
  format?: KPIFormat
  /** @default 112 */
  height?: number
  title: string
}

const exampleProps: LineChartKPI1Props = {
  comparison: 'last week',
  data: [
    { label: 'Mon', previous: 6_100, value: 6_420 },
    { label: 'Tue', previous: 6_650, value: 7_180 },
    { label: 'Wed', previous: 6_020, value: 5_890 },
    { label: 'Thu', previous: 6_900, value: 7_560 },
    { label: 'Fri', previous: 7_240, value: 8_030 },
    { label: 'Sat', previous: 5_310, value: 5_720 },
    { label: 'Sun', previous: 4_880, value: 5_430 },
  ],
  format: 'compact',
  title: 'Visitors',
}

function describeLead(data: DailyComparison[]): [string, string] {
  const behind = data.filter((point) => point.value < point.previous)
  const ahead = data.length - behind.length
  if (behind.length === 0) return ['ahead of', 'every day.']
  if (ahead === 0) return ['behind', 'every day.']
  return [
    'ahead of',
    `on ${ahead} of ${data.length} days, behind on ${formatList(behind.map((point) => point.label))}.`,
  ]
}

const LineChartKPI1 = (props: LineChartKPI1Props) => {
  const {
    comparison,
    currentLabel = 'This week',
    data = [],
    format,
    height = 112,
    errorMessage,
    status,
    title,
  } = props
  const total = data.reduce((sum, point) => sum + point.value, 0)
  const previous = data.reduce((sum, point) => sum + point.previous, 0)
  const [lead, rest] = describeLead(data)

  return (
    <BlockStateProvider errorMessage={errorMessage} state={getBlockState(status, data)}>
      <KPI>
        <KPIContent className='gap-3'>
          <div className='flex flex-col gap-1'>
            <KPITitle>{title}</KPITitle>
            <KPIValue value={total} format={format} animated />
            <KPIChange
              comparison={comparison}
              format={format}
              previous={previous}
              value={total}
            />
          </div>
          <KPIChart label={describeSeries(`${title} by day`, data, format)}>
            <TinyAreaChart
              accessibilityLayer={false}
              areas={[
                {
                  dataKey: 'previous',
                  fill: 'none',
                  name: comparison.charAt(0).toUpperCase() + comparison.slice(1),
                  stroke: 'var(--color-muted-foreground)',
                  strokeDasharray: '3 3',
                  strokeWidth: 1.5,
                },
                {
                  dataKey: 'value',
                  fill: 'var(--color-chart-2)',
                  fillOpacity: 0.3,
                  name: currentLabel,
                  stroke: 'var(--color-chart-2)',
                },
              ]}
              data={data}
              formatter={getKPIFormatter(format)}
              height={height}
              markLast='value'
              scale='data'
              xAxisKey='label'
            />
          </KPIChart>
          <BlockReady className='text-xs'>
            <p className='text-muted-foreground text-xs'>
              <span
                aria-hidden
                className='bg-chart-2 mr-1.5 inline-block h-0.5 w-3 align-middle'
              />
              {currentLabel} was {lead}
              <span
                aria-hidden
                className='border-muted-foreground mx-1.5 inline-block w-3 border-t-[1.5px] border-dashed align-middle'
              />
              {comparison} {rest}
            </p>
          </BlockReady>
        </KPIContent>
      </KPI>
    </BlockStateProvider>
  )
}

export {
  LineChartKPI1,
  exampleProps as lineChartKpi1ExampleProps,
  type DailyComparison,
  type LineChartKPI1Props,
}
