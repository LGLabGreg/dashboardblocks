'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  chartAxisProps,
  chartGridProps,
  chartLineCursor,
  chartReferenceProps,
  chartValueAxisWidth,
} from '@/registry/components/dashboardblocks/chart'
import {
  ChartPanelFigure,
  ChartPanelLegend,
  ChartPanelTable,
} from '@/registry/components/dashboardblocks/chart-panel'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import {
  ScatterTooltipContent,
  describeCorrelation,
  fitLine,
  scatterPalette,
} from '@/registry/components/dashboardblocks/scatter'
import {
  formatNumber,
  formatPercent,
  formatPoints,
  formatSigned,
} from '@/registry/lib/dashboardblocks/format'
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface CorrelationPoint {
  group: string
  label: string
  x: number
  y: number
}

interface Scatter1Props extends BlockStateProps {
  description: string
  groups: string[]
  /** Leave out, or pass none, to show the empty state. */
  points?: CorrelationPoint[]
  title: string
  x: { format: (value: number) => string; label: string }
  y: {
    format: (value: number) => string
    formatChange?: (value: number) => string
    label: string
  }
}

const noise = (index: number) =>
  ((index * 2_654_435_761) % 4_294_967_296) / 4_294_967_296 - 0.5

const GROUPS = ['Marketing', 'Docs', 'Checkout']

const exampleProps: Scatter1Props = {
  description:
    'Each dot is a page: its median load time against its conversion rate, over the last 30 days.',
  groups: GROUPS,
  points: Array.from({ length: 42 }, (_, index) => {
    const group = GROUPS[index % 3]
    const load = 0.8 + ((index * 37) % 42) / 12 + noise(index + 7) * 0.4
    const base = group === 'Checkout' ? 7.4 : group === 'Marketing' ? 5.2 : 3.6
    return {
      group,
      label: `/${group.toLowerCase()}/${index + 1}`,
      x: Math.round(load * 100) / 100,
      y: Math.max(0.3, Math.round((base - load * 0.95 + noise(index) * 1.6) * 100) / 100),
    }
  }),
  title: 'Load time vs conversion',
  x: {
    format: (value) => `${formatNumber(value, { minimumFractionDigits: 1 })} s`,
    label: 'Load time',
  },
  y: {
    format: (value) => formatPercent(value / 100, { minimumFractionDigits: 1 }),
    formatChange: (value) => formatPoints(value, { minimumFractionDigits: 1 }),
    label: 'Conversion',
  },
}

const formatCorrelation = (r: number) =>
  `${r < 0 ? '−' : ''}${formatNumber(Math.abs(r), {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`

const Scatter1 = (props: Scatter1Props) => {
  const { description, groups, points = [], errorMessage, status, title, x, y } = props
  const state = getBlockState(status, points)
  const fit = fitLine(points)
  const xs = points.map((point) => point.x)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const xTicks = Array.from({ length: Math.ceil(maxX) + 1 }, (_, index) => index)
  const colorOf = (group: string) =>
    scatterPalette[Math.max(0, groups.indexOf(group)) % scatterPalette.length]
  const perUnit = fit.slope

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <dl className='grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-4'>
          <div className='flex flex-col gap-1'>
            <dt className='text-muted-foreground text-sm'>Correlation (r)</dt>
            <dd>
              <KPIValue value={fit.r} format={formatCorrelation} />
            </dd>
            <BlockReady className='text-sm'>
              <dd className='text-muted-foreground text-sm first-letter:uppercase'>
                {describeCorrelation(fit.r)}
              </dd>
            </BlockReady>
          </div>
          {state !== 'empty' && state !== 'error' && (
            <div className='flex flex-col gap-1'>
              <dt className='text-muted-foreground text-sm'>Trend</dt>
              <dd>
                <KPIValue
                  className='text-2xl'
                  value={perUnit}
                  format={(value) => formatSigned(value, y.formatChange ?? y.format)}
                />
              </dd>
              <BlockReady className='text-sm'>
                <dd className='text-muted-foreground text-sm'>
                  {y.label.toLowerCase()} for each {x.format(1)} more{' '}
                  {x.label.toLowerCase()}
                </dd>
              </BlockReady>
            </div>
          )}
        </dl>
        <ChartPanelLegend
          items={[
            ...groups.map((group) => ({
              color: colorOf(group),
              label: group,
              shape: 'rect' as const,
            })),
            {
              color: 'var(--color-muted-foreground)',
              label: 'Trend',
              shape: 'line' as const,
            },
          ]}
        />
        <ChartPanelFigure className='h-64'>
          <ResponsiveContainer width='100%' height='100%'>
            <ScatterChart
              aria-label={`${title} chart`}
              margin={{ top: 8, right: 12, bottom: 16, left: 0 }}
            >
              <CartesianGrid {...chartGridProps} />
              <XAxis
                {...chartAxisProps}
                dataKey='x'
                domain={[0, xTicks[xTicks.length - 1]]}
                label={{
                  fill: 'var(--color-muted-foreground)',
                  fontSize: 11,
                  position: 'insideBottom',
                  offset: -12,
                  value: x.label,
                }}
                name={x.label}
                tickFormatter={x.format}
                ticks={xTicks}
                type='number'
              />
              <YAxis
                {...chartAxisProps}
                dataKey='y'
                domain={[0, 'auto']}
                name={y.label}
                tickFormatter={y.format}
                type='number'
                width={chartValueAxisWidth}
              />
              <ReferenceLine
                {...chartReferenceProps}
                ifOverflow='hidden'
                segment={[
                  { x: minX, y: fit.intercept + fit.slope * minX },
                  { x: maxX, y: fit.intercept + fit.slope * maxX },
                ]}
                strokeWidth={1.5}
              />
              <Tooltip
                content={({ active, payload }) => {
                  const point = payload?.[0]?.payload as CorrelationPoint | undefined
                  if (!active || !point) return null
                  return (
                    <ScatterTooltipContent
                      color={colorOf(point.group)}
                      rows={[
                        { label: x.label, value: x.format(point.x) },
                        { label: y.label, value: y.format(point.y) },
                      ]}
                      title={point.label}
                    />
                  )
                }}
                cursor={chartLineCursor}
              />
              {groups.map((group) => (
                <Scatter
                  key={group}
                  data={points.filter((point) => point.group === group)}
                  fill={colorOf(group)}
                  fillOpacity={0.8}
                  name={group}
                  stroke='var(--color-background)'
                  strokeWidth={1.5}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </ChartPanelFigure>
        <ChartPanelTable
          caption={`${title}: ${description}. Correlation r = ${formatCorrelation(fit.r)}.`}
          columns={[
            { key: 'label', label: 'Page' },
            { key: 'group', label: 'Group' },
            { format: x.format, key: 'x', label: x.label },
            { format: y.format, key: 'y', label: y.label },
          ]}
          rows={points}
        />
      </section>
    </BlockStateProvider>
  )
}

export {
  Scatter1,
  exampleProps as scatter1ExampleProps,
  type CorrelationPoint,
  type Scatter1Props,
}
