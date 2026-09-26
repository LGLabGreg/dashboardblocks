'use client'

import {
  ChartPanelTooltip,
  type ChartValueFormatter,
} from '@/registry/components/dashboardblocks/chart-panel'
import { useInView } from '@/registry/hooks/use-in-view'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type RefObject, useEffect, useState } from 'react'
import type { TooltipContentProps } from 'recharts'
import type {
  NameType,
  Payload,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent'

import { cn } from '@/lib/utils'

type ConfidenceLevel = 0.8 | 0.9 | 0.95

/** Two-sided z-scores from the normal distribution. */
const zScores: Record<ConfidenceLevel, number> = { 0.8: 1.2816, 0.9: 1.6449, 0.95: 1.96 }

interface LinearFit {
  intercept: number
  meanX: number
  n: number
  /** Spread of the actuals around the line. */
  residualSd: number
  /** Change per step. */
  slope: number
  sxx: number
}

/** Least-squares straight line through `values`, with the index as x. */
function fitLinear(values: number[]): LinearFit {
  const n = values.length
  const meanX = (n - 1) / 2
  const meanY = n > 0 ? values.reduce((sum, value) => sum + value, 0) / n : 0
  let sxx = 0
  let sxy = 0
  values.forEach((value, x) => {
    sxx += (x - meanX) ** 2
    sxy += (x - meanX) * (value - meanY)
  })
  const slope = sxx > 0 ? sxy / sxx : 0
  const intercept = meanY - slope * meanX
  const squaredError = values.reduce(
    (sum, value, x) => sum + (value - (intercept + slope * x)) ** 2,
    0,
  )
  const residualSd = n > 2 ? Math.sqrt(squaredError / (n - 2)) : 0
  return { intercept, meanX, n, residualSd, slope, sxx }
}

interface Prediction {
  high: number
  low: number
  value: number
}

/**
 * The fitted value at `x`, with a prediction interval that widens the further
 * `x` is from the actuals. A normal approximation: good enough to show
 * uncertainty on a dashboard, not to plan capacity on.
 */
function predictLinear(fit: LinearFit, x: number, level: ConfidenceLevel = 0.8) {
  const value = fit.intercept + fit.slope * x
  const leverage = fit.sxx > 0 ? (x - fit.meanX) ** 2 / fit.sxx : 0
  const margin =
    fit.n > 0 ? zScores[level] * fit.residualSd * Math.sqrt(1 + 1 / fit.n + leverage) : 0
  return { high: value + margin, low: value - margin, value } satisfies Prediction
}

interface ForecastRow {
  actual: number | null
  /** Low and high together, for a Recharts range area. */
  band: [number, number] | null
  forecast: number | null
  high: number | null
  low: number | null
}

/**
 * The actuals followed by `horizon` forecast steps on a straight-line fit.
 * The forecast starts at the last actual with no width, so the dashed line
 * and the band join the actuals.
 */
function buildForecast(values: number[], horizon: number, level: ConfidenceLevel = 0.8) {
  const fit = fitLinear(values)
  const last = values.length - 1
  const rows: ForecastRow[] = values.map((value, index) =>
    index === last
      ? { actual: value, band: [value, value], forecast: value, high: value, low: value }
      : { actual: value, band: null, forecast: null, high: null, low: null },
  )
  for (let step = 1; step <= horizon; step++) {
    const { high, low, value } = predictLinear(fit, last + step, level)
    rows.push({ actual: null, band: [low, high], forecast: value, high, low })
  }
  return { fit, rows }
}

interface TargetForecast {
  /** Steps after the last actual when the interval first reaches the target. */
  earliest: number | null
  /** Steps after the last actual when the fitted line reaches the target. */
  expected: number | null
  /**
   * Steps after the last actual when the whole interval has reached the
   * target. `null` if that doesn't happen within `maxSteps`.
   */
  latest: number | null
  reached: boolean
}

interface SolveForTargetOptions {
  /** @default 'up' */
  direction?: 'up' | 'down'
  /** @default 0.8 */
  level?: ConfidenceLevel
  /** How far ahead to look for the interval, in steps. @default 104 */
  maxSteps?: number
  /** The precision of `earliest` and `latest`, in steps. @default 0.1 */
  resolution?: number
}

/** When the trend in `values` reaches `target`, in steps after the last actual. */
function solveForTarget(
  values: number[],
  target: number,
  {
    direction = 'up',
    level = 0.8,
    maxSteps = 104,
    resolution = 0.1,
  }: SolveForTargetOptions = {},
): TargetForecast {
  const current = values[values.length - 1] ?? 0
  const reaches = (value: number) =>
    direction === 'up' ? value >= target : value <= target
  if (reaches(current)) return { earliest: 0, expected: 0, latest: 0, reached: true }

  const fit = fitLinear(values)
  const last = values.length - 1
  const heading = direction === 'up' ? fit.slope > 0 : fit.slope < 0
  const expected = heading
    ? Math.max(0, (target - fit.intercept) / fit.slope - last)
    : null

  let earliest: number | null = null
  let latest: number | null = null
  for (let index = 1; index * resolution <= maxSteps; index++) {
    const step = index * resolution
    const { high, low } = predictLinear(fit, last + step, level)
    if (earliest === null && reaches(direction === 'up' ? high : low)) earliest = step
    if (reaches(direction === 'up' ? low : high)) {
      latest = step
      break
    }
  }
  return { earliest, expected, latest, reached: false }
}

interface RunRate {
  /** The period total if the rate so far holds. */
  projected: number
  /** Average per unit so far, such as per day. */
  rate: number
  remaining: number
  /** The rate needed over what's left to reach the target. */
  required: number | null
}

interface RunRateInput {
  current: number
  /** Units of the period that have passed, such as days. */
  elapsed: number
  target?: number
  /** Units in the whole period. */
  total: number
}

/** Projects the period total from the average rate so far. */
function getRunRate({ current, elapsed, target, total }: RunRateInput): RunRate {
  const rate = elapsed > 0 ? current / elapsed : 0
  const remaining = Math.max(0, total - elapsed)
  return {
    projected: current + rate * remaining,
    rate,
    remaining,
    required:
      target !== undefined && remaining > 0
        ? Math.max(0, (target - current) / remaining)
        : null,
  }
}

/** Values after compounding `start` by `rate` per step, for scenarios. */
function projectGrowth(start: number, rate: number, steps: number) {
  return Array.from({ length: steps }, (_, index) => start * (1 + rate) ** (index + 1))
}

/**
 * A y-axis domain and evenly spaced ticks on round numbers that fit every
 * value, ignoring nulls. Forecast charts rarely start at zero, so the axis
 * hugs the data.
 */
function getForecastAxis(values: (number | null)[], tickCount = 5) {
  const numbers = values.filter((value): value is number => value !== null)
  const min = numbers.length > 0 ? Math.min(...numbers) : 0
  const max = numbers.length > 0 ? Math.max(...numbers) : 1
  const rough = Math.max(max - min, Math.abs(max) / 10, 1) / (tickCount - 1)
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const step =
    ([1, 2, 2.5, 5, 10].find((multiple) => multiple * magnitude >= rough) ?? 10) *
    magnitude
  const low = Math.floor(min / step) * step
  const count = Math.max(1, Math.ceil((max - low) / step))
  const ticks = Array.from({ length: count + 1 }, (_, index) => low + index * step)
  return { domain: [low, ticks[count]] as [number, number], ticks }
}

type ForecastStatus = 'reached' | 'on-track' | 'at-risk' | 'off-track'

/**
 * On track when even the conservative date meets the deadline, at risk when
 * only the expected date does, off track otherwise.
 */
function getDeadlineStatus(forecast: TargetForecast, deadline: number): ForecastStatus {
  if (forecast.reached) return 'reached'
  if (forecast.latest !== null && forecast.latest <= deadline) return 'on-track'
  if (forecast.expected !== null && forecast.expected <= deadline) return 'at-risk'
  return 'off-track'
}

/** On track at or above the target, at risk within `tolerance` of it. */
function getProjectionStatus(projected: number, target: number, tolerance = 0.05) {
  const status: ForecastStatus =
    projected >= target
      ? 'on-track'
      : projected >= target * (1 - tolerance)
        ? 'at-risk'
        : 'off-track'
  return status
}

const forecastStatusConfig: Record<
  ForecastStatus,
  { className: string; icon: React.ReactNode; label: string; text: string }
> = {
  'at-risk': {
    className: 'bg-amber-500/10 text-amber-800 dark:text-amber-400',
    icon: (
      <IconPlaceholder
        lucide='TriangleAlertIcon'
        tabler='IconAlertTriangle'
        hugeicons='Alert02Icon'
        phosphor='WarningIcon'
        remixicon='RiErrorWarningLine'
        aria-hidden
      />
    ),
    label: 'At risk',
    text: 'text-amber-800 dark:text-amber-400',
  },
  'off-track': {
    className: 'bg-red-500/10 text-red-700 dark:text-red-400',
    icon: (
      <IconPlaceholder
        lucide='CircleXIcon'
        tabler='IconCircleX'
        hugeicons='CancelCircleIcon'
        phosphor='XCircleIcon'
        remixicon='RiCloseCircleLine'
        aria-hidden
      />
    ),
    label: 'Off track',
    text: 'text-red-700 dark:text-red-400',
  },
  'on-track': {
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    icon: (
      <IconPlaceholder
        lucide='TrendingUpIcon'
        tabler='IconTrendingUp'
        hugeicons='ChartUpIcon'
        phosphor='TrendUpIcon'
        remixicon='RiLineChartLine'
        aria-hidden
      />
    ),
    label: 'On track',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  reached: {
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    icon: (
      <IconPlaceholder
        lucide='CircleCheckIcon'
        tabler='IconCircleCheck'
        hugeicons='CheckmarkCircle02Icon'
        phosphor='CheckCircleIcon'
        remixicon='RiCheckboxCircleLine'
        aria-hidden
      />
    ),
    label: 'Target reached',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
}

/** The forecast status with its icon and label. Colour never carries it alone. */
function ForecastBadge({
  className,
  label,
  status,
}: {
  className?: string
  label?: string
  status: ForecastStatus
}) {
  const config = forecastStatusConfig[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0',
        config.className,
        className,
      )}
    >
      {config.icon}
      {label ?? config.label}
    </span>
  )
}

/** Actuals are solid and forecasts dashed in the same hue, so the two read as one series. */
const forecastColors = {
  actual: 'var(--chart-1)',
  band: 'color-mix(in oklab, var(--chart-1) 20%, transparent)',
  forecast: 'var(--chart-1)',
  marker: 'var(--color-foreground)',
  target: 'var(--color-muted-foreground)',
} as const

/** Dash patterns, so forecasts and targets differ from actuals without colour. */
const forecastDash = { forecast: '5 4', target: '2 3' } as const

type ForecastKeyShape =
  | 'line'
  | 'dashed'
  | 'dotted'
  | 'band'
  | 'marker'
  | 'dot'
  | 'bar'
  | 'striped'

/** A striped fill for projected amounts in bars. */
function stripes(color: string) {
  return `repeating-linear-gradient(-45deg, ${color} 0 2px, color-mix(in oklab, ${color} 25%, transparent) 2px 5px)`
}

function ForecastKey({
  className,
  color,
  shape,
}: {
  className?: string
  color?: string
  shape: ForecastKeyShape
}) {
  if (shape === 'bar' || shape === 'striped') {
    const fill = color ?? forecastColors.actual
    return (
      <span
        aria-hidden
        className={cn('inline-block size-2.5 shrink-0 rounded-[3px]', className)}
        style={
          shape === 'bar' ? { backgroundColor: fill } : { backgroundImage: stripes(fill) }
        }
      />
    )
  }
  const stroke =
    color ??
    (shape === 'dotted'
      ? forecastColors.target
      : shape === 'marker'
        ? forecastColors.marker
        : forecastColors.actual)
  return (
    <svg
      aria-hidden
      width='16'
      height='10'
      className={cn('shrink-0 overflow-visible', className)}
    >
      {shape === 'band' ? (
        <rect width='16' height='10' rx='2' fill={color ?? forecastColors.band} />
      ) : shape === 'dot' ? (
        <circle cx='8' cy='5' r='4' fill={stroke} />
      ) : shape === 'marker' ? (
        <line x1='8' y1='0' x2='8' y2='10' stroke={stroke} strokeWidth='1.5' />
      ) : (
        <line
          x1='0'
          y1='5'
          x2='16'
          y2='5'
          stroke={stroke}
          strokeDasharray={
            shape === 'dashed'
              ? forecastDash.forecast
              : shape === 'dotted'
                ? forecastDash.target
                : undefined
          }
          strokeWidth='2'
        />
      )}
    </svg>
  )
}

interface ForecastLegendItem {
  color?: string
  label: string
  shape: ForecastKeyShape
}

function ForecastLegend({
  className,
  items,
}: {
  className?: string
  items: ForecastLegendItem[]
}) {
  return (
    <ul
      className={cn(
        'text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs',
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.label} className='flex items-center gap-1.5'>
          <ForecastKey color={item.color} shape={item.shape} />
          {item.label}
        </li>
      ))}
    </ul>
  )
}

