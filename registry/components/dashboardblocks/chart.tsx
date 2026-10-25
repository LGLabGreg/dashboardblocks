'use client'

import { useBlockState } from '@/registry/components/dashboardblocks/block-state'
import { formatNumber } from '@/registry/lib/dashboardblocks/format'
import { type ComponentProps, type ReactNode, useEffect, useId } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  type BarProps,
  Cell,
  Line,
  LabelList,
  LineChart,
  type LineProps,
  ReferenceLine,
  ResponsiveContainer,
  Text,
  Tooltip,
  type TooltipContentProps,
  useActiveTooltipLabel,
  usePlotArea,
  useXAxisScale,
  XAxis,
  YAxis,
} from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

import { cn } from '@/lib/utils'

type AreaProps = ComponentProps<typeof Area>

type ChartValueFormatter = (value: number) => string

const chartAxisProps = {
  axisLine: false,
  tickLine: false,
  tickMargin: 8,
  tick: { fill: 'var(--color-muted-foreground)', fontSize: 12 },
} as const

const chartGridProps = {
  stroke: 'var(--color-border)',
  strokeDasharray: '3 3',
  vertical: false,
} as const

const chartTimeGridProps = {
  horizontal: false,
  stroke: 'var(--color-border)',
  strokeOpacity: 0.5,
} as const

const chartValueAxisWidth = 48

type ChartEdgeTickProps = Omit<ComponentProps<typeof Text>, 'children'> & {
  index?: number
  payload?: { coordinate: number; value: unknown }
  tickFormatter?: (value: never, index: number) => string
  visibleTicksCount?: number
}

/**
 * An x axis label that keeps the first and last labels inside the chart: the first starts at its
 * point and the last ends at its point. Pass it as `tick={<ChartEdgeTick />}` with
 * `interval='preserveStartEnd'`.
 */
function ChartEdgeTick({
  index = 0,
  payload,
  tickFormatter,
  visibleTicksCount = 0,
  ...props
}: ChartEdgeTickProps) {
  if (!payload) return null
  const first = index === 0
  const last = visibleTicksCount > 1 && index === visibleTicksCount - 1
  const label = tickFormatter
    ? tickFormatter(payload.value as never, index)
    : String(payload.value)
  return (
    <Text
      {...props}
      {...chartAxisProps.tick}
      textAnchor={first ? 'start' : last ? 'end' : props.textAnchor}
      x={first || last ? payload.coordinate : props.x}
    >
      {label}
    </Text>
  )
}

const chartBarCursor = {
  fill: 'var(--color-muted)',
  fillOpacity: 0.5,
} as const

const chartLineCursor = { stroke: 'var(--color-border)' } as const

const chartActiveDot = {
  r: 4,
  stroke: 'var(--color-background)',
  strokeWidth: 2,
} as const

const chartReferenceColor =
  'color-mix(in oklab, var(--color-foreground) 40%, transparent)'

const chartReferenceProps = {
  stroke: chartReferenceColor,
  strokeDasharray: '3 3',
} as const

const chartReferenceLabel = {
  fill: 'var(--color-muted-foreground)',
  fontSize: 11,
} as const

/**
 * The rest of a series beside a highlighted mark, at 30% of `color`. A main series that sits
 * beside a louder one (calls above their failures) passes a stronger `percent`, such as 70.
 */
function chartFadedColor(color: string, percent = 30) {
  return `color-mix(in oklab, ${color} ${percent}%, transparent)`
}

/**
 * Diagonal hatching over a light fill of `color`, for a part that is left over or estimated.
 * Put it in the chart's `<defs>` and fill with `url(#id)`; take `id` from `useChartId()`.
 */
function ChartHatch({ color, id }: { color: string; id: string }) {
  return (
    <pattern
      id={id}
      width={6}
      height={6}
      patternTransform='rotate(45)'
      patternUnits='userSpaceOnUse'
    >
      <rect width={6} height={6} fill={chartFadedColor(color)} />
      <line
        x1={0}
        x2={0}
        y1={0}
        y2={6}
        stroke={color}
        strokeOpacity={0.35}
        strokeWidth={2}
      />
    </pattern>
  )
}

/** A gradient or pattern id that is safe inside `url(#…)`. */
function useChartId() {
  return useId().replace(/:/g, '')
}

interface ChartDotProps {
  cx?: number
  cy?: number
  index?: number
}

