'use client'

import {
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  ChartPlaceholder,
  ChartTooltipContent,
  chartActiveDot,
  chartAxisProps,
  chartGridProps,
  chartLineCursor,
  chartReferenceLabel,
  chartReferenceProps,
  chartValueAxisWidth,
} from '@/registry/components/dashboardblocks/chart'
import {
  ChartPanelFigure,
  ChartPanelTable,
} from '@/registry/components/dashboardblocks/chart-panel'
import {
  ForecastKey,
  type ForecastKeyShape,
  ForecastLegend,
  ForecastStatusLabel,
  forecastColors,
  forecastDash,
  getForecastAxis,
  projectGrowth,
} from '@/registry/components/dashboardblocks/forecast'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  DataTableStateRows,
} from '@/registry/components/dashboardblocks/table'
import {
  formatCompact,
  formatCurrency,
  formatNumber,
  formatPercent,
  formatSigned,
} from '@/registry/lib/dashboardblocks/format'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type ScenarioKey = 'low' | 'base' | 'high'

interface Scenario {
  note: string
  /** Growth per step, as a fraction. */
  rate: number
}

interface Forecast4Props {
  /** Values so far, oldest first. Leave out, or pass none, to show the empty state. */
  actuals?: { label: string; value: number }[]
  description: string
  formatter?: (value: number) => string
  horizon: string[]
  scenarios: Record<ScenarioKey, Scenario>
  status?: BlockStatus
  target?: number
  title: string
}

const exampleProps: Forecast4Props = {
  actuals: [
    { label: 'Mar 2026', value: 182_400 },
    { label: 'Apr 2026', value: 188_900 },
    { label: 'May 2026', value: 193_100 },
    { label: 'Jun 2026', value: 201_700 },
    { label: 'Jul 2026', value: 207_300 },
    { label: 'Aug 2026', value: 214_200 },
  ],
  description: 'Monthly recurring revenue under three growth scenarios.',
  formatter: (value) => formatCurrency(value),
  horizon: ['Sep 2026', 'Oct 2026', 'Nov 2026', 'Dec 2026', 'Jan 2027', 'Feb 2027'],
  scenarios: {
    base: { note: 'Current growth continues', rate: 0.03 },
    high: { note: 'Enterprise plan launches in October', rate: 0.05 },
    low: { note: 'Churn rises to last winter’s level', rate: 0.01 },
  },
  target: 250_000,
  title: 'Revenue scenarios',
}

const SCENARIOS: { key: ScenarioKey; label: string; shape: ForecastKeyShape }[] = [
  { key: 'high', label: 'High', shape: 'dotted' },
  { key: 'base', label: 'Base', shape: 'dashed' },
  { key: 'low', label: 'Low', shape: 'dotted' },
]

const formatGrowth = (ratio: number) =>
  formatSigned(ratio, (value) => formatPercent(value))

