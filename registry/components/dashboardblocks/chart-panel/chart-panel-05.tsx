'use client'

import {
  ChartPanelKey,
  ChartPanelTooltip,
  type ChartValueFormatter,
  formatCompact,
} from '@/registry/components/dashboardblocks/chart-panel'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Segment {
  color: string
  label: string
  value: number
}

interface ChartPanel5Props {
  description: string
  formatter?: ChartValueFormatter
  segments: Segment[]
  title: string
  totalLabel?: string
}

const exampleProps: ChartPanel5Props = {
  description: 'Visitors by source, last 30 days',
  segments: [
    { color: 'var(--chart-1)', label: 'Organic search', value: 38_420 },
    { color: 'var(--chart-2)', label: 'Direct', value: 21_760 },
    { color: 'var(--chart-3)', label: 'Social', value: 12_180 },
    {
      color: 'color-mix(in oklab, var(--muted-foreground) 35%, transparent)',
      label: 'Other',
      value: 6_940,
    },
  ],
  title: 'Traffic sources',
  totalLabel: 'Visitors',
}

const ChartPanel5 = (props: ChartPanel5Props) => {
  const {
    description,
    formatter = (value) => value.toLocaleString(),
    segments,
    title,
    totalLabel = 'Total',
  } = props
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  const percent = (value: number) => (total === 0 ? 0 : (value / total) * 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col items-center gap-6 sm:flex-row'>
        <div className='relative size-40 shrink-0'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Tooltip
                content={(tooltipProps) => (
                  <ChartPanelTooltip {...tooltipProps} valueFormatter={formatter} />
                )}
              />
              <Pie
                cornerRadius={3}
                data={segments}
                dataKey='value'
                innerRadius='72%'
                nameKey='label'
                outerRadius='100%'
                startAngle={90}
                endAngle={-270}
                stroke='var(--color-card)'
                strokeWidth={2}
              >
                {segments.map((segment) => (
                  <Cell key={segment.label} fill={segment.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center'>
            <span className='text-xl font-semibold tracking-tight'>
              {formatCompact(total)}
            </span>
            <span className='text-muted-foreground text-xs'>{totalLabel}</span>
          </div>
        </div>
        <table className='w-full text-sm'>
          <caption className='sr-only'>{`${title}: ${description}`}</caption>
          <thead className='sr-only'>
            <tr>
              <th scope='col'>Source</th>
              <th scope='col'>{totalLabel}</th>
              <th scope='col'>Share</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((segment) => (
              <tr key={segment.label} className='border-b last:border-b-0'>
                <th scope='row' className='py-2 pr-3 text-left font-normal'>
                  <span className='flex items-center gap-2'>
                    <ChartPanelKey color={segment.color} />
                    {segment.label}
                  </span>
                </th>
                <td className='py-2 pr-3 text-right font-medium tabular-nums'>
                  {formatter(segment.value)}
                </td>
                <td className='text-muted-foreground w-12 py-2 text-right tabular-nums'>
                  {percent(segment.value).toFixed(0)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

export { ChartPanel5, exampleProps as chartPanel5ExampleProps, type ChartPanel5Props }
