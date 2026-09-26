'use client'

import { ClockAlertIcon, ClockIcon } from 'lucide-react'
import { type ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface PipelineStage {
  /** Days an item is expected to spend in this stage. Longer counts as stuck. */
  expectedDays?: number
  id: string
  label: string
  /** Chance that an item in this stage closes, 0–1. Used for weighted value. */
  probability?: number
}

interface PipelineItem {
  /** When the item entered its current stage. */
  enteredStageAt: Date
  id: string
  owner?: string
  /** The id of the item's current stage. */
  stage: string
  /** A second line, such as the company or the role. */
  subtitle?: string
  title: string
  value?: number
}

interface StageSummary extends PipelineStage {
  count: number
  /** Items over the stage's expected days. */
  stuck: number
  value: number
  /** Value × stage probability. */
  weighted: number
}

const DAY = 86_400_000

/** Whole days since `date`. Pass a fixed `now` to render the same on server and client. */
function getDaysInStage(date: Date, now: Date) {
  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / DAY))
}

function isStuck(days: number, expectedDays?: number) {
  return expectedDays !== undefined && days > expectedDays
}

/** Count, value, weighted value and stuck items per stage, in stage order. */
function getStageSummaries(
  stages: PipelineStage[],
  items: PipelineItem[],
  now: Date,
): StageSummary[] {
  return stages.map((stage) => {
    const inStage = items.filter((item) => item.stage === stage.id)
    const value = inStage.reduce((sum, item) => sum + (item.value ?? 0), 0)
    return {
      ...stage,
      count: inStage.length,
      stuck: inStage.filter((item) =>
        isStuck(getDaysInStage(item.enteredStageAt, now), stage.expectedDays),
      ).length,
      value,
      weighted: value * (stage.probability ?? 0),
    }
  })
}

/**
 * Fill for the stage at `index` of `count`. Stages are ordered, so they share
 * one hue that deepens towards the last stage instead of unrelated colours.
 */
function getStageColor(index: number, count: number) {
  const share = count > 1 ? index / (count - 1) : 1
  return `color-mix(in oklab, var(--chart-1) ${Math.round(50 + share * 50)}%, var(--card))`
}

// Set both fraction digit limits: engines disagree on the default minimum for
// compact currency, which would render "$42K" on the server and "$42.0K" in the browser.
const compactCurrency = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
  notation: 'compact',
  style: 'currency',
})

const fullCurrency = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
  style: 'currency',
})

/** "$48K", "$1.2M", or "$48,200" with `compact: false`. */
function formatCurrency(value: number, { compact = true } = {}) {
  return (compact ? compactCurrency : fullCurrency).format(value)
}

/**
 * Days up to four weeks, then weeks, then months: "12d", "5w", "4mo", or
 * "12 days", "5 weeks", "4 months" with `style: 'long'`.
 */
function formatAge(days: number, style: 'short' | 'long' = 'short') {
  const [amount, unit] =
    days < 28
      ? [days, 'd']
      : days < 90
        ? [Math.floor(days / 7), 'w']
        : [Math.floor(days / 30), 'mo']
  if (style === 'short') return `${amount}${unit}`
  const word = unit === 'd' ? 'day' : unit === 'w' ? 'week' : 'month'
  return `${amount} ${word}${amount === 1 ? '' : 's'}`
}

/** Days in stage with a clock icon. Over the expected days it turns amber and the icon changes. */
function PipelineAge({
  className,
  days,
  expectedDays,
}: {
  className?: string
  days: number
  expectedDays?: number
}) {
  const stuck = isStuck(days, expectedDays)
  const Icon = stuck ? ClockAlertIcon : ClockIcon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium whitespace-nowrap tabular-nums',
        stuck
          ? 'bg-amber-500/10 text-amber-800 dark:text-amber-400'
          : 'text-muted-foreground',
        className,
      )}
    >
      <Icon aria-hidden className='size-3.5' />
      <span aria-hidden>{formatAge(days)}</span>
      <span className='sr-only'>
        {formatAge(days, 'long')} in stage
        {stuck && `, over the ${expectedDays}-day limit`}
      </span>
    </span>
  )
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

/** The owner's initials in a circle, with the full name for screen readers or beside it. */
function PipelineOwner({
  className,
  name,
  showName = false,
}: {
  className?: string
  name: string
  showName?: boolean
}) {
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-2', className)}>
      <span
        aria-hidden
        title={name}
        className='bg-muted text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-medium'
      >
        {getInitials(name)}
      </span>
      <span className={cn(showName ? 'truncate text-sm' : 'sr-only')}>
        {showName ? name : `Owner: ${name}`}
      </span>
    </span>
  )
}

/** A stage's name, item count and total value, for the top of a board column. */
function PipelineStageHeader({
  className,
  color,
  count,
  id,
  label,
  total,
}: {
  className?: string
  color: string
  count: number
  /** Lets the column's list point at the heading with `aria-labelledby`. */
  id?: string
  label: string
  /** The formatted total value. */
  total?: string
}) {
  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <h3 id={id} className='flex items-center gap-2 text-sm font-medium'>
        <span
          aria-hidden
          className='size-2.5 shrink-0 rounded-full'
          style={{ backgroundColor: color }}
        />
        <span className='truncate'>{label}</span>
        <span className='bg-muted text-muted-foreground ml-auto rounded-full px-2 py-0.5 text-xs tabular-nums'>
          {count}
          <span className='sr-only'> {count === 1 ? 'item' : 'items'}</span>
        </span>
      </h3>
      {total !== undefined && (
        <p className='text-muted-foreground pl-4.5 text-xs tabular-nums'>
          <span className='sr-only'>Total </span>
          {total}
        </p>
      )}
    </div>
  )
}

interface PipelineCardProps {
  /** A button or menu in the top corner, such as a move action. */
  action?: ReactNode
  className?: string
  days: number
  expectedDays?: number
  owner?: string
  subtitle?: string
  title: string
  /** The formatted value. */
  value?: string
}

/** An item on a board: title, subtitle, value, days in stage and owner. */
function PipelineCard({
  action,
  className,
  days,
  expectedDays,
  owner,
  subtitle,
  title,
  value,
}: PipelineCardProps) {
  return (
    <div
      className={cn(
        'bg-card flex flex-col gap-3 rounded-lg p-3 shadow-xs ring-1 ring-foreground/10',
        className,
      )}
    >
      <div className='flex items-start justify-between gap-2'>
        <div className='flex min-w-0 flex-col gap-0.5'>
          <p className='text-sm leading-snug font-medium'>{title}</p>
          {subtitle && <p className='text-muted-foreground text-xs'>{subtitle}</p>}
        </div>
        {action && <div className='-mt-1 -mr-1 shrink-0'>{action}</div>}
      </div>
      <div className='flex items-center gap-2'>
        {value !== undefined && (
          <span className='text-sm font-medium tabular-nums'>{value}</span>
        )}
        <PipelineAge className='ml-auto' days={days} expectedDays={expectedDays} />
        {owner && <PipelineOwner name={owner} />}
      </div>
    </div>
  )
}

export {
  PipelineAge,
  PipelineCard,
  PipelineOwner,
  PipelineStageHeader,
  formatAge,
  formatCurrency,
  getDaysInStage,
  getStageColor,
  getStageSummaries,
  isStuck,
}

export type { PipelineCardProps, PipelineItem, PipelineStage, StageSummary }
