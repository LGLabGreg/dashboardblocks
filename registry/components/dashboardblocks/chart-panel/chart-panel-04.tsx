'use client'

import {
  ChartPanelFigure,
  ChartPanelTable,
  ChartPanelTooltip,
  type ChartValueFormatter,
  chartAxisProps,
  chartGridProps,
  formatCompact,
} from '@/registry/components/dashboardblocks/chart-panel'
import { Trend } from '@/registry/components/dashboardblocks/trend'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
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

interface MonthValue {
  label: string
  value: number
}

interface ChartPanel4Props {
  data: MonthValue[]
  description: string
  formatter?: ChartValueFormatter
  title: string
}

const exampleProps: ChartPanel4Props = {
  data: [
    { label: 'Oct', value: 31_200 },
    { label: 'Nov', value: 33_900 },
    { label: 'Dec', value: 34_400 },
    { label: 'Jan', value: 37_100 },
    { label: 'Feb', value: 39_800 },
    { label: 'Mar', value: 41_300 },
    { label: 'Apr', value: 44_900 },
    { label: 'May', value: 46_200 },
    { label: 'Jun', value: 49_700 },
    { label: 'Jul', value: 52_100 },
    { label: 'Aug', value: 55_600 },
    { label: 'Sep', value: 59_400 },
  ],
  description: 'Monthly recurring revenue, last 12 months',
  formatter: (value) => `$${value.toLocaleString()}`,
  title: 'MRR',
}

const HIGHLIGHT_COLOR = 'var(--chart-1)'
const MUTED_COLOR = 'color-mix(in oklab, var(--muted-foreground) 25%, transparent)'

const ChartPanel4 = (props: ChartPanel4Props) => {
  const {
    data,
    description,
    formatter = (value) => value.toLocaleString(),
    title,
  } = props
  const lastIndex = data.length - 1
  const latest = data[lastIndex]
  const prior = data[lastIndex - 1]
  const change =
    latest && prior?.value ? ((latest.value - prior.value) / prior.value) * 100 : 0

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
        <div className='flex flex-col gap-0.5'>
          <span className='text-3xl font-semibold tracking-tight'>
            {latest ? formatter(latest.value) : '—'}
          </span>
          <span className='text-muted-foreground text-xs'>
            in {latest?.label}, vs {prior ? formatter(prior.value) : '—'} in{' '}
            {prior?.label}
          </span>
        </div>
        <ChartPanelFigure className='h-60'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={data} margin={{ top: 24, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid {...chartGridProps} />
              <XAxis {...chartAxisProps} dataKey='label' />
              <YAxis
                {...chartAxisProps}
                tickFormatter={(value: number) => formatCompact(value)}
                width={40}
              />
              <Tooltip
                content={(tooltipProps) => (
                  <ChartPanelTooltip {...tooltipProps} valueFormatter={formatter} />
                )}
                cursor={{ fill: 'var(--color-muted)', fillOpacity: 0.6 }}
              />
              <Bar dataKey='value' maxBarSize={24} name={title} radius={[4, 4, 0, 0]}>
                {data.map((point, index) => (
                  <Cell
                    key={point.label}
                    fill={index === lastIndex ? HIGHLIGHT_COLOR : MUTED_COLOR}
                  />
                ))}
                <LabelList
                  dataKey='value'
                  content={({ index, width, x, y }) =>
                    index === lastIndex ? (
                      <text
                        x={Number(x) + Number(width) / 2}
                        y={Number(y) - 8}
                        textAnchor='middle'
                        className='fill-foreground text-xs font-medium'
                      >
                        {formatCompact(Number(latest?.value ?? 0))}
                      </text>
                    ) : null
                  }
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanelFigure>
        <ChartPanelTable
          caption={`${title}: ${description}`}
          columns={[
            { key: 'label', label: 'Month' },
            { format: formatter, key: 'value', label: title },
          ]}
          rows={data}
        />
      </CardContent>
    </Card>
  )
}

export { ChartPanel4, exampleProps as chartPanel4ExampleProps, type ChartPanel4Props }
