'use client'

import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * Whether the insight is good news, bad news, worth knowing or out of the
 * ordinary. It's about the outcome, not the direction: churn falling is positive.
 */
type InsightKind = 'positive' | 'negative' | 'neutral' | 'anomaly'

/** The colour of a highlighted metric. Say the direction in its text as well. */
type InsightTone = 'positive' | 'negative' | 'neutral'

interface InsightKindConfig {
  icon: React.ReactNode
  label: string
  /** Tinted background with readable text, for badges. */
  soft: string
  /** Text colour for icons and inline labels. */
  text: string
  /** Solid fill, for dots and chart marks. */
  fill: string
}

/** Every kind comes with an icon and a label, so colour never carries it alone. */
const insightKindConfig: Record<InsightKind, InsightKindConfig> = {
  anomaly: {
    fill: 'var(--color-fuchsia-600)',
    icon: (
      <IconPlaceholder
        lucide='ActivityIcon'
        tabler='IconActivity'
        hugeicons='ActivityIcon'
        phosphor='ActivityIcon'
        remixicon='RiPulseLine'
        aria-hidden
      />
    ),
    label: 'Anomaly',
    soft: 'bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-400',
    text: 'text-fuchsia-700 dark:text-fuchsia-400',
  },
  negative: {
    fill: 'var(--color-red-600)',
    icon: (
      <IconPlaceholder
        lucide='TrendingDownIcon'
        tabler='IconTrendingDown'
        hugeicons='ChartDownIcon'
        phosphor='TrendDownIcon'
        remixicon='RiArrowDownLine'
        aria-hidden
      />
    ),
    label: 'Negative',
    soft: 'bg-red-500/10 text-red-700 dark:text-red-400',
    text: 'text-red-700 dark:text-red-400',
  },
  neutral: {
    fill: 'var(--color-muted-foreground)',
    icon: (
      <IconPlaceholder
        lucide='LightbulbIcon'
        tabler='IconBulb'
        hugeicons='BulbIcon'
        phosphor='LightbulbIcon'
        remixicon='RiLightbulbLine'
        aria-hidden
      />
    ),
    label: 'Neutral',
    soft: 'bg-muted text-muted-foreground',
    text: 'text-muted-foreground',
  },
  positive: {
    fill: 'var(--color-emerald-600)',
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
    label: 'Positive',
    soft: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
}

const toneClassNames: Record<InsightTone, string> = {
  negative: 'bg-red-500/10 text-red-700 dark:text-red-400',
  neutral: 'bg-muted text-foreground',
  positive: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
}

function InsightBadge({
  className,
  kind,
  label,
}: {
  className?: string
  kind: InsightKind
  label?: string
}) {
  const config = insightKindConfig[kind]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0',
        config.soft,
        className,
      )}
    >
      {config.icon}
      {label ?? config.label}
    </span>
  )
}

/** The kind's icon in a tinted circle. Pair it with the kind in text nearby. */
function InsightIcon({ className, kind }: { className?: string; kind: InsightKind }) {
  const config = insightKindConfig[kind]
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full [&_svg]:size-4',
        config.soft,
        className,
      )}
    >
      {config.icon}
    </span>
  )
}

/** A metric called out inside a sentence, such as "up 24%". */
interface InsightMetric {
  text: string
  /** @default 'neutral' */
  tone?: InsightTone
}

/** Plain text, or a highlighted metric. */
type InsightSegment = string | InsightMetric

function InsightHighlight({
  children,
  className,
  tone = 'neutral',
}: {
  children: ReactNode
  className?: string
  tone?: InsightTone
}) {
  return (
    <mark
      className={cn(
        'rounded-sm px-0.5 py-px font-medium tabular-nums box-decoration-clone',
        toneClassNames[tone],
        className,
      )}
    >
      {children}
    </mark>
  )
}

/** A sentence with its metrics highlighted. */
function InsightText({
  as: Component = 'p',
  className,
  segments,
}: {
  /** @default 'p' */
  as?: 'p' | 'span'
  className?: string
  segments: InsightSegment[]
}) {
  return (
    <Component className={cn('text-sm leading-6 text-pretty', className)}>
      {segments.map((segment, index) =>
        typeof segment === 'string' ? (
          segment
        ) : (
          <InsightHighlight key={index} tone={segment.tone}>
            {segment.text}
          </InsightHighlight>
        ),
      )}
    </Component>
  )
}

/** The sentence as plain text, for accessible names. */
function insightToString(segments: InsightSegment[]) {
  return segments
    .map((segment) => (typeof segment === 'string' ? segment : segment.text))
    .join('')
}

/** Something that contributed to the change, with its effect already formatted. */
interface InsightDriver {
  label: string
  /** Include the sign, such as "+812" or "−14%". */
  value: string
  /** @default 'neutral' */
  tone?: InsightTone
}

/** A short "Why" line listing what drove the insight. */
function InsightDrivers({
  className,
  drivers,
  label = 'Why',
}: {
  className?: string
  drivers: InsightDriver[]
  /** @default 'Why' */
  label?: string
}) {
  if (drivers.length === 0) return null
  return (
    <div
      className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs', className)}
    >
      <span className='text-muted-foreground font-medium'>{label}</span>
      <ul className='flex flex-wrap gap-x-3 gap-y-1'>
        {drivers.map((driver) => (
          <li key={driver.label} className='flex items-baseline gap-1'>
            {driver.label}
            <InsightHighlight tone={driver.tone}>{driver.value}</InsightHighlight>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** "+1,284" or "−312", with a true minus sign. */
function formatSigned(value: number, formatter: (value: number) => string) {
  const sign = value > 0 ? '+' : value < 0 ? '−' : ''
  return `${sign}${formatter(Math.abs(value))}`
}

/** Whether a change is good news, given which direction is good for the metric. */
function getChangeTone(value: number, goodDirection: 'up' | 'down' = 'up'): InsightTone {
  if (value === 0) return 'neutral'
  return value > 0 === (goodDirection === 'up') ? 'positive' : 'negative'
}

export {
  InsightBadge,
  InsightDrivers,
  InsightHighlight,
  InsightIcon,
  InsightText,
  formatSigned,
  getChangeTone,
  insightKindConfig,
  insightToString,
}

export type {
  InsightDriver,
  InsightKind,
  InsightKindConfig,
  InsightMetric,
  InsightSegment,
  InsightTone,
}
