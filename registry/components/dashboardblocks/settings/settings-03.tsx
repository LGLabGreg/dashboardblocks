'use client'

import {
  Announcements,
  useAnnouncements,
} from '@/registry/components/dashboardblocks/announcements'
import {
  BlockStateProvider,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableGroupHead,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  DataTableRowHead,
  DataTableStateRows,
} from '@/registry/components/dashboardblocks/table'
import { attempt } from '@/registry/lib/dashboardblocks/attempt'
import { type ReactNode, startTransition, useId, useState } from 'react'

import { Switch } from '@/components/ui/switch'

interface NotificationChannel {
  id: string
  label: string
  /** Why the channel can't send right now, such as "Slack isn't connected. Ask an admin to connect it." Shown above the table; the channel's switches turn off until it can, and the saved choices come back then. */
  unavailable?: ReactNode
}

interface NotificationEvent {
  description?: string
  id: string
  label: string
}

interface NotificationGroup {
  events: NotificationEvent[]
  id: string
  label: string
}

/** `preferences[eventId]` lists the channel ids that event is sent to. */
type NotificationPreferences = Record<string, string[]>

type NotificationChangeResult = void | { status: 'error'; message: string }

interface Settings3Props extends BlockStateProps {
  channels: NotificationChannel[]
  description: string
  /** Leave out, or pass none, to show the empty state. */
  groups?: NotificationGroup[]
  /** Saves the new preferences; resolve to an error, or throw, to put the switches it changed back and say why. */
  onChange?: (
    preferences: NotificationPreferences,
  ) => NotificationChangeResult | Promise<NotificationChangeResult>
  preferences?: NotificationPreferences
  title: string
}

const exampleProps: Settings3Props = {
  channels: [
    { id: 'email', label: 'Email' },
    { id: 'push', label: 'Push' },
    { id: 'slack', label: 'Slack' },
  ],
  description: 'Choose where each notification is sent.',
  groups: [
    {
      events: [
        {
          description: 'When a metric crosses a threshold you set',
          id: 'alert-triggered',
          label: 'Alert triggered',
        },
        {
          description: 'When an alert clears',
          id: 'alert-resolved',
          label: 'Alert resolved',
        },
      ],
      id: 'alerts',
      label: 'Alerts',
    },
    {
      events: [
        { id: 'weekly-summary', label: 'Weekly summary' },
        { id: 'report-ready', label: 'Scheduled report ready' },
      ],
      id: 'reports',
      label: 'Reports',
    },
    {
      events: [
        { id: 'invoice-paid', label: 'Invoice paid' },
        {
          description: 'When a payment fails or a card is about to expire',
          id: 'payment-issue',
          label: 'Payment issue',
        },
      ],
      id: 'billing',
      label: 'Billing',
    },
    {
      events: [
        { id: 'mention', label: 'Mentioned in a comment' },
        { id: 'member-joined', label: 'Member joined' },
      ],
      id: 'workspace',
      label: 'Workspace',
    },
  ],
  preferences: {
    'alert-resolved': ['slack'],
    'alert-triggered': ['email', 'push', 'slack'],
    'invoice-paid': ['email'],
    mention: ['email', 'push'],
    'member-joined': [],
    'payment-issue': ['email', 'push'],
    'report-ready': ['email'],
    'weekly-summary': ['email'],
  },
  title: 'Notifications',
}

function revert(
  current: NotificationPreferences,
  previous: NotificationPreferences,
  next: NotificationPreferences,
) {
  const reverted = { ...current }
  for (const eventId of new Set([...Object.keys(previous), ...Object.keys(next)])) {
    const was = previous[eventId] ?? []
    const sent = next[eventId] ?? []
    for (const channelId of new Set([...was, ...sent])) {
      if (was.includes(channelId) === sent.includes(channelId)) continue
      const without = (reverted[eventId] ?? []).filter((channel) => channel !== channelId)
      reverted[eventId] = was.includes(channelId) ? [...without, channelId] : without
    }
  }
  return reverted
}

