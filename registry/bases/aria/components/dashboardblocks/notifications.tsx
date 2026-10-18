// Override of registry/components/dashboardblocks/notifications.tsx for React Aria
// source-hash: 2e2e337b7856

'use client'

import {
  ActivityTime,
  type ActivityTone,
  UnreadDot,
} from '@/registry/components/dashboardblocks/activity-feed'
import { Link } from '@/registry/components/dashboardblocks/link'
import { statusToneClasses } from '@/registry/components/dashboardblocks/status-label'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import type { MouseEvent, ReactNode } from 'react'
import { Dialog } from 'react-aria-components'

import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger } from '@/components/ui/popover'

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
  return (
    <PopoverTrigger isOpen={open} onOpenChange={onOpenChange}>
      <Button
        variant='ghost'
        size='icon'
        className='relative'
        aria-label={
          unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'
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
          <span className='bg-primary text-primary-foreground ring-background absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-xs font-medium tabular-nums ring-2'>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
      <Popover
        placement='bottom end'
        className={cn('w-96 max-w-[calc(100vw-2rem)] gap-0 p-0', className)}
      >
        <Dialog aria-label='Notifications' className='flex flex-col outline-none'>
          {({ close }) => (
            <div
              className='contents'
              onClick={(event) => {
                if (isLinkClick(event)) close()
              }}
            >
              {children}
            </div>
          )}
        </Dialog>
      </Popover>
    </PopoverTrigger>
  )
}

function NotificationsHeader({
  action,
  className,
  description,
  title = 'Notifications',
}: {
  action?: ReactNode
  className?: string
  description?: ReactNode
  /** @default 'Notifications' */
  title?: string
}) {
  return (
    <div
      className={cn('flex items-start justify-between gap-3 px-4 pt-4 pb-3', className)}
    >
      <div className='flex min-w-0 flex-col gap-0.5'>
        <h2 className='font-semibold tracking-tight'>{title}</h2>
        {description && <p className='text-muted-foreground text-sm'>{description}</p>}
      </div>
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
    <ul aria-label={label} className={cn('flex flex-col divide-y', className)}>
      {children}
    </ul>
  )
}

const toneClasses: Record<ActivityTone, string> = {
  accent: 'text-foreground',
  danger: statusToneClasses.bad,
  info: statusToneClasses.info,
  neutral: statusToneClasses.neutral,
  success: statusToneClasses.good,
  warning: statusToneClasses.warning,
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
        'hover:bg-muted/50 focus-within:bg-muted/50 relative flex gap-3 px-4 py-3 transition-colors',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'flex h-5 shrink-0 items-center [&_svg]:size-4',
          toneClasses[notification.tone ?? 'neutral'],
        )}
      >
        {notification.icon}
      </span>
      <div className='flex min-w-0 flex-1 flex-col gap-1'>
        <p className={cn('text-sm', notification.read && 'text-muted-foreground')}>
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
        <ActivityTime className='tabular-nums' date={notification.at} now={now} />
        {actions && <div className='relative mt-1 flex flex-wrap gap-2'>{actions}</div>}
      </div>
      <div className='relative flex shrink-0 items-center gap-2 self-start'>
        {trailing && <div className='-my-1'>{trailing}</div>}
        <span className='flex h-5 w-2 items-center'>
          {!notification.read && <UnreadDot />}
        </span>
      </div>
    </li>
  )
}

export { NotificationBell, NotificationItem, NotificationList, NotificationsHeader }

export type { AppNotification, NotificationBellProps, NotificationItemProps }
