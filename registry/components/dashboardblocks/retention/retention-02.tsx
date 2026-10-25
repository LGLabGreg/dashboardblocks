'use client'

import {
  BlockStateProvider,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  ChartPlaceholder,
  ChartTooltipContent,
  chartActiveDot,
  chartAxisProps,
  chartFadedColor,
  chartGridProps,
  chartLineCursor,
  chartReferenceLabel,
  chartReferenceProps,
  chartValueAxisWidth,
  useChartId,
} from '@/registry/components/dashboardblocks/chart'
import {
  ChartPanelFigure,
  ChartPanelLegend,
  ChartPanelTable,
} from '@/registry/components/dashboardblocks/chart-panel'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { Link } from '@/registry/components/dashboardblocks/link'
import {
  RetentionChange,
  type RetentionCohort,
  getAverageRetention,
  getPlateau,
  getRetentionRates,
} from '@/registry/components/dashboardblocks/retention'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatPercent } from '@/registry/lib/dashboardblocks/format'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { buttonVariants } from '@/components/ui/button'

import { cn } from '@/lib/utils'

interface Retention2Props extends BlockStateProps {
  /** Oldest first. Leave out, or pass none, to show the empty state. */
  cohorts?: RetentionCohort[]
  description: string
  highlight?: number
  /** Where the chart opens in full, such as the explorer it was saved from. */
  link?: { href: string; label: string }
  /** @default 'Month' */
  periodName?: string
  title: string
}

const COHORT_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
const COHORT_SIZES = [1_184, 1_246, 1_402, 1_318, 1_527, 1_611, 1_489, 1_702]

const exampleProps: Retention2Props = {
  cohorts: COHORT_NAMES.map((name, index) => {
    const size = COHORT_SIZES[index]
    const floor = index < 4 ? 0.2 + index * 0.006 : 0.27 + (index - 4) * 0.015
    return {
      label: `${name} 2026`,
      retained: Array.from({ length: COHORT_NAMES.length + 1 - index }, (_, month) => {
        if (month === 0) return size
        const rate = floor + (0.6 - floor) * Math.exp(-(month - 1) / 1.3)
        return Math.round(size * (rate + Math.sin(index * 1.9 + month) * 0.01))
      }),
      size,
    }
  }),
  description:
    'Share of each monthly signup cohort still active, by months since signup.',
  highlight: 4,
  link: { href: '/dashboard/retention', label: 'Open in Retention' },
  periodName: 'Month',
  title: 'Retention curves',
}

