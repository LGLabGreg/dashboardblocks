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
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface SignInDay {
  /** Blocked outright, e.g. by rate limits or a blocked IP. */
  blocked: number
  failed: number
  label: string
  succeeded: number
}

interface Security1Props {
  days: SignInDay[]
  description: string
  /** Share of active users with multi-factor authentication, 0–1. */
  mfaCoverage?: number
  title: string
}

const DAYS = [
  'Sep 13',
  'Sep 14',
  'Sep 15',
  'Sep 16',
  'Sep 17',
  'Sep 18',
  'Sep 19',
  'Sep 20',
  'Sep 21',
  'Sep 22',
  'Sep 23',
  'Sep 24',
  'Sep 25',
  'Sep 26',
]
const SUCCEEDED = [
  1_820, 910, 2_140, 2_260, 2_190, 2_230, 2_010, 980, 870, 2_310, 2_280, 2_350, 2_270,
  1_190,
]
const FAILED = [96, 51, 118, 104, 131, 99, 92, 48, 55, 121, 108, 116, 103, 64]
const BLOCKED = [12, 8, 15, 11, 9, 14, 188, 242, 31, 17, 12, 10, 13, 6]

const exampleProps: Security1Props = {
  days: DAYS.map((label, index) => ({
    blocked: BLOCKED[index],
    failed: FAILED[index],
    label,
    succeeded: SUCCEEDED[index],
  })),
  description: 'Sign-in attempts per day, last 14 days',
  mfaCoverage: 0.87,
  title: 'Sign-in activity',
}

const COLORS = {
  blocked: 'var(--destructive)',
  failed: 'color-mix(in oklab, var(--destructive) 40%, var(--card))',
  succeeded: 'color-mix(in oklab, var(--muted-foreground) 45%, var(--card))',
}

const Security1 = (props: Security1Props) => {
  const { days, description, mfaCoverage, title } = props
  const totals = days.reduce(
    (sum, day) => ({
      blocked: sum.blocked + day.blocked,
      failed: sum.failed + day.failed,
      succeeded: sum.succeeded + day.succeeded,
    }),
    { blocked: 0, failed: 0, succeeded: 0 },
  )
  const attempts = totals.succeeded + totals.failed + totals.blocked
  const failureRate = attempts > 0 ? (totals.failed + totals.blocked) / attempts : 0
  // A day with over three times the median blocked attempts looks like an attack.
  const sorted = [...days].map((day) => day.blocked).sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)] ?? 0
  const spikes = days.filter((day) => day.blocked > median * 3)

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <dl className='grid grid-cols-2 gap-4 @md:grid-cols-3'>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Failed or blocked</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {(failureRate * 100).toFixed(1)}%
            </dd>
            <dd className='text-muted-foreground text-xs tabular-nums'>
              {(totals.failed + totals.blocked).toLocaleString()} of{' '}
              {attempts.toLocaleString()}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Blocked</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {totals.blocked.toLocaleString()}
            </dd>
            <dd className='text-muted-foreground text-xs'>
              {spikes.length > 0
                ? `Spike on ${spikes.map((day) => day.label).join(' and ')}`
                : 'No unusual spikes'}
            </dd>
          </div>
          {mfaCoverage !== undefined && (
            <div className='col-span-2 flex flex-col gap-0.5 @md:col-span-1'>
              <dt className='text-muted-foreground text-xs'>Users with MFA</dt>
              <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
                {Math.round(mfaCoverage * 100)}%
              </dd>
            </div>
          )}
        </dl>
        <ChartPanelLegend
          items={[
            { color: COLORS.succeeded, label: 'Succeeded' },
            { color: COLORS.failed, label: 'Failed' },
            { color: COLORS.blocked, label: 'Blocked' },
          ]}
        />
        <ChartPanelFigure className='h-56'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={days} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid {...chartGridProps} />
              <XAxis
                {...chartAxisProps}
                dataKey='label'
                interval='preserveStartEnd'
                minTickGap={20}
              />
              <YAxis {...chartAxisProps} tickFormatter={formatCompact} width={40} />
              <Tooltip
                content={(tooltipProps) => <ChartPanelTooltip {...tooltipProps} />}
                cursor={{ fill: 'var(--color-muted)', fillOpacity: 0.5 }}
              />
              <Bar
                dataKey='succeeded'
                fill={COLORS.succeeded}
                name='Succeeded'
                stackId='sign-ins'
              />
              <Bar
                dataKey='failed'
                fill={COLORS.failed}
                name='Failed'
                stackId='sign-ins'
              />
              <Bar
                dataKey='blocked'
                fill={COLORS.blocked}
                name='Blocked'
                radius={[3, 3, 0, 0]}
                stackId='sign-ins'
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanelFigure>
        <ChartPanelTable
          caption={`${title}: ${description}.`}
          columns={[
            { key: 'label', label: 'Day' },
            { key: 'succeeded', label: 'Succeeded' },
            { key: 'failed', label: 'Failed' },
            { key: 'blocked', label: 'Blocked' },
          ]}
          rows={days}
        />
      </CardContent>
    </Card>
  )
}

export {
  Security1,
  exampleProps as security1ExampleProps,
  type Security1Props,
  type SignInDay,
}
