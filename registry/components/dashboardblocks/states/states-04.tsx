'use client'

import {
  BlockStateProvider,
  BlockStateText,
  type BlockStatus,
  type LoadStatus,
  useBlockData,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  ChartPlaceholder,
  chartAxisProps,
  chartBarCursor,
  chartBarValueLabel,
  chartFadedColor,
  chartGridProps,
  chartReferenceLabel,
  chartReferenceProps,
  ChartTooltipContent,
  chartValueAxisWidth,
} from '@/registry/components/dashboardblocks/chart'
import {
  ChartPanelFigure,
  ChartPanelTable,
} from '@/registry/components/dashboardblocks/chart-panel'
import { KPIChange, KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { formatCompact, formatNumber } from '@/registry/lib/dashboardblocks/format'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface WeeklyPoint {
  label: string
  value: number
}

interface States4Props {
  description: string
  load: () => Promise<WeeklyPoint[]>
  title: string
}

const SERIES_COLOR = 'var(--color-chart-2)'
const CHART_HEIGHT = 240

const exampleProps: States4Props = {
  description: 'New accounts each week for the last 8 weeks, against the weekly average.',
  load: () =>
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('The analytics service timed out.')), 1_000),
    ),
  title: 'Signups',
}

function toBlockStatus(status: LoadStatus): BlockStatus | undefined {
  if (status === 'idle' || status === 'loading') return 'loading'
  if (status === 'error') return 'error'
  return undefined
}

const States4 = (props: States4Props) => {
  const { description, load, title } = props
  const { data = [], status: loadStatus } = useBlockData(load, { keepData: false })
  const status = toBlockStatus(loadStatus)
  const lastIndex = data.length - 1
  const latest = lastIndex >= 0 ? data[lastIndex] : undefined
  const prior = lastIndex >= 1 ? data[lastIndex - 1] : undefined
  const average = data.length
    ? data.reduce((sum, point) => sum + point.value, 0) / data.length
    : 0

  return (
    <BlockStateProvider state={getBlockState(status, data)}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        {status || !latest ? (
          <div className='flex flex-col gap-4 border-t pt-4'>
            <div className='flex flex-col gap-1'>
              <KPIValue />
              {status === 'loading' && <BlockStateText className='text-sm' />}
            </div>
            <ChartPlaceholder height={CHART_HEIGHT} />
          </div>
        ) : (
          <div className='flex flex-col gap-4 border-t pt-4'>
            <div className='flex flex-col gap-1'>
              <p className='text-4xl font-light tracking-tight tabular-nums'>
                {formatNumber(latest.value)}
              </p>
              {prior && (
                <KPIChange
                  comparison={`the week of ${prior.label}`}
                  format={(value) => formatNumber(value)}
                  previous={prior.value}
                  value={latest.value}
                />
              )}
            </div>
            <ChartPanelFigure className='h-60'>
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
                  <Bar dataKey='value' maxBarSize={28} name={title} radius={[4, 4, 0, 0]}>
                    {data.map((point, index) => (
                      <Cell
                        key={point.label}
                        fill={
                          index === lastIndex
                            ? SERIES_COLOR
                            : chartFadedColor(SERIES_COLOR)
                        }
                      />
                    ))}
                    <LabelList dataKey='value' content={chartBarValueLabel(lastIndex)} />
                  </Bar>
                  <ReferenceLine
                    {...chartReferenceProps}
                    y={average}
                    label={{
                      ...chartReferenceLabel,
                      value: `avg ${formatNumber(Math.round(average))}`,
                      position: 'insideBottomLeft',
                      dy: -4,
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartPanelFigure>
            <ChartPanelTable
              caption={`${title}: ${description}`}
              columns={[
                { key: 'label', label: 'Week of' },
                { format: (value) => formatNumber(value), key: 'value', label: title },
              ]}
              rows={data}
            />
          </div>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { States4, exampleProps as states4ExampleProps, type States4Props }
