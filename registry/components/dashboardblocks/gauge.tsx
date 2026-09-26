'use client'

import { useInView } from '@/registry/hooks/use-in-view'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type ReactNode, type RefObject, useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

type GaugeTone = 'positive' | 'caution' | 'critical' | 'neutral'

interface GaugeToneConfig {
  icon: React.ReactNode
  /** Tinted background with readable text, for badges. */
  soft: string
  /** Stroke colour for arcs. */
  stroke: string
  /** Solid fill, for legend swatches and bars. */
  swatch: string
  /** Text colour for icons and inline labels. */
  text: string
}

/** Band colours always come with an icon and a label, never colour alone. */
const gaugeToneConfig: Record<GaugeTone, GaugeToneConfig> = {
  caution: {
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
    soft: 'bg-amber-500/10 text-amber-800 dark:text-amber-400',
    stroke: 'stroke-amber-500',
    swatch: 'bg-amber-500',
    text: 'text-amber-800 dark:text-amber-400',
  },
  critical: {
    icon: (
      <IconPlaceholder
        lucide='OctagonAlertIcon'
        tabler='IconAlertOctagon'
        hugeicons='AlertDiamondIcon'
        phosphor='WarningOctagonIcon'
        remixicon='RiAlarmWarningLine'
        aria-hidden
      />
    ),
    soft: 'bg-red-500/10 text-red-700 dark:text-red-400',
    stroke: 'stroke-red-600',
    swatch: 'bg-red-600',
    text: 'text-red-700 dark:text-red-400',
  },
  neutral: {
    icon: (
      <IconPlaceholder
        lucide='CircleDotIcon'
        tabler='IconCircleDot'
        hugeicons='RecordIcon'
        phosphor='RecordIcon'
        remixicon='RiRecordCircleLine'
        aria-hidden
      />
    ),
    soft: 'bg-muted text-muted-foreground',
    stroke: 'stroke-muted-foreground',
    swatch: 'bg-muted-foreground',
    text: 'text-muted-foreground',
  },
  positive: {
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
    soft: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    stroke: 'stroke-emerald-600',
    swatch: 'bg-emerald-600',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
}

/** A labelled range on the scale, such as "Fair" from 40 to 70. */
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

/**
 * The band `value` falls in. Each band includes its `from` and excludes its
 * `to`, except the last, which includes both. Values off the scale take the
 * nearest band.
 */
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

/** Average of `score` weighted by `weight`. Weights don't need to add up to 1. */
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

/** Flips to true once the element scrolls into view, after the first paint. */
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

// The arc is drawn in a 100-unit wide viewBox around (50, 50). PAD leaves room
// for the target marker, which reaches past the track on both sides.
const CENTER = 50
const PAD = 4
const BAND_GAP = 1.5
const SCALE_WIDTH = 3

/** Rounded so the server and the browser print the same path. */
const round = (value: number) => Math.round(value * 100) / 100

/** A point on a circle around the centre, with 0° at 12 o'clock, clockwise. */
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
  /** Shown in the middle of the arc, usually the value. Hidden from screen readers, so put everything in `valueText`. */
  children?: ReactNode
  className?: string
  /**
   * Fill colour, unless `colorByBand` is set.
   * @default 'var(--chart-1)'
   */
  color?: string
  /** Colours the fill with the tone of the band the value falls in. */
  colorByBand?: boolean
  /** Formats the labels under the ends of the arc. Leave out to hide them. */
  formatScale?: (value: number) => string
  /**
   * `fill` draws the value as an arc from `origin`, with any bands as a thin
   * scale inside the track. `marker` draws the bands as the track and marks
   * the value with a knob.
   * @default 'fill'
   */
  indicator?: 'fill' | 'marker'
  /** Names the meter for assistive technology, e.g. "Net Promoter Score". */
  label: string
  /** @default 100 */
  max?: number
  /** @default 0 */
  min?: number
  /** Where the fill starts. Use 0 on a scale that goes below zero. Defaults to `min`. */
  origin?: number
  /**
   * 180 for a semicircle, 270 for a three-quarter arc.
   * @default 180
   */
  sweep?: 180 | 270
  /** Draws a tick across the track at this value. */
  target?: number
  /**
   * Track thickness, in hundredths of the gauge's width.
   * @default 10
   */
  thickness?: number
  value: number
  /** How screen readers read the value, e.g. "68 out of 100, fair". Defaults to the number. */
  valueText?: string
}

/**
 * A radial gauge on a scale from `min` to `max`, with optional bands and a
 * target tick. Built as a `meter`: the SVG is decorative, and screen readers
 * get the label, the range and `valueText`. The fill animates in once, and
 * not at all when reduced motion is on.
 */
