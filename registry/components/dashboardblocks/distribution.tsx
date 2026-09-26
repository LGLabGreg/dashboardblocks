'use client'

import { useInView } from '@/registry/hooks/use-in-view'
import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useEffect,
  useState,
} from 'react'

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
  /** 25th percentile. */
  q1: number
  /** 75th percentile. */
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

/** Count, mean and the five-number summary of raw values. */
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

/**
 * Counts raw values into bins between consecutive `edges`. Values below the
 * first edge count in the first bin and values from the last edge up count
 * in the last, so nothing is dropped.
 */
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

/**
 * The `p` (0–1) quantile from binned counts, such as histogram buckets from a
 * metrics backend, assuming values are spread evenly within each bin.
 */
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

/** The mean from binned counts, taking each bin's midpoint. */
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

/** Round, evenly spaced ticks (1, 2 or 5 × a power of ten) covering `min` to `max`. */
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

/**
 * Where `value` falls across bins drawn at equal widths, 0–1. Within a bin the
 * position is linear, so uneven (e.g. doubling) bins read like a log scale.
 */
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

function useReveal(animated: boolean) {
  const { isInView, ref } = useInView({ threshold: 0.3 })
  const [revealed, setRevealed] = useState(!animated)

  useEffect(() => {
    if (!animated || !isInView) return
    const frame = requestAnimationFrame(() => setRevealed(true))
    return () => cancelAnimationFrame(frame)
  }, [animated, isInView])

  return { ref: ref as RefObject<HTMLDivElement>, revealed }
}

interface HistogramMarker {
  label: string
  value: number
}

interface HistogramProps {
  animated?: boolean
  bins: DistributionBin[]
  /** Shown under the chart when no bar is hovered, such as a summary. */
  children?: ReactNode
  className?: string
  /** @default 'var(--chart-1)' */
  color?: string
  /** Earlier counts in the same bins, drawn as outlines. Compared as shares. */
  compare?: number[]
  /** Describes a bin for the readout, e.g. "200–300 ms: 1,204 requests (18%)". */
  describe: (index: number) => string
  /** Formats the bin edges on the axis. */
  formatEdge?: (value: number) => string
  /** Labelled vertical lines, such as percentiles. */
  markers?: HistogramMarker[]
  /** Label every nth edge. @default 1 */
  tickEvery?: number
  /** Bars from this value up use `thresholdColor`, with a labelled line. */
  threshold?: HistogramMarker
  /** @default a muted red from --destructive */
  thresholdColor?: string
}

/** Roughly how wide an 11px label is, to keep labels from overlapping. */
function estimateLabelWidth(text: string) {
  return text.length * 6.5 + 8
}

const defaultThresholdColor = 'color-mix(in oklab, var(--destructive) 70%, var(--card))'

/**
 * A histogram built from bins, drawn at equal widths. Markers and the
 * threshold are labelled lines; hovering a bin reads it out under the chart.
 * Decorative for assistive technology: pair it with a table of the bins.
 */
