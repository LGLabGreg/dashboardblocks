'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  ChartPlaceholder,
  chartAxisProps,
  chartBarCursor,
  chartBarValueLabel,
  chartFadedColor,
  chartGridProps,
  chartReferenceLabel,
  chartReferenceProps,
  ChartTooltipContent,
  chartValueAxisWidth,
} from '@/registry/components/dashboardblocks/chart'
import {
  ChartPanelFigure,
  ChartPanelLegend,
  ChartPanelTable,
} from '@/registry/components/dashboardblocks/chart-panel'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import {
  formatCompact,
  formatNumber,
  formatPercent,
} from '@/registry/lib/dashboardblocks/format'
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface SignInDay {
  blocked: number
  failed: number
  label: string
  succeeded: number
}

interface Security1Props {
  /** Leave out, or pass none, to show the empty state. */
  days?: SignInDay[]
  description: string
  /** Share of active users with multi-factor authentication, 0–1. */
  mfaCoverage?: number
  status?: BlockStatus
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
  description: 'Failed and blocked sign-in attempts per day, over the last 14 days.',
  mfaCoverage: 0.87,
  title: 'Sign-in activity',
}

const BLOCKED_COLOR = 'var(--color-red-600)'
const FAILED_COLOR = chartFadedColor(BLOCKED_COLOR)

const SPIKE_MULTIPLIER = 3

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)] ?? 0
}

const Security1 = (props: Security1Props) => {
  const { days = [], description, mfaCoverage, status, title } = props
  const state = getBlockState(status, days)
  const totals = days.reduce(
    (sum, day) => ({
      blocked: sum.blocked + day.blocked,
      failed: sum.failed + day.failed,
      succeeded: sum.succeeded + day.succeeded,
    }),
    { blocked: 0, failed: 0, succeeded: 0 },
  )
  const attempts = totals.succeeded + totals.failed + totals.blocked
  const refused = totals.failed + totals.blocked
  const typicalBlocked = median(days.map((day) => day.blocked))
  const typicalRefused = median(days.map((day) => day.failed + day.blocked))
  const spikes = days.filter((day) => day.blocked > typicalBlocked * SPIKE_MULTIPLIER)
  const peakIndex = days.reduce(
    (best, day, index) => (day.blocked > (days[best]?.blocked ?? -1) ? index : best),
    0,
  )
  const spikeBlocked = spikes.reduce((sum, day) => sum + day.blocked, 0)

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <div className='flex flex-wrap items-end gap-x-10 gap-y-4 border-t pt-4'>
          <div className='flex flex-col gap-1'>
            <p className='text-muted-foreground text-sm'>Failed or blocked</p>
            <KPIValue
              value={attempts > 0 ? refused / attempts : 0}
              format={(value) =>
                formatPercent(value, {
                  maximumFractionDigits: 1,
                  minimumFractionDigits: 1,
                })
              }
            />
            <BlockReady className='text-sm'>
              <p className='text-muted-foreground text-sm tabular-nums'>
                {formatNumber(refused)} of {formatNumber(attempts)} attempts
              </p>
            </BlockReady>
          </div>
          {(!state || state === 'loading') && (
            <dl className='flex flex-wrap gap-x-10 gap-y-4'>
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>Blocked</dt>
                <dd>
                  <KPIValue
                    className='text-2xl'
                    value={totals.blocked}
                    format={(value) => formatNumber(value)}
                  />
                </dd>
              </div>
              {mfaCoverage !== undefined && (
                <div className='flex flex-col gap-1'>
                  <dt className='text-muted-foreground text-sm'>Users with MFA</dt>
                  <dd>
                    <KPIValue
                      className='text-2xl'
                      value={mfaCoverage}
                      format={(value) =>
                        formatPercent(value, { maximumFractionDigits: 0 })
                      }
                    />
                  </dd>
                </div>
              )}
            </dl>
          )}
        </div>
        <BlockReady className='text-sm'>
          <p className='text-sm text-pretty'>
            {spikes.length > 0 ? (
              <>
                <span className='font-medium text-red-700 dark:text-red-400'>
                  {formatNumber(spikeBlocked)} blocked
                </span>{' '}
                on {spikes.map((day) => day.label).join(' and ')},{' '}
                <span className='text-muted-foreground'>
                  against {formatNumber(typicalBlocked)} on a typical day.
                </span>
              </>
            ) : (
              <span className='text-muted-foreground'>
                No unusual spikes in blocked attempts.
              </span>
            )}
          </p>
        </BlockReady>
        {(!state || state === 'loading') && (
          <ChartPanelLegend
            items={[
              { color: FAILED_COLOR, label: 'Failed' },
              { color: BLOCKED_COLOR, label: 'Blocked' },
            ]}
          />
        )}
        {state ? (
          <ChartPlaceholder height={224} />
        ) : (
          <>
            <ChartPanelFigure className='h-56'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  aria-label={`${title} chart`}
                  data={days}
                  margin={{ top: 20, right: 8, bottom: 0, left: 0 }}
                >
                  <CartesianGrid {...chartGridProps} />
                  <XAxis
                    {...chartAxisProps}
                    dataKey='label'
                    interval='preserveStartEnd'
                    minTickGap={20}
                  />
                  <YAxis
                    {...chartAxisProps}
                    tickFormatter={formatCompact}
                    width={chartValueAxisWidth}
                  />
                  <Tooltip
                    content={(tooltipProps) => <ChartTooltipContent {...tooltipProps} />}
                    cursor={chartBarCursor}
                  />
                  <Bar
                    dataKey='failed'
                    fill={FAILED_COLOR}
                    maxBarSize={28}
                    name='Failed'
                    stackId='refused'
                  />
                  <Bar
                    dataKey='blocked'
                    fill={BLOCKED_COLOR}
                    maxBarSize={28}
                    name='Blocked'
                    radius={[4, 4, 0, 0]}
                    stackId='refused'
                  >
                    {spikes.length > 0 && (
                      <LabelList
                        dataKey='blocked'
                        content={chartBarValueLabel(
                          peakIndex,
                          (value) => `${formatNumber(value)} blocked`,
                        )}
                      />
                    )}
                  </Bar>
                  {typicalRefused > 0 && (
                    <ReferenceLine
                      {...chartReferenceProps}
                      y={typicalRefused}
                      label={{
                        ...chartReferenceLabel,
                        value: `typical ${formatNumber(typicalRefused)}`,
                        position: 'insideBottomLeft',
                        dy: -4,
                      }}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </ChartPanelFigure>
            <ChartPanelTable
              caption={`${title}: ${description}`}
              columns={[
                { key: 'label', label: 'Day' },
                { key: 'succeeded', label: 'Succeeded' },
                { key: 'failed', label: 'Failed' },
                { key: 'blocked', label: 'Blocked' },
              ]}
              rows={days}
            />
          </>
        )}
      </section>
    </BlockStateProvider>
  )
}

export {
  Security1,
  exampleProps as security1ExampleProps,
  type Security1Props,
  type SignInDay,
}