function Gauge({
  animated = true,
  bands = [],
  children,
  className,
  color = 'var(--chart-1)',
  colorByBand = false,
  formatScale,
  indicator = 'fill',
  label,
  max = 100,
  min = 0,
  origin = min,
  sweep = 180,
  target,
  thickness = 10,
  value,
  valueText,
}: GaugeProps) {
  const { ref, revealed } = useReveal(animated)

  const radius = CENTER - PAD - thickness / 2
  const startAngle = -sweep / 2
  const endAngle = sweep / 2
  const angleOf = (at: number) => startAngle + getGaugeShare(at, min, max) * sweep
  const end = polar(endAngle, radius)
  const height = round(Math.max(end.y, CENTER) + thickness / 2 + PAD)
  const track = arcPath(startAngle, endAngle, radius)

  const band = getGaugeBand(value, bands)
  const valueShare = getGaugeShare(value, min, max)
  const originShare = getGaugeShare(origin, min, max)
  const shown = revealed ? valueShare : originShare
  const fillStart = Math.min(originShare, shown) * 100
  const fillLength = Math.abs(shown - originShare) * 100
  // Round caps reach past each end of the dash by half the thickness. Pull in
  // the ends inside the scale so the fill stops at the value, not past it;
  // at the scale's own ends the track's caps reach just as far.
  const cap = (thickness / 2 / ((radius * sweep * Math.PI) / 180)) * 100
  const startInset = fillStart > 0 ? cap : 0
  const endInset = fillStart + fillLength < 100 ? cap : 0
  const dashStart = fillStart + startInset
  const dashLength = Math.max(0, fillLength - startInset - endInset)

  // Bands on the track sit flush with it; as a scale they sit just inside it.
  const bandRadius =
    indicator === 'marker' ? radius : radius - thickness / 2 - 2.5 - SCALE_WIDTH / 2
  const bandWidth = indicator === 'marker' ? thickness : SCALE_WIDTH
  const gapAngle = (BAND_GAP / bandRadius) * (180 / Math.PI)

  const motion =
    'duration-1000 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none'
  const scaleEnd = polar(startAngle, radius)
  const scaleInset = `${scaleEnd.x}%`

  return (
    <div
      ref={ref}
      role='meter'
      aria-label={label}
      aria-valuemax={max}
      aria-valuemin={min}
      aria-valuenow={value}
      aria-valuetext={valueText}
      className={cn('relative shrink-0', className)}
    >
      <div className='relative'>
        <svg
          aria-hidden
          viewBox={`0 0 100 ${height}`}
          className='block h-auto w-full overflow-visible'
          fill='none'
        >
          {(indicator === 'fill' || bands.length === 0) && (
            <path
              d={track}
              className='stroke-muted'
              strokeLinecap={indicator === 'fill' ? 'round' : 'butt'}
              strokeWidth={thickness}
            />
          )}
          {bands.map((item, index) => {
            const from = angleOf(item.from) + (index > 0 ? gapAngle / 2 : 0)
            const to = angleOf(item.to) - (index < bands.length - 1 ? gapAngle / 2 : 0)
            if (to <= from) return null
            return (
              <path
                key={item.label}
                d={arcPath(from, to, bandRadius)}
                className={gaugeToneConfig[item.tone].stroke}
                strokeWidth={bandWidth}
              />
            )
          })}
          {indicator === 'fill' && (
            <path
              d={track}
              pathLength={100}
              className={cn(
                'transition-[stroke-dasharray,stroke-dashoffset]',
                motion,
                colorByBand && band && gaugeToneConfig[band.tone].stroke,
              )}
              style={colorByBand && band ? undefined : { stroke: color }}
              // One dash per 200-unit period, shifted to start at `fillStart`. A
              // positive offset, as some browsers skip dashes with a negative one.
              strokeDasharray={`${round(dashLength)} ${round(200 - dashLength)}`}
              strokeDashoffset={round(200 - dashStart)}
              strokeLinecap='round'
              strokeOpacity={fillLength > 0 ? 1 : 0}
              strokeWidth={thickness}
            />
          )}
          {target !== undefined && target >= min && target <= max && (
            <g strokeLinecap='round'>
              {[
                { className: 'stroke-card', width: 5 },
                { className: 'stroke-foreground', width: 2 },
              ].map((line) => {
                const angle = angleOf(target)
                const inner = polar(angle, radius - thickness / 2 - 2.5)
                const outer = polar(angle, radius + thickness / 2 + 2.5)
                return (
                  <line
                    key={line.width}
                    className={line.className}
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
          {indicator === 'marker' && (
            <g
              className={cn('transition-transform', motion)}
              style={{
                transform: `rotate(${round(startAngle + shown * sweep)}deg)`,
                transformOrigin: `${CENTER}px ${CENTER}px`,
              }}
            >
              <circle
                className='fill-card stroke-foreground'
                cx={CENTER}
                cy={CENTER - radius}
                r={thickness / 2 + 1}
                strokeWidth={2.5}
              />
            </g>
          )}
        </svg>
        {children && (
          <div
            aria-hidden
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

/** A band's tone with its icon and label. */
function GaugeToneBadge({
  className,
  label,
  tone,
}: {
  className?: string
  label: string
  tone: GaugeTone
}) {
  const config = gaugeToneConfig[tone]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0',
        config.soft,
        className,
      )}
    >
      {config.icon}
      {label}
    </span>
  )
}

/** The bands as a list: a swatch, the label and the range. */
function GaugeLegend({
  bands,
  className,
  format = (value) => value.toLocaleString(),
}: {
  bands: GaugeBand[]
  className?: string
  format?: (value: number) => string
}) {
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

/** A short legend for the target tick. */
function GaugeTargetKey({
  className,
  label = 'Target',
}: {
  className?: string
  label?: string
}) {
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

export {
  Gauge,
  GaugeLegend,
  GaugeTargetKey,
  GaugeToneBadge,
  gaugeToneConfig,
  getGaugeBand,
  getGaugeShare,
  getNps,
  getWeightedScore,
}

export type { GaugeBand, GaugeProps, GaugeTone, GaugeToneConfig, NpsResponses }
