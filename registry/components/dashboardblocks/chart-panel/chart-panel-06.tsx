'use client'

import {
  ChartPanelFigure,
  ChartPanelLegend,
  ChartPanelTable,
  ChartPanelTooltip,
  type ChartValueFormatter,
  chartAxisProps,
  chartGridProps,
} from '@/registry/components/dashboardblocks/chart-panel'
import { Trend } from '@/registry/components/dashboardblocks/trend'
import {
  CartesianGrid,
  LabelList,
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

interface Percentile {
  key: string
  label: string
}

interface ChartPanel6Props {
  data: Array<Record<string, number | string> & { label: string }>
  description: string
  formatter?: ChartValueFormatter
  headline: string
  percentiles: Percentile[]
  title: string
  trend: number
}

const exampleProps: ChartPanel6Props = {
  data: Array.from({ length: 24 }, (_, hour) => {
    const load = Math.sin(((hour - 6) / 24) * Math.PI * 2) * 0.5 + 0.5
    const spike = hour === 14 ? 1.6 : 1
    return {
      label: `${String(hour).padStart(2, '0')}:00`,
      p50: Math.round(62 + load * 18),
      p95: Math.round((140 + load * 60) * (spike > 1 ? 1.25 : 1)),
      p99: Math.round((260 + load * 120) * spike),
    }
  }),
  description: 'Response time percentiles, last 24 hours',
  formatter: (value) => `${value} ms`,
  headline: 'p95',
  percentiles: [
    { key: 'p50', label: 'p50' },
    { key: 'p95', label: 'p95' },
    { key: 'p99', label: 'p99' },
  ],
  title: 'API latency',
  trend: -6.8,
}

/** Percentiles are ordered, so they share one hue from light to full strength. */
const rampColor = (index: number, count: number) => {
  const strength = count <= 1 ? 100 : Math.round(45 + (55 * index) / (count - 1))
  return `color-mix(in oklab, var(--chart-1) ${strength}%, var(--color-card))`
}

const ChartPanel6 = (props: ChartPanel6Props) => {
  const {
    data,
    description,
    formatter = (value) => value.toLocaleString(),
    headline,
    percentiles,
    title,
    trend,
  } = props
  const lastIndex = data.length - 1
  const headlineValue = Number(data[lastIndex]?.[headline] ?? 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <Trend goodDirection='down' trend={trend} variant='badge' />
        </CardAction>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <div className='flex flex-wrap items-end justify-between gap-x-6 gap-y-3'>
          <div className='flex flex-col gap-0.5'>
            <span className='text-3xl font-semibold tracking-tight'>
              {formatter(headlineValue)}
            </span>
            <span className='text-muted-foreground text-xs'>{headline} right now</span>
          </div>
          <ChartPanelLegend
            items={percentiles.map((item, index) => ({
              color: rampColor(index, percentiles.length),
              label: item.label,
              shape: 'line',
            }))}
          />
        </div>
        <ChartPanelFigure className='h-60'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={data} margin={{ top: 8, right: 40, bottom: 0, left: 0 }}>
              <CartesianGrid {...chartGridProps} />
              <XAxis
                {...chartAxisProps}
                dataKey='label'
                interval='preserveStartEnd'
                minTickGap={40}
              />
              <YAxis {...chartAxisProps} width={40} />
              <Tooltip
                content={(tooltipProps) => (
                  <ChartPanelTooltip {...tooltipProps} valueFormatter={formatter} />
                )}
                cursor={{ stroke: 'var(--color-border)' }}
              />
              {percentiles.map((item, index) => (
                <Line
                  key={item.key}
                  activeDot={{ r: 4, stroke: 'var(--color-card)', strokeWidth: 2 }}
                  dataKey={item.key}
                  dot={false}
                  name={item.label}
                  stroke={rampColor(index, percentiles.length)}
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  type='monotone'
                >
                  <LabelList
                    dataKey={item.key}
                    content={({ index: pointIndex, x, y }) =>
                      pointIndex === lastIndex ? (
                        <text
                          x={Number(x) + 8}
                          y={Number(y)}
                          dominantBaseline='middle'
                          className='fill-muted-foreground text-xs'
                        >
                          {item.label}
                        </text>
                      ) : null
                    }
                  />
                </Line>
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartPanelFigure>
        <ChartPanelTable
          caption={`${title}: ${description}`}
          columns={[
            { key: 'label', label: 'Hour' },
            ...percentiles.map((item) => ({
              format: formatter,
              key: item.key,
              label: item.label,
            })),
          ]}
          rows={data}
        />
      </CardContent>
    </Card>
  )
}

export { ChartPanel6, exampleProps as chartPanel6ExampleProps, type ChartPanel6Props }
