'use client'

import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type ReactNode, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { cn } from '@/lib/utils'

type Role = 'owner' | 'admin' | 'member' | 'viewer'

const roleConfig: Record<Role, { description: string; label: string }> = {
  admin: { description: 'Manage members, billing and settings', label: 'Admin' },
  member: { description: 'Create and edit dashboards', label: 'Member' },
  owner: { description: 'Full access, including deleting the workspace', label: 'Owner' },
  viewer: { description: 'View dashboards only', label: 'Viewer' },
}

/** Most access first. */
const roleOrder: Role[] = ['owner', 'admin', 'member', 'viewer']

interface RoleMenuProps {
  className?: string
  /** Names the trigger for assistive technology, e.g. "Role for Amara Okafor". */
  label: string
  onValueChange: (role: Role) => void
  /**
   * The roles to offer. Leave out `owner` to keep ownership changes out of the menu.
   * @default ['admin', 'member', 'viewer']
   */
  roles?: Role[]
  value: Role
}

/** A menu that picks a role, with what each role can do. */
function RoleMenu({
  className,
  label,
  onValueChange,
  roles = ['admin', 'member', 'viewer'],
  value,
}: RoleMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant='outline'
            size='sm'
            className={cn('justify-between', className)}
            aria-label={`${label}: ${roleConfig[value].label}`}
          />
        }
      >
        {roleConfig[value].label}
        <IconPlaceholder
          lucide='ChevronDownIcon'
          tabler='IconChevronDown'
          hugeicons='ArrowDownIcon'
          phosphor='CaretDownIcon'
          remixicon='RiArrowDownSLine'
          data-icon='inline-end'
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-64'>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Role</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={value}
            onValueChange={(next) => onValueChange(next as Role)}
          >
            {roles.map((role) => (
              <DropdownMenuRadioItem key={role} value={role} closeOnClick>
                <span className='flex flex-col gap-0.5'>
                  <span>{roleConfig[role].label}</span>
                  <span className='text-muted-foreground text-xs'>
                    {roleConfig[role].description}
                  </span>
                </span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface SettingsRowProps {
  children: ReactNode
  className?: string
  description?: ReactNode
  /** Give the control `aria-labelledby` this id, or `aria-describedby` for the description. */
  id?: string
  label: ReactNode
}

/**
 * A setting with its label and description beside the control, stacking in
 * narrow containers. Put it inside an `@container`.
 */
function SettingsRow({ children, className, description, id, label }: SettingsRowProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 @md:flex-row @md:items-center @md:justify-between @md:gap-6',
        className,
      )}
    >
      <div className='flex min-w-0 flex-col gap-0.5'>
        <span id={id} className='text-sm font-medium'>
          {label}
        </span>
        {description && (
          <span
            id={id ? `${id}-description` : undefined}
            className='text-muted-foreground text-sm'
          >
            {description}
          </span>
        )}
      </div>
      <div className='flex shrink-0 items-center gap-2'>{children}</div>
    </div>
  )
}

type ConnectionStatus = 'connected' | 'error' | 'paused' | 'disconnected'

const connectionStatusConfig: Record<
  ConnectionStatus,
  { className: string; icon: ReactNode; label: string }
> = {
  connected: {
    className: 'text-emerald-700 dark:text-emerald-400',
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
    label: 'Connected',
  },
  disconnected: {
    className: 'text-muted-foreground',
    icon: (
      <IconPlaceholder
        lucide='CircleDashedIcon'
        tabler='IconCircleDashed'
        hugeicons='DashedLineCircleIcon'
        phosphor='CircleDashedIcon'
        remixicon='RiLoaderLine'
        aria-hidden
      />
    ),
    label: 'Not connected',
  },
  error: {
    className: 'text-red-700 dark:text-red-400',
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
    label: 'Needs attention',
  },
  paused: {
    className: 'text-amber-800 dark:text-amber-400',
    icon: (
      <IconPlaceholder
        lucide='CirclePauseIcon'
        tabler='IconPlayerPause'
        hugeicons='PauseIcon'
        phosphor='PauseCircleIcon'
        remixicon='RiPauseCircleLine'
        aria-hidden
      />
    ),
    label: 'Paused',
  },
}