const Retention2 = (props: Retention2Props) => {
  const {
    cohorts = [],
    description,
    periodName = 'Month',
    errorMessage,
    link,
    status,
    title,
  } = props
  const state = getBlockState(status, cohorts)
  let fallback = cohorts.length - 1
  while (fallback > 0 && cohorts[fallback].retained.length < 2) fallback--
  const highlight = props.highlight ?? Math.max(0, fallback)
  const selected = cohorts[highlight]
  const averages = getAverageRetention(cohorts)
  const unit = periodName.toLowerCase()

  const rates = cohorts.map(getRetentionRates)
  const rows = averages.map((average, period) => {
    const row: Record<string, number | null> = { average, period }
    rates.forEach((cohortRates, index) => {
      row[`c${index}`] = cohortRates[period] ?? null
    })
    return row
  })

  const latest = Math.max(0, (selected?.retained.length ?? 1) - 1)
  const selectedRate = rates[highlight]?.[latest] ?? 0
  const averageRate = averages[latest] ?? 0
  const plateau = getPlateau(averages)
  const format = (value: number) => formatPercent(value, { maximumFractionDigits: 0 })
  const gradientId = useChartId()
  const otherCohortColor = chartFadedColor('var(--color-muted-foreground)')

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </div>
          {link && (
            <Link
              href={link.href}
              className={cn(
                buttonVariants({ size: 'xs', variant: 'outline' }),
                'group/open shrink-0',
              )}
            >
              {link.label}
              <IconPlaceholder
                lucide='ArrowRightIcon'
                tabler='IconArrowRight'
                hugeicons='ArrowRight01Icon'
                phosphor='ArrowRightIcon'
                remixicon='RiArrowRightLine'
                className='transition-transform group-hover/open:translate-x-0.5 motion-reduce:transition-none'
                data-icon='inline-end'
                aria-hidden
              />
            </Link>
          )}
        </header>
        <dl className='grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-4 @lg:grid-cols-3 @lg:items-start'>
          <div className='col-span-2 flex flex-col gap-1 @lg:col-span-1'>
            <dt className='text-muted-foreground text-sm'>
              {selected && !state
                ? `${selected.label}, ${unit} ${latest}`
                : 'Latest cohort'}
            </dt>
            <dd>
              <KPIValue value={selected ? selectedRate : undefined} format={format} />
            </dd>
            <dd>
              <RetentionChange
                difference={selectedRate - averageRate}
                versus='against the average'
              />
            </dd>
          </div>
          {state === 'loading' && (
            <>
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>Average</dt>
                <dd>
                  <KPIValue className='text-2xl' value={undefined} />
                </dd>
              </div>
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>Levels off</dt>
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
                  Average, {unit} {latest}
                </dt>
                <dd className='text-2xl font-light tracking-tight tabular-nums'>
                  {format(averageRate)}
                </dd>
              </div>
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>Levels off</dt>
                <dd className='text-2xl font-light tracking-tight tabular-nums'>
                  {plateau ? `${periodName} ${plateau.period}` : 'Not yet'}
                </dd>
                {plateau && (
                  <dd className='text-muted-foreground text-xs'>
                    at about {format(plateau.rate)} retained
                  </dd>
                )}
              </div>
            </>
          )}
        </dl>
        {(!state || state === 'loading') && (
          <ChartPanelLegend
            items={[
              {
                color: 'var(--color-chart-2)',
                label: selected?.label ?? '',
                shape: 'line',
              },
              { color: 'var(--color-foreground)', label: 'Average', shape: 'line' },
              {
                color: otherCohortColor,
                label: 'Other cohorts',
                shape: 'line',
              },
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
                >
                  <defs>
                    <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
                      <stop
                        offset='0%'
                        stopColor='var(--color-chart-2)'
                        stopOpacity={0.3}
                      />
                      <stop
                        offset='100%'
                        stopColor='var(--color-chart-2)'
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...chartGridProps} />
                  <XAxis
                    {...chartAxisProps}
                    dataKey='period'
                    tickFormatter={(value: number) =>
                      `${periodName.charAt(0).toUpperCase()}${value}`
                    }
                  />
                  <YAxis
                    {...chartAxisProps}
                    domain={[0, 1]}
                    tickFormatter={format}
                    ticks={[0, 0.25, 0.5, 0.75, 1]}
                    width={chartValueAxisWidth}
                  />
                  {plateau && (
                    <ReferenceLine
                      {...chartReferenceProps}
                      x={plateau.period}
                      label={{
                        ...chartReferenceLabel,
                        position: 'insideTopRight',
                        value: 'Levels off',
                      }}
                    />
                  )}
                  <Tooltip
                    content={({ active, label, payload }) => (
                      <ChartTooltipContent
                        active={active}
                        formatLabel={(value) => `${periodName} ${value}`}
                        label={label}
                        payload={payload?.filter(
                          (item) =>
                            item.dataKey === 'average' ||
                            item.dataKey === `c${highlight}`,
                        )}
                        valueFormatter={(value) => formatPercent(value)}
                      />
                    )}
                    cursor={chartLineCursor}
                  />
                  {cohorts.map((cohort, index) =>
                    index === highlight ? null : (
                      <Line
                        key={cohort.label}
                        activeDot={false}
                        dataKey={`c${index}`}
                        dot={false}
                        name={cohort.label}
                        stroke={otherCohortColor}
                        strokeWidth={1}
                        type='monotone'
                      />
                    ),
                  )}
                  <Line
                    activeDot={chartActiveDot}
                    dataKey='average'
                    dot={false}
                    name='Average'
                    stroke='var(--color-foreground)'
                    strokeDasharray='4 3'
                    strokeWidth={2}
                    type='monotone'
                  />
                  <Area
                    activeDot={chartActiveDot}
                    dataKey={`c${highlight}`}
                    dot={{ fill: 'var(--color-chart-2)', r: 2.5, strokeWidth: 0 }}
                    fill={`url(#${gradientId})`}
                    fillOpacity={1}
                    name={selected?.label}
                    stroke='var(--color-chart-2)'
                    strokeLinecap='round'
                    strokeWidth={2.5}
                    type='monotone'
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartPanelFigure>
            <ChartPanelTable
              caption={`${title}: ${description} The average is weighted by cohort size.`}
              columns={[
                { key: 'label', label: periodName },
                { format, key: 'average', label: 'Average' },
                ...cohorts.map((cohort, index) => ({
                  format,
                  key: `c${index}`,
                  label: cohort.label,
                })),
              ]}
              rows={rows.map((row) => {
                const cells: Record<string, number | string> = {
                  label: `${periodName} ${row.period}`,
                }
                for (const [key, value] of Object.entries(row)) {
                  if (key !== 'period') cells[key] = value ?? '—'
                }
                return cells
              })}
            />
          </>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Retention2, exampleProps as retention2ExampleProps, type Retention2Props }
