'use client'

import {
  DeviceIcon,
  type DeviceKind,
  formatSince,
} from '@/registry/components/dashboardblocks/security'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Session {
  /** e.g. "Chrome on macOS". */
  client: string
  /** Marks the session this page is open in. */
  current?: boolean
  device: DeviceKind
  id: string
  lastActive: Date
  location: string
}

interface Security3Props {
  description: string
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  /** Called with a session's id when it's signed out. */
  onSignOut?: (id: string) => void
  sessions: Session[]
  title: string
}

const NOW = new Date(Date.UTC(2026, 8, 26, 16, 0))
const minutesAgo = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000)

const exampleProps: Security3Props = {
  description: 'Devices signed in to your account',
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

const Security3 = (props: Security3Props) => {
  const { description, now, onSignOut, title } = props
  const [sessions, setSessions] = useState(props.sessions)
  const others = sessions.filter((session) => !session.current)

  const signOut = (ids: string[]) => {
    ids.forEach((id) => onSignOut?.(id))
    setSessions((list) => list.filter((session) => !ids.includes(session.id)))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {others.length > 0 && (
          <CardAction>
            <Button
              size='sm'
              variant='outline'
              onClick={() => signOut(others.map((session) => session.id))}
            >
              Sign out others
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <ul className='flex flex-col'>
          {sessions.map((session) => (
            <li
              key={session.id}
              className='flex items-center gap-3 border-b py-3 first:pt-0 last:border-b-0 last:pb-0'
            >
              <DeviceIcon kind={session.device} />
              <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                <span className='flex flex-wrap items-center gap-2 text-sm font-medium'>
                  {session.client}
                  {session.current && (
                    <span className='rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400'>
                      This device
                    </span>
                  )}
                </span>
                <span className='text-muted-foreground text-xs'>
                  {session.location} ·{' '}
                  {session.current ? (
                    'active now'
                  ) : (
                    <time dateTime={session.lastActive.toISOString()}>
                      {formatSince(session.lastActive, now)}
                    </time>
                  )}
                </span>
              </div>
              {!session.current && (
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
      </CardContent>
    </Card>
  )
}

export {
  Security3,
  exampleProps as security3ExampleProps,
  type Security3Props,
  type Session,
}