const rangeKeyColor = 'color-mix(in oklab, var(--chart-1) 40%, transparent)'

type ForecastTooltipProps = Partial<
  Pick<TooltipContentProps<ValueType, NameType>, 'active' | 'label' | 'payload'>
> & {
  formatLabel?: (label: string) => string
  /** @default 0.8 */
  level?: ConfidenceLevel
  valueFormatter?: ChartValueFormatter
}

/** The chart panel tooltip for a `buildForecast` row: the actual, or the forecast with its range. */
function ForecastTooltip({
  active,
  formatLabel,
  label,
  level = 0.8,
  payload,
  valueFormatter,
}: ForecastTooltipProps) {
  const row = payload?.[0]?.payload as ForecastRow | undefined
  if (!active || !row) return null
  const percent = `${level * 100}%`
  const items: Payload<ValueType, NameType>[] =
    row.actual !== null
      ? [
          {
            color: forecastColors.actual,
            dataKey: 'actual',
            graphicalItemId: 'actual',
            name: 'Actual',
            value: row.actual,
          },
        ]
      : [
          {
            color: forecastColors.forecast,
            dataKey: 'forecast',
            graphicalItemId: 'forecast',
            name: 'Forecast',
            value: row.forecast ?? 0,
          },
          {
            color: rangeKeyColor,
            dataKey: 'high',
            graphicalItemId: 'high',
            name: `High (${percent})`,
            value: row.high ?? 0,
          },
          {
            color: rangeKeyColor,
            dataKey: 'low',
            graphicalItemId: 'low',
            name: `Low (${percent})`,
            value: row.low ?? 0,
          },
        ]
  return (
    <ChartPanelTooltip
      active={active}
      formatLabel={formatLabel}
      label={label}
      payload={items}
      valueFormatter={valueFormatter}
    />
  )
}

