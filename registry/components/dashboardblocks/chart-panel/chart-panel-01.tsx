'use client'

import {
  ChartPanelFigure,
  ChartPanelLegend,
  ChartPanelTable,
  ChartPanelTooltip,
  type ChartValueFormatter,
  chartAxisProps,
  chartGridProps,
  formatCompact,
} from '@/registry/components/dashboardblocks/chart-panel'
import { Trend } from '@/registry/components/dashboardblocks/trend'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface PeriodPoint {
  current: number
  label: string
  previous: number
}

interface ChartPanel1Props {
  currentLabel?: string
  data: PeriodPoint[]
  description: string
  formatter?: ChartValueFormatter
  previousLabel?: string
  title: string
}

const exampleProps: ChartPanel1Props = {
  currentLabel: 'This period',
  data: Array.from({ length: 30 }, (_, day) => ({
    current: Math.round(
      3900 + day * 42 + Math.sin(day / 2.2) * 420 - (day % 7 > 4 ? 520 : 0),
    ),
    label: `Sep ${day + 1}`,
    previous: Math.round(
      3700 + day * 18 + Math.sin(day / 2.8 + 1) * 360 - (day % 7 > 4 ? 480 : 0),
    ),
  })),
  description: 'Sep 1 – Sep 30, compared with the previous 30 days',
  formatter: (value) => `$${value.toLocaleString()}`,
  previousLabel: 'Previous period',
  title: 'Revenue',
}

const CURRENT_COLOR = 'var(--chart-1)'
const PREVIOUS_COLOR = 'color-mix(in oklab, var(--muted-foreground) 45%, transparent)'

const ChartPanel1 = (props: ChartPanel1Props) => {
  const {
    currentLabel = 'This period',
    data,
    description,
    formatter = (value) => value.toLocaleString(),
    previousLabel = 'Previous period',
    title,
  } = props

  const currentTotal = data.reduce((sum, point) => sum + point.current, 0)
  const previousTotal = data.reduce((sum, point) => sum + point.previous, 0)
  const change =
    previousTotal === 0 ? 0 : ((currentTotal - previousTotal) / previousTotal) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <Trend trend={Number(change.toFixed(1))} variant='badge' />
        </CardAction>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <div className='flex flex-wrap items-end justify-between gap-x-6 gap-y-3'>
          <div className='flex flex-col gap-0.5'>
            <span className='text-3xl font-semibold tracking-tight'>
              {formatter(currentTotal)}
            </span>
            <span className='text-muted-foreground text-xs'>
              vs {formatter(previousTotal)} previous period
            </span>
          </div>
          <ChartPanelLegend
            items={[
              { color: CURRENT_COLOR, label: currentLabel, shape: 'line' },
              { color: PREVIOUS_COLOR, label: previousLabel, shape: 'line' },
            ]}
          />
        </div>
        <ChartPanelFigure className='h-60'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
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
                width={40}
              />
              <Tooltip
                content={(tooltipProps) => (
                  <ChartPanelTooltip {...tooltipProps} valueFormatter={formatter} />
                )}
                cursor={{ stroke: 'var(--color-border)' }}
                itemSorter={(item) => (item.dataKey === 'current' ? 0 : 1)}
              />
              <Line
                activeDot={{ r: 4, stroke: 'var(--color-card)', strokeWidth: 2 }}
                dataKey='previous'
                dot={false}
                name={previousLabel}
                stroke={PREVIOUS_COLOR}
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                type='monotone'
              />
              <Line
                activeDot={{ r: 4, stroke: 'var(--color-card)', strokeWidth: 2 }}
                dataKey='current'
                dot={false}
                name={currentLabel}
                stroke={CURRENT_COLOR}
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                type='monotone'
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanelFigure>
        <ChartPanelTable
          caption={`${title}: ${description}`}
          columns={[
            { key: 'label', label: 'Day' },
            { format: formatter, key: 'current', label: currentLabel },
            { format: formatter, key: 'previous', label: previousLabel },
          ]}
          rows={data}
        />
      </CardContent>
    </Card>
  )
}

export { ChartPanel1, exampleProps as chartPanel1ExampleProps, type ChartPanel1Props }
