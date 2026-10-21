// Override of registry/components/dashboardblocks/settings.tsx for React Aria
// source-hash: 5452380060a1

'use client'

import {
  StatusLabel,
  type StatusTone,
} from '@/registry/components/dashboardblocks/status-label'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type ComponentProps, type ReactNode, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
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

const roleOrder: Role[] = ['owner', 'admin', 'member', 'viewer']

interface RoleMenuProps {
  className?: string
  label: string
  onValueChange: (role: Role) => void
  /** @default ['admin', 'member', 'viewer'] */
  roles?: Role[]
  value: Role
}

function RoleMenu({
  className,
  label,
  onValueChange,
  roles = ['admin', 'member', 'viewer'],
  value,
}: RoleMenuProps) {
  return (
    <DropdownMenuTrigger>
      <Button
        variant='outline'
        size='sm'
        className={cn('justify-between', className)}
        aria-label={`${label}: ${roleConfig[value].label}`}
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
      </Button>
      <DropdownMenu
        placement='bottom end'
        className='w-64'
        selectionMode='single'
        disallowEmptySelection
        selectedKeys={[value]}
        onSelectionChange={(keys) => {
          const [next] = keys === 'all' ? [] : [...keys]
          if (next !== undefined) onValueChange(next as Role)
        }}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Role</DropdownMenuLabel>
          {roles.map((role) => (
            <DropdownMenuItem key={role} id={role} textValue={roleConfig[role].label}>
              <span className='flex flex-col gap-0.5'>
                <span>{roleConfig[role].label}</span>
                <span className='text-muted-foreground text-xs'>
                  {roleConfig[role].description}
                </span>
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenu>
    </DropdownMenuTrigger>
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
            className='text-muted-foreground text-sm break-words'
          >
            {description}
          </span>
        )}
      </div>
      <div className='flex shrink-0 items-center gap-2'>{children}</div>
    </div>
  )
}

type ConnectionStatus =
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'importing'
  | 'paused'
  | 'revoked'

const connectionStatusConfig: Record<
  ConnectionStatus,
  { icon: ReactNode; label: string; tone: StatusTone }
> = {
  connected: {
    tone: 'good',
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
    tone: 'neutral',
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
    tone: 'bad',
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
  importing: {
    tone: 'info',
    icon: (
      <IconPlaceholder
        lucide='Loader2Icon'
        tabler='IconLoader'
        hugeicons='Loading03Icon'
        phosphor='SpinnerIcon'
        remixicon='RiLoaderLine'
        aria-hidden
        className='animate-spin motion-reduce:animate-none'
      />
    ),
    label: 'Importing',
  },
  paused: {
    tone: 'warning',
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
  revoked: {
    tone: 'bad',
    icon: (
      <IconPlaceholder
        lucide='UnlinkIcon'
        tabler='IconUnlink'
        hugeicons='Unlink01Icon'
        phosphor='LinkBreakIcon'
        remixicon='RiLinkUnlink'
        aria-hidden
      />
    ),
    label: 'Access removed',
  },
}

function ConnectionStatusLabel({
  className,
  label,
  status,
}: {
  className?: string
  label?: string
  status: ConnectionStatus
}) {
  const config = connectionStatusConfig[status]
  return (
    <StatusLabel tone={config.tone} className={className} indicator={config.icon}>
      {label ?? config.label}
    </StatusLabel>
  )
}

interface ConnectionRowProps extends Omit<ComponentProps<'div'>, 'title'> {
  /** Buttons for what can be done now: Connect, Reconnect, Disconnect. */
  actions?: ReactNode
  /** What it does, or what's wrong, in a sentence. */
  description?: ReactNode
  /** Drawn in a square at the start of the row. */
  logo?: ReactNode
  name: string
  status: ConnectionStatus
}

function ConnectionRow({
  actions,
  children,
  className,
  description,
  logo,
  name,
  status,
  ...props
}: ConnectionRowProps) {
  return (
    <div
      data-slot='connection-row'
      className={cn('flex flex-wrap items-start gap-x-3 gap-y-2 py-3', className)}
      {...props}
    >
      {logo}
      <div className='flex min-w-0 flex-1 basis-48 flex-col gap-0.5'>
        <span className='flex flex-wrap items-baseline gap-x-2'>
          <span className='text-sm font-medium'>{name}</span>
          <ConnectionStatusLabel status={status} />
        </span>
        {description && (
          <div className='text-muted-foreground text-sm text-pretty'>{description}</div>
        )}
        {children}
      </div>
      {actions && <div className='flex shrink-0 flex-wrap gap-2'>{actions}</div>}
    </div>
  )
}

function maskSecret(secret: string, prefixLength = 8) {
  if (secret.length <= prefixLength + 4) return '••••'
  return `${secret.slice(0, prefixLength)}…${secret.slice(-4)}`
}

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

function CopyButton({
  className,
  label = 'Copy',
  value,
}: {
  className?: string
  label?: string
  value: string
}) {
  const { copied, copy } = useCopyToClipboard()
  return (
    <Button
      type='button'
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

function daysBetween(from: Date, to: Date) {
  return Math.floor((to.getTime() - from.getTime()) / 86_400_000)
}

export {
  ConnectionRow,
  ConnectionStatusLabel,
  CopyButton,
  RoleMenu,
  SettingsRow,
  connectionStatusConfig,
  daysBetween,
  maskSecret,
  roleConfig,
  roleOrder,
  useCopyToClipboard,
}

export type {
  ConnectionRowProps,
  ConnectionStatus,
  Role,
  RoleMenuProps,
  SettingsRowProps,
}