const Settings3 = (props: Settings3Props) => {
  const {
    channels,
    description,
    groups = [],
    onChange,
    errorMessage,
    status,
    title,
  } = props
  const [preferences, setPreferences] = useState(props.preferences ?? {})
  const [error, setError] = useState<string | null>(null)
  const [said, announce] = useAnnouncements()
  const noteId = useId()
  const ready = !status && groups.length > 0
  const unavailable = channels.filter((channel) => channel.unavailable)

  const update = async (next: NotificationPreferences) => {
    const previous = preferences
    setPreferences(next)
    setError(null)
    const result: NotificationChangeResult = await attempt(
      () => onChange?.(next),
      'Couldn’t save your notifications. Try again.',
    )
    if (!result) return
    const { message } = result
    startTransition(() => {
      setPreferences((current) => revert(current, previous, next))
      setError(message)
      announce(message)
    })
  }

  const isOn = (eventId: string, channel: NotificationChannel) =>
    !channel.unavailable && (preferences[eventId]?.includes(channel.id) ?? false)

  const noteFor = (channel: NotificationChannel) =>
    channel.unavailable ? `${noteId}-${channel.id}` : undefined

  const toggle = (eventId: string, channelId: string, on: boolean) => {
    const current = preferences[eventId] ?? []
    return update({
      ...preferences,
      [eventId]: on
        ? [...current, channelId]
        : current.filter((channel) => channel !== channelId),
    })
  }

  const allEvents = groups.flatMap((group) => group.events)

  const setChannel = (channelId: string, on: boolean) =>
    update(
      Object.fromEntries(
        allEvents.map((event) => {
          const current = preferences[event.id] ?? []
          const without = current.filter((channel) => channel !== channelId)
          return [event.id, on ? [...without, channelId] : without]
        }),
      ),
    )

  return (
    <BlockStateProvider errorMessage={errorMessage} state={getBlockState(status, groups)}>
      <section className='@container flex flex-col gap-3'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        {ready &&
          unavailable.map((channel) => (
            <p
              key={channel.id}
              id={noteFor(channel)}
              className='text-muted-foreground text-sm text-pretty'
            >
              {channel.unavailable}
            </p>
          ))}
        <DataTable className='border-t' caption={title}>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead className='min-w-40'>
                <span className='sr-only'>Notification</span>
              </DataTableHead>
              {channels.map((channel) => {
                const count = allEvents.filter((event) => isOn(event.id, channel)).length
                return (
                  <DataTableHead key={channel.id} align='center' className='w-20 py-2.5'>
                    <div className='flex flex-col items-center gap-2'>
                      <span className='text-foreground text-sm'>{channel.label}</span>
                      <Switch
                        size='sm'
                        aria-label={`All ${channel.label} notifications`}
                        aria-describedby={noteFor(channel)}
                        checked={ready && count === allEvents.length}
                        disabled={!ready || Boolean(channel.unavailable)}
                        onCheckedChange={(on) => void setChannel(channel.id, on)}
                      />
                    </div>
                  </DataTableHead>
                )
              })}
            </DataTableRow>
          </DataTableHeader>
          {!ready && (
            <DataTableBody>
              <DataTableStateRows colSpan={channels.length + 1} rows={4} />
            </DataTableBody>
          )}
          {ready &&
            groups.map((group) => (
              <DataTableBody key={group.id}>
                <DataTableRow>
                  <DataTableGroupHead colSpan={channels.length + 1}>
                    {group.label}
                  </DataTableGroupHead>
                </DataTableRow>
                {group.events.map((event) => (
                  <DataTableRow key={event.id}>
                    <DataTableRowHead>
                      <span className='block'>{event.label}</span>
                      {event.description && (
                        <span className='text-muted-foreground block text-xs'>
                          {event.description}
                        </span>
                      )}
                    </DataTableRowHead>
                    {channels.map((channel) => (
                      <DataTableCell key={channel.id} align='center'>
                        <Switch
                          aria-label={`${event.label} by ${channel.label}`}
                          aria-describedby={noteFor(channel)}
                          checked={isOn(event.id, channel)}
                          disabled={Boolean(channel.unavailable)}
                          onCheckedChange={(on) => void toggle(event.id, channel.id, on)}
                        />
                      </DataTableCell>
                    ))}
                  </DataTableRow>
                ))}
              </DataTableBody>
            ))}
        </DataTable>
        {error && <p className='text-destructive text-sm'>{error}</p>}
        <Announcements said={said} />
      </section>
    </BlockStateProvider>
  )
}

export {
  Settings3,
  exampleProps as settings3ExampleProps,
  type NotificationChangeResult,
  type NotificationChannel,
  type NotificationEvent,
  type NotificationGroup,
  type NotificationPreferences,
  type Settings3Props,
}
