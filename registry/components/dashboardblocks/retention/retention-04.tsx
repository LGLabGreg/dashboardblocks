'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  ChartPlaceholder,
  ChartTooltipContent,
  chartActiveDot,
  chartAxisProps,
  chartBarCursor,
  chartGridProps,
  chartValueAxisWidth,
} from '@/registry/components/dashboardblocks/chart'
import {
  ChartPanelFigure,
  ChartPanelLegend,
  ChartPanelTable,
} from '@/registry/components/dashboardblocks/chart-panel'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import {
  type GrowthAccountingInput,
  getQuickRatio,
  growthColors,
} from '@/registry/components/dashboardblocks/retention'
import {
  formatCompact,
  formatNumber,
  formatSigned,
} from '@/registry/lib/dashboardblocks/format'
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

interface GrowthAccountingPeriod extends GrowthAccountingInput {
  label: string
}

interface Retention4Props {
  description: string
  /** Oldest first. Leave out, or pass none, to show the empty state. */
  periods?: GrowthAccountingPeriod[]
  periodName?: string
  status?: BlockStatus
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
  description: 'Weekly active users gained and lost, last 12 weeks.',
  periods: WEEK_ENDINGS.map((label, week) => ({
    churned: Math.round(1_020 + week * 18 + Math.sin(week * 1.3) * 90),
    label,
    new: Math.round(1_180 + week * 34 + Math.sin(week / 1.7) * 160),
    resurrected: Math.round(310 + week * 6 + Math.cos(week * 0.9) * 45),
  })),
  title: 'Growth accounting',
  unit: 'users',
}

const formatChange = (value: number) =>
  formatSigned(Math.round(value), (count) => formatNumber(count))

const formatRatio = (ratio: number) =>
  Number.isFinite(ratio)
    ? formatNumber(ratio, { maximumFractionDigits: 2, minimumFractionDigits: 2 })
    : 'No churn'

const Retention4 = (props: Retention4Props) => {
  const {
    description,
    periodName = 'week',
    periods = [],
    status,
    title,
    unit = 'users',
  } = props
  const state = getBlockState(status, periods.length === 0)
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
    <BlockStateProvider status={status} empty={periods.length === 0}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <dl className='grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-4 @lg:grid-cols-3 @lg:items-start'>
          <div className='col-span-2 flex flex-col gap-1 @lg:col-span-1'>
            <dt className='text-muted-foreground text-sm'>
              {latest ? `Quick ratio, ${latest.label}` : 'Quick ratio'}
            </dt>
            <dd>
              <KPIValue value={latest ? ratio : undefined} format={formatRatio} />
            </dd>
            {(!state || state === 'loading') && (
              <dd className='text-muted-foreground text-xs'>
                <BlockReady>
                  {Number.isFinite(ratio)
                    ? `${formatRatio(ratio)} ${unit} gained for each one lost`
                    : `No ${unit} lost`}
                </BlockReady>
              </dd>
            )}
          </div>
          {state === 'loading' && (
            <>
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>Net change</dt>
                <dd>
                  <KPIValue className='text-2xl' value={undefined} />
                </dd>
              </div>
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>
                  Net change, {periodName}s
                </dt>
                <dd>
                  <KPIValue className='text-2xl' value={undefined} />
                </dd>
              </div>
            </>
          )}
          {!state && (
            <>
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>
                  Net change, {latest?.label}
                </dt>
                <dd className='text-2xl font-light tracking-tight tabular-nums'>
                  {formatChange(latestRow?.net ?? 0)}
                </dd>
              </div>
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>
                  Net change, {periods.length} {periodName}s
                </dt>
                <dd className='text-2xl font-light tracking-tight tabular-nums'>
                  {formatChange(netTotal)}
                </dd>
              </div>
            </>
          )}
        </dl>
        {(!state || state === 'loading') && (
          <ChartPanelLegend
            items={[
              { color: growthColors.new, label: 'New' },
              { color: growthColors.resurrected, label: 'Resurrected' },
              { color: growthColors.churned, label: 'Churned' },
              { color: 'var(--color-foreground)', label: 'Net change', shape: 'line' },
            ]}
          />
        )}
        {state ? (
          <ChartPlaceholder height={240} />
        ) : (
          <>
            <ChartPanelFigure className='h-60'>
              <ResponsiveContainer width='100%' height='100%'>
                <ComposedChart
                  aria-label={title}
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
                      value < 0
                        ? formatSigned(value, formatCompact)
                        : formatCompact(value)
                    }
                    width={chartValueAxisWidth}
                  />
                  <ReferenceLine y={0} stroke='var(--color-border)' />
                  <Tooltip
                    content={(tooltipProps) => (
                      <ChartTooltipContent
                        {...tooltipProps}
                        valueFormatter={formatChange}
                      />
                    )}
                    cursor={chartBarCursor}
                  />
                  <Bar dataKey='new' fill={growthColors.new} name='New' stackId='users' />
                  <Bar
                    dataKey='resurrected'
                    fill={growthColors.resurrected}
                    name='Resurrected'
                    radius={[4, 4, 0, 0]}
                    stackId='users'
                  />
                  <Bar
                    dataKey='churned'
                    fill={growthColors.churned}
                    name='Churned'
                    radius={[0, 0, 4, 4]}
                    stackId='users'
                  />
                  <Line
                    activeDot={chartActiveDot}
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
              caption={`${title}: ${description} Net change is new plus resurrected minus churned.`}
              columns={[
                {
                  key: 'label',
                  label: `${periodName.charAt(0).toUpperCase()}${periodName.slice(1)} ending`,
                },
                { format: formatChange, key: 'new', label: 'New' },
                { format: formatChange, key: 'resurrected', label: 'Resurrected' },
                { format: formatChange, key: 'churned', label: 'Churned' },
                { format: formatChange, key: 'net', label: 'Net change' },
                { key: 'ratio', label: 'Quick ratio' },
              ]}
              rows={rows.map((row, index) => ({
                ...row,
                ratio: formatRatio(getQuickRatio(periods[index])),
              }))}
            />
          </>
        )}
      </section>
    </BlockStateProvider>
  )
}

export {
  Retention4,
  exampleProps as retention4ExampleProps,
  type GrowthAccountingPeriod,
  type Retention4Props,
}
