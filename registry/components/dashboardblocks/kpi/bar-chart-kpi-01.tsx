'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { TinyBarChart } from '@/registry/components/dashboardblocks/chart'
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

interface DailyValue {
  label: string
  value: number
}

interface BarChartKPI1Props {
  comparison: string
  /** Leave out, or pass no days, to show the empty state. */
  data?: DailyValue[]
  format?: KPIFormat
  /** @default 144 */
  height?: number
  previous?: number
  status?: BlockStatus
  title: string
}

const exampleProps: BarChartKPI1Props = {
  comparison: 'last week',
  data: [
    { label: 'Mon', value: 3_200 },
    { label: 'Tue', value: 4_500 },
    { label: 'Wed', value: 2_800 },
    { label: 'Thu', value: 5_200 },
    { label: 'Fri', value: 6_100 },
    { label: 'Sat', value: 4_800 },
    { label: 'Sun', value: 5_700 },
  ],
  format: 'currency',
  previous: 30_050,
  title: 'Revenue this week',
}

const compactFormat = (format: KPIFormat = 'number'): KPIFormat =>
  format === 'currency' ? 'currency-compact' : format === 'number' ? 'compact' : format

const BarChartKPI1 = (props: BarChartKPI1Props) => {
  const { comparison, data = [], format, height = 144, previous, status, title } = props
  const total = data.reduce((sum, point) => sum + point.value, 0)
  const formatter = getKPIFormatter(format)
  const best = data.reduce(
    (top, point, index) => (point.value > data[top].value ? index : top),
    0,
  )

  return (
    <BlockStateProvider state={getBlockState(status, data)}>
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
            <TinyBarChart
              accessibilityLayer={false}
              bars={[{ dataKey: 'value', fill: 'var(--color-chart-2)' }]}
              data={data}
              formatter={getKPIFormatter(compactFormat(format))}
              height={height}
              highlightIndex={best}
              reference={{
                label: `avg ${formatter(Math.round(total / data.length))}`,
                value: total / data.length,
              }}
              xAxisKey='label'
            />
          </KPIChart>
          <BlockReady className='text-xs'>
            <p className='text-muted-foreground text-xs'>
              {data[best]?.label} was the best day, at {formatter(data[best]?.value ?? 0)}
              .
            </p>
          </BlockReady>
        </KPIContent>
      </KPI>
    </BlockStateProvider>
  )
}

export {
  BarChartKPI1,
  exampleProps as barChartKpi1ExampleProps,
  type BarChartKPI1Props,
  type DailyValue,
}
