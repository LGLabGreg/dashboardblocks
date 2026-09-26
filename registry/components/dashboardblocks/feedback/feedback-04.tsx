'use client'

import {
  ChartPanelFigure,
  ChartPanelLegend,
  ChartPanelTable,
  ChartPanelTooltip,
  chartAxisProps,
  chartGridProps,
} from '@/registry/components/dashboardblocks/chart-panel'
import {
  CartesianGrid,
  Line,
  LineChart,
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

interface CsatPeriod {
  label: string
  /** Survey responses in the period. */
  responses: number
  /** Responses rating 4 or 5 out of 5. */
  satisfied: number
}

interface Feedback4Props {
  description: string
  /** Oldest first. */
  periods: CsatPeriod[]
  /** The CSAT to stay above, 0–1. */
  target?: number
  title: string
}

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
  description: 'Share of support survey responses rating 4 or 5, weekly',
  periods: WEEKS.map((label, index) => ({
    label,
    responses: RESPONSES[index],
    satisfied: SATISFIED[index],
  })),
  target: 0.85,
  title: 'Customer satisfaction',
}

const percent = (value: number) => `${Math.round(value * 100)}%`

const Feedback4 = (props: Feedback4Props) => {
  const { description, periods, target, title } = props
  const rows = periods.map((period) => ({
    ...period,
    csat: period.responses > 0 ? period.satisfied / period.responses : 0,
  }))
  const latest = rows[rows.length - 1]
  const previous = rows[rows.length - 2]
  const change = latest && previous ? latest.csat - previous.csat : 0
  const responses = periods.reduce((sum, period) => sum + period.responses, 0)
  const low = Math.min(...rows.map((row) => row.csat), target ?? 1)
  const floor = Math.max(0, Math.floor((low - 0.05) * 20) / 20)
  // Round ticks: every 5% for a narrow range, every 10% otherwise.
  const step = 1 - floor <= 0.3 ? 0.05 : 0.1
  const ticks = Array.from(
    { length: Math.round((1 - floor) / step) + 1 },
    (_, index) => Math.round((floor + index * step) * 100) / 100,
  )

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <dl className='grid grid-cols-2 gap-4 @md:grid-cols-3'>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>
              CSAT, week of {latest?.label}
            </dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {percent(latest?.csat ?? 0)}
            </dd>
            <dd
              className={cn(
                'text-xs font-medium tabular-nums',
                change >= 0
                  ? 'text-green-700 dark:text-green-400'
                  : 'text-red-700 dark:text-red-400',
              )}
            >
              {change >= 0 ? '↑' : '↓'} {Math.abs(change * 100).toFixed(1)} pts on the
              week before
            </dd>
          </div>
          {target !== undefined && (
            <div className='flex flex-col gap-0.5'>
              <dt className='text-muted-foreground text-xs'>Target</dt>
              <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
                {percent(target)}
              </dd>
              <dd className='text-muted-foreground text-xs'>
                {rows.filter((row) => row.csat >= target).length} of {rows.length} weeks
                at or above
              </dd>
            </div>
          )}
          <div className='col-span-2 flex flex-col gap-0.5 @md:col-span-1'>
            <dt className='text-muted-foreground text-xs'>Responses</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {responses.toLocaleString()}
            </dd>
          </div>
        </dl>
        <ChartPanelLegend
          items={[
            { color: 'var(--chart-1)', label: 'CSAT', shape: 'line' },
            ...(target !== undefined
              ? [
                  {
                    color: 'var(--muted-foreground)',
                    label: 'Target',
                    shape: 'line' as const,
                  },
                ]
              : []),
          ]}
        />
        <ChartPanelFigure className='h-52'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
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
                width={52}
              />
              {target !== undefined && (
                <ReferenceLine
                  stroke='var(--color-muted-foreground)'
                  strokeDasharray='4 4'
                  y={target}
                />
              )}
              <Tooltip
                content={(tooltipProps) => (
                  <ChartPanelTooltip
                    {...tooltipProps}
                    valueFormatter={(value) => `${(value * 100).toFixed(1)}%`}
                  />
                )}
                cursor={{ stroke: 'var(--color-border)' }}
              />
              <Line
                activeDot={{ r: 4, stroke: 'var(--color-card)', strokeWidth: 2 }}
                dataKey='csat'
                dot={{ fill: 'var(--chart-1)', r: 2.5, strokeWidth: 0 }}
                name='CSAT'
                stroke='var(--chart-1)'
                strokeWidth={2}
                type='monotone'
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanelFigure>
        <ChartPanelTable
          caption={`${title}: ${description}.${target !== undefined ? ` Target ${percent(target)}.` : ''}`}
          columns={[
            { key: 'label', label: 'Week of' },
            { key: 'csat', label: 'CSAT' },
            { key: 'responses', label: 'Responses' },
          ]}
          rows={rows.map((row) => ({
            csat: `${(row.csat * 100).toFixed(1)}%`,
            label: row.label,
            responses: row.responses.toLocaleString(),
          }))}
        />
      </CardContent>
    </Card>
  )
}

export {
  Feedback4,
  exampleProps as feedback4ExampleProps,
  type CsatPeriod,
  type Feedback4Props,
}
