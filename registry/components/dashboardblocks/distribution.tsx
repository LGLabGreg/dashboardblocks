'use client'

import { useBlockState } from '@/registry/components/dashboardblocks/block-state'
import {
  ChartPlaceholder,
  chartActiveDot,
  chartAxisProps,
  chartBarCursor,
  chartGridProps,
  chartReferenceProps,
  ChartTooltipFrame,
  ChartTooltipItem,
  chartValueAxisWidth,
} from '@/registry/components/dashboardblocks/chart'
import { formatNumber, formatPercent } from '@/registry/lib/dashboardblocks/format'
import { type CSSProperties, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type YAxisTickContentProps,
} from 'recharts'

import { cn } from '@/lib/utils'

interface DistributionBin {
  /** Lower edge, inclusive. */
  x0: number
  /** Upper edge, exclusive. */
  x1: number
  count: number
}

interface DistributionSummary {
  count: number
  max: number
  mean: number
  median: number
  min: number
  q1: number
  q3: number
}

/** The `p` (0–1) quantile of sorted values, interpolating between neighbours. */
function quantile(sorted: number[], p: number) {
  if (sorted.length === 0) return 0
  const index = (sorted.length - 1) * Math.min(1, Math.max(0, p))
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower)
}

function summarize(values: number[]): DistributionSummary {
  const sorted = [...values].sort((a, b) => a - b)
  const count = sorted.length
  return {
    count,
    max: sorted[count - 1] ?? 0,
    mean: count > 0 ? sorted.reduce((sum, value) => sum + value, 0) / count : 0,
    median: quantile(sorted, 0.5),
    min: sorted[0] ?? 0,
    q1: quantile(sorted, 0.25),
    q3: quantile(sorted, 0.75),
  }
}

function binValues(values: number[], edges: number[]): DistributionBin[] {
  const bins = edges
    .slice(0, -1)
    .map((x0, index) => ({ count: 0, x0, x1: edges[index + 1] }))
  if (bins.length === 0) return bins
  for (const value of values) {
    let index = bins.findIndex((bin) => value < bin.x1)
    if (index === -1) index = bins.length - 1
    bins[index].count++
  }
  return bins
}

/** The `p` (0–1) quantile from binned counts, such as histogram buckets from a metrics backend, assuming values are spread evenly within each bin. */
function quantileFromBins(bins: DistributionBin[], p: number) {
  const total = bins.reduce((sum, bin) => sum + bin.count, 0)
  if (total === 0) return bins[0]?.x0 ?? 0
  const target = Math.min(1, Math.max(0, p)) * total
  let before = 0
  for (const bin of bins) {
    if (bin.count > 0 && before + bin.count >= target) {
      return bin.x0 + ((target - before) / bin.count) * (bin.x1 - bin.x0)
    }
    before += bin.count
  }
  return bins[bins.length - 1].x1
}

function meanFromBins(bins: DistributionBin[]) {
  const total = bins.reduce((sum, bin) => sum + bin.count, 0)
  if (total === 0) return 0
  return bins.reduce((sum, bin) => sum + ((bin.x0 + bin.x1) / 2) * bin.count, 0) / total
}

/** The share (0–1) of binned counts at or above `limit`, interpolating within its bin. */
function getShareAbove(bins: DistributionBin[], limit: number) {
  const total = bins.reduce((sum, bin) => sum + bin.count, 0)
  if (total === 0) return 0
  let above = 0
  for (const bin of bins) {
    if (bin.x0 >= limit) above += bin.count
    else if (bin.x1 > limit) above += (bin.count * (bin.x1 - limit)) / (bin.x1 - bin.x0)
  }
  return above / total
}

function getNiceTicks(min: number, max: number, count = 5) {
  const span = max - min || Math.abs(max) || 1
  const rough = span / Math.max(1, count - 1)
  const power = 10 ** Math.floor(Math.log10(rough))
  const step = [1, 2, 5, 10].map((m) => m * power).find((s) => s >= rough) ?? power * 10
  const start = Math.floor(min / step) * step
  const end = Math.ceil(max / step) * step
  const ticks: number[] = []
  for (let tick = start; tick <= end + step / 2; tick += step) {
    ticks.push(Math.round(tick / power) * power)
  }
  return ticks
}

