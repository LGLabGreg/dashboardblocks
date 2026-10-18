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
  describeSeries,
  getKPIFormatter,
} from '@/registry/components/dashboardblocks/kpi'

interface DailyValue {
  label: string
  value: number
}

interface AreaChartKPI2Props {
  comparison: string
  /** Leave out, or pass no days, to show the empty state. */
  data?: DailyValue[]
  format?: KPIFormat
  /** @default 88 */
  height?: number
  previous?: number
  status?: BlockStatus
  title: string
}

const exampleProps: AreaChartKPI2Props = {
  comparison: 'last week',
  data: [
    { label: 'Mon', value: 14_200 },
    { label: 'Tue', value: 17_100 },
    { label: 'Wed', value: 12_800 },
    { label: 'Thu', value: 19_600 },
    { label: 'Fri', value: 22_300 },
    { label: 'Sat', value: 18_400 },
    { label: 'Sun', value: 24_000 },
  ],
  format: 'currency',
  previous: 108_450,
  title: 'Transaction volume',
}

const AreaChartKPI2 = (props: AreaChartKPI2Props) => {
  const { comparison, data = [], format, height = 88, previous, status, title } = props
  const formatter = getKPIFormatter(format)
  const total = data.reduce((sum, point) => sum + point.value, 0)
  const peak = data.reduce<DailyValue | undefined>(
    (top, point) => (!top || point.value > top.value ? point : top),
    undefined,
  )

  return (
    <BlockStateProvider status={status} empty={data.length === 0}>
      <KPI className='relative overflow-hidden'>
        <KPIContent className='gap-1 pb-20'>
          <KPITitle className='relative z-10'>{title}</KPITitle>
          <KPIValue
            className='relative z-10 text-5xl'
            value={total}
            format={format}
            animated
          />
          <KPIChange
            className='relative z-10'
            comparison={comparison}
            format={format}
            previous={previous}
            value={total}
          />
          <BlockReady className='relative z-10 text-xs'>
            {peak && (
              <p className='text-muted-foreground relative z-10 text-xs'>
                Busiest on {peak.label}, at{' '}
                <span className='text-foreground font-medium tabular-nums'>
                  {formatter(peak.value)}
                </span>
                .
              </p>
            )}
          </BlockReady>
        </KPIContent>
        <KPIChart
          className='pointer-events-none absolute inset-x-0 bottom-0'
          label={describeSeries(`${title} by day`, data, format)}
        >
          <TinyAreaChart
            accessibilityLayer={false}
            areas={[
              {
                dataKey: 'value',
                fill: 'var(--color-chart-2)',
                stroke: 'color-mix(in oklab, var(--color-chart-2) 60%, transparent)',
                strokeWidth: 1.5,
              },
            ]}
            data={data}
            formatter={formatter}
            height={height}
            markLast='value'
            scale='data'
          />
        </KPIChart>
      </KPI>
    </BlockStateProvider>
  )
}

export {
  AreaChartKPI2,
  exampleProps as areaChartKpi2ExampleProps,
  type AreaChartKPI2Props,
  type DailyValue,
}
