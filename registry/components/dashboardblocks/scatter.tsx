'use client'

import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface ScatterPoint {
  x: number
  y: number
}

interface LineFit {
  intercept: number
  /** Pearson correlation, −1 to 1. */
  r: number
  slope: number
}

/** Least-squares line through the points, with the correlation coefficient. */
function fitLine(points: ScatterPoint[]): LineFit {
  const n = points.length
  if (n < 2) return { intercept: points[0]?.y ?? 0, r: 0, slope: 0 }
  const meanX = points.reduce((sum, point) => sum + point.x, 0) / n
  const meanY = points.reduce((sum, point) => sum + point.y, 0) / n
  let sxx = 0
  let syy = 0
  let sxy = 0
  for (const point of points) {
    sxx += (point.x - meanX) ** 2
    syy += (point.y - meanY) ** 2
    sxy += (point.x - meanX) * (point.y - meanY)
  }
  const slope = sxx > 0 ? sxy / sxx : 0
  return {
    intercept: meanY - slope * meanX,
    r: sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : 0,
    slope,
  }
}

/** Describes a correlation coefficient in words, e.g. "strong positive". */
function describeCorrelation(r: number) {
  const size = Math.abs(r)
  const strength =
    size >= 0.7 ? 'strong' : size >= 0.4 ? 'moderate' : size >= 0.2 ? 'weak' : 'no clear'
  if (strength === 'no clear') return 'no clear relationship'
  return `${strength} ${r > 0 ? 'positive' : 'negative'}`
}

/** The middle value, averaging the two middle ones for an even count. */
function getMedian(values: number[]) {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

/** Categorical colours in a fixed order, so a series keeps its colour. */
const scatterPalette = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

interface ScatterTooltipRow {
  label: string
  value: string
}

/** Tooltip content for one point: its name, then labelled values. */
function ScatterTooltipContent({
  color,
  rows,
  title,
}: {
  color?: string
  rows: ScatterTooltipRow[]
  title: ReactNode
}) {
  return (
    <div className='bg-popover text-popover-foreground ring-foreground/10 grid min-w-36 gap-1 rounded-lg px-3 py-2 text-xs shadow-md ring-1'>
      <span className='flex items-center gap-1.5 font-medium'>
        {color && (
          <span
            aria-hidden
            className='size-2 rounded-full'
            style={{ backgroundColor: color }}
          />
        )}
        {title}
      </span>
      {rows.map((row) => (
        <span key={row.label} className='flex justify-between gap-4'>
          <span className='text-muted-foreground'>{row.label}</span>
          <span className='font-medium tabular-nums'>{row.value}</span>
        </span>
      ))}
    </div>
  )
}

type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

/** A risk level from likelihood and impact, each 1–5, by their product. */
function getRiskLevel(likelihood: number, impact: number): RiskLevel {
  const score = likelihood * impact
  if (score >= 15) return 'critical'
  if (score >= 8) return 'high'
  if (score >= 4) return 'medium'
  return 'low'
}

const riskLevelConfig: Record<RiskLevel, { cell: string; label: string; text: string }> =
  {
    critical: {
      cell: 'bg-red-500/25 dark:bg-red-500/30',
      label: 'Critical',
      text: 'text-red-700 dark:text-red-400',
    },
    high: {
      cell: 'bg-orange-400/25 dark:bg-orange-500/25',
      label: 'High',
      text: 'text-orange-700 dark:text-orange-400',
    },
    low: {
      cell: 'bg-emerald-500/15 dark:bg-emerald-500/15',
      label: 'Low',
      text: 'text-emerald-700 dark:text-emerald-400',
    },
    medium: {
      cell: 'bg-amber-400/20 dark:bg-amber-400/20',
      label: 'Medium',
      text: 'text-amber-700 dark:text-amber-400',
    },
  }

/** The risk level as a label in its colour. */
function RiskLevelLabel({ className, level }: { className?: string; level: RiskLevel }) {
  const config = riskLevelConfig[level]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap',
        config.text,
        className,
      )}
    >
      <span aria-hidden className={cn('size-2.5 rounded-[3px]', config.cell)} />
      {config.label}
    </span>
  )
}

export {
  RiskLevelLabel,
  ScatterTooltipContent,
  describeCorrelation,
  fitLine,
  getMedian,
  getRiskLevel,
  riskLevelConfig,
  scatterPalette,
}

export type { LineFit, RiskLevel, ScatterPoint, ScatterTooltipRow }
