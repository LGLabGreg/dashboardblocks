'use client'

import {
  dayIn,
  formatDate,
  formatDayHeading,
  formatRelativeTime,
} from '@/registry/lib/dashboardblocks/format'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/utils'

type ActivityTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'accent'

const activityToneClasses: Record<ActivityTone, string> = {
  accent: 'bg-chart-2/15 text-foreground',
  danger: 'bg-red-500/10 text-red-700 dark:text-red-400',
  info: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
  neutral: 'bg-muted text-foreground',
  success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  warning: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
}

const activityToneColors: Record<ActivityTone, string> = {
  accent: 'var(--color-chart-2)',
  danger: 'var(--color-red-600)',
  info: 'var(--color-sky-600)',
  neutral: 'var(--color-muted-foreground)',
  success: 'var(--color-emerald-600)',
  warning: 'var(--color-orange-500)',
}

function ActivityFeed({ className, ...props }: ComponentProps<'ol'>) {
  return (
    <ol className={cn('flex flex-col [--activity-marker:2rem]', className)} {...props} />
  )
}

interface ActivityFeedItemProps extends ComponentProps<'li'> {
  connector?: boolean
}

function ActivityFeedItem({
  children,
  className,
  connector = false,
  ...props
}: ActivityFeedItemProps) {
  return (
    <li
      className={cn(
        'relative flex gap-3 [&:last-child>[data-slot=activity-connector]]:hidden',
        className,
      )}
      {...props}
    >
      {connector && (
        <span
          aria-hidden
          data-slot='activity-connector'
          className='bg-border absolute top-[calc(var(--activity-marker)+0.25rem)] bottom-1 left-[calc(var(--activity-marker)/2)] w-px -translate-x-1/2'
        />
      )}
      {children}
    </li>
  )
}

function ActivityIcon({
  className,
  icon,
  tone = 'neutral',
}: {
  className?: string
  icon: ReactNode
  /** @default 'neutral' */
  tone?: ActivityTone
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'ring-card relative flex size-(--activity-marker) shrink-0 items-center justify-center rounded-full ring-4 [&_svg]:size-4',
        activityToneClasses[tone],
        className,
      )}
    >
      {icon}
    </span>
  )
}

function UnreadDot({ className }: { className?: string }) {
  return (
    <span className={cn('bg-primary size-2 shrink-0 rounded-full', className)}>
      <span className='sr-only'>Unread</span>
    </span>
  )
}

function groupActivityByDay<T extends { at: Date }>(
  items: T[],
  now: Date,
  timeZone = 'UTC',
) {
  const groups: { items: T[]; key: string; label: string }[] = []
  for (const item of items) {
    const key = dayIn(item.at, timeZone)
    const group = groups.find((existing) => existing.key === key)
    if (group) group.items.push(item)
    else
      groups.push({
        items: [item],
        key,
        label: formatDayHeading(item.at, now, timeZone),
      })
  }
  return groups
}

interface ActivityTimeProps {
  className?: string
  date: Date
  /** Pass a fixed date, so it renders the same on the server and in the browser. */
  now: Date
  /** @default 'UTC' */
  timeZone?: string
}

function ActivityTime({ className, date, now, timeZone = 'UTC' }: ActivityTimeProps) {
  return (
    <time
      dateTime={date.toISOString()}
      title={formatDate(date, 'date-time', timeZone)}
      className={cn('text-muted-foreground text-xs whitespace-nowrap', className)}
    >
      {formatRelativeTime(date, now, { timeZone })}
    </time>
  )
}

export {
  ActivityFeed,
  ActivityFeedItem,
  ActivityIcon,
  ActivityTime,
  UnreadDot,
  activityToneClasses,
  activityToneColors,
  groupActivityByDay,
}

export type { ActivityFeedItemProps, ActivityTimeProps, ActivityTone }