/** Where `value` falls across bins drawn at equal widths, 0–1. */
function getBinPosition(bins: DistributionBin[], value: number) {
  if (bins.length === 0) return 0
  let index = bins.findIndex((bin) => value < bin.x1)
  if (index === -1) index = bins.length - 1
  const bin = bins[index]
  const within = bin.x1 > bin.x0 ? (value - bin.x0) / (bin.x1 - bin.x0) : 0
  return Math.min(
    1,
    Math.max(0, (index + Math.min(1, Math.max(0, within))) / bins.length),
  )
}

/** A share (0–1) as a whole percent, with one decimal below 1%. */
function formatDistributionShare(share: number) {
  return formatPercent(share, {
    maximumFractionDigits: share > 0 && share < 0.01 ? 1 : 0,
  })
}

interface HistogramMarker {
  label: string
  value: number
}

interface HistogramProps {
  bins: DistributionBin[]
  className?: string
  /** @default 'var(--color-chart-2)' */
  color?: string
  /** Earlier counts in the same bins, drawn as a dashed line of shares. */
  compare?: number[]
  /** @default 'Before' */
  compareLabel?: string
  formatEdge?: (value: number) => string
  /** Names the bars in the tooltip, such as `This week`. @default 'Share' */
  label?: string
  markers?: HistogramMarker[]
  /** Shows every nth bin edge on the axis. */
  tickEvery?: number
  threshold?: HistogramMarker
  /** @default DISTRIBUTION_THRESHOLD_COLOR */
  thresholdColor?: string
  /** Counts the bars in the tooltip, such as `requests`. Leave out to show shares only. */
  unit?: string
  /** Names the chart for screen readers; leave it out to hide it, such as beside a table of the same data. */
  'aria-label'?: string
}

const LABEL_ROW_PX = 16

function estimateLabelWidth(text: string) {
  return text.length * 6.5 + 8
}

const DISTRIBUTION_THRESHOLD_COLOR =
  'color-mix(in oklab, var(--color-destructive) 70%, var(--color-background))'

function chartLabelProps(ariaLabel: string | undefined) {
  return ariaLabel
    ? ({ 'aria-label': ariaLabel, role: 'img' } as const)
    : ({ 'aria-hidden': true } as const)
}