/** A connection's status as an icon and a label, so colour never carries it alone. */
function ConnectionStatusLabel({
  className,
  label,
  status,
}: {
  className?: string
  /** Replaces the default label, e.g. "Failing". */
  label?: string
  status: ConnectionStatus
}) {
  const config = connectionStatusConfig[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3.5',
        config.className,
        className,
      )}
    >
      {config.icon}
      {label ?? config.label}
    </span>
  )
}

/** "sk_live_51Hx…9f2a": the prefix and the last four characters, so a key can be recognised but not used. */
function maskSecret(secret: string, prefixLength = 8) {
  if (secret.length <= prefixLength + 4) return '••••'
  return `${secret.slice(0, prefixLength)}…${secret.slice(-4)}`
}

/** Copies text to the clipboard, and says so for two seconds. */
function useCopyToClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      return false
    }
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), timeout)
    return true
  }

  return { copied, copy }
}

/** An icon button that copies `value`, shows a tick once copied and announces it. */
function CopyButton({
  className,
  label = 'Copy',
  value,
}: {
  className?: string
  /** Names the button, e.g. "Copy API key". */
  label?: string
  value: string
}) {
  const { copied, copy } = useCopyToClipboard()
  return (
    <Button
      variant='ghost'
      size='icon-sm'
      className={className}
      aria-label={label}
      onClick={() => void copy(value)}
    >
      {copied ? (
        <IconPlaceholder
          lucide='CheckIcon'
          tabler='IconCheck'
          hugeicons='Tick02Icon'
          phosphor='CheckIcon'
          remixicon='RiCheckLine'
          aria-hidden
        />
      ) : (
        <IconPlaceholder
          lucide='CopyIcon'
          tabler='IconCopy'
          hugeicons='Copy01Icon'
          phosphor='CopyIcon'
          remixicon='RiFileCopyLine'
          aria-hidden
        />
      )}
      <span role='status' className='sr-only'>
        {copied ? 'Copied' : ''}
      </span>
    </Button>
  )
}

const relativeFormatter = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })

/** "just now", "3 hours ago", "yesterday", "5 months ago". Pass a fixed `now` to render the same on server and client. */
function formatRelative(date: Date, now: Date) {
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000)
  const minutes = Math.round(seconds / 60)
  const hours = Math.round(minutes / 60)
  const days = Math.round(hours / 24)
  if (Math.abs(minutes) < 1) return 'just now'
  if (Math.abs(minutes) < 60) return relativeFormatter.format(minutes, 'minute')
  if (Math.abs(hours) < 24) return relativeFormatter.format(hours, 'hour')
  if (Math.abs(days) < 30) return relativeFormatter.format(days, 'day')
  if (Math.abs(days) < 365)
    return relativeFormatter.format(Math.round(days / 30), 'month')
  return relativeFormatter.format(Math.round(days / 365), 'year')
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
})

/** "Sep 26, 2026", in UTC so it renders the same on server and client. */
function formatDate(date: Date) {
  return dateFormatter.format(date)
}

/** Whole days between two dates. */
function daysBetween(from: Date, to: Date) {
  return Math.floor((to.getTime() - from.getTime()) / 86_400_000)
}

export {
  ConnectionStatusLabel,
  CopyButton,
  RoleMenu,
  SettingsRow,
  connectionStatusConfig,
  daysBetween,
  formatDate,
  formatRelative,
  maskSecret,
  roleConfig,
  roleOrder,
  useCopyToClipboard,
}

export type { ConnectionStatus, Role, RoleMenuProps, SettingsRowProps }
