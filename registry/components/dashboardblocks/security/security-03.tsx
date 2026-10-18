'use client'

import { ActivityTime } from '@/registry/components/dashboardblocks/activity-feed'
import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
  useBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { Details } from '@/registry/components/dashboardblocks/details'
import {
  DeviceIcon,
  type DeviceKind,
} from '@/registry/components/dashboardblocks/security'
import { StatusLabel } from '@/registry/components/dashboardblocks/status-label'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

interface Session {
  client: string
  current?: boolean
  device: DeviceKind
  id: string
  lastActive: Date
  location: string
}

interface Security3Props {
  /** Defaults to a sentence counting the devices and where they are. */
  description?: string
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  onSignOut?: (id: string) => void
  /** Leave out, or pass none, to show the empty state. */
  sessions?: Session[]
  status?: BlockStatus
  /** @default 'UTC' */
  timeZone?: string
  title: string
}

const NOW = new Date(Date.UTC(2026, 8, 26, 16, 0))
const minutesAgo = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000)

const exampleProps: Security3Props = {
  now: NOW,
  sessions: [
    {
      client: 'Chrome on macOS',
      current: true,
      device: 'desktop',
      id: 's1',
      lastActive: NOW,
      location: 'Lisbon, Portugal',
    },
    {
      client: 'Safari on iOS',
      device: 'mobile',
      id: 's2',
      lastActive: minutesAgo(42),
      location: 'Lisbon, Portugal',
    },
    {
      client: 'Firefox on Windows',
      device: 'desktop',
      id: 's3',
      lastActive: minutesAgo(60 * 26),
      location: 'Porto, Portugal',
    },
    {
      client: 'Chrome on Android',
      device: 'mobile',
      id: 's4',
      lastActive: minutesAgo(60 * 24 * 9),
      location: 'Madrid, Spain',
    },
  ],
  title: 'Active sessions',
}

const summarize = (sessions: Session[]) => {
  const places = new Set(sessions.map((session) => session.location)).size
  const devices = `${sessions.length} ${sessions.length === 1 ? 'device' : 'devices'} signed in`
  return places > 1 ? `${devices}, from ${places} places.` : `${devices}.`
}

function SessionList(props: Security3Props) {
  const { now, onSignOut, timeZone, title } = props
  const state = useBlockState()
  const [sessions, setSessions] = useState(props.sessions ?? [])
  const others = sessions.filter((session) => !session.current)

  const signOut = (ids: string[]) => {
    ids.forEach((id) => onSignOut?.(id))
    setSessions((list) => list.filter((session) => !ids.includes(session.id)))
  }

  return (
    <section className='@container flex flex-col gap-3'>
      <header className='flex flex-wrap items-start justify-between gap-3'>
        <div className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          {props.description ? (
            <p className='text-muted-foreground text-sm'>{props.description}</p>
          ) : (
            <BlockReady className='text-sm'>
              <p className='text-muted-foreground text-sm'>{summarize(sessions)}</p>
            </BlockReady>
          )}
        </div>
        {!state && others.length > 0 && (
          <Button
            size='sm'
            variant='outline'
            onClick={() => signOut(others.map((session) => session.id))}
          >
            Sign out others
          </Button>
        )}
      </header>
      <BlockStateRows className='border-t' rows={4} />
      {!state && (
        <ul className='flex flex-col border-t'>
          {sessions.map((session) => (
            <li key={session.id} className='flex items-center gap-3 border-b py-2.5'>
              <DeviceIcon kind={session.device} />
              <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                <span className='truncate text-sm font-medium'>{session.client}</span>
                <Details className='text-muted-foreground text-xs'>
                  {session.location}
                  {session.current ? (
                    'active now'
                  ) : (
                    <ActivityTime
                      date={session.lastActive}
                      now={now}
                      timeZone={timeZone}
                    />
                  )}
                </Details>
              </div>
              {session.current ? (
                <StatusLabel tone='good'>This device</StatusLabel>
              ) : (
                <Button
                  aria-label={`Sign out ${session.client} in ${session.location}`}
                  size='sm'
                  variant='ghost'
                  onClick={() => signOut([session.id])}
                >
                  Sign out
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

const Security3 = (props: Security3Props) => {
  const { sessions = [], status } = props
  const state = getBlockState(status, sessions.length === 0)

  return (
    <BlockStateProvider status={status} empty={sessions.length === 0}>
      <SessionList key={state ?? 'ready'} {...props} />
    </BlockStateProvider>
  )
}

export {
  Security3,
  exampleProps as security3ExampleProps,
  type Security3Props,
  type Session,
}
