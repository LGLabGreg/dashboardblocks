'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  ChartPlaceholder,
  ChartTooltipFrame,
  ChartTooltipItem,
  chartActiveDot,
  chartAxisProps,
  chartGridProps,
  chartLastDot,
  chartLineCursor,
  chartReferenceLabel,
  chartReferenceProps,
  chartValueAxisWidth,
  useChartId,
} from '@/registry/components/dashboardblocks/chart'
import {
  ChartPanelFigure,
  ChartPanelTable,
} from '@/registry/components/dashboardblocks/chart-panel'
import { KPIChange, KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { formatNumber, formatPercent } from '@/registry/lib/dashboardblocks/format'
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

interface CsatPeriod {
  label: string
  responses: number
  satisfied: number
}

interface Feedback4Props extends BlockStateProps {
  description: string
  /** Oldest first. Leave out, or pass none, to show the empty state. */
  periods?: CsatPeriod[]
  /** The CSAT to stay above, 0–1. */
  target?: number
  title: string
}

const CHART_HEIGHT = 224

const WEEKS = [
  'Jul 5',
  'Jul 12',
  'Jul 19',
  'Jul 26',
  'Aug 2',
  'Aug 9',
  'Aug 16',
  'Aug 23',
  'Aug 30',
  'Sep 6',
  'Sep 13',
  'Sep 20',
]
const RESPONSES = [412, 398, 441, 430, 455, 468, 472, 459, 481, 503, 497, 516]
const SATISFIED = [343, 334, 366, 349, 360, 365, 382, 381, 404, 427, 427, 449]

const exampleProps: Feedback4Props = {
  description: 'The share of support survey responses rating us 4 or 5, by week.',
  periods: WEEKS.map((label, index) => ({
    label,
    responses: RESPONSES[index],
    satisfied: SATISFIED[index],
  })),
  target: 0.85,
  title: 'Customer satisfaction',
}

const CSAT_COLOR = 'var(--color-chart-2)'

const percent = (value: number) => formatPercent(value, { maximumFractionDigits: 0 })
const exactPercent = (value: number) =>
  formatPercent(value, { maximumFractionDigits: 1, minimumFractionDigits: 1 })

const Feedback4 = (props: Feedback4Props) => {
  const { description, periods = [], errorMessage, status, target, title } = props
  const gradient = useChartId()
  const state = getBlockState(status, periods)
  const rows = periods.map((period) => ({
    ...period,
    csat: period.responses > 0 ? period.satisfied / period.responses : 0,
  }))
  const latest = rows[rows.length - 1]
  const previous = rows[rows.length - 2]
  const responses = periods.reduce((sum, period) => sum + period.responses, 0)
  const weeksMet =
    target === undefined ? 0 : rows.filter((row) => row.csat >= target).length
  const low = Math.min(...rows.map((row) => row.csat), target ?? 1)
  const floor = Math.max(0, Math.floor((low - 0.05) * 20) / 20)
  const step = 1 - floor <= 0.3 ? 0.05 : 0.1
  const ticks = Array.from(
    { length: Math.round((1 - floor) / step) + 1 },
    (_, index) => Math.round((floor + index * step) * 100) / 100,
  )

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <dl className='grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-4 @lg:grid-cols-3'>
          <div className='col-span-2 flex flex-col gap-1 @lg:col-span-1'>
            <dt className='text-muted-foreground text-sm'>
              {state ? 'Latest week' : `Week of ${latest?.label}`}
            </dt>
            {state ? (
              <dd>
                <KPIValue />
              </dd>
            ) : (
              <dd className='text-4xl font-light tracking-tight tabular-nums'>
                {exactPercent(latest?.csat ?? 0)}
              </dd>
            )}
            {latest && previous && (
              <dd>
                <KPIChange
                  changeType='points'
                  comparison='the week before'
                  format={(value) => exactPercent(value / 100)}
                  previous={previous.csat * 100}
                  value={latest.csat * 100}
                />
              </dd>
            )}
          </div>
          {state !== 'error' && state !== 'empty' && target !== undefined && (
            <div className='flex flex-col gap-1'>
              <dt className='text-muted-foreground text-sm'>Target</dt>
              <dd>
                <KPIValue className='text-2xl' format={percent} value={target} />
              </dd>
              <dd className='text-muted-foreground text-xs tabular-nums'>
                <BlockReady className='text-xs'>
                  Met in {weeksMet} of {rows.length} weeks
                </BlockReady>
              </dd>
            </div>
          )}
          {state !== 'error' && state !== 'empty' && (
            <div className='flex flex-col gap-1'>
              <dt className='text-muted-foreground text-sm'>Responses</dt>
              <dd>
                <KPIValue className='text-2xl' value={responses} />
              </dd>
              <dd className='text-muted-foreground text-xs tabular-nums'>
                <BlockReady className='text-xs'>
                  {formatNumber(Math.round(responses / Math.max(1, rows.length)))} a week
                </BlockReady>
              </dd>
            </div>
          )}
        </dl>
        {state && <ChartPlaceholder height={CHART_HEIGHT} />}
        {!state && (
          <ChartPanelFigure className='h-56'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart
                aria-label={`${title} by week${target !== undefined ? `, against a target of ${percent(target)}` : ''}`}
                data={rows}
                margin={{ top: 16, right: 12, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id={gradient} x1='0' x2='0' y1='0' y2='1'>
                    <stop offset='0%' stopColor={CSAT_COLOR} stopOpacity={0.3} />
                    <stop offset='100%' stopColor={CSAT_COLOR} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...chartGridProps} />
                <XAxis
                  {...chartAxisProps}
                  dataKey='label'
                  interval='preserveStartEnd'
                  minTickGap={20}
                />
                <YAxis
                  {...chartAxisProps}
                  domain={[floor, 1]}
                  tickFormatter={percent}
                  ticks={ticks}
                  width={chartValueAxisWidth}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    const row = payload?.[0]?.payload as (typeof rows)[number] | undefined
                    if (!active || !row) return null
                    return (
                      <ChartTooltipFrame>
                        <span className='font-medium'>Week of {row.label}</span>
                        <ChartTooltipItem
                          color={CSAT_COLOR}
                          name='CSAT'
                          value={exactPercent(row.csat)}
                        />
                        <ChartTooltipItem
                          name='Responses'
                          value={formatNumber(row.responses)}
                        />
                      </ChartTooltipFrame>
                    )
                  }}
                  cursor={chartLineCursor}
                />
                {target !== undefined && (
                  <ReferenceLine
                    {...chartReferenceProps}
                    y={target}
                    label={{
                      ...chartReferenceLabel,
                      position: 'insideTopLeft',
                      value: `Target ${percent(target)}`,
                    }}
                  />
                )}
                <Area
                  activeDot={chartActiveDot}
                  baseValue={floor}
                  dataKey='csat'
                  dot={chartLastDot(rows.length, CSAT_COLOR)}
                  fill={`url(#${gradient})`}
                  name='CSAT'
                  stroke={CSAT_COLOR}
                  strokeWidth={2}
                  type='monotone'
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartPanelFigure>
        )}
        {!state && (
          <ChartPanelTable
            caption={`${title}: ${description}${target !== undefined ? ` Target ${percent(target)}.` : ''}`}
            columns={[
              { key: 'label', label: 'Week of' },
              { key: 'csat', label: 'CSAT' },
              { key: 'responses', label: 'Responses' },
            ]}
            rows={rows.map((row) => ({
              csat: exactPercent(row.csat),
              label: row.label,
              responses: formatNumber(row.responses),
            }))}
          />
        )}
      </section>
    </BlockStateProvider>
  )
}

export {
  Feedback4,
  exampleProps as feedback4ExampleProps,
  type CsatPeriod,
  type Feedback4Props,
}