function Histogram({
  animated = true,
  bins,
  children,
  className,
  color = 'var(--chart-1)',
  compare,
  describe,
  formatEdge = (value) => value.toLocaleString(),
  markers = [],
  threshold,
  thresholdColor = defaultThresholdColor,
  tickEvery = 1,
}: HistogramProps) {
  const { ref, revealed } = useReveal(animated)
  const [active, setActive] = useState<number | null>(null)
  // Measured, so labels and ticks can make room for each other at any width.
  const [width, setWidth] = useState(600)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  const total = bins.reduce((sum, bin) => sum + bin.count, 0) || 1
  const compareTotal = compare?.reduce((sum, count) => sum + count, 0) || 1
  const shares = bins.map((bin) => bin.count / total)
  const compareShares = compare?.map((count) => count / compareTotal) ?? []
  const peak = Math.max(...shares, ...compareShares, 0) || 1

  const lines = [
    ...markers.map((marker) => ({ ...marker, kind: 'marker' as const })),
    ...(threshold ? [{ ...threshold, kind: 'threshold' as const }] : []),
  ]
    .map((line) => ({ ...line, position: getBinPosition(bins, line.value) }))
    .sort((a, b) => a.position - b.position)
  // A label that would overlap one to its left steps down a row.
  const rowEnds: number[] = []
  const rows = lines.map((line) => {
    const half = estimateLabelWidth(line.label) / 2
    const center = line.position * width
    let row = rowEnds.findIndex((end) => end + 4 <= center - half)
    if (row === -1) row = rowEnds.push(0) - 1
    rowEnds[row] = center + half
    return row
  })
  const labelRows = rowEnds.length
  // Skip edge labels that wouldn't fit between their neighbours.
  const widestTick = Math.max(
    0,
    ...bins.map((bin) => estimateLabelWidth(formatEdge(bin.x0))),
  )
  const tickStep = Math.max(
    tickEvery,
    Math.ceil((widestTick + 8) / (width / Math.max(1, bins.length))),
  )

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div ref={ref} aria-hidden className='flex min-h-0 flex-1 flex-col gap-1.5'>
        <div
          className='relative min-h-0 flex-1'
          style={{ paddingTop: `${labelRows * 16 + 4}px` }}
          onPointerLeave={() => setActive(null)}
        >
          <div className='flex h-full items-end gap-0.5 border-b'>
            {bins.map((bin, index) => {
              const over = threshold !== undefined && bin.x0 >= threshold.value
              return (
                <div
                  key={index}
                  className='relative flex h-full min-w-0 flex-1 items-end'
                  onPointerEnter={() => setActive(index)}
                  onPointerDown={() => setActive(index)}
                >
                  {active === index && (
                    <span className='bg-muted absolute inset-x-0 top-0 bottom-0 rounded-t-[3px]' />
                  )}
                  <span
                    className='relative w-full origin-bottom rounded-t-[3px] transition-transform duration-700 ease-out motion-reduce:transition-none'
                    style={{
                      backgroundColor: over ? thresholdColor : color,
                      height: `${(shares[index] / peak) * 100}%`,
                      minHeight: bin.count > 0 ? 2 : 0,
                      transform: `scaleY(${revealed ? 1 : 0})`,
                      transitionDelay: `${index * 30}ms`,
                    }}
                  />
                  {compare && (
                    <span
                      className='border-foreground/70 absolute inset-x-0 bottom-0 rounded-t-[3px] border-2 border-b-0 transition-opacity duration-500 motion-reduce:transition-none'
                      style={{
                        height: `${((compareShares[index] ?? 0) / peak) * 100}%`,
                        opacity: revealed ? 1 : 0,
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
          {lines.map((line, index) => (
            <div
              key={`${line.kind}-${line.label}`}
              className='pointer-events-none absolute bottom-0 flex flex-col items-center'
              style={{
                left: `${line.position * 100}%`,
                top: `${rows[index] * 16}px`,
                transform: 'translateX(-50%)',
              }}
            >
              <span
                className={cn(
                  'bg-card rounded-sm px-1 text-[11px] leading-4 font-medium whitespace-nowrap tabular-nums',
                  line.kind === 'threshold' && 'text-muted-foreground',
                )}
              >
                {line.label}
              </span>
              <span
                className={cn(
                  'w-0 flex-1',
                  line.kind === 'marker'
                    ? 'border-foreground border-l-[1.5px]'
                    : 'border-muted-foreground border-l-[1.5px] border-dashed',
                )}
              />
            </div>
          ))}
        </div>
        <div className='text-muted-foreground relative h-4 text-[11px] tabular-nums'>
          {bins.map((bin, index) =>
            index % tickStep === 0 && (index === 0 || bins.length - index >= tickStep) ? (
              <span
                key={index}
                className='absolute -translate-x-1/2 whitespace-nowrap first:translate-x-0'
                style={{ left: `${(index / bins.length) * 100}%` }}
              >
                {formatEdge(bin.x0)}
              </span>
            ) : null,
          )}
          {bins.length > 0 && (
            <span className='absolute right-0 whitespace-nowrap'>
              {formatEdge(bins[bins.length - 1].x1)}
            </span>
          )}
        </div>
      </div>
      <p className='text-muted-foreground min-h-5 text-sm'>
        {active !== null ? (
          <span className='text-foreground'>{describe(active)}</span>
        ) : (
          children
        )}
      </p>
    </div>
  )
}

interface BoxPlotProps {
  animated?: boolean
  className?: string
  /** @default 'var(--chart-1)' */
  color?: string
  /** The axis range, shared by rows that are compared. */
  domain: [number, number]
  /** Whisker ends, e.g. the minimum and maximum or the 5th and 95th percentiles. */
  high: number
  low: number
  /** Adds a dot at the mean. */
  mean?: number
  median: number
  q1: number
  q3: number
}

/**
 * A horizontal box and whiskers: the box spans the middle half, the line in
 * it is the median and the whiskers reach `low` and `high`. Decorative: show
 * the values as text beside it.
 */
function BoxPlot({
  animated = true,
  className,
  color = 'var(--chart-1)',
  domain,
  high,
  low,
  mean,
  median,
  q1,
  q3,
}: BoxPlotProps) {
  const { ref, revealed } = useReveal(animated)
  const [min, max] = domain
  const position = (value: number) =>
    Math.min(100, Math.max(0, ((value - min) / (max - min || 1)) * 100))

  return (
    <div ref={ref} aria-hidden className={cn('relative h-6 w-full', className)}>
      <div
        className='absolute inset-y-0 origin-left transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none'
        style={{
          left: `${position(low)}%`,
          opacity: revealed ? 1 : 0,
          transform: `scaleX(${revealed ? 1 : 0.6})`,
          width: `${position(high) - position(low)}%`,
        }}
      >
        <span className='bg-muted-foreground absolute inset-x-0 top-1/2 h-px -translate-y-1/2' />
        <span className='bg-muted-foreground absolute inset-y-1.5 left-0 w-px' />
        <span className='bg-muted-foreground absolute inset-y-1.5 right-0 w-px' />
      </div>
      <span
        className='absolute inset-y-0.5 rounded-[3px] border border-[var(--box-color)] transition-opacity duration-500 motion-reduce:transition-none'
        style={
          {
            '--box-color': color,
            backgroundColor: `color-mix(in oklab, ${color} 30%, var(--card))`,
            left: `${position(q1)}%`,
            opacity: revealed ? 1 : 0,
            width: `${position(q3) - position(q1)}%`,
          } as CSSProperties
        }
      />
      <span
        className='bg-foreground absolute inset-y-0 w-0.5 -translate-x-1/2 rounded-full'
        style={{ left: `${position(median)}%` }}
      />
      {mean !== undefined && (
        <span
          className='bg-card border-foreground absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px]'
          style={{ left: `${position(mean)}%` }}
        />
      )}
    </div>
  )
}

interface DistributionAxisProps {
  className?: string
  domain: [number, number]
  format?: (value: number) => string
  ticks: number[]
}

/** Tick labels under box plots that share `domain`. */
function DistributionAxis({
  className,
  domain,
  format = (value) => value.toLocaleString(),
  ticks,
}: DistributionAxisProps) {
  const [min, max] = domain
  return (
    <div
      aria-hidden
      className={cn(
        'text-muted-foreground relative h-4 text-[11px] tabular-nums',
        className,
      )}
    >
      {ticks.map((tick, index) => (
        <span
          key={tick}
          className={cn(
            'absolute whitespace-nowrap',
            index === 0
              ? ''
              : index === ticks.length - 1
                ? '-translate-x-full'
                : '-translate-x-1/2',
          )}
          style={{ left: `${((tick - min) / (max - min || 1)) * 100}%` }}
        >
          {format(tick)}
        </span>
      ))}
    </div>
  )
}

type DistributionKeyShape =
  | 'bar'
  | 'box'
  | 'mean'
  | 'median'
  | 'outline'
  | 'threshold'
  | 'whisker'

interface DistributionKeyProps {
  className?: string
  /** @default 'var(--chart-1)' */
  color?: string
  shape: DistributionKeyShape
}

/** A legend swatch matching a histogram or box plot mark. */
function DistributionKey({
  className,
  color = 'var(--chart-1)',
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
              backgroundColor: `color-mix(in oklab, ${color} 30%, var(--card))`,
            } as CSSProperties
          }
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
    case 'outline':
      return (
        <span
          aria-hidden
          className={cn(
            base,
            'border-foreground/70 h-2.5 w-2.5 rounded-t-[3px] border-2 border-b-0',
          )}
        />
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
  DistributionAxis,
  DistributionKey,
  Histogram,
  binValues,
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
  DistributionAxisProps,
  DistributionBin,
  DistributionKeyProps,
  DistributionKeyShape,
  DistributionSummary,
  HistogramMarker,
  HistogramProps,
}