/** A `dot` for a line or area that marks only its last point. */
function chartLastDot(count: number, color: string) {
  return function LastDot({ cx, cy, index }: ChartDotProps) {
    return index === count - 1 ? (
      <circle
        key={index}
        cx={cx}
        cy={cy}
        r={4}
        fill={color}
        stroke='var(--color-background)'
        strokeWidth={2}
      />
    ) : (
      <g key={index} />
    )
  }
}

/** A `dot` for a line or area that marks its last point as still filling: the dot pulses until the period ends and the line takes `chartLastDot` instead. */
function chartLiveDot(count: number, color: string) {
  return function LiveDot({ cx, cy, index }: ChartDotProps) {
    return index === count - 1 ? (
      <g key={index}>
        <circle
          cx={cx}
          cy={cy}
          r={4}
          fill={color}
          opacity={0.5}
          className='origin-center animate-ping [transform-box:fill-box] motion-reduce:hidden'
        />
        <circle
          cx={cx}
          cy={cy}
          r={4}
          fill={color}
          stroke='var(--color-background)'
          strokeWidth={2}
        />
      </g>
    ) : (
      <g key={index} />
    )
  }
}

interface ChartBarLabelProps {
  index?: number
  value?: unknown
  width?: number | string
  x?: number | string
  y?: number | string
}

/** A `LabelList` `content` that writes the value above the bar at `highlightIndex`. */
const NICE_STEPS = [1, 2, 2.5, 5]

/** Round ticks from 0 that leave a little room above `max`, at most `intervals` steps. */
function chartNiceTicks(max: number, intervals = 5) {
  const target = Math.max(max, 0) * 1.05 || 1
  const scale = 10 ** Math.floor(Math.log10(target / intervals))
  const step =
    [...NICE_STEPS, 10]
      .map((nice) => nice * scale)
      .find((candidate) => target / candidate <= intervals) ?? 10 * scale
  return Array.from({ length: Math.ceil(target / step) + 1 }, (_, index) =>
    Number((index * step).toPrecision(12)),
  )
}

function chartBarValueLabel(
  highlightIndex: number | undefined,
  formatter: ChartValueFormatter = formatNumber,
) {
  return function BarValueLabel({ index, value, width, x, y }: ChartBarLabelProps) {
    if (index !== highlightIndex) return null
    return (
      <text
        x={Number(x) + Number(width) / 2}
        y={Number(y) - 6}
        textAnchor='middle'
        fontSize={11}
        fontWeight={500}
        fill='var(--color-foreground)'
      >
        {formatter(Number(value))}
      </text>
    )
  }
}

function ChartTooltipFrame({ children }: { children: ReactNode }) {
  return (
    <div className='bg-popover text-popover-foreground grid min-w-32 items-start gap-1.5 rounded-md px-2.5 py-1.5 text-xs shadow-md ring-1 ring-foreground/10'>
      {children}
    </div>
  )
}

interface ChartTooltipItemProps {
  /** Draws a swatch before the name; leave it out for a plain label and value. */
  color?: string
  name?: ReactNode
  value: ReactNode
}

function ChartTooltipItem({ color, name, value }: ChartTooltipItemProps) {
  return (
    <div className='flex items-center gap-1.5'>
      {color !== undefined && (
        <div
          className='size-2.5 shrink-0 rounded-[2px]'
          style={{ backgroundColor: color }}
        />
      )}
      {name !== undefined && <span className='text-muted-foreground'>{name}</span>}
      <span className='ml-auto pl-3 font-medium tabular-nums'>{value}</span>
    </div>
  )
}

/** A line under a tooltip's values about the hovered point, such as the release that shipped that day. */
function ChartTooltipNote({ children }: { children: ReactNode }) {
  return <div className='border-t pt-1.5'>{children}</div>
}

type ChartTooltipContentProps = Partial<
  Pick<TooltipContentProps<ValueType, NameType>, 'active' | 'label' | 'payload'>
> & {
  formatLabel?: (label: string) => string
  valueFormatter?: ChartValueFormatter
}

function ChartTooltipContent({
  active,
  formatLabel,
  label,
  payload,
  valueFormatter = formatNumber,
}: ChartTooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null

  const heading = label !== undefined && label !== '' ? String(label) : undefined

  return (
    <ChartTooltipFrame>
      {heading && (
        <span className='font-medium'>
          {formatLabel ? formatLabel(heading) : heading}
        </span>
      )}
      {payload.map((item, index) => (
        <ChartTooltipItem
          key={`${String(item.dataKey ?? item.name)}-${index}`}
          color={
            (item.color as string | undefined) ??
            (item.payload as { fill?: string } | undefined)?.fill ??
            'var(--color-foreground)'
          }
          name={payload.length > 1 ? item.name : undefined}
          value={valueFormatter(Number(item.value))}
        />
      ))}
    </ChartTooltipFrame>
  )
}

