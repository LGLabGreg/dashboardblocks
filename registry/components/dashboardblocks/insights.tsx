'use client'

import {
  StatusLabel,
  type StatusTone,
  statusToneClasses,
} from '@/registry/components/dashboardblocks/status-label'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type InsightKind = 'positive' | 'negative' | 'neutral' | 'anomaly'

type InsightTone = 'positive' | 'negative' | 'neutral'

interface InsightKindConfig {
  fill: string
  label: string
  tone: StatusTone
}

const insightKindConfig: Record<InsightKind, InsightKindConfig> = {
  anomaly: {
    fill: 'var(--color-amber-500)',
    label: 'Anomaly',
    tone: 'warning',
  },
  negative: {
    fill: 'var(--color-red-600)',
    label: 'Negative',
    tone: 'bad',
  },
  neutral: {
    fill: 'var(--color-muted-foreground)',
    label: 'Neutral',
    tone: 'neutral',
  },
  positive: {
    fill: 'var(--color-emerald-600)',
    label: 'Positive',
    tone: 'good',
  },
}

const toneClassNames: Record<InsightTone, string> = {
  negative: statusToneClasses.bad,
  neutral: 'text-foreground',
  positive: statusToneClasses.good,
}

function InsightLabel({
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
    <StatusLabel className={className} tone={config.tone}>
      {label ?? config.label}
    </StatusLabel>
  )
}

interface InsightMetric {
  text: string
  /** @default 'neutral' */
  tone?: InsightTone
}

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
    <strong className={cn('font-medium tabular-nums', toneClassNames[tone], className)}>
      {children}
    </strong>
  )
}

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

function insightToString(segments: InsightSegment[]) {
  return segments
    .map((segment) => (typeof segment === 'string' ? segment : segment.text))
    .join('')
}

interface InsightDriver {
  label: string
  /** Include the sign, such as "+812" or "−14%". */
  value: string
  /** @default 'neutral' */
  tone?: InsightTone
}

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

function getChangeTone(value: number, goodDirection: 'up' | 'down' = 'up'): InsightTone {
  if (value === 0) return 'neutral'
  return value > 0 === (goodDirection === 'up') ? 'positive' : 'negative'
}

export {
  InsightDrivers,
  InsightHighlight,
  InsightLabel,
  InsightText,
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
