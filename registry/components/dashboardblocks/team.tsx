'use client'

import {
  StatusLabel,
  type StatusLabelProps,
  type StatusTone,
} from '@/registry/components/dashboardblocks/status-label'

import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { cn } from '@/lib/utils'

type Presence = 'online' | 'away' | 'offline'

interface Person {
  avatar?: string
  id: string
  name: string
  presence?: Presence
}

interface PresenceConfig {
  dot: string
  label: string
  tone: StatusTone
}

const presenceConfig: Record<Presence, PresenceConfig> = {
  away: { dot: 'bg-orange-500', label: 'Away', tone: 'warning' },
  offline: {
    dot: 'border-muted-foreground bg-background border-2',
    label: 'Offline',
    tone: 'neutral',
  },
  online: { dot: 'bg-emerald-600 dark:bg-emerald-500', label: 'Online', tone: 'good' },
}

const presenceOrder: Presence[] = ['online', 'away', 'offline']

const avatarColors = [
  'bg-[color-mix(in_oklab,var(--color-chart-2)_25%,var(--color-card))] text-foreground',
  'bg-[color-mix(in_oklab,var(--color-chart-3)_25%,var(--color-card))] text-foreground',
  'bg-[color-mix(in_oklab,var(--color-chart-4)_25%,var(--color-card))] text-foreground',
  'bg-[color-mix(in_oklab,var(--color-chart-5)_25%,var(--color-card))] text-foreground',
  'bg-[color-mix(in_oklab,var(--color-chart-1)_25%,var(--color-card))] text-foreground',
]

function fnv1a(text: string) {
  let hash = 2_166_136_261
  for (const char of text) hash = Math.imul(hash ^ char.charCodeAt(0), 16_777_619) >>> 0
  return hash
}

function getAvatarColor(name: string) {
  return avatarColors[fnv1a(name) % avatarColors.length]
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0][0]
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return `${first}${last}`.toUpperCase()
}

const relativeFormatter = new Intl.RelativeTimeFormat('en-US', {
  numeric: 'auto',
  style: 'short',
})

function formatLastActive(date: Date, now: Date) {
  const minutes = Math.round((date.getTime() - now.getTime()) / 60_000)
  const hours = Math.round(minutes / 60)
  const days = Math.round(hours / 24)
  if (Math.abs(minutes) < 1) return 'just now'
  if (Math.abs(minutes) < 60) return relativeFormatter.format(minutes, 'minute')
  if (Math.abs(hours) < 24) return relativeFormatter.format(hours, 'hour')
  return relativeFormatter.format(days, 'day')
}

type AvatarSize = 'sm' | 'default' | 'lg'

const initialsSize: Record<AvatarSize, string> = {
  default: 'text-xs',
  lg: 'text-sm',
  sm: 'text-xs',
}

interface PersonAvatarProps {
  className?: string
  person: Pick<Person, 'avatar' | 'name' | 'presence'>
  showPresence?: boolean
  /** @default 'default' */
  size?: AvatarSize
}

/** Decorative: always show the person's name beside it, or in `sr-only` text. */
function PersonAvatar({
  className,
  person,
  showPresence = false,
  size = 'default',
}: PersonAvatarProps) {
  return (
    <Avatar aria-hidden size={size} className={className}>
      {person.avatar && <AvatarImage src={person.avatar} alt='' />}
      <AvatarFallback
        // Not the primitive's colour: each person's initials take their own chart tint
        className={cn('font-medium', initialsSize[size], getAvatarColor(person.name))}
      >
        {getInitials(person.name)}
      </AvatarFallback>
      {showPresence && person.presence && (
        <AvatarBadge
          // Not the primitive's colour: the presence dot is the block's own, coloured for status, and its ring cuts it out of the page behind it
          className={cn('ring-background', presenceConfig[person.presence].dot)}
        />
      )}
    </Avatar>
  )
}

interface PresenceLabelProps extends Omit<StatusLabelProps, 'tone'> {
  presence: Presence
}

function PresenceLabel({ children, presence, ...props }: PresenceLabelProps) {
  const config = presenceConfig[presence]
  return (
    <StatusLabel tone={config.tone} {...props}>
      {children ?? config.label}
    </StatusLabel>
  )
}

const stackCountSize: Record<AvatarSize, string> = {
  default: 'size-8 text-xs',
  lg: 'size-10 text-sm',
  sm: 'size-6 text-xs',
}

const stackSpacing: Record<AvatarSize, string> = {
  default: '-space-x-2',
  lg: '-space-x-2',
  sm: 'space-x-0',
}

interface AvatarStackProps {
  className?: string
  label: string
  /** Avatars shown before "+N", 4 by default. */
  max?: number
  people: Pick<Person, 'avatar' | 'id' | 'name'>[]
  /** @default 'default' */
  size?: AvatarSize
}

function AvatarStack({
  className,
  label,
  max = 4,
  people,
  size = 'default',
}: AvatarStackProps) {
  const shown = people.slice(0, max)
  const hidden = people.length - shown.length

  return (
    <ul aria-label={label} className={cn('flex', stackSpacing[size], className)}>
      {shown.map((person) => (
        <li key={person.id} title={person.name} className='flex'>
          <PersonAvatar person={person} size={size} className='ring-background ring-2' />
          <span className='sr-only'>{person.name}</span>
        </li>
      ))}
      {hidden > 0 && (
        <li
          className={cn(
            'bg-muted text-foreground ring-background relative flex shrink-0 items-center justify-center rounded-full font-medium tabular-nums ring-2',
            stackCountSize[size],
          )}
        >
          <span aria-hidden>+{hidden}</span>
          <span className='sr-only'>and {hidden} more</span>
        </li>
      )}
    </ul>
  )
}

export {
  AvatarStack,
  PersonAvatar,
  PresenceLabel,
  formatLastActive,
  getAvatarColor,
  getInitials,
  presenceConfig,
  presenceOrder,
}

export type {
  AvatarSize,
  AvatarStackProps,
  Person,
  PersonAvatarProps,
  Presence,
  PresenceConfig,
  PresenceLabelProps,
}
