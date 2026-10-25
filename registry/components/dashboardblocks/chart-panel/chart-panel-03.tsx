'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  chartAxisProps,
  chartBarCursor,
  chartBarValueLabel,
  chartGridProps,
  chartReferenceLabel,
  chartReferenceProps,
  ChartTooltipContent,
  chartValueAxisWidth,
} from '@/registry/components/dashboardblocks/chart'
import {
  ChartPanelFigure,
  ChartPanelLegend,
  ChartPanelTable,
} from '@/registry/components/dashboardblocks/chart-panel'
import { KPIChange, KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { formatCompact, formatNumber } from '@/registry/lib/dashboardblocks/format'
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface StackSeries {
  color: string
  key: string
  label: string
}

interface ChartPanel3Props extends BlockStateProps {
  /** Leave out, or pass no months, to show the empty state. */
  data?: Array<Record<string, number | string> & { label: string }>
  description: string
  series: StackSeries[]
  title: string
}

const exampleProps: ChartPanel3Props = {
  data: [
    { enterprise: 48, free: 492, label: 'Oct', pro: 164 },
    { enterprise: 56, free: 522, label: 'Nov', pro: 171 },
    { enterprise: 44, free: 474, label: 'Dec', pro: 158 },
    { enterprise: 64, free: 564, label: 'Jan', pro: 196 },
    { enterprise: 72, free: 606, label: 'Feb', pro: 214 },
    { enterprise: 68, free: 588, label: 'Mar', pro: 222 },
    { enterprise: 84, free: 654, label: 'Apr', pro: 248 },
    { enterprise: 96, free: 696, label: 'May', pro: 263 },
    { enterprise: 88, free: 672, label: 'Jun', pro: 271 },
    { enterprise: 108, free: 744, label: 'Jul', pro: 302 },
    { enterprise: 116, free: 786, label: 'Aug', pro: 318 },
    { enterprise: 132, free: 834, label: 'Sep', pro: 347 },
  ],
  description: 'New accounts each month over the last 12 months, by plan.',
  series: [
    { color: 'var(--color-chart-2)', key: 'free', label: 'Free' },
    { color: 'var(--color-chart-3)', key: 'pro', label: 'Pro' },
    { color: 'var(--color-chart-4)', key: 'enterprise', label: 'Enterprise' },
  ],
  title: 'Signups by plan',
}

const ChartPanel3 = (props: ChartPanel3Props) => {
  const { data = [], description, series, errorMessage, status, title } = props
  const totals = data.map((point) =>
    series.reduce((sum, item) => sum + Number(point[item.key] ?? 0), 0),
  )
  const lastIndex = data.length - 1
  const latest = data[lastIndex]
  const prior = data[lastIndex - 1]
  const average =
    totals.length > 0 ? totals.reduce((sum, total) => sum + total, 0) / totals.length : 0
  const format = (value: number) => formatNumber(value, { maximumFractionDigits: 0 })

  return (
    <BlockStateProvider errorMessage={errorMessage} state={getBlockState(status, data)}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <div className='flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-t pt-4'>
          <div className='flex flex-col gap-1'>
            <BlockReady className='w-16 text-sm'>
              <p className='text-muted-foreground text-sm'>{latest?.label}</p>
            </BlockReady>
            <KPIValue value={totals[lastIndex]} format={format} />
            <KPIChange
              comparison={`in ${prior?.label}`}
              format={format}
              previous={totals[lastIndex - 1]}
              value={totals[lastIndex]}
            />
          </div>
          <ChartPanelLegend
            items={series.map((item) => ({ color: item.color, label: item.label }))}
          />
        </div>
        <ChartPanelFigure className='h-64'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              aria-label={`${title} chart`}
              data={data}
              margin={{ top: 20, right: 8, bottom: 0, left: 0 }}
            >
              <CartesianGrid {...chartGridProps} />
              <XAxis {...chartAxisProps} dataKey='label' />
              <YAxis
                {...chartAxisProps}
                tickFormatter={(value: number) => formatCompact(value)}
                width={chartValueAxisWidth}
              />
              <Tooltip
                content={(tooltipProps) => <ChartTooltipContent {...tooltipProps} />}
                cursor={chartBarCursor}
              />
              {series.map((item, index) => (
                <Bar
                  key={item.key}
                  dataKey={item.key}
                  fill={item.color}
                  maxBarSize={28}
                  name={item.label}
                  radius={index === series.length - 1 ? [4, 4, 0, 0] : 0}
                  stackId='stack'
                  stroke='var(--color-background)'
                  strokeWidth={1}
                >
                  {index === series.length - 1 && (
                    <LabelList
                      dataKey={item.key}
                      content={chartBarValueLabel(lastIndex, () =>
                        format(totals[lastIndex] ?? 0),
                      )}
                    />
                  )}
                </Bar>
              ))}
              {average > 0 && (
                <ReferenceLine
                  {...chartReferenceProps}
                  y={average}
                  label={{
                    ...chartReferenceLabel,
                    value: `avg ${format(average)}`,
                    position: 'insideBottomLeft',
                    dy: -4,
                  }}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </ChartPanelFigure>
        <ChartPanelTable
          caption={`${title}: ${description}`}
          columns={[
            { key: 'label', label: 'Month' },
            ...series.map((item) => ({ key: item.key, label: item.label })),
          ]}
          rows={data}
        />
      </section>
    </BlockStateProvider>
  )
}

export { ChartPanel3, exampleProps as chartPanel3ExampleProps, type ChartPanel3Props }
