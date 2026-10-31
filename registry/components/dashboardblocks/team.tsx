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
  online: {
    dot: 'bg-emerald-600 dark:bg-emerald-500',
    label: 'Online',
    tone: 'good',
  },
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

const workloadFill = 'var(--color-chart-2)'
const workloadOpenFill = 'color-mix(in oklab, var(--color-chart-2) 35%, transparent)'
const workloadOverFill =
  'repeating-linear-gradient(135deg, var(--color-orange-500) 0 3px, color-mix(in oklab, var(--color-orange-500) 45%, var(--color-background)) 3px 6px)'

interface WorkloadBarPart {
  /** Finished work: it keeps its fill past `capacity`, where only open work is hatched. */
  done?: boolean
  /** A colour, such as `workloadFill` or a lighter mix of it. */
  fill: string
  value: number
}

interface WorkloadBarProps {
  /** What the person has, in the bar's unit. */
  assigned: number
  /** What they can take, drawn as a tick. What's past it is hatched in orange. */
  capacity?: number
  className?: string
  /** Of `assigned`, what's finished: drawn solid, and the rest lighter. Leave out to draw all of `assigned` solid. */
  done?: number
  /** A tick that marks a point on the bar without hatching past it, such as where a pace lands. */
  mark?: number
  /** The value the full width stands for, so bars one above another share a scale. */
  max: number
  /** `assigned` split into parts, drawn in order in place of `done` and the rest, such as done, in review and in progress. */
  parts?: WorkloadBarPart[]
  /** Grows the bar in from zero once true, as `useReveal` gives. */
  revealed: boolean
}

/** Cuts the open parts at `limit`, and gives the open work past it as one more amount. */
function splitAt(parts: WorkloadBarPart[], limit: number) {
  const within: WorkloadBarPart[] = []
  let used = 0
  let over = 0
  for (const part of parts) {
    const value = part.done ? part.value : Math.max(0, Math.min(part.value, limit - used))
    if (value > 0) within.push({ fill: part.fill, value })
    over += part.value - value
    used += part.value
  }
  return { over, within }
}

function WorkloadTick({ at }: { at: string }) {
  return (
    <span
      className='bg-foreground ring-background absolute top-1/2 h-[calc(100%+8px)] w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2'
      style={{ left: at }}
    />
  )
}

/** One person's load: what they have against what they can take. Decorative: write the numbers beside it. */
function WorkloadBar({
  assigned,
  capacity,
  className,
  done,
  mark,
  max,
  parts,
  revealed,
}: WorkloadBarProps) {
  const solid = done === undefined ? assigned : Math.min(done, assigned)
  const { over, within } = splitAt(
    parts ?? [
      { done: done !== undefined, fill: workloadFill, value: solid },
      { fill: workloadOpenFill, value: assigned - solid },
    ],
    capacity ?? assigned,
  )
  const toPercent = (value: number) =>
    `${max > 0 ? Math.min(100, (value / max) * 100) : 0}%`
  return (
    <div
      aria-hidden
      data-slot='workload-bar'
      className={cn('relative h-2 w-full', className)}
    >
      <div className='bg-muted flex h-full w-full overflow-hidden rounded-full'>
        <div
          data-slot='workload-bar-parts'
          className='flex h-full origin-left transition-transform duration-700 ease-out motion-reduce:transition-none'
          style={{
            transform: revealed ? 'scaleX(1)' : 'scaleX(0)',
            width: toPercent(assigned),
          }}
        >
          {within.map((part, index) => (
            <div
              key={index}
              className='h-full'
              style={{ backgroundColor: part.fill, flexGrow: part.value }}
            />
          ))}
          {over > 0 && (
            <div
              className='h-full'
              style={{ backgroundImage: workloadOverFill, flexGrow: over }}
            />
          )}
        </div>
      </div>
      {capacity !== undefined && <WorkloadTick at={toPercent(capacity)} />}
      {mark !== undefined && <WorkloadTick at={toPercent(mark)} />}
    </div>
  )
}

export {
  AvatarStack,
  PersonAvatar,
  PresenceLabel,
  getAvatarColor,
  getInitials,
  presenceConfig,
  presenceOrder,
  WorkloadBar,
  workloadFill,
  workloadOverFill,
}

export type {
  AvatarSize,
  AvatarStackProps,
  Person,
  PersonAvatarProps,
  Presence,
  PresenceConfig,
  PresenceLabelProps,
  WorkloadBarPart,
  WorkloadBarProps,
}
