'use client'

import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/utils'

type ActivityTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'accent'

/** Tinted, readable in both themes. Pair a tone with an icon and text, never alone. */
const activityToneClasses: Record<ActivityTone, string> = {
  accent: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
  danger: 'bg-red-500/10 text-red-700 dark:text-red-400',
  info: 'bg-sky-500/10 text-sky-800 dark:text-sky-300',
  neutral: 'bg-muted text-muted-foreground',
  success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-800 dark:text-amber-400',
}

/**
 * A list of activity, newest or oldest first. Set the marker size with
 * `--activity-marker` so `ActivityFeedItem` connectors line up with it.
 */
function ActivityFeed({ className, ...props }: ComponentProps<'ol'>) {
  return (
    <ol className={cn('flex flex-col [--activity-marker:2rem]', className)} {...props} />
  )
}

interface ActivityFeedItemProps extends ComponentProps<'li'> {
  /**
   * Draws a line from this item's marker down to the next one. The first
   * child should be the marker, `--activity-marker` wide.
   * @default false
   */
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

/** The icon for a kind of activity in a tinted circle. Say what it means in text nearby. */
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

/** A dot for unread items, with "Unread" for screen readers. */
function UnreadDot({ className }: { className?: string }) {
  return (
    <span className={cn('bg-primary size-2 shrink-0 rounded-full', className)}>
      <span className='sr-only'>Unread</span>
    </span>
  )
}

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const relativeFormatter = new Intl.RelativeTimeFormat('en-US', {
  numeric: 'auto',
  style: 'short',
})

/** "2026-09-26", the calendar day in a time zone. */
function getDayKey(date: Date, timeZone = 'UTC') {
  return new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone,
    year: 'numeric',
  }).format(date)
}

/**
 * "just now", "5 min ago", "3 hr ago", "yesterday", then "Sep 21" after a
 * week. Pass a fixed `now`, so it renders the same on the server and in the browser.
 */
function formatActivityTime(date: Date, now: Date, timeZone = 'UTC') {
  const elapsed = now.getTime() - date.getTime()
  if (elapsed < MINUTE) return 'just now'
  if (elapsed < HOUR)
    return relativeFormatter.format(-Math.floor(elapsed / MINUTE), 'minute')
  if (elapsed < 12 * HOUR)
    return relativeFormatter.format(-Math.floor(elapsed / HOUR), 'hour')
  const days = Math.round(
    (Date.parse(getDayKey(now, timeZone)) - Date.parse(getDayKey(date, timeZone))) / DAY,
  )
  if (days === 0) {
    return new Intl.DateTimeFormat('en-US', { timeStyle: 'short', timeZone }).format(date)
  }
  if (days < 7) return relativeFormatter.format(-days, 'day')
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone,
  }).format(date)
}

/** "Today", "Yesterday", then "Monday, Sep 21". */
function formatActivityDay(date: Date, now: Date, timeZone = 'UTC') {
  const days = Math.round(
    (Date.parse(getDayKey(now, timeZone)) - Date.parse(getDayKey(date, timeZone))) / DAY,
  )
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone,
    weekday: 'long',
  }).format(date)
}

/** Groups items by calendar day in their current order, labelled "Today", "Yesterday" and so on. */
function groupActivityByDay<T extends { at: Date }>(
  items: T[],
  now: Date,
  timeZone = 'UTC',
) {
  const groups: { items: T[]; key: string; label: string }[] = []
  for (const item of items) {
    const key = getDayKey(item.at, timeZone)
    const group = groups.find((existing) => existing.key === key)
    if (group) group.items.push(item)
    else
      groups.push({
        items: [item],
        key,
        label: formatActivityDay(item.at, now, timeZone),
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

/** A relative time with the full date and time on hover. */
function ActivityTime({ className, date, now, timeZone = 'UTC' }: ActivityTimeProps) {
  return (
    <time
      dateTime={date.toISOString()}
      title={new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone,
      }).format(date)}
      className={cn('text-muted-foreground text-xs whitespace-nowrap', className)}
    >
      {formatActivityTime(date, now, timeZone)}
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
  formatActivityDay,
  formatActivityTime,
  getDayKey,
  groupActivityByDay,
}

export type { ActivityFeedItemProps, ActivityTimeProps, ActivityTone }
