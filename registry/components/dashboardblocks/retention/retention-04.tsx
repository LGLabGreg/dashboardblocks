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
import {
  type GrowthAccountingInput,
  getQuickRatio,
  growthColors,
} from '@/registry/components/dashboardblocks/retention'
import {
  Bar,
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

interface GrowthAccountingPeriod extends GrowthAccountingInput {
  /** e.g. "Sep 21". */
  label: string
}

interface Retention4Props {
  description: string
  /** Oldest first. */
  periods: GrowthAccountingPeriod[]
  /** The period each row covers. @default 'week' */
  periodName?: string
  title: string
  /** @default 'users' */
  unit?: string
}

const WEEK_ENDINGS = [
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

const exampleProps: Retention4Props = {
  description: 'Weekly active users gained and lost, last 12 weeks',
  periods: WEEK_ENDINGS.map((label, week) => ({
    churned: Math.round(1_020 + week * 18 + Math.sin(week * 1.3) * 90),
    label,
    new: Math.round(1_180 + week * 34 + Math.sin(week / 1.7) * 160),
    resurrected: Math.round(310 + week * 6 + Math.cos(week * 0.9) * 45),
  })),
  title: 'Growth accounting',
  unit: 'users',
}

const formatSigned = (value: number) =>
  `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(Math.round(value)).toLocaleString()}`

const formatRatio = (ratio: number) =>
  Number.isFinite(ratio) ? ratio.toFixed(2) : 'No churn'

const Retention4 = (props: Retention4Props) => {
  const { description, periodName = 'week', periods, title, unit = 'users' } = props
  const rows = periods.map((period) => ({
    churned: -period.churned,
    label: period.label,
    net: period.new + period.resurrected - period.churned,
    new: period.new,
    resurrected: period.resurrected,
  }))
  const latest = periods[periods.length - 1]
  const latestRow = rows[rows.length - 1]
  const ratio = latest ? getQuickRatio(latest) : 0
  const netTotal = rows.reduce((sum, row) => sum + row.net, 0)

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
              Quick ratio, {latest?.label}
            </dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {formatRatio(ratio)}
            </dd>
            <dd className='text-muted-foreground text-xs'>
              {Number.isFinite(ratio)
                ? `${formatRatio(ratio)} ${unit} gained for each one lost`
                : `No ${unit} lost`}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Net change, {latest?.label}</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {formatSigned(latestRow?.net ?? 0)}
            </dd>
          </div>
          <div className='col-span-2 flex flex-col gap-0.5 @md:col-span-1'>
            <dt className='text-muted-foreground text-xs'>
              Net change, {periods.length} {periodName}s
            </dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {formatSigned(netTotal)}
            </dd>
          </div>
        </dl>
        <ChartPanelLegend
          items={[
            { color: growthColors.new, label: 'New' },
            { color: growthColors.resurrected, label: 'Resurrected' },
            { color: growthColors.churned, label: 'Churned' },
            { color: 'var(--foreground)', label: 'Net change', shape: 'line' },
          ]}
        />
        <ChartPanelFigure className='h-60'>
          <ResponsiveContainer width='100%' height='100%'>
            <ComposedChart
              data={rows}
              margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
              stackOffset='sign'
            >
              <CartesianGrid {...chartGridProps} />
              <XAxis
                {...chartAxisProps}
                dataKey='label'
                interval='preserveStartEnd'
                minTickGap={16}
              />
              <YAxis
                {...chartAxisProps}
                tickFormatter={(value: number) =>
                  value < 0 ? `−${formatCompact(-value)}` : formatCompact(value)
                }
                width={44}
              />
              <ReferenceLine y={0} stroke='var(--color-border)' />
              <Tooltip
                content={(tooltipProps) => (
                  <ChartPanelTooltip {...tooltipProps} valueFormatter={formatSigned} />
                )}
                cursor={{ fill: 'var(--color-muted)', fillOpacity: 0.5 }}
              />
              <Bar dataKey='new' fill={growthColors.new} name='New' stackId='users' />
              <Bar
                dataKey='resurrected'
                fill={growthColors.resurrected}
                name='Resurrected'
                radius={[3, 3, 0, 0]}
                stackId='users'
              />
              <Bar
                dataKey='churned'
                fill={growthColors.churned}
                name='Churned'
                radius={[0, 0, 3, 3]}
                stackId='users'
              />
              <Line
                activeDot={{ r: 4, stroke: 'var(--color-card)', strokeWidth: 2 }}
                dataKey='net'
                dot={{ fill: 'var(--color-foreground)', r: 2.5, strokeWidth: 0 }}
                name='Net change'
                stroke='var(--color-foreground)'
                strokeWidth={2}
                type='linear'
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartPanelFigure>
        <ChartPanelTable
          caption={`${title}: ${description}. Net change is new plus resurrected minus churned.`}
          columns={[
            {
              key: 'label',
              label: `${periodName.charAt(0).toUpperCase()}${periodName.slice(1)} ending`,
            },
            { format: formatSigned, key: 'new', label: 'New' },
            { format: formatSigned, key: 'resurrected', label: 'Resurrected' },
            { format: formatSigned, key: 'churned', label: 'Churned' },
            { format: formatSigned, key: 'net', label: 'Net change' },
            { key: 'ratio', label: 'Quick ratio' },
          ]}
          rows={rows.map((row, index) => ({
            ...row,
            ratio: formatRatio(getQuickRatio(periods[index])),
          }))}
        />
      </CardContent>
    </Card>
  )
}

export {
  Retention4,
  exampleProps as retention4ExampleProps,
  type GrowthAccountingPeriod,
  type Retention4Props,
}