const Forecast4 = (props: Forecast4Props) => {
  const {
    actuals = [],
    description,
    formatter = (value) => formatNumber(value, { maximumFractionDigits: 0 }),
    horizon,
    scenarios,
    status,
    target,
    title,
  } = props
  const state = getBlockState(status, actuals)

  const current = actuals[actuals.length - 1]?.value ?? 0
  const paths = {
    base: projectGrowth(current, scenarios.base.rate, horizon.length),
    high: projectGrowth(current, scenarios.high.rate, horizon.length),
    low: projectGrowth(current, scenarios.low.rate, horizon.length),
  }
  const rows = [
    ...actuals.map((point, index) => {
      const isLast = index === actuals.length - 1
      return {
        actual: point.value,
        base: isLast ? point.value : null,
        high: isLast ? point.value : null,
        label: point.label,
        low: isLast ? point.value : null,
        range: isLast ? [point.value, point.value] : null,
      }
    }),
    ...horizon.map((label, index) => ({
      actual: null,
      base: paths.base[index],
      high: paths.high[index],
      label,
      low: paths.low[index],
      range: [paths.low[index], paths.high[index]],
    })),
  ]
  const endLabel = horizon[horizon.length - 1] ?? ''
  const yAxis = getForecastAxis([
    ...rows.flatMap((row) => [row.actual, row.low, row.high]),
    target ?? null,
  ])

  const renderEndLabel =
    (text: string) =>
    ({ index, x, y }: { index?: number; x?: number | string; y?: number | string }) =>
      index === rows.length - 1 ? (
        <text
          x={Number(x) + 6}
          y={Number(y)}
          dominantBaseline='middle'
          fill='var(--color-muted-foreground)'
          fontSize={11}
        >
          {text}
        </text>
      ) : null

  return (
    <BlockStateProvider state={state}>
      <section className='@container/data-table flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <div className='flex flex-col gap-4 border-t pt-4'>
          <ForecastLegend
            items={[
              { label: 'Actual', shape: 'line' },
              { label: 'Base', shape: 'dashed' },
              { label: 'Low to high', shape: 'band' },
              ...(target !== undefined
                ? [{ label: `Target ${formatter(target)}`, shape: 'dotted' as const }]
                : []),
            ]}
          />
          {state ? (
            <ChartPlaceholder height={224} />
          ) : (
            <ChartPanelFigure className='h-56'>
              <ResponsiveContainer width='100%' height='100%'>
                <ComposedChart
                  aria-label={title}
                  data={rows}
                  margin={{ top: 8, right: 36, bottom: 0, left: 0 }}
                >
                  <CartesianGrid {...chartGridProps} />
                  <XAxis
                    {...chartAxisProps}
                    dataKey='label'
                    interval='preserveStartEnd'
                    minTickGap={16}
                    tickFormatter={(label: string) => label.slice(0, 3)}
                  />
                  <YAxis
                    {...chartAxisProps}
                    domain={yAxis.domain}
                    tickFormatter={(value: number) => formatCompact(value)}
                    ticks={yAxis.ticks}
                    width={chartValueAxisWidth}
                  />
                  {target !== undefined && (
                    <ReferenceLine
                      {...chartReferenceProps}
                      y={target}
                      label={{
                        ...chartReferenceLabel,
                        position: 'insideTopLeft',
                        value: 'Target',
                      }}
                    />
                  )}
                  <Tooltip
                    content={(tooltipProps) => {
                      const row = tooltipProps.payload?.[0]?.payload as
                        | (typeof rows)[number]
                        | undefined
                      const payload = tooltipProps.payload?.filter((item) =>
                        row?.actual !== null
                          ? item.dataKey === 'actual'
                          : item.dataKey !== 'range' && item.dataKey !== 'actual',
                      )
                      return (
                        <ChartTooltipContent
                          {...tooltipProps}
                          payload={payload}
                          valueFormatter={formatter}
                        />
                      )
                    }}
                    cursor={chartLineCursor}
                  />
                  <Area
                    activeDot={false}
                    dataKey='range'
                    fill={forecastColors.band}
                    fillOpacity={1}
                    name='Low to high'
                    stroke='none'
                    type='linear'
                  />
                  {SCENARIOS.map((scenario) => (
                    <Line
                      key={scenario.key}
                      activeDot={chartActiveDot}
                      dataKey={scenario.key}
                      dot={false}
                      label={renderEndLabel(scenario.label)}
                      name={scenario.label}
                      stroke={forecastColors.forecast}
                      strokeDasharray={
                        scenario.key === 'base'
                          ? forecastDash.forecast
                          : forecastDash.target
                      }
                      strokeOpacity={scenario.key === 'base' ? 1 : 0.7}
                      strokeWidth={scenario.key === 'base' ? 2 : 1.5}
                      type='linear'
                    />
                  ))}
                  <Line
                    activeDot={chartActiveDot}
                    dataKey='actual'
                    dot={false}
                    name='Actual'
                    stroke={forecastColors.actual}
                    strokeLinecap='round'
                    strokeWidth={2}
                    type='monotone'
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartPanelFigure>
          )}
          {!state && (
            <ChartPanelTable
              caption={`${title}: ${description}`}
              columns={[
                { key: 'label', label: 'Month' },
                { format: formatter, key: 'actual', label: 'Actual' },
                ...SCENARIOS.map((scenario) => ({
                  format: formatter,
                  key: scenario.key,
                  label: scenario.label,
                })),
              ]}
              rows={rows.map((row, index) => {
                const isScenario = index >= actuals.length
                return {
                  actual: row.actual ?? '—',
                  base: isScenario ? (row.base ?? '—') : '—',
                  high: isScenario ? (row.high ?? '—') : '—',
                  label: row.label,
                  low: isScenario ? (row.low ?? '—') : '—',
                }
              })}
            />
          )}
        </div>
        <DataTable caption={`${title} by scenario, to ${endLabel}`}>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>Scenario</DataTableHead>
              <DataTableHead align='end'>Growth</DataTableHead>
              <DataTableHead align='end'>{endLabel}</DataTableHead>
              <DataTableHead align='end'>Change</DataTableHead>
              {target !== undefined && (
                <DataTableHead align='end'>Reaches target</DataTableHead>
              )}
            </DataTableRow>
          </DataTableHeader>
          <DataTableBody>
            <DataTableStateRows colSpan={target !== undefined ? 5 : 4} rows={3} />
            {!state &&
              SCENARIOS.map((scenario) => {
                const path = paths[scenario.key]
                const end = path[path.length - 1] ?? current
                const reachedIndex =
                  target !== undefined ? path.findIndex((value) => value >= target) : -1
                const reached =
                  target !== undefined && current >= target
                    ? 'Already'
                    : reachedIndex >= 0
                      ? horizon[reachedIndex]
                      : null
                return (
                  <DataTableRow key={scenario.key}>
                    <DataTableCell primary>
                      <div className='flex items-start gap-2'>
                        <ForecastKey className='mt-1' shape={scenario.shape} />
                        <div className='flex min-w-0 flex-col'>
                          <span className='font-medium'>{scenario.label}</span>
                          <span className='text-muted-foreground text-xs'>
                            {scenarios[scenario.key].note}
                          </span>
                        </div>
                      </div>
                    </DataTableCell>
                    <DataTableCell align='end'>
                      {formatGrowth(scenarios[scenario.key].rate)} a month
                    </DataTableCell>
                    <DataTableCell align='end' className='font-medium'>
                      {formatter(end)}
                    </DataTableCell>
                    <DataTableCell align='end'>
                      {formatGrowth(current > 0 ? end / current - 1 : 0)}
                    </DataTableCell>
                    {target !== undefined && (
                      <DataTableCell align='end'>
                        <ForecastStatusLabel
                          variant='text'
                          label={reached ?? `Not by ${endLabel}`}
                          status={reached ? 'on-track' : 'off-track'}
                        />
                      </DataTableCell>
                    )}
                  </DataTableRow>
                )
              })}
          </DataTableBody>
        </DataTable>
      </section>
    </BlockStateProvider>
  )
}

export { Forecast4, exampleProps as forecast4ExampleProps, type Forecast4Props }
