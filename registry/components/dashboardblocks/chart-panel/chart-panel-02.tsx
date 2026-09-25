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
import { useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Metric {
  formatter?: ChartValueFormatter
  goodDirection?: 'up' | 'down'
  key: string
  label: string
  total: number
  trend: number
}

interface ChartPanel2Props {
  data: Array<Record<string, number | string> & { label: string }>
  metrics: Metric[]
  title: string
}

const exampleProps: ChartPanel2Props = {
  data: Array.from({ length: 14 }, (_, day) => {
    const weekend = day % 7 > 4
    const visitors = Math.round(
      1650 + day * 22 + Math.sin(day / 1.6) * 260 - (weekend ? 420 : 0),
    )
    return {
      bounceRate: Math.round(
        44 - day * 0.3 + Math.cos(day / 1.8) * 3 + (weekend ? 4 : 0),
      ),
      label: `Sep ${day + 17}`,
      pageviews: Math.round(visitors * (3.1 + Math.sin(day / 3) * 0.3)),
      visitors,
    }
  }),
  metrics: [
    { key: 'visitors', label: 'Visitors', total: 24_318, trend: 12.4 },
    { key: 'pageviews', label: 'Page views', total: 81_204, trend: 8.1 },
    {
      formatter: (value) => `${value}%`,
      goodDirection: 'down',
      key: 'bounceRate',
      label: 'Bounce rate',
      total: 41,
      trend: -3.2,
    },
  ],
  title: 'Traffic',
}

const SERIES_COLOR = 'var(--chart-1)'

const ChartPanel2 = (props: ChartPanel2Props) => {
  const { data, metrics, title } = props
  const [active, setActive] = useState(metrics[0]?.key)

  return (
    <Card className='gap-0 py-0'>
      <Tabs
        value={active}
        onValueChange={(value) => setActive(String(value))}
        className='gap-0'
      >
        <TabsList
          aria-label={title}
          className='h-auto w-full items-stretch group-data-horizontal/tabs:h-auto gap-0 rounded-none border-b bg-transparent p-0'
        >
          {metrics.map((metric) => {
            const format = metric.formatter ?? formatCompact
            return (
              <TabsTrigger
                key={metric.key}
                value={metric.key}
                className='hover:bg-muted/40 data-active:bg-muted/60 dark:data-active:bg-muted/60 h-auto flex-col items-start gap-1 rounded-none border-0 border-r px-6 py-4 text-left last:border-r-0 data-active:shadow-none dark:data-active:border-transparent'
              >
                <span className='text-muted-foreground text-xs font-normal'>
                  {metric.label}
                </span>
                <span className='text-foreground text-2xl font-semibold tracking-tight'>
                  {format(metric.total)}
                </span>
                <Trend
                  className='text-xs'
                  goodDirection={metric.goodDirection}
                  trend={metric.trend}
                  trendIcon='arrow'
                />
              </TabsTrigger>
            )
          })}
        </TabsList>
        {metrics.map((metric) => {
          const format = metric.formatter ?? ((value: number) => value.toLocaleString())
          return (
            <TabsContent key={metric.key} value={metric.key} className='px-6 pt-6 pb-4'>
              <ChartPanelFigure className='h-56'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart
                    data={data}
                    margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                  >
                    <CartesianGrid {...chartGridProps} />
                    <XAxis
                      {...chartAxisProps}
                      dataKey='label'
                      interval='preserveStartEnd'
                      minTickGap={40}
                    />
                    <YAxis
                      {...chartAxisProps}
                      tickFormatter={(value: number) =>
                        metric.formatter ? metric.formatter(value) : formatCompact(value)
                      }
                      width={40}
                    />
                    <Tooltip
                      content={(tooltipProps) => (
                        <ChartPanelTooltip {...tooltipProps} valueFormatter={format} />
                      )}
                      cursor={{ stroke: 'var(--color-border)' }}
                    />
                    <Area
                      activeDot={{ r: 4, stroke: 'var(--color-card)', strokeWidth: 2 }}
                      dataKey={metric.key}
                      fill={SERIES_COLOR}
                      fillOpacity={0.1}
                      name={metric.label}
                      stroke={SERIES_COLOR}
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      type='monotone'
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartPanelFigure>
              <ChartPanelTable
                caption={`${title}: ${metric.label} by day`}
                columns={[
                  { key: 'label', label: 'Day' },
                  { format, key: metric.key, label: metric.label },
                ]}
                rows={data}
              />
            </TabsContent>
          )
        })}
      </Tabs>
    </Card>
  )
}

export { ChartPanel2, exampleProps as chartPanel2ExampleProps, type ChartPanel2Props }
