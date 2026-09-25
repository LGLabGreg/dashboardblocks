'use client'

import {
  ChartPanelFigure,
  ChartPanelLegend,
  ChartPanelTable,
  ChartPanelTooltip,
  chartAxisProps,
  chartGridProps,
  formatCompact,
} from '@/registry/components/dashboardblocks/chart-panel'
import { Trend } from '@/registry/components/dashboardblocks/trend'
import {
  Bar,
  BarChart,
  CartesianGrid,
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

interface StackSeries {
  color: string
  key: string
  label: string
}

interface ChartPanel3Props {
  data: Array<Record<string, number | string> & { label: string }>
  description: string
  series: StackSeries[]
  title: string
  trend: number
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
  description: 'New accounts per month, last 12 months',
  series: [
    { color: 'var(--chart-1)', key: 'free', label: 'Free' },
    { color: 'var(--chart-2)', key: 'pro', label: 'Pro' },
    { color: 'var(--chart-3)', key: 'enterprise', label: 'Enterprise' },
  ],
  title: 'Signups by plan',
  trend: 9.2,
}

const ChartPanel3 = (props: ChartPanel3Props) => {
  const { data, description, series, title, trend } = props
  const latest = data.at(-1)
  const latestTotal = latest
    ? series.reduce((sum, item) => sum + Number(latest[item.key] ?? 0), 0)
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <Trend trend={trend} variant='badge' />
        </CardAction>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <div className='flex flex-wrap items-end justify-between gap-x-6 gap-y-3'>
          <div className='flex flex-col gap-0.5'>
            <span className='text-3xl font-semibold tracking-tight'>
              {latestTotal.toLocaleString()}
            </span>
            <span className='text-muted-foreground text-xs'>
              signups in {latest?.label}
            </span>
          </div>
          <ChartPanelLegend
            items={series.map((item) => ({ color: item.color, label: item.label }))}
          />
        </div>
        <ChartPanelFigure className='h-60'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid {...chartGridProps} />
              <XAxis {...chartAxisProps} dataKey='label' />
              <YAxis
                {...chartAxisProps}
                tickFormatter={(value: number) => formatCompact(value)}
                width={40}
              />
              <Tooltip
                content={(tooltipProps) => <ChartPanelTooltip {...tooltipProps} />}
                cursor={{ fill: 'var(--color-muted)', fillOpacity: 0.6 }}
              />
              {series.map((item, index) => (
                <Bar
                  key={item.key}
                  dataKey={item.key}
                  fill={item.color}
                  maxBarSize={24}
                  name={item.label}
                  radius={index === series.length - 1 ? [4, 4, 0, 0] : 0}
                  stackId='stack'
                  stroke='var(--color-card)'
                  strokeWidth={2}
                />
              ))}
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
      </CardContent>
    </Card>
  )
}

export { ChartPanel3, exampleProps as chartPanel3ExampleProps, type ChartPanel3Props }
