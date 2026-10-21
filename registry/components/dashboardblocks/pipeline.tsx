'use client'

import { PersonAvatar } from '@/registry/components/dashboardblocks/team'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface PipelineStage {
  expectedDays?: number
  id: string
  label: string
  /** Chance that an item in this stage closes, 0–1. */
  probability?: number
}

interface PipelineItem {
  enteredStageAt: Date
  id: string
  owner?: string
  /** A photo of the owner, shown in place of their initials. */
  ownerAvatar?: string
  stage: string
  subtitle?: string
  title: string
  value?: number
}

interface StageSummary extends PipelineStage {
  count: number
  stuck: number
  value: number
  weighted: number
}

const DAY = 86_400_000

function getDaysInStage(date: Date, now: Date) {
  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / DAY))
}

function isStuck(days: number, expectedDays?: number) {
  return expectedDays !== undefined && days > expectedDays
}

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

function getStageColor(index: number, count: number) {
  const share = count > 1 ? index / (count - 1) : 1
  return `color-mix(in oklab, var(--color-chart-2) ${Math.round(50 + share * 50)}%, var(--color-card))`
}

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
  return (
    <span
      className={cn(
        'text-xs whitespace-nowrap tabular-nums',
        stuck
          ? 'font-medium text-orange-700 dark:text-orange-400'
          : 'text-muted-foreground',
        className,
      )}
    >
      <span aria-hidden>{stuck ? `Stuck ${formatAge(days)}` : formatAge(days)}</span>
      <span className='sr-only'>
        {formatAge(days, 'long')} in stage
        {stuck && `, over the ${expectedDays}-day limit`}
      </span>
    </span>
  )
}

function PipelineOwner({
  avatar,
  className,
  name,
  showName = false,
}: {
  avatar?: string
  className?: string
  name: string
  showName?: boolean
}) {
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-2', className)}>
      <PersonAvatar person={{ avatar, name }} size='sm' />
      <span className={cn(showName ? 'truncate text-sm' : 'sr-only')}>
        {showName ? name : `Owner: ${name}`}
      </span>
    </span>
  )
}

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
  /** Leave out while the items load. */
  count?: number
  /** Lets the column's list point at the heading with `aria-labelledby`. */
  id?: string
  label: string
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
        {count !== undefined && (
          <span className='text-muted-foreground ml-auto font-normal tabular-nums'>
            {count}
            <span className='sr-only'> {count === 1 ? 'item' : 'items'}</span>
          </span>
        )}
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
  action?: ReactNode
  className?: string
  days: number
  expectedDays?: number
  owner?: string
  ownerAvatar?: string
  subtitle?: string
  title: string
  value?: string
}

function PipelineCard({
  action,
  className,
  days,
  expectedDays,
  owner,
  ownerAvatar,
  subtitle,
  title,
  value,
}: PipelineCardProps) {
  return (
    <div className={cn('bg-muted/50 flex flex-col gap-3 rounded-xl p-3', className)}>
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
        {owner && <PipelineOwner avatar={ownerAvatar} name={owner} />}
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
  getDaysInStage,
  getStageColor,
  getStageSummaries,
  isStuck,
}

export type { PipelineCardProps, PipelineItem, PipelineStage, StageSummary }
