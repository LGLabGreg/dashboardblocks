'use client'

import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { cn } from '@/lib/utils'

type Presence = 'online' | 'away' | 'offline'

interface Person {
  /** An image URL. Without one, or until it loads, the avatar shows initials. */
  avatar?: string
  id: string
  name: string
  presence?: Presence
}

interface PresenceConfig {
  /** The dot: filled for online and away, hollow for offline, so shape tells them apart too. */
  dot: string
  label: string
  /** Text colour for inline labels. */
  text: string
}

/** Presence colours are for presence only, and always come with a label. */
const presenceConfig: Record<Presence, PresenceConfig> = {
  away: {
    dot: 'bg-amber-500',
    label: 'Away',
    text: 'text-amber-800 dark:text-amber-400',
  },
  offline: {
    dot: 'border-muted-foreground bg-card border-2',
    label: 'Offline',
    text: 'text-muted-foreground',
  },
  online: {
    dot: 'bg-emerald-600 dark:bg-emerald-500',
    label: 'Online',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
}

/** Most available first. */
const presenceOrder: Presence[] = ['online', 'away', 'offline']

/*
 * Tinted, opaque backgrounds so stacked avatars don't show through each other,
 * with -800 / -300 initials for AA contrast in both themes. Presence greens and
 * ambers are left out so an avatar is never mistaken for a status.
 */
const avatarColors = [
  'bg-[color-mix(in_oklab,var(--color-sky-500)_20%,var(--card))] text-sky-800 dark:text-sky-300',
  'bg-[color-mix(in_oklab,var(--color-violet-500)_20%,var(--card))] text-violet-800 dark:text-violet-300',
  'bg-[color-mix(in_oklab,var(--color-rose-500)_20%,var(--card))] text-rose-800 dark:text-rose-300',
  'bg-[color-mix(in_oklab,var(--color-teal-500)_20%,var(--card))] text-teal-800 dark:text-teal-300',
  'bg-[color-mix(in_oklab,var(--color-indigo-500)_20%,var(--card))] text-indigo-800 dark:text-indigo-300',
  'bg-[color-mix(in_oklab,var(--color-orange-500)_20%,var(--card))] text-orange-800 dark:text-orange-300',
  'bg-[color-mix(in_oklab,var(--color-fuchsia-500)_20%,var(--card))] text-fuchsia-800 dark:text-fuchsia-300',
  'bg-[color-mix(in_oklab,var(--color-cyan-500)_20%,var(--card))] text-cyan-800 dark:text-cyan-300',
]

/** Picks the same colour for the same name every time, on the server and in the browser. */
function getAvatarColor(name: string) {
  // FNV-1a, which spreads similar names across the palette.
  let hash = 2_166_136_261
  for (const char of name) hash = Math.imul(hash ^ char.charCodeAt(0), 16_777_619) >>> 0
  return avatarColors[hash % avatarColors.length]
}

/** "Amara Okafor" → "AO", "Cher" → "C". */
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

/** "just now", "12 min ago", "3 days ago". Pass a fixed `now` to render the same on server and client. */
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
  sm: 'text-[10px]',
}

interface PersonAvatarProps {
  className?: string
  person: Pick<Person, 'avatar' | 'name' | 'presence'>
  /** Adds a presence dot. Show the presence as text nearby too. */
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
        className={cn('font-medium', initialsSize[size], getAvatarColor(person.name))}
      >
        {getInitials(person.name)}
      </AvatarFallback>
      {showPresence && person.presence && (
        <AvatarBadge className={cn('ring-card', presenceConfig[person.presence].dot)} />
      )}
    </Avatar>
  )
}

/** The presence dot with its label. */
function PresenceIndicator({
  className,
  label,
  presence,
}: {
  className?: string
  /** Replaces the default label, e.g. "Away · in a meeting". */
  label?: string
  presence: Presence
}) {
  const config = presenceConfig[presence]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap',
        config.text,
        className,
      )}
    >
      <span aria-hidden className={cn('size-2 shrink-0 rounded-full', config.dot)} />
      {label ?? config.label}
    </span>
  )
}

const stackCountSize: Record<AvatarSize, string> = {
  default: 'size-8 text-xs',
  lg: 'size-10 text-sm',
  sm: 'size-6 text-[10px]',
}

interface AvatarStackProps {
  className?: string
  /** Names the list for assistive technology, e.g. "Online now". */
  label: string
  /**
   * How many avatars to show before "+N".
   * @default 4
   */
  max?: number
  people: Pick<Person, 'avatar' | 'id' | 'name'>[]
  /** @default 'default' */
  size?: AvatarSize
}

/** Overlapping avatars with a "+N" for the rest. Each avatar keeps its name for screen readers and on hover. */
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
    <ul aria-label={label} className={cn('flex -space-x-2', className)}>
      {shown.map((person) => (
        <li key={person.id} title={person.name} className='flex'>
          <PersonAvatar person={person} size={size} className='ring-card ring-2' />
          <span className='sr-only'>{person.name}</span>
        </li>
      ))}
      {hidden > 0 && (
        <li
          className={cn(
            'bg-muted text-muted-foreground ring-card relative flex shrink-0 items-center justify-center rounded-full font-medium tabular-nums ring-2',
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
  PresenceIndicator,
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
}
