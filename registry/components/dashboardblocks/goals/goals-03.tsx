'use client'

import {
  ChartPanelFigure,
  ChartPanelTable,
  ChartPanelTooltip,
  chartAxisProps,
  chartGridProps,
  formatCompact,
} from '@/registry/components/dashboardblocks/chart-panel'
import { PaceBadge, getPace } from '@/registry/components/dashboardblocks/goals'
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
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Goals3Props {
  /** Daily values so far, oldest first. The chart accumulates them. */
  daily: number[]
  description: string
  /** Day labels for the whole period, including days still to come. */
  days: string[]
  formatter?: (value: number) => string
  target: number
  title: string
}

const SEPTEMBER = Array.from({ length: 30 }, (_, day) => `Sep ${day + 1}`)

const exampleProps: Goals3Props = {
  daily: Array.from({ length: 25 }, (_, day) =>
    Math.round(1_500 + day * 14 + Math.sin(day / 2.3) * 260 - (day % 7 > 4 ? 380 : 0)),
  ),
  description: 'Cumulative revenue this month, projected at the current daily rate',
  days: SEPTEMBER,
  formatter: (value) => `$${Math.round(value).toLocaleString('en-US')}`,
  target: 48_000,
  title: 'September revenue goal',
}

const ACTUAL_COLOR = 'var(--chart-1)'
const PROJECTED_COLOR = 'color-mix(in oklab, var(--chart-1) 55%, var(--card))'
const TARGET_COLOR = 'var(--color-muted-foreground)'

function LegendLine({ color, dash }: { color: string; dash?: string }) {
  return (
    <svg aria-hidden width='16' height='2' className='shrink-0 overflow-visible'>
      <line
        x1='0'
        y1='1'
        x2='16'
        y2='1'
        stroke={color}
        strokeWidth='2'
        strokeDasharray={dash}
      />
    </svg>
  )
}

const Goals3 = (props: Goals3Props) => {
  const {
    daily,
    description,
    days,
    formatter = (value) => Math.round(value).toLocaleString(),
    target,
    title,
  } = props

  const actual = daily.map((_, index) =>
    daily.slice(0, index + 1).reduce((sum, value) => sum + value, 0),
  )
  const current = actual[actual.length - 1] ?? 0
  const pace = getPace({ current, elapsed: daily.length / days.length, target })
  const rate = daily.length > 0 ? current / daily.length : 0
  const rows = days.map((label, index) => {
    const isActual = index < actual.length
    // The projection starts at the last actual point so the lines join.
    const isProjected = index >= actual.length - 1
    return {
      actual: isActual ? actual[index] : null,
      label,
      projected: isProjected
        ? Math.round(current + rate * (index - (actual.length - 1)))
        : null,
    }
  })
  const projected = rows[rows.length - 1]?.projected ?? current
  // Leave room above the higher of the target and the projection.
  const step = 10 ** Math.floor(Math.log10(Math.max(target, projected, 1)))
  const yMax = Math.ceil((Math.max(target, projected) * 1.08) / step) * step

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <PaceBadge status={pace.status} />
        </CardAction>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <dl className='grid grid-cols-2 gap-4 @md:grid-cols-3'>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>So far</dt>
            <dd className='text-2xl font-semibold tracking-tight'>
              {formatter(current)}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Projected</dt>
            <dd className='text-2xl font-semibold tracking-tight'>
              {formatter(projected)}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Target</dt>
            <dd className='text-2xl font-semibold tracking-tight'>{formatter(target)}</dd>
          </div>
        </dl>
        <ul className='text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs'>
          <li className='flex items-center gap-1.5'>
            <LegendLine color={ACTUAL_COLOR} />
            Actual
          </li>
          <li className='flex items-center gap-1.5'>
            <LegendLine color={PROJECTED_COLOR} dash='4 3' />
            Projected
          </li>
          <li className='flex items-center gap-1.5'>
            <LegendLine color={TARGET_COLOR} dash='2 3' />
            Target
          </li>
        </ul>
        <ChartPanelFigure className='h-56'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid {...chartGridProps} />
              <XAxis
                {...chartAxisProps}
                dataKey='label'
                interval='preserveStartEnd'
                minTickGap={40}
              />
              <YAxis
                {...chartAxisProps}
                domain={[0, yMax]}
                tickFormatter={(value: number) => formatCompact(value)}
                width={40}
              />
              <ReferenceLine
                y={target}
                stroke={TARGET_COLOR}
                strokeDasharray='2 3'
                strokeWidth={1.5}
              />
              <Tooltip
                content={(tooltipProps) => (
                  <ChartPanelTooltip {...tooltipProps} valueFormatter={formatter} />
                )}
                cursor={{ stroke: 'var(--color-border)' }}
              />
              <Line
                activeDot={{ r: 4, stroke: 'var(--color-card)', strokeWidth: 2 }}
                connectNulls={false}
                dataKey='projected'
                dot={false}
                name='Projected'
                stroke={PROJECTED_COLOR}
                strokeDasharray='4 3'
                strokeWidth={2}
                type='linear'
              />
              <Line
                activeDot={{ r: 4, stroke: 'var(--color-card)', strokeWidth: 2 }}
                connectNulls={false}
                dataKey='actual'
                dot={false}
                name='Actual'
                stroke={ACTUAL_COLOR}
                strokeLinecap='round'
                strokeWidth={2}
                type='monotone'
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanelFigure>
        <ChartPanelTable
          caption={`${title}: ${description}. Target ${formatter(target)}.`}
          columns={[
            { key: 'label', label: 'Day' },
            { format: formatter, key: 'actual', label: 'Actual' },
            { format: formatter, key: 'projected', label: 'Projected' },
          ]}
          rows={rows.map((row) => ({
            actual: row.actual ?? '—',
            label: row.label,
            projected: row.projected ?? '—',
          }))}
        />
      </CardContent>
    </Card>
  )
}

export { Goals3, exampleProps as goals3ExampleProps, type Goals3Props }
