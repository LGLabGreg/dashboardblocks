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
  RetentionChange,
  type RetentionCohort,
  formatRetention,
  getAverageRetention,
  getPlateau,
  getRetentionRates,
} from '@/registry/components/dashboardblocks/retention'
import {
  CartesianGrid,
  Line,
  LineChart,
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

interface Retention2Props {
  /** Oldest first. `retained[0]` is period 0, usually the whole cohort. */
  cohorts: RetentionCohort[]
  description: string
  /**
   * The cohort to highlight against the average. Defaults to the newest
   * cohort with at least two periods.
   */
  highlight?: number
  /** @default 'Month' */
  periodName?: string
  title: string
}

const COHORT_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
const COHORT_SIZES = [1_184, 1_246, 1_402, 1_318, 1_527, 1_611, 1_489, 1_702]

const exampleProps: Retention2Props = {
  // Newer cohorts level off higher after an onboarding change in May.
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
  description: 'Share of each monthly signup cohort still active, by months since signup',
  highlight: 4,
  periodName: 'Month',
  title: 'Retention curves',
}

const Retention2 = (props: Retention2Props) => {
  const { cohorts, description, periodName = 'Month', title } = props
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
  const format = (value: number) => formatRetention(value)

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
              {selected?.label}, {unit} {latest}
            </dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {formatRetention(selectedRate)}
            </dd>
            <dd>
              <RetentionChange
                difference={selectedRate - averageRate}
                versus='the average'
              />
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>
              Average, {unit} {latest}
            </dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {formatRetention(averageRate)}
            </dd>
          </div>
          <div className='col-span-2 flex flex-col gap-0.5 @md:col-span-1'>
            <dt className='text-muted-foreground text-xs'>Levels off</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {plateau ? `${periodName} ${plateau.period}` : 'Not yet'}
            </dd>
            {plateau && (
              <dd className='text-muted-foreground text-xs'>
                at about {formatRetention(plateau.rate)} retained
              </dd>
            )}
          </div>
        </dl>
        <ChartPanelLegend
          items={[
            { color: 'var(--chart-1)', label: selected?.label ?? '', shape: 'line' },
            { color: 'var(--foreground)', label: 'Average', shape: 'line' },
            {
              color: 'color-mix(in oklab, var(--muted-foreground) 45%, transparent)',
              label: 'Other cohorts',
              shape: 'line',
            },
          ]}
        />
        <ChartPanelFigure className='h-60'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
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
                width={52}
              />
              <Tooltip
                content={({ active, label, payload }) => (
                  <ChartPanelTooltip
                    active={active}
                    formatLabel={(value) => `${periodName} ${value}`}
                    label={label}
                    payload={payload?.filter(
                      (item) =>
                        item.dataKey === 'average' || item.dataKey === `c${highlight}`,
                    )}
                    valueFormatter={(value) => formatRetention(value, 1)}
                  />
                )}
                cursor={{ stroke: 'var(--color-border)' }}
              />
              {cohorts.map((cohort, index) =>
                index === highlight ? null : (
                  <Line
                    key={cohort.label}
                    activeDot={false}
                    dataKey={`c${index}`}
                    dot={false}
                    isAnimationActive={false}
                    name={cohort.label}
                    stroke='var(--color-muted-foreground)'
                    strokeOpacity={0.35}
                    strokeWidth={1}
                    type='monotone'
                  />
                ),
              )}
              <Line
                activeDot={{ r: 4, stroke: 'var(--color-card)', strokeWidth: 2 }}
                dataKey='average'
                dot={false}
                name='Average'
                stroke='var(--color-foreground)'
                strokeDasharray='4 3'
                strokeWidth={2}
                type='monotone'
              />
              <Line
                activeDot={{ r: 4, stroke: 'var(--color-card)', strokeWidth: 2 }}
                dataKey={`c${highlight}`}
                dot={{ fill: 'var(--chart-1)', r: 2.5, strokeWidth: 0 }}
                name={selected?.label}
                stroke='var(--chart-1)'
                strokeLinecap='round'
                strokeWidth={2.5}
                type='monotone'
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanelFigure>
        <ChartPanelTable
          caption={`${title}: ${description}. The average is weighted by cohort size.`}
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
      </CardContent>
    </Card>
  )
}

export { Retention2, exampleProps as retention2ExampleProps, type Retention2Props }
