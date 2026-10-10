'use client'

import {
  ActivityIcon,
  ActivityTime,
  type ActivityTone,
  UnreadDot,
} from '@/registry/components/dashboardblocks/activity-feed'
import { Link } from '@/registry/components/dashboardblocks/link'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type MouseEvent, type ReactNode, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { cn } from '@/lib/utils'

interface AppNotification {
  at: Date
  body?: string
  href?: string
  icon: ReactNode
  id: string
  read: boolean
  title: ReactNode
  /** @default 'neutral' */
  tone?: ActivityTone
}

interface NotificationBellProps {
  children: ReactNode
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  unreadCount: number
}

function isLinkClick(event: MouseEvent) {
  return (
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    event.target instanceof Element &&
    event.target.closest('a[href]') !== null
  )
}

function NotificationBell({
  children,
  className,
  onOpenChange,
  open,
  unreadCount,
}: NotificationBellProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const setOpen = (next: boolean) => {
    setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  return (
    <Popover open={open ?? uncontrolledOpen} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant='ghost'
            size='icon'
            className='relative'
            aria-label={
              unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'
            }
          />
        }
      >
        <IconPlaceholder
          lucide='BellIcon'
          tabler='IconBell'
          hugeicons='NotificationIcon'
          phosphor='BellIcon'
          remixicon='RiNotificationLine'
        />
        {unreadCount > 0 && (
          <span className='bg-primary text-primary-foreground ring-background absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.625rem] font-medium tabular-nums ring-2'>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent
        align='end'
        className={cn('w-96 max-w-[calc(100vw-2rem)] gap-0 p-0', className)}
        onClick={(event) => {
          if (isLinkClick(event)) setOpen(false)
        }}
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}

function NotificationsHeader({
  action,
  className,
  title = 'Notifications',
}: {
  action?: ReactNode
  className?: string
  /** @default 'Notifications' */
  title?: string
}) {
  return (
    <div className={cn('flex items-center justify-between gap-2 px-4 py-3', className)}>
      <h2 className='text-sm font-semibold'>{title}</h2>
      {action}
    </div>
  )
}

function NotificationList({
  children,
  className,
  label = 'Notifications',
}: {
  children: ReactNode
  className?: string
  /** @default 'Notifications' */
  label?: string
}) {
  return (
    <ul aria-label={label} className={cn('flex flex-col', className)}>
      {children}
    </ul>
  )
}

interface NotificationItemProps {
  actions?: ReactNode
  className?: string
  notification: AppNotification
  /** Pass a fixed date, so times render the same on the server and in the browser. */
  now: Date
  onOpen: (notification: AppNotification) => void
  trailing?: ReactNode
}

function NotificationItem({
  actions,
  className,
  notification,
  now,
  onOpen,
  trailing,
}: NotificationItemProps) {
  const target = (
    <>
      <span aria-hidden className='absolute inset-0' />
      {notification.title}
    </>
  )
  return (
    <li
      data-read={notification.read || undefined}
      className={cn(
        'hover:bg-muted/50 focus-within:bg-muted/50 relative flex gap-3 px-4 py-3 transition-colors [--activity-marker:2rem]',
        className,
      )}
    >
      <ActivityIcon
        icon={notification.icon}
        tone={notification.tone}
        className='ring-0'
      />
      <div className='flex min-w-0 flex-1 flex-col gap-1'>
        <p className='text-sm'>
          {notification.href ? (
            <Link
              href={notification.href}
              onClick={() => onOpen(notification)}
              className='outline-none focus-visible:underline'
            >
              {target}
            </Link>
          ) : (
            <button
              type='button'
              onClick={() => onOpen(notification)}
              className='text-left outline-none focus-visible:underline'
            >
              {target}
            </button>
          )}
        </p>
        {notification.body && (
          <p className='text-muted-foreground line-clamp-2 text-sm'>
            {notification.body}
          </p>
        )}
        <ActivityTime date={notification.at} now={now} />
        {actions && <div className='relative mt-1 flex flex-wrap gap-2'>{actions}</div>}
      </div>
      <div className='relative flex shrink-0 flex-col items-end gap-2'>
        {!notification.read && <UnreadDot className='mt-1.5' />}
        {trailing}
      </div>
    </li>
  )
}

export { NotificationBell, NotificationItem, NotificationList, NotificationsHeader }

export type { AppNotification, NotificationBellProps, NotificationItemProps }