function pointLabel(payload: ChartTooltipContentProps['payload']) {
  const label = (payload?.[0]?.payload as { label?: string | number } | undefined)?.label
  return label === undefined ? undefined : String(label)
}

interface ChartFloatingTooltipProps {
  active: boolean
  children: ReactNode
  /** Opens to the left of the point instead of the right, such as past the middle of the chart. */
  flip?: boolean
  /** The hovered point, in px from the top left of the nearest positioned parent. */
  x: number
  y: number
}

function ChartFloatingTooltip({
  active,
  children,
  flip,
  x,
  y,
}: ChartFloatingTooltipProps) {
  const offset = 10
  return (
    <div
      aria-hidden
      className='pointer-events-none absolute top-0 left-0 z-10 transition-transform duration-400 ease-out motion-reduce:transition-none'
      style={{
        transform: `translate(${flip ? `calc(${x - offset}px - 100%)` : `${x + offset}px`}, ${y + offset}px)`,
        visibility: active ? 'visible' : 'hidden',
      }}
    >
      <ChartTooltipFrame>{children}</ChartTooltipFrame>
    </div>
  )
}

interface ChartPlaceholderProps {
  className?: string
  height?: number | string
}

function ChartPlaceholder({ className, height = 180 }: ChartPlaceholderProps) {
  const state = useBlockState()

  return (
    <div
      aria-hidden
      data-slot='chart-placeholder'
      className={cn(
        'w-full',
        state === 'loading'
          ? 'bg-muted animate-pulse rounded-md motion-reduce:animate-none'
          : 'border-b border-dashed',
        className,
      )}
      style={{ height }}
    />
  )
}

interface TinyBarChartProps {
  /** Turn off inside a `role='img'` wrapper, such as `KPIChart`: its children are hidden from assistive tech, so the chart's keyboard layer would be a tab stop that a screen reader announces as nothing. */
  accessibilityLayer?: boolean
  bars: BarProps[]
  className?: string
  /** Names the chart for keyboard and screen reader users while its keyboard layer is on. */
  label?: string
  data: unknown[]
  formatter?: ChartValueFormatter
  height?: number | string
  /** Draws this bar in full colour and the others faded, with its value above it. */
  highlightIndex?: number
  /** Writes the highlighted bar's value above it. @default true */
  highlightLabel?: boolean
  /** A dashed line across the bars, such as an average or a target. */
  reference?: { label: string; value: number }
  /** Shows the first letter of this key under each bar. */
  xAxisKey?: string
}