function Histogram({
  'aria-label': ariaLabel,
  bins,
  className,
  color = 'var(--color-chart-2)',
  compare,
  compareLabel = 'Before',
  formatEdge = (value) => formatNumber(value),
  label = 'Share',
  markers = [],
  threshold,
  thresholdColor = DISTRIBUTION_THRESHOLD_COLOR,
  tickEvery = 1,
  unit,
}: HistogramProps) {
  const [width, setWidth] = useState(0)
  const state = useBlockState()
  const total = bins.reduce((sum, bin) => sum + bin.count, 0) || 1
  const compareTotal = compare?.reduce((sum, count) => sum + count, 0) || 1
  const data = bins.map((bin, index) => ({
    ...bin,
    compareShare: compare ? (compare[index] ?? 0) / compareTotal : undefined,
    over: threshold !== undefined && bin.x0 >= threshold.value,
    position: index + 0.5,
    share: bin.count / total,
  }))

  const shareTicks = getNiceTicks(
    0,
    Math.max(...data.map((bin) => Math.max(bin.share, bin.compareShare ?? 0)), 0.01),
    4,
  )

  const lines = [
    ...markers.map((marker) => ({ ...marker, kind: 'marker' as const })),
    ...(threshold ? [{ ...threshold, kind: 'threshold' as const }] : []),
  ]
    .map((line) => ({ ...line, position: getBinPosition(bins, line.value) }))
    .sort((a, b) => a.position - b.position)
  const rowEnds: number[] = []
  const rows = lines.map((line) => {
    const half = estimateLabelWidth(line.label) / 2
    const center = line.position * width
    let row = rowEnds.findIndex((end) => end + 4 <= center - half)
    if (row === -1) row = rowEnds.push(0) - 1
    rowEnds[row] = center + half
    return row
  })
  const widestTick = Math.max(
    0,
    ...bins.map((bin) => estimateLabelWidth(formatEdge(bin.x0))),
  )
  const tickStep = Math.max(
    tickEvery,
    Math.ceil((widestTick + 8) / Math.max(1, width / Math.max(1, bins.length))),
  )
  const ticks = bins
    .map((_, index) => index)
    .filter((index) => index % tickStep === 0 && bins.length - index >= tickStep)
    .concat(bins.length)
  const edgeAt = (index: number) =>
    index >= bins.length ? (bins[bins.length - 1]?.x1 ?? 0) : (bins[index]?.x0 ?? 0)

  if (state) {
    return (
      <div className={cn('w-full', className)}>
        <ChartPlaceholder height='100%' />
      </div>
    )
  }

  return (
    <div {...chartLabelProps(ariaLabel)} className={cn('w-full', className)}>
      <ResponsiveContainer
        height='100%'
        onResize={(nextWidth) => setWidth(nextWidth)}
        width='100%'
      >
        <ComposedChart
          accessibilityLayer={false}
          barCategoryGap={2}
          data={data}
          margin={{
            bottom: 0,
            left: 0,
            right: 16,
            top: rowEnds.length * LABEL_ROW_PX + 4,
          }}
        >
          <CartesianGrid {...chartGridProps} />
          <XAxis dataKey='position' height={0} hide />
          <XAxis
            {...chartAxisProps}
            dataKey='position'
            domain={[0, bins.length]}
            interval={0}
            tickFormatter={(index: number) => formatEdge(edgeAt(index))}
            ticks={ticks}
            type='number'
            xAxisId='edges'
          />
          <YAxis
            {...chartAxisProps}
            domain={[0, shareTicks[shareTicks.length - 1]]}
            tickFormatter={formatDistributionShare}
            ticks={shareTicks}
            width={chartValueAxisWidth}
          />
          <Tooltip
            content={({ active, payload }) => {
              const bin = payload?.[0]?.payload as (typeof data)[number] | undefined
              if (!active || !bin) return null
              return (
                <ChartTooltipFrame>
                  <span className='font-medium tabular-nums'>
                    {formatEdge(bin.x0)}–{formatEdge(bin.x1)}
                  </span>
                  <ChartTooltipItem
                    color={bin.over ? thresholdColor : color}
                    name={label}
                    value={formatDistributionShare(bin.share)}
                  />
                  {bin.compareShare !== undefined && (
                    <ChartTooltipItem
                      color='var(--color-muted-foreground)'
                      name={compareLabel}
                      value={formatDistributionShare(bin.compareShare)}
                    />
                  )}
                  {unit && (
                    <ChartTooltipItem
                      name={unit.charAt(0).toUpperCase() + unit.slice(1)}
                      value={formatNumber(bin.count)}
                    />
                  )}
                </ChartTooltipFrame>
              )
            }}
            cursor={chartBarCursor}
          />
          <Bar dataKey='share' name={label} radius={[4, 4, 0, 0]}>
            {data.map((bin, index) => (
              <Cell key={index} fill={bin.over ? thresholdColor : color} />
            ))}
          </Bar>
          {compare && (
            <Line
              activeDot={chartActiveDot}
              dataKey='compareShare'
              dot={false}
              name={compareLabel}
              stroke='var(--color-muted-foreground)'
              strokeDasharray='3 3'
              strokeWidth={1.5}
              type='monotone'
            />
          )}
          {lines.map((line, index) => (
            <ReferenceLine
              key={`${line.kind}-${line.label}`}
              {...(line.kind === 'marker'
                ? { stroke: 'var(--color-foreground)', strokeWidth: 1.5 }
                : chartReferenceProps)}
              ifOverflow='visible'
              label={({ viewBox }: { viewBox?: { x?: number; y?: number } }) => (
                <text
                  x={viewBox?.x ?? 0}
                  y={(viewBox?.y ?? 0) - 6 - rows[index] * LABEL_ROW_PX}
                  textAnchor='middle'
                  fontSize={11}
                  fontWeight={500}
                  fill={
                    line.kind === 'marker'
                      ? 'var(--color-foreground)'
                      : 'var(--color-muted-foreground)'
                  }
                >
                  {line.label}
                </text>
              )}
              x={line.position * bins.length}
              xAxisId='edges'
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

interface BoxPlotRow {
  count?: number
  high: number
  label: string
  low: number
  mean?: number
  median: number
  q1: number
  q3: number
}

interface BoxPlotProps {
  className?: string
  /** @default 'var(--color-chart-2)' */
  color?: string
  domain: [number, number]
  format?: (value: number) => string
  /** Shows each row's label on the left. @default true when there is more than one row */
  labels?: boolean
  /** Shows each row's median on the right. @default true when there is more than one row */
  medians?: boolean
  /** How many rows to sketch while loading, when `rows` is empty. @default 4 */
  placeholderRows?: number
  /** @default 44 */
  rowHeight?: number
  rows: BoxPlotRow[]
  tickFormat?: (value: number) => string
  ticks?: number[]
  /** Counts each row in the tooltip, such as `tickets`. */
  unit?: string
  /** @default '5th–95th percentile' */
  whiskerLabel?: string
  /** Names the chart for screen readers; leave it out to hide it, such as beside a table of the same data. */
  'aria-label'?: string
}

const BOX_AXIS_PX = 24
const LABEL_AXIS_PX = 100
const BOX_MAX_PX = 24

interface BoxShapeProps {
  color: string
  height?: number
  payload?: BoxPlotRow
  width?: number
  x?: number
  y?: number
}

function BoxShape({
  color,
  height = 0,
  payload,
  width = 0,
  x = 0,
  y = 0,
}: BoxShapeProps) {
  if (!payload) return null
  const at = (value: number) =>
    payload.high > payload.low
      ? x + ((value - payload.low) / (payload.high - payload.low)) * width
      : x
  const middle = y + height / 2
  const box = Math.min(BOX_MAX_PX, height * 0.55)
  return (
    <g>
      <line
        x1={x}
        x2={x + width}
        y1={middle}
        y2={middle}
        stroke='var(--color-muted-foreground)'
      />
      <line
        x1={x}
        x2={x}
        y1={middle - box / 3}
        y2={middle + box / 3}
        stroke='var(--color-muted-foreground)'
      />
      <line
        x1={x + width}
        x2={x + width}
        y1={middle - box / 3}
        y2={middle + box / 3}
        stroke='var(--color-muted-foreground)'
      />
      <rect
        x={at(payload.q1)}
        y={middle - box / 2}
        width={Math.max(1, at(payload.q3) - at(payload.q1))}
        height={box}
        rx={3}
        fill={`color-mix(in oklab, ${color} 30%, var(--color-background))`}
        stroke={color}
      />
      <line
        x1={at(payload.median)}
        x2={at(payload.median)}
        y1={middle - box / 2 - 2}
        y2={middle + box / 2 + 2}
        stroke='var(--color-foreground)'
        strokeLinecap='round'
        strokeWidth={2}
      />
      {payload.mean !== undefined && (
        <circle
          cx={at(payload.mean)}
          cy={middle}
          r={4}
          fill='var(--color-background)'
          stroke='var(--color-foreground)'
          strokeWidth={1.5}
        />
      )}
    </g>
  )
}

function BoxPlot({
  'aria-label': ariaLabel,
  className,
  color = 'var(--color-chart-2)',
  domain,
  format = (value) => formatNumber(value),
  labels,
  medians,
  placeholderRows = 4,
  rowHeight = 44,
  rows,
  tickFormat = format,
  ticks,
  unit,
  whiskerLabel = '5th–95th percentile',
}: BoxPlotProps) {
  const state = useBlockState()
  const several = rows.length > 1
  const showLabels = labels ?? several
  const showMedians = medians ?? several
  const data = rows.map((row) => ({ ...row, range: [row.low, row.high] }))

  if (state) {
    return (
      <ChartPlaceholder
        className={className}
        height={(rows.length || placeholderRows) * rowHeight + BOX_AXIS_PX}
      />
    )
  }

  return (
    <div
      {...chartLabelProps(ariaLabel)}
      className={cn('w-full', className)}
      style={{ height: rows.length * rowHeight + BOX_AXIS_PX }}
    >
      <ResponsiveContainer height='100%' width='100%'>
        <BarChart
          accessibilityLayer={false}
          barCategoryGap={0}
          data={data}
          layout='vertical'
          margin={{ bottom: 0, left: 0, right: showMedians ? 0 : 20, top: 0 }}
        >
          <XAxis
            {...chartAxisProps}
            allowDataOverflow
            domain={domain}
            height={BOX_AXIS_PX}
            interval={0}
            tickFormatter={tickFormat}
            ticks={ticks}
            type='number'
          />
          <YAxis
            axisLine={false}
            dataKey='label'
            hide={!showLabels}
            tick={{
              dx: -LABEL_AXIS_PX + 8,
              fill: 'var(--color-foreground)',
              fontSize: 14,
              textAnchor: 'start',
            }}
            tickLine={false}
            type='category'
            width={showLabels ? LABEL_AXIS_PX : 0}
          />
          {showMedians && (
            <YAxis
              axisLine={false}
              dataKey='label'
              orientation='right'
              tick={({ payload, x, y }: YAxisTickContentProps) => {
                const row = rows.find((item) => item.label === payload?.value)
                return row ? (
                  <text
                    x={Number(x) + 8}
                    y={Number(y)}
                    dominantBaseline='middle'
                    fill='var(--color-foreground)'
                    fontSize={14}
                  >
                    {format(row.median)}
                  </text>
                ) : (
                  <g />
                )
              }}
              tickLine={false}
              type='category'
              width={64}
              yAxisId='medians'
            />
          )}
          <Tooltip
            content={({ active, payload }) => {
              const row = payload?.[0]?.payload as BoxPlotRow | undefined
              if (!active || !row) return null
              return (
                <ChartTooltipFrame>
                  <span className='font-medium'>{row.label}</span>
                  <ChartTooltipItem name='Median' value={format(row.median)} />
                  {row.mean !== undefined && (
                    <ChartTooltipItem name='Mean' value={format(row.mean)} />
                  )}
                  <ChartTooltipItem
                    name='Middle half'
                    value={`${format(row.q1)}–${format(row.q3)}`}
                  />
                  <ChartTooltipItem
                    name={whiskerLabel}
                    value={`${format(row.low)}–${format(row.high)}`}
                  />
                  {unit && row.count !== undefined && (
                    <ChartTooltipItem
                      name={unit.charAt(0).toUpperCase() + unit.slice(1)}
                      value={formatNumber(row.count)}
                    />
                  )}
                </ChartTooltipFrame>
              )
            }}
            cursor={chartBarCursor}
          />
          <Bar
            dataKey='range'
            shape={(shape: Omit<BoxShapeProps, 'color'>) => (
              <BoxShape {...shape} color={color} />
            )}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

type DistributionKeyShape =
  | 'bar'
  | 'box'
  | 'line'
  | 'mean'
  | 'median'
  | 'threshold'
  | 'whisker'

interface DistributionKeyProps {
  className?: string
  /** @default 'var(--color-chart-2)' */
  color?: string
  shape: DistributionKeyShape
}

function DistributionKey({
  className,
  color = 'var(--color-chart-2)',
  shape,
}: DistributionKeyProps) {
  const base = cn('inline-block shrink-0', className)
  switch (shape) {
    case 'bar':
      return (
        <span
          aria-hidden
          className={cn(base, 'size-2.5 rounded-[3px]')}
          style={{ backgroundColor: color }}
        />
      )
    case 'box':
      return (
        <span
          aria-hidden
          className={cn(
            base,
            'h-2.5 w-3.5 rounded-[3px] border border-[var(--box-color)]',
          )}
          style={
            {
              '--box-color': color,
              backgroundColor: `color-mix(in oklab, ${color} 30%, var(--color-background))`,
            } as CSSProperties
          }
        />
      )
    case 'line':
      return (
        <span
          aria-hidden
          className={cn(base, 'h-0.5 w-3 rounded-full')}
          style={{ backgroundColor: color }}
        />
      )
    case 'mean':
      return (
        <span
          aria-hidden
          className={cn(base, 'border-foreground size-2 rounded-full border-[1.5px]')}
        />
      )
    case 'median':
      return (
        <span aria-hidden className={cn(base, 'bg-foreground h-3 w-0.5 rounded-full')} />
      )
    case 'threshold':
      return (
        <span
          aria-hidden
          className={cn(
            base,
            'border-muted-foreground h-3 w-0 border-l-[1.5px] border-dashed',
          )}
        />
      )
    case 'whisker':
      return (
        <span aria-hidden className={cn(base, 'relative h-2.5 w-3.5')}>
          <span className='bg-muted-foreground absolute inset-x-0 top-1/2 h-px' />
          <span className='bg-muted-foreground absolute inset-y-0 left-0 w-px' />
          <span className='bg-muted-foreground absolute inset-y-0 right-0 w-px' />
        </span>
      )
  }
}

export {
  BoxPlot,
  DISTRIBUTION_THRESHOLD_COLOR,
  DistributionKey,
  Histogram,
  binValues,
  formatDistributionShare,
  getBinPosition,
  getNiceTicks,
  getShareAbove,
  meanFromBins,
  quantile,
  quantileFromBins,
  summarize,
}

export type {
  BoxPlotProps,
  BoxPlotRow,
  DistributionBin,
  DistributionKeyProps,
  DistributionKeyShape,
  DistributionSummary,
  HistogramMarker,
  HistogramProps,
}
