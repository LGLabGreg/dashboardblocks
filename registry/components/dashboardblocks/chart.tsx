'use client'

import { useBlockState } from '@/registry/components/dashboardblocks/block-state'
import { formatNumber } from '@/registry/lib/dashboardblocks/format'
import { type ComponentProps, type ReactNode, useId } from 'react'
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
  Tooltip,
  type TooltipContentProps,
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

const chartReferenceProps = {
  stroke: 'var(--color-foreground)',
  strokeDasharray: '3 3',
  strokeOpacity: 0.4,
} as const

const chartReferenceLabel = {
  fill: 'var(--color-muted-foreground)',
  fontSize: 11,
} as const

/** The rest of a series beside a highlighted mark. */
function chartFadedColor(color: string) {
  return `color-mix(in oklab, ${color} 30%, transparent)`
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

interface ChartBarLabelProps {
  index?: number
  value?: unknown
  width?: number | string
  x?: number | string
  y?: number | string
}

/** A `LabelList` `content` that writes the value above the bar at `highlightIndex`. */
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

export {
  ChartFloatingTooltip,
  ChartPlaceholder,
  ChartTooltipContent,
  ChartTooltipFrame,
  ChartTooltipItem,
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
  chartReferenceLabel,
  chartReferenceProps,
  chartTimeGridProps,
  chartValueAxisWidth,
  useChartId,
}

export type {
  ChartPlaceholderProps,
  ChartFloatingTooltipProps,
  ChartTooltipContentProps,
  ChartTooltipItemProps,
  ChartValueFormatter,
  TinyAreaChartProps,
  TinyBarChartProps,
  TinyLineChartProps,
}
