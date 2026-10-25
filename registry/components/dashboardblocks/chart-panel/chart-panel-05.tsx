'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { BreakdownTable } from '@/registry/components/dashboardblocks/breakdown'
import {
  ChartTooltipContent,
  type ChartValueFormatter,
} from '@/registry/components/dashboardblocks/chart'
import { Ring } from '@/registry/components/dashboardblocks/ring'
import {
  formatCompact,
  formatNumber,
  formatPercent,
} from '@/registry/lib/dashboardblocks/format'
import { useState } from 'react'
import {
  Cell,
  Pie,
  PieChart,
  type PieSectorDataItem,
  ResponsiveContainer,
  Sector,
  Tooltip,
} from 'recharts'

interface Segment {
  color: string
  label: string
  value: number
}

interface ChartPanel5Props extends BlockStateProps {
  description: string
  formatter?: ChartValueFormatter
  /** Leave out, or pass none, to show the empty state. */
  segments?: Segment[]
  title: string
  totalLabel?: string
}

const exampleProps: ChartPanel5Props = {
  description: 'Where visitors came from in the last 30 days.',
  segments: [
    { color: 'var(--color-chart-2)', label: 'Organic search', value: 38_420 },
    { color: 'var(--color-chart-3)', label: 'Direct', value: 21_760 },
    { color: 'var(--color-chart-4)', label: 'Social', value: 12_180 },
    {
      color: 'color-mix(in oklab, var(--color-muted-foreground) 35%, transparent)',
      label: 'Other',
      value: 6_940,
    },
  ],
  title: 'Traffic sources',
  totalLabel: 'Visitors',
}

const ACTIVE_GROWTH_PX = 4

const ChartPanel5 = (props: ChartPanel5Props) => {
  const {
    description,
    formatter = (value) => formatNumber(value),
    segments = [],
    errorMessage,
    status,
    title,
    totalLabel = 'Total',
  } = props
  const state = getBlockState(status, segments)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  const share = (value: number) =>
    formatPercent(total === 0 ? 0 : value / total, { maximumFractionDigits: 0 })
  const top = segments.reduce<Segment | undefined>(
    (best, segment) => (best && best.value >= segment.value ? best : segment),
    undefined,
  )

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <div className='flex flex-col items-center gap-6 border-t pt-4 @lg:flex-row'>
          {state ? (
            <Ring className='size-44' percentage={0} radius={41} strokeWidth={12} />
          ) : (
            <div className='relative size-44 shrink-0'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart
                  aria-label={`${title} chart`}
                  margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                >
                  <Tooltip
                    content={(tooltipProps) => (
                      <ChartTooltipContent {...tooltipProps} valueFormatter={formatter} />
                    )}
                  />
                  <Pie
                    activeShape={(sector: PieSectorDataItem) => (
                      <Sector
                        {...sector}
                        outerRadius={Number(sector.outerRadius ?? 0) + ACTIVE_GROWTH_PX}
                      />
                    )}
                    cornerRadius={3}
                    data={segments}
                    dataKey='value'
                    endAngle={-270}
                    innerRadius='70%'
                    nameKey='label'
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                    outerRadius='94%'
                    paddingAngle={1}
                    startAngle={90}
                    stroke='var(--color-background)'
                    strokeWidth={2}
                  >
                    {segments.map((segment) => (
                      <Cell key={segment.label} fill={segment.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center'>
                <span className='text-2xl font-light tracking-tight tabular-nums'>
                  {formatCompact(total)}
                </span>
                <span className='text-muted-foreground text-xs'>{totalLabel}</span>
              </div>
            </div>
          )}
          <div className='flex w-full min-w-0 flex-col gap-2'>
            <BlockReady className='text-sm'>
              {top && (
                <p className='text-muted-foreground text-sm'>
                  <span className='text-foreground font-medium'>{top.label}</span> brings{' '}
                  {share(top.value)} of {totalLabel.toLowerCase()}.
                </p>
              )}
            </BlockReady>
            <BlockStateRows rows={4} />
            {!state && (
              <BreakdownTable
                caption={`${title}: ${description}`}
                format={formatter}
                highlightIndex={activeIndex}
                labels={['Source', totalLabel, 'Share']}
                segments={segments}
              />
            )}
          </div>
        </div>
      </section>
    </BlockStateProvider>
  )
}

export { ChartPanel5, exampleProps as chartPanel5ExampleProps, type ChartPanel5Props }
