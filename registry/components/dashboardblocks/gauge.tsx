'use client'

import {
  BlockStateText,
  SkeletonText,
  useBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { useChartId } from '@/registry/components/dashboardblocks/chart'
import {
  StatusLabel,
  type StatusTone,
  statusToneClasses,
} from '@/registry/components/dashboardblocks/status-label'
import { useReveal } from '@/registry/hooks/use-reveal'
import { formatNumber } from '@/registry/lib/dashboardblocks/format'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type GaugeTone = 'positive' | 'caution' | 'critical' | 'neutral'

interface GaugeToneConfig {
  color: string
  stroke: string
  swatch: string
  text: string
  tone: StatusTone
}

const gaugeToneConfig: Record<GaugeTone, GaugeToneConfig> = {
  caution: {
    color: 'var(--color-orange-500)',
    stroke: 'stroke-orange-500',
    swatch: 'bg-orange-500',
    text: statusToneClasses.warning,
    tone: 'warning',
  },
  critical: {
    color: 'var(--color-red-600)',
    stroke: 'stroke-red-600',
    swatch: 'bg-red-600',
    text: statusToneClasses.bad,
    tone: 'bad',
  },
  neutral: {
    color: 'var(--color-muted-foreground)',
    stroke: 'stroke-muted-foreground',
    swatch: 'bg-muted-foreground',
    text: statusToneClasses.neutral,
    tone: 'neutral',
  },
  positive: {
    color: 'var(--color-emerald-600)',
    stroke: 'stroke-emerald-600',
    swatch: 'bg-emerald-600',
    text: statusToneClasses.good,
    tone: 'good',
  },
}

interface GaugeBand {
  from: number
  label: string
  to: number
  tone: GaugeTone
}

/** Where `value` sits between `min` and `max`, clamped to 0–1. */
function getGaugeShare(value: number, min: number, max: number) {
  const range = max - min
  if (range <= 0) return 0
  return Math.min(1, Math.max(0, (value - min) / range))
}

function getGaugeBand(value: number, bands: GaugeBand[]) {
  if (bands.length === 0) return undefined
  const found = bands.find(
    (band, index) =>
      value >= band.from &&
      (value < band.to || (index === bands.length - 1 && value <= band.to)),
  )
  if (found) return found
  return value < bands[0].from ? bands[0] : bands[bands.length - 1]
}

function getWeightedScore(items: { score: number; weight: number }[]) {
  const total = items.reduce((sum, item) => sum + item.weight, 0)
  if (total <= 0) return 0
  return items.reduce((sum, item) => sum + item.score * item.weight, 0) / total
}

interface NpsResponses {
  /** Scores 0–6. */
  detractors: number
  /** Scores 7–8. */
  passives: number
  /** Scores 9–10. */
  promoters: number
}

/** Net Promoter Score: the share of promoters minus the share of detractors, −100 to 100. */
function getNps({ detractors, passives, promoters }: NpsResponses) {
  const total = detractors + passives + promoters
  if (total === 0) {
    return { detractors: 0, passives: 0, promoters: 0, score: 0, total }
  }
  const shares = {
    detractors: detractors / total,
    passives: passives / total,
    promoters: promoters / total,
  }
  return {
    ...shares,
    score: Math.round((shares.promoters - shares.detractors) * 100),
    total,
  }
}

const CENTER = 50
const TARGET_MARKER_OVERHANG = 4
const BAND_GAP = 1.5
const SCALE_WIDTH = 3
const HALO = 1.5
const SURFACE = 'var(--gauge-surface, var(--color-card))'

const round = (value: number) => Math.round(value * 100) / 100

function polar(angle: number, radius: number) {
  const radians = (angle * Math.PI) / 180
  return {
    x: round(CENTER + radius * Math.sin(radians)),
    y: round(CENTER - radius * Math.cos(radians)),
  }
}

function arcPath(startAngle: number, endAngle: number, radius: number) {
  const start = polar(startAngle, radius)
  const end = polar(endAngle, radius)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

interface GaugeProps {
  animated?: boolean
  /** Labelled ranges on the scale, in order from `min` to `max`. */
  bands?: GaugeBand[]
  children?: ReactNode
  className?: string
  /** Ignored when `colorByBand` is set, `var(--color-chart-2)` by default. */
  color?: string
  colorByBand?: boolean
  formatScale?: (value: number) => string
  /** @default 'fill' */
  indicator?: 'fill' | 'marker'
  label: string
  /** @default 100 */
  max?: number
  /** @default 0 */
  min?: number
  origin?: number
  /** An earlier value, drawn as a faint tick across the scale. */
  previous?: number
  /** @default 180 */
  sweep?: 180 | 270
  target?: number
  /** In hundredths of the gauge's width, 10 by default. */
  thickness?: number
  value: number
  valueText?: string
}

function Gauge({
  animated = true,
  bands = [],
  children,
  className,
  color = 'var(--color-chart-2)',
  colorByBand = false,
  formatScale,
  indicator = 'fill',
  label,
  max = 100,
  min = 0,
  origin = min,
  previous,
  sweep = 180,
  target,
  thickness = 10,
  value,
  valueText,
}: GaugeProps) {
  const { ref, revealed } = useReveal(animated)
  const state = useBlockState()

  const radius = CENTER - TARGET_MARKER_OVERHANG - thickness / 2
  const startAngle = -sweep / 2
  const endAngle = sweep / 2
  const angleOf = (at: number) => startAngle + getGaugeShare(at, min, max) * sweep
  const end = polar(endAngle, radius)
  const height = round(Math.max(end.y, CENTER) + thickness / 2 + TARGET_MARKER_OVERHANG)
  const track = arcPath(startAngle, endAngle, radius)

  const band = getGaugeBand(value, bands)
  const tint = colorByBand && band ? gaugeToneConfig[band.tone].color : color
  const knobColor =
    indicator === 'marker' && band ? gaugeToneConfig[band.tone].color : tint
  const gradientId = useChartId()
  const gradientFrom = polar(angleOf(origin), radius)
  const gradientTo = polar(angleOf(value), radius)
  const gradient =
    Math.hypot(gradientTo.x - gradientFrom.x, gradientTo.y - gradientFrom.y) > 4
  const valueShare = getGaugeShare(value, min, max)
  const originShare = getGaugeShare(origin, min, max)
  const shown = revealed ? valueShare : originShare
  const fillStart = Math.min(originShare, shown) * 100
  const fillLength = Math.abs(shown - originShare) * 100
  const cap = (thickness / 2 / ((radius * sweep * Math.PI) / 180)) * 100
  const startInset = fillStart > 0 ? cap : 0
  const endInset = fillStart + fillLength < 100 ? cap : 0
  const dashStart = fillStart + startInset
  const dashLength = Math.max(0, fillLength - startInset - endInset)

  const bandRadius =
    indicator === 'marker' ? radius : radius - thickness / 2 - 2.5 - SCALE_WIDTH / 2
  const bandWidth = indicator === 'marker' ? thickness : SCALE_WIDTH
  const gapAngle = (BAND_GAP / bandRadius) * (180 / Math.PI)

  const previousTick =
    previous !== undefined &&
    previous >= min &&
    previous <= max &&
    !(indicator === 'marker' && Math.abs(previous - value) < (max - min) * 0.04)
      ? {
          inner: polar(angleOf(previous), radius - thickness / 2 - 2.5),
          outer: polar(angleOf(previous), radius + thickness / 2 + 2.5),
        }
      : undefined

  const motion =
    'duration-1000 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none'
  const scaleEnd = polar(startAngle, radius)
  const scaleInset = `${scaleEnd.x}%`

  return (
    <div
      ref={ref}
      role={state ? undefined : 'meter'}
      aria-label={state ? undefined : label}
      aria-valuemax={state ? undefined : max}
      aria-valuemin={state ? undefined : min}
      aria-valuenow={state ? undefined : value}
      aria-valuetext={state ? undefined : valueText}
      className={cn('relative shrink-0', className)}
    >
      <div className='relative'>
        <svg
          aria-hidden
          viewBox={`0 0 100 ${height}`}
          className={cn(
            'block h-auto w-full overflow-visible',
            state === 'loading' && 'animate-pulse motion-reduce:animate-none',
          )}
          fill='none'
        >
          {gradient && (
            <defs>
              <linearGradient
                id={gradientId}
                gradientUnits='userSpaceOnUse'
                x1={gradientFrom.x}
                x2={gradientTo.x}
                y1={gradientFrom.y}
                y2={gradientTo.y}
              >
                <stop
                  offset='0'
                  stopColor={`color-mix(in oklab, ${tint} 40%, ${SURFACE})`}
                />
                <stop offset='1' stopColor={tint} />
              </linearGradient>
            </defs>
          )}
          {(state || indicator === 'fill' || bands.length === 0) && (
            <path
              d={track}
              className={state ? 'stroke-muted' : undefined}
              style={
                state
                  ? undefined
                  : { stroke: `color-mix(in oklab, ${tint} 14%, transparent)` }
              }
              strokeLinecap='round'
              strokeWidth={state ? thickness : thickness + HALO * 2}
            />
          )}
          {!state &&
            bands.map((item, index) => {
              const first = index === 0
              const last = index === bands.length - 1
              const from = angleOf(item.from) + (first ? 0 : gapAngle / 2)
              const to = angleOf(item.to) - (last ? 0 : gapAngle / 2)
              if (to <= from) return null
              const toneColor = gaugeToneConfig[item.tone].color
              const stroke =
                indicator === 'marker' && item !== band
                  ? `color-mix(in oklab, ${toneColor} 30%, ${SURFACE})`
                  : toneColor
              const ends = [
                first && polar(from, bandRadius),
                last && polar(to, bandRadius),
              ]
              return (
                <g key={item.label}>
                  <path
                    d={arcPath(from, to, bandRadius)}
                    stroke={stroke}
                    strokeWidth={bandWidth}
                  />
                  {ends.map(
                    (point, end) =>
                      point && (
                        <circle
                          key={end}
                          cx={point.x}
                          cy={point.y}
                          fill={stroke}
                          r={bandWidth / 2}
                        />
                      ),
                  )}
                </g>
              )
            })}
          {!state && indicator === 'fill' && (
            <path
              d={track}
              pathLength={100}
              className={cn('transition-[stroke-dasharray,stroke-dashoffset]', motion)}
              style={{ stroke: gradient ? `url(#${gradientId})` : tint }}
              strokeDasharray={`${round(dashLength)} ${round(200 - dashLength)}`}
              strokeDashoffset={round(200 - dashStart)}
              strokeLinecap='round'
              strokeOpacity={fillLength > 0 ? 1 : 0}
              strokeWidth={thickness}
            />
          )}
          {!state && target !== undefined && target >= min && target <= max && (
            <g strokeLinecap='round'>
              {[
                { stroke: SURFACE, width: 5 },
                { stroke: 'var(--color-foreground)', width: 2 },
              ].map((line) => {
                const angle = angleOf(target)
                const inner = polar(angle, radius - thickness / 2 - 2.5)
                const outer = polar(angle, radius + thickness / 2 + 2.5)
                return (
                  <line
                    key={line.width}
                    stroke={line.stroke}
                    strokeWidth={line.width}
                    x1={inner.x}
                    x2={outer.x}
                    y1={inner.y}
                    y2={outer.y}
                  />
                )
              })}
            </g>
          )}
          {!state && previousTick && (
            <line
              className='stroke-muted-foreground'
              strokeLinecap='round'
              strokeOpacity={0.6}
              strokeWidth={1.5}
              x1={previousTick.inner.x}
              x2={previousTick.outer.x}
              y1={previousTick.inner.y}
              y2={previousTick.outer.y}
            />
          )}
          {!state && (indicator === 'marker' || valueShare !== originShare) && (
            <g
              className={cn('drop-shadow-sm transition-transform', motion)}
              style={{
                transform: `rotate(${round(startAngle + shown * sweep)}deg)`,
                transformOrigin: `${CENTER}px ${CENTER}px`,
              }}
            >
              <circle
                cx={CENTER}
                cy={CENTER - radius}
                fill={`color-mix(in oklab, ${knobColor} 80%, var(--color-foreground))`}
                r={thickness / 2 + 1}
                stroke={SURFACE}
                strokeWidth={2}
              />
            </g>
          )}
        </svg>
        {children && (
          <div
            aria-hidden={state ? undefined : true}
            className={cn(
              'absolute inset-x-0 flex flex-col items-center text-center',
              sweep === 180 ? 'bottom-0 justify-end' : '-translate-y-1/2',
            )}
            style={sweep === 180 ? undefined : { top: `${(CENTER / height) * 100}%` }}
          >
            {children}
          </div>
        )}
      </div>
      {formatScale && (
        <div
          aria-hidden
          className='text-muted-foreground mt-1 flex justify-between text-xs tabular-nums'
          style={{ paddingInline: sweep === 180 ? 0 : scaleInset }}
        >
          <span>{formatScale(min)}</span>
          <span>{formatScale(max)}</span>
        </div>
      )}
    </div>
  )
}

interface GaugeValueProps {
  children: ReactNode
  className?: string
}

function GaugeValue({ children, className }: GaugeValueProps) {
  const state = useBlockState()

  return (
    <span
      data-slot='gauge-value'
      className={cn('font-light tracking-tight tabular-nums', className)}
    >
      {state === 'loading' ? (
        <SkeletonText className='w-[2.5em]' />
      ) : state ? (
        <BlockStateText className='text-xl' variant='short' />
      ) : (
        children
      )}
    </span>
  )
}

function GaugeToneLabel({
  className,
  label,
  tone,
}: {
  className?: string
  label: string
  tone: GaugeTone
}) {
  return (
    <StatusLabel className={className} tone={gaugeToneConfig[tone].tone}>
      {label}
    </StatusLabel>
  )
}

function GaugeLegend({
  bands,
  className,
  format = (value) => formatNumber(value),
}: {
  bands: GaugeBand[]
  className?: string
  format?: (value: number) => string
}) {
  const state = useBlockState()
  if (state === 'empty' || state === 'error') return null

  return (
    <ul
      className={cn(
        'text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs',
        className,
      )}
    >
      {bands.map((band) => (
        <li key={band.label} className='flex items-center gap-1.5'>
          <span
            aria-hidden
            className={cn('size-2.5 rounded-full', gaugeToneConfig[band.tone].swatch)}
          />
          <span className='text-foreground font-medium'>{band.label}</span>
          <span className='tabular-nums'>
            {format(band.from)}–{format(band.to)}
          </span>
        </li>
      ))}
    </ul>
  )
}

function GaugeTargetKey({
  className,
  label = 'Target',
}: {
  className?: string
  label?: string
}) {
  const state = useBlockState()
  if (state === 'empty' || state === 'error') return null

  return (
    <span
      className={cn(
        'text-muted-foreground inline-flex items-center gap-1.5 text-xs',
        className,
      )}
    >
      <span aria-hidden className='bg-foreground h-3 w-0.5 rounded-full' />
      {label}
    </span>
  )
}

function GaugePreviousKey({
  className,
  label,
}: {
  className?: string
  label: ReactNode
}) {
  const state = useBlockState()
  if (state === 'empty' || state === 'error') return null

  return (
    <span
      className={cn(
        'text-muted-foreground inline-flex items-center gap-1.5 text-xs',
        className,
      )}
    >
      <span aria-hidden className='bg-muted-foreground/60 h-3 w-0.5 rounded-full' />
      {label}
    </span>
  )
}

export {
  Gauge,
  GaugeLegend,
  GaugePreviousKey,
  GaugeTargetKey,
  GaugeToneLabel,
  GaugeValue,
  gaugeToneConfig,
  getGaugeBand,
  getGaugeShare,
  getNps,
  getWeightedScore,
}

export type {
  GaugeBand,
  GaugeProps,
  GaugeTone,
  GaugeToneConfig,
  GaugeValueProps,
  NpsResponses,
}
