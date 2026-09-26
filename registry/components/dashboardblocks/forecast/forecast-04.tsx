'use client'

import {
  ChartPanelFigure,
  ChartPanelTable,
  ChartPanelTooltip,
  chartAxisProps,
  chartGridProps,
  formatCompact,
} from '@/registry/components/dashboardblocks/chart-panel'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from '@/registry/components/dashboardblocks/data-table'
import {
  ForecastKey,
  type ForecastKeyShape,
  ForecastLegend,
  forecastColors,
  forecastDash,
  forecastStatusConfig,
  getForecastAxis,
  projectGrowth,
} from '@/registry/components/dashboardblocks/forecast'
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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

type ScenarioKey = 'low' | 'base' | 'high'

interface Scenario {
  /** What the scenario assumes, in a few words. */
  note: string
  /** Growth per step, as a fraction. */
  rate: number
}

interface Forecast4Props {
  /** Values so far, oldest first. */
  actuals: { label: string; value: number }[]
  description: string
  formatter?: (value: number) => string
  /** Labels for the steps after the last actual. */
  horizon: string[]
  scenarios: Record<ScenarioKey, Scenario>
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
  description: 'Monthly recurring revenue under three growth scenarios',
  formatter: (value) => `$${Math.round(value).toLocaleString('en-US')}`,
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

const percentFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  signDisplay: 'always',
  style: 'percent',
})

const Forecast4 = (props: Forecast4Props) => {
  const {
    actuals,
    description,
    formatter = (value) => Math.round(value).toLocaleString(),
    horizon,
    scenarios,
    target,
    title,
  } = props

  const current = actuals[actuals.length - 1]?.value ?? 0
  const paths = {
    base: projectGrowth(current, scenarios.base.rate, horizon.length),
    high: projectGrowth(current, scenarios.high.rate, horizon.length),
    low: projectGrowth(current, scenarios.low.rate, horizon.length),
  }
  // The scenarios start at the last actual so the lines join.
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
    <Card className='@container/data-table gap-0 pb-0'>
      <CardHeader className='pb-4'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4 border-b pb-6'>
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
        <ChartPanelFigure className='h-56'>
          <ResponsiveContainer width='100%' height='100%'>
            <ComposedChart data={rows} margin={{ top: 8, right: 36, bottom: 0, left: 0 }}>
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
                width={48}
              />
              {target !== undefined && (
                <ReferenceLine
                  y={target}
                  stroke={forecastColors.target}
                  strokeDasharray={forecastDash.target}
                  strokeWidth={1.5}
                  label={{
                    fill: 'var(--color-muted-foreground)',
                    fontSize: 11,
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
                  // Show the actual where there is one, otherwise the scenarios.
                  const payload = tooltipProps.payload?.filter((item) =>
                    row?.actual !== null
                      ? item.dataKey === 'actual'
                      : item.dataKey !== 'range' && item.dataKey !== 'actual',
                  )
                  return (
                    <ChartPanelTooltip
                      {...tooltipProps}
                      payload={payload}
                      valueFormatter={formatter}
                    />
                  )
                }}
                cursor={{ stroke: 'var(--color-border)' }}
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
                  activeDot={{ r: 4, stroke: 'var(--color-card)', strokeWidth: 2 }}
                  dataKey={scenario.key}
                  dot={false}
                  label={renderEndLabel(scenario.label)}
                  name={scenario.label}
                  stroke={forecastColors.forecast}
                  strokeDasharray={
                    scenario.key === 'base' ? forecastDash.forecast : forecastDash.target
                  }
                  strokeOpacity={scenario.key === 'base' ? 1 : 0.7}
                  strokeWidth={scenario.key === 'base' ? 2 : 1.5}
                  type='linear'
                />
              ))}
              <Line
                activeDot={{ r: 4, stroke: 'var(--color-card)', strokeWidth: 2 }}
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
        <ChartPanelTable
          caption={`${title}: ${description}.`}
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
            // The last actual is where the scenarios start, not a scenario itself.
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
      </CardContent>
      <DataTable>
        <caption className='sr-only'>{`${title} by scenario, to ${endLabel}`}</caption>
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
          {SCENARIOS.map((scenario) => {
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
            const status = forecastStatusConfig[reached ? 'on-track' : 'off-track']
            const StatusIcon = status.icon
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
                <DataTableCell align='end' label='Growth'>
                  {percentFormatter.format(scenarios[scenario.key].rate)} a month
                </DataTableCell>
                <DataTableCell align='end' label={endLabel} className='font-medium'>
                  {formatter(end)}
                </DataTableCell>
                <DataTableCell align='end' label='Change'>
                  {percentFormatter.format(current > 0 ? end / current - 1 : 0)}
                </DataTableCell>
                {target !== undefined && (
                  <DataTableCell align='end' label='Reaches target'>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 @2xl/data-table:justify-end',
                        status.text,
                      )}
                    >
                      <StatusIcon aria-hidden className='size-3.5 shrink-0' />
                      {reached ?? `Not by ${endLabel}`}
                    </span>
                  </DataTableCell>
                )}
              </DataTableRow>
            )
          })}
        </DataTableBody>
      </DataTable>
    </Card>
  )
}

export { Forecast4, exampleProps as forecast4ExampleProps, type Forecast4Props }
