'use client'

import {
  ChartPanelFigure,
  ChartPanelLegend,
  ChartPanelTable,
  chartAxisProps,
  chartGridProps,
} from '@/registry/components/dashboardblocks/chart-panel'
import {
  ScatterTooltipContent,
  describeCorrelation,
  fitLine,
  scatterPalette,
} from '@/registry/components/dashboardblocks/scatter'
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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface CorrelationPoint {
  group: string
  label: string
  x: number
  y: number
}

interface Scatter1Props {
  description: string
  /** Groups in legend order; each keeps its colour. */
  groups: string[]
  points: CorrelationPoint[]
  title: string
  x: { format: (value: number) => string; label: string }
  y: {
    format: (value: number) => string
    /** Formats the trend, a change in y, e.g. in percentage points. Defaults to `format`. */
    formatChange?: (value: number) => string
    label: string
  }
}

/** Deterministic noise for the example, from an integer hash. */
const noise = (index: number) =>
  ((index * 2_654_435_761) % 4_294_967_296) / 4_294_967_296 - 0.5

const GROUPS = ['Marketing', 'Docs', 'Checkout']

const exampleProps: Scatter1Props = {
  description:
    'Each dot is a page: median load time against conversion rate, last 30 days',
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
  x: { format: (value) => `${value.toFixed(1)} s`, label: 'Load time' },
  y: {
    format: (value) => `${value.toFixed(1)}%`,
    formatChange: (value) => `${value.toFixed(1)} pts`,
    label: 'Conversion',
  },
}

const Scatter1 = (props: Scatter1Props) => {
  const { description, groups, points, title, x, y } = props
  const fit = fitLine(points)
  const xs = points.map((point) => point.x)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  // Whole-unit ticks from zero, e.g. 0 s, 1 s, 2 s.
  const xTicks = Array.from({ length: Math.ceil(maxX) + 1 }, (_, index) => index)
  const colorOf = (group: string) =>
    scatterPalette[Math.max(0, groups.indexOf(group)) % scatterPalette.length]
  const perUnit = fit.slope

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <dl className='grid grid-cols-2 gap-4'>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Correlation</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              r = {fit.r.toFixed(2)}
            </dd>
            <dd className='text-muted-foreground text-xs'>
              {describeCorrelation(fit.r)}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Trend</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {perUnit >= 0 ? '+' : '−'}
              {(y.formatChange ?? y.format)(Math.abs(perUnit))}
            </dd>
            <dd className='text-muted-foreground text-xs'>
              {y.label.toLowerCase()} per {x.format(1)} more {x.label.toLowerCase()}
            </dd>
          </div>
        </dl>
        <ChartPanelLegend
          items={[
            ...groups.map((group) => ({
              color: colorOf(group),
              label: group,
              shape: 'rect' as const,
            })),
            { color: 'var(--muted-foreground)', label: 'Trend', shape: 'line' as const },
          ]}
        />
        <ChartPanelFigure className='h-64'>
          <ResponsiveContainer width='100%' height='100%'>
            <ScatterChart margin={{ top: 8, right: 12, bottom: 16, left: 0 }}>
              <CartesianGrid {...chartGridProps} vertical />
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
                width={44}
              />
              <ReferenceLine
                ifOverflow='hidden'
                segment={[
                  { x: minX, y: fit.intercept + fit.slope * minX },
                  { x: maxX, y: fit.intercept + fit.slope * maxX },
                ]}
                stroke='var(--color-muted-foreground)'
                strokeDasharray='5 4'
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
                cursor={{ stroke: 'var(--color-border)', strokeDasharray: '3 3' }}
              />
              {groups.map((group) => (
                <Scatter
                  key={group}
                  data={points.filter((point) => point.group === group)}
                  fill={colorOf(group)}
                  fillOpacity={0.8}
                  name={group}
                  stroke='var(--color-card)'
                  strokeWidth={1.5}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </ChartPanelFigure>
        <ChartPanelTable
          caption={`${title}: ${description}. Correlation r = ${fit.r.toFixed(2)}.`}
          columns={[
            { key: 'label', label: 'Page' },
            { key: 'group', label: 'Group' },
            { format: x.format, key: 'x', label: x.label },
            { format: y.format, key: 'y', label: y.label },
          ]}
          rows={points}
        />
      </CardContent>
    </Card>
  )
}

export {
  Scatter1,
  exampleProps as scatter1ExampleProps,
  type CorrelationPoint,
  type Scatter1Props,
}