function TinyBarChart({
  accessibilityLayer = true,
  bars,
  className,
  label,
  data,
  formatter,
  height = 180,
  highlightIndex,
  highlightLabel = true,
  reference,
  xAxisKey,
}: TinyBarChartProps) {
  const state = useBlockState()
  if (state) return <ChartPlaceholder className={className} height={height} />

  const safeData = Array.isArray(data) ? data : []
  const resolvedBars = Array.isArray(bars) && bars.length > 0 ? bars : []
  const highlighted = highlightIndex !== undefined && highlightIndex >= 0
  const labelled = highlighted && highlightLabel

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart
          accessibilityLayer={accessibilityLayer}
          aria-label={label}
          data={safeData}
          margin={
            labelled
              ? { top: 18, right: 0, bottom: 0, left: 0 }
              : highlighted
                ? { top: 0, right: 0, bottom: 0, left: 0 }
                : undefined
          }
        >
          {xAxisKey && (
            <XAxis
              {...chartAxisProps}
              dataKey={xAxisKey}
              interval={0}
              tickFormatter={(value: string) => String(value).charAt(0)}
            />
          )}
          {reference && (
            <ReferenceLine
              {...chartReferenceProps}
              y={reference.value}
              label={{
                ...chartReferenceLabel,
                value: reference.label,
                position: 'insideBottomLeft',
                dy: -4,
              }}
            />
          )}
          <Tooltip
            content={({ active, payload }) => (
              <ChartTooltipContent
                active={active}
                label={pointLabel(payload)}
                payload={payload}
                valueFormatter={formatter}
              />
            )}
            cursor={chartBarCursor}
          />
          {resolvedBars.map((barProps, index) => {
            const dataKey =
              typeof barProps.dataKey === 'string' || typeof barProps.dataKey === 'number'
                ? barProps.dataKey
                : index

            return (
              <Bar
                key={String(dataKey)}
                radius={barProps.radius ?? [4, 4, 0, 0]}
                {...barProps}
              >
                {highlighted &&
                  index === 0 &&
                  safeData.map((_, cell) => (
                    <Cell
                      key={cell}
                      fill={
                        cell === highlightIndex
                          ? String(barProps.fill)
                          : chartFadedColor(String(barProps.fill))
                      }
                    />
                  ))}
                {labelled && index === 0 && (
                  <LabelList
                    dataKey={dataKey}
                    content={chartBarValueLabel(highlightIndex, formatter)}
                  />
                )}
              </Bar>
            )
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface TinyLineChartProps {
  /** Turn off inside a `role='img'` wrapper, such as `KPIChart`: its children are hidden from assistive tech, so the chart's keyboard layer would be a tab stop that a screen reader announces as nothing. */
  accessibilityLayer?: boolean
  className?: string
  /** Names the chart for keyboard and screen reader users while its keyboard layer is on. */
  label?: string
  data: unknown[]
  formatter?: ChartValueFormatter
  height?: number | string
  lines: LineProps[]
}

function TinyLineChart({
  accessibilityLayer = true,
  className,
  label,
  data,
  formatter,
  height = 180,
  lines,
}: TinyLineChartProps) {
  const state = useBlockState()
  if (state) return <ChartPlaceholder className={className} height={height} />

  const safeData = Array.isArray(data) ? data : []
  const resolvedLines = Array.isArray(lines) && lines.length > 0 ? lines : []

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart
          accessibilityLayer={accessibilityLayer}
          aria-label={label}
          data={safeData}
        >
          <Tooltip
            content={({ active, payload }) => (
              <ChartTooltipContent
                active={active}
                label={pointLabel(payload)}
                payload={payload}
                valueFormatter={formatter}
              />
            )}
            cursor={chartLineCursor}
          />
          {resolvedLines.map((lineProps, index) => {
            const dataKey =
              typeof lineProps.dataKey === 'string' ||
              typeof lineProps.dataKey === 'number'
                ? lineProps.dataKey
                : index

            return (
              <Line
                key={String(dataKey)}
                type={lineProps.type ?? 'monotone'}
                strokeWidth={lineProps.strokeWidth ?? 2}
                dot={lineProps.dot ?? { r: 4 }}
                {...lineProps}
              />
            )
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

interface TinyAreaChartProps {
  /** Turn off inside a `role='img'` wrapper, such as `KPIChart`: its children are hidden from assistive tech, so the chart's keyboard layer would be a tab stop that a screen reader announces as nothing. */
  accessibilityLayer?: boolean
  /** An area's `fill` fades from its `fillOpacity` at the top to nothing at the bottom. Set `fill='none'` for a line. */
  areas: AreaProps[]
  className?: string
  /** Names the chart for keyboard and screen reader users while its keyboard layer is on. */
  label?: string
  data: unknown[]
  formatter?: ChartValueFormatter
  height?: number | string
  /** Marks the last point of the area with this `dataKey`. */
  markLast?: string
  /** `data` starts the scale near the lowest value, so small changes show. @default 'zero' */
  scale?: 'zero' | 'data'
  /** Shows the first letter of this key under each point. */
  xAxisKey?: string
}

function TinyAreaChart({
  accessibilityLayer = true,
  areas,
  className,
  label,
  data,
  formatter,
  height = 180,
  markLast,
  scale = 'zero',
  xAxisKey,
}: TinyAreaChartProps) {
  const id = useChartId()
  const state = useBlockState()
  const safeData = Array.isArray(data) ? data : []
  const resolvedAreas = Array.isArray(areas) && areas.length > 0 ? areas : []

  if (state) return <ChartPlaceholder className={className} height={height} />

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width='100%' height='100%'>
        <AreaChart
          accessibilityLayer={accessibilityLayer}
          aria-label={label}
          data={safeData}
          margin={{ top: 6, right: 6, bottom: 0, left: 6 }}
        >
          <defs>
            {resolvedAreas.map((areaProps, index) =>
              typeof areaProps.fill === 'string' && areaProps.fill !== 'none' ? (
                <linearGradient
                  key={index}
                  id={`${id}-${index}`}
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop
                    offset='0%'
                    stopColor={areaProps.fill}
                    stopOpacity={Number(areaProps.fillOpacity ?? 0.3)}
                  />
                  <stop offset='100%' stopColor={areaProps.fill} stopOpacity={0} />
                </linearGradient>
              ) : null,
            )}
          </defs>
          {xAxisKey && (
            <XAxis
              {...chartAxisProps}
              dataKey={xAxisKey}
              interval={0}
              tickFormatter={(value: string) => String(value).charAt(0)}
            />
          )}
          <YAxis
            hide
            domain={
              scale === 'data'
                ? [(min: number) => min - (Math.abs(min) || 1) * 0.15, 'dataMax']
                : [0, 'auto']
            }
          />
          <Tooltip
            content={({ active, payload }) => (
              <ChartTooltipContent
                active={active}
                label={pointLabel(payload)}
                payload={payload}
                valueFormatter={formatter}
              />
            )}
            cursor={chartLineCursor}
          />
          {resolvedAreas.map((areaProps, index) => {
            const dataKey =
              typeof areaProps.dataKey === 'string' ||
              typeof areaProps.dataKey === 'number'
                ? areaProps.dataKey
                : index
            const gradient =
              typeof areaProps.fill === 'string' && areaProps.fill !== 'none'
            const stroke = String(areaProps.stroke ?? 'var(--color-chart-2)')

            return (
              <Area
                key={String(dataKey)}
                type={areaProps.type ?? 'monotone'}
                strokeWidth={areaProps.strokeWidth ?? 2}
                activeDot={chartActiveDot}
                dot={markLast === dataKey ? chartLastDot(safeData.length, stroke) : false}
                {...areaProps}
                fill={gradient ? `url(#${id}-${index})` : 'none'}
                fillOpacity={1}
              />
            )
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

interface ChartMarker {
  /** The x axis value the marker stands on, such as the day in the axis's `dataKey`. */
  x: string | number
  label: string
}

type ChartMarkerAnchor = 'start' | 'end'

const MARKER_CHAR_WIDTH = 6.6
const MARKER_GAP = 9
const MARKER_SPACE = 12

/**
 * Where each marker's name goes: left of its line (`end`), or right of it (`start`) when the left
 * side runs off the plot. `null` when two names can't both fit, so every marker is drawn as a
 * numbered pin instead. `xs` are the markers' positions in px, left to right.
 */
function layoutChartMarkers(
  xs: number[],
  labels: string[],
  plot: { left: number; right: number },
): ChartMarkerAnchor[] | null {
  const anchors: ChartMarkerAnchor[] = []
  let taken = plot.left - MARKER_SPACE
  for (const [index, x] of xs.entries()) {
    const width = labels[index].length * MARKER_CHAR_WIDTH
    const before = x - MARKER_GAP - width
    if (before >= plot.left && before >= taken + MARKER_SPACE) {
      anchors.push('end')
      taken = x
      continue
    }
    const after = x + MARKER_GAP + width
    if (after > plot.right || x < taken + MARKER_SPACE) return null
    anchors.push('start')
    taken = after
  }
  return anchors
}

interface ChartMarkersProps {
  /** Milliseconds before the first marker drops in, such as the time the chart's line takes to draw. @default 0 */
  delay?: number
  markers: ChartMarker[]
  /** Called with the markers in their pins' order when the names don't fit and they show as numbered pins, and with `null` when they show their names. Draw `ChartMarkerKey` from it under the chart. */
  onPinsChange?: (pins: ChartMarker[] | null) => void
}

/**
 * Named dashed lines across a cartesian chart, such as releases: put it inside the chart, and leave
 * about 24px of top margin for the names. A marker's line turns the chart's colour while the
 * tooltip is on its point. Names that don't fit become numbered pins.
 */
function ChartMarkers({ delay = 0, markers, onPinsChange }: ChartMarkersProps) {
  const scale = useXAxisScale()
  const plot = usePlotArea()
  const activeLabel = useActiveTooltipLabel()

  const placed =
    scale && plot
      ? markers
          .map((marker) => ({ ...marker, at: scale(marker.x, { position: 'middle' }) }))
          .filter(
            (marker): marker is ChartMarker & { at: number } => marker.at !== undefined,
          )
          .sort((a, b) => a.at - b.at)
      : []
  const anchors = plot
    ? layoutChartMarkers(
        placed.map((marker) => marker.at),
        placed.map((marker) => marker.label),
        { left: plot.x, right: plot.x + plot.width },
      )
    : []
  const pins =
    anchors === null ? JSON.stringify(placed.map(({ label, x }) => ({ label, x }))) : null

  useEffect(() => {
    onPinsChange?.(pins === null ? null : (JSON.parse(pins) as ChartMarker[]))
  }, [onPinsChange, pins])

  if (!plot) return null
  const top = plot.y

  return (
    <g aria-hidden data-slot='chart-markers'>
      {placed.map((marker, index) => {
        const active =
          activeLabel !== undefined && String(activeLabel) === String(marker.x)
        const color = active ? 'var(--color-chart-2)' : 'var(--color-foreground)'
        const anchor = anchors?.[index]
        return (
          <g
            key={`${marker.x}-${marker.label}`}
            className='animate-in fade-in slide-in-from-top-2 fill-mode-both duration-500 ease-out motion-reduce:animate-none'
            style={{ animationDelay: `${delay + index * 180}ms` }}
          >
            <line
              x1={marker.at}
              x2={marker.at}
              y1={top}
              y2={top + plot.height}
              stroke={active ? 'var(--color-chart-2)' : chartReferenceColor}
              strokeDasharray='3 3'
              className='transition-[stroke] duration-200'
            />
            {anchor ? (
              <>
                <circle
                  cx={marker.at}
                  cy={top - 7}
                  r={3}
                  fill={color}
                  className='transition-[fill] duration-200'
                />
                <text
                  x={anchor === 'end' ? marker.at - MARKER_GAP : marker.at + MARKER_GAP}
                  y={top - 3}
                  textAnchor={anchor}
                  fontSize={12}
                  fontWeight={500}
                  fill={color}
                  className='transition-[fill] duration-200'
                >
                  {marker.label}
                </text>
              </>
            ) : (
              <>
                <circle
                  cx={marker.at}
                  cy={top - 10}
                  r={8}
                  fill={color}
                  className='transition-[fill] duration-200'
                />
                <text
                  x={marker.at}
                  y={top - 6}
                  textAnchor='middle'
                  fontSize={11}
                  fontWeight={600}
                  fill='var(--color-background)'
                >
                  {index + 1}
                </text>
              </>
            )}
          </g>
        )
      })}
    </g>
  )
}

/** The names of `ChartMarkers` shown as numbered pins, in the pins' order: put it under the chart. */
function ChartMarkerKey({
  className,
  markers,
}: {
  className?: string
  markers: ChartMarker[]
}) {
  return (
    <ol
      aria-hidden
      data-slot='chart-marker-key'
      className={cn('flex flex-wrap gap-x-4 gap-y-1.5 text-xs', className)}
    >
      {markers.map((marker, index) => (
        <li
          key={`${marker.x}-${marker.label}`}
          className='flex min-w-0 items-center gap-1.5'
        >
          <span className='bg-foreground text-background grid size-4 shrink-0 place-items-center rounded-full font-semibold tabular-nums'>
            {index + 1}
          </span>
          <span className='truncate'>{marker.label}</span>
        </li>
      ))}
    </ol>
  )
}

export {
  ChartFloatingTooltip,
  ChartHatch,
  ChartMarkerKey,
  ChartEdgeTick,
  ChartMarkers,
  ChartPlaceholder,
  ChartTooltipContent,
  ChartTooltipFrame,
  ChartTooltipItem,
  ChartTooltipNote,
  TinyAreaChart,
  TinyBarChart,
  TinyLineChart,
  chartActiveDot,
  chartAxisProps,
  chartBarCursor,
  chartBarValueLabel,
  chartFadedColor,
  chartGridProps,
  chartLastDot,
  chartLineCursor,
  chartLiveDot,
  chartNiceTicks,
  chartReferenceColor,
  chartReferenceLabel,
  chartReferenceProps,
  chartTimeGridProps,
  chartValueAxisWidth,
  layoutChartMarkers,
  useChartId,
}

export type {
  ChartEdgeTickProps,
  ChartMarker,
  ChartMarkerAnchor,
  ChartMarkersProps,
  ChartPlaceholderProps,
  ChartFloatingTooltipProps,
  ChartTooltipContentProps,
  ChartTooltipItemProps,
  ChartValueFormatter,
  TinyAreaChartProps,
  TinyBarChartProps,
  TinyLineChartProps,
}
