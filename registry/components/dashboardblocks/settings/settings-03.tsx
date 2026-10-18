'use client'

import {
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { Fragment, useState } from 'react'

import { Switch } from '@/components/ui/switch'

interface NotificationChannel {
  id: string
  label: string
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

interface Settings3Props {
  channels: NotificationChannel[]
  description: string
  /** Leave out, or pass none, to show the empty state. */
  groups?: NotificationGroup[]
  onChange?: (preferences: NotificationPreferences) => void
  preferences?: NotificationPreferences
  status?: BlockStatus
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

const Settings3 = (props: Settings3Props) => {
  const { channels, description, groups = [], onChange, status, title } = props
  const [preferences, setPreferences] = useState(props.preferences ?? {})
  const ready = !status && groups.length > 0

  const update = (next: NotificationPreferences) => {
    setPreferences(next)
    onChange?.(next)
  }

  const isOn = (eventId: string, channelId: string) =>
    preferences[eventId]?.includes(channelId) ?? false

  const toggle = (eventId: string, channelId: string, on: boolean) => {
    const current = preferences[eventId] ?? []
    update({
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
    <BlockStateProvider state={getBlockState(status, groups)}>
      <section className='@container flex flex-col gap-3'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <div className='overflow-x-auto border-t'>
          <table className='w-full text-sm'>
            <caption className='sr-only'>{title}</caption>
            <thead>
              <tr className='border-b'>
                <th scope='col' className='min-w-40 py-2.5 pr-4 text-left font-medium'>
                  <span className='sr-only'>Notification</span>
                </th>
                {channels.map((channel) => {
                  const count = allEvents.filter((event) =>
                    isOn(event.id, channel.id),
                  ).length
                  return (
                    <th
                      key={channel.id}
                      scope='col'
                      className='w-20 px-2 py-2.5 text-center font-medium'
                    >
                      <div className='flex flex-col items-center gap-2'>
                        {channel.label}
                        <Switch
                          size='sm'
                          aria-label={`All ${channel.label} notifications`}
                          checked={ready && count === allEvents.length}
                          disabled={!ready}
                          onCheckedChange={(on) => setChannel(channel.id, on)}
                        />
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {!ready && (
                <tr>
                  <td colSpan={channels.length + 1}>
                    <BlockStateRows rows={4} />
                  </td>
                </tr>
              )}
              {ready &&
                groups.map((group) => (
                  <Fragment key={group.id}>
                    <tr className='border-b'>
                      <th
                        scope='colgroup'
                        colSpan={channels.length + 1}
                        className='text-muted-foreground pt-4 pb-1.5 text-left text-xs font-medium'
                      >
                        {group.label}
                      </th>
                    </tr>
                    {group.events.map((event) => (
                      <tr key={event.id} className='border-b'>
                        <th scope='row' className='py-2.5 pr-4 text-left font-normal'>
                          <span className='block'>{event.label}</span>
                          {event.description && (
                            <span className='text-muted-foreground block text-xs'>
                              {event.description}
                            </span>
                          )}
                        </th>
                        {channels.map((channel) => (
                          <td key={channel.id} className='px-2 py-2.5 text-center'>
                            <Switch
                              aria-label={`${event.label} by ${channel.label}`}
                              checked={isOn(event.id, channel.id)}
                              onCheckedChange={(on) => toggle(event.id, channel.id, on)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </BlockStateProvider>
  )
}

export {
  Settings3,
  exampleProps as settings3ExampleProps,
  type NotificationChannel,
  type NotificationEvent,
  type NotificationGroup,
  type NotificationPreferences,
  type Settings3Props,
}