interface ProjectionBarProps {
  animated?: boolean
  className?: string
  /** @default 'var(--chart-1)' */
  color?: string
  current: number
  /** The value at the right end. Defaults to the largest of the values. */
  max?: number
  projected: number
  target?: number
}

/**
 * The value so far as a solid bar, the projected rest as a striped bar and
 * the target as a tick. Decorative: show the values as text beside it.
 */
function ProjectionBar({
  animated = true,
  className,
  color = forecastColors.actual,
  current,
  max,
  projected,
  target,
}: ProjectionBarProps) {
  const { isInView, ref } = useInView({ threshold: 0.3 })
  const [revealed, setRevealed] = useState(!animated)

  useEffect(() => {
    if (!animated || !isInView) return
    const frame = requestAnimationFrame(() => setRevealed(true))
    return () => cancelAnimationFrame(frame)
  }, [animated, isInView])

  const scale = max ?? Math.max(current, projected, target ?? 0)
  const share = (value: number) =>
    scale > 0 ? Math.min(1, Math.max(0, value / scale)) * 100 : 0
  const actualWidth = share(current)
  const projectedWidth = Math.max(0, share(projected) - actualWidth)

  return (
    <div
      ref={ref as RefObject<HTMLDivElement>}
      aria-hidden
      className={cn('relative h-3 w-full', className)}
    >
      <div className='bg-muted flex h-full w-full overflow-hidden rounded-full'>
        <div
          className='h-full transition-[width] duration-1000 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none'
          style={{ backgroundColor: color, width: `${revealed ? actualWidth : 0}%` }}
        />
        <div
          className='h-full transition-[width] delay-300 duration-700 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none motion-reduce:delay-0'
          style={{
            backgroundImage: stripes(color),
            width: `${revealed ? projectedWidth : 0}%`,
          }}
        />
      </div>
      {target !== undefined && (
        <span
          className='bg-foreground ring-card absolute top-1/2 h-[calc(100%+8px)] w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2'
          style={{ left: `${share(target)}%` }}
        />
      )}
    </div>
  )
}

export {
  ForecastBadge,
  ForecastKey,
  ForecastLegend,
  ForecastTooltip,
  ProjectionBar,
  buildForecast,
  fitLinear,
  forecastColors,
  forecastDash,
  forecastStatusConfig,
  getDeadlineStatus,
  getForecastAxis,
  getProjectionStatus,
  getRunRate,
  predictLinear,
  projectGrowth,
  solveForTarget,
  stripes,
  zScores,
}

export type {
  ConfidenceLevel,
  ForecastKeyShape,
  ForecastLegendItem,
  ForecastRow,
  ForecastStatus,
  ForecastTooltipProps,
  LinearFit,
  Prediction,
  ProjectionBarProps,
  RunRate,
  RunRateInput,
  SolveForTargetOptions,
  TargetForecast,
}
