'use client'

import {
  type Person,
  PersonAvatar,
  PresenceIndicator,
  formatLastActive,
} from '@/registry/components/dashboardblocks/team'
import { UserPlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Member extends Person {
  /** When they were last seen. Ignored while online. */
  lastActive?: Date
  role: string
}

interface Team1Props {
  members: Member[]
  /** The time relative times are measured from. */
  now: Date
  onInvite?: () => void
  title: string
}

const NOW = Date.UTC(2026, 8, 25, 14, 30)
const minutesAgo = (minutes: number) => new Date(NOW - minutes * 60_000)

const exampleProps: Team1Props = {
  members: [
    {
      id: 'm1',
      name: 'Amara Okafor',
      presence: 'online',
      role: 'Engineering manager',
    },
    {
      id: 'm2',
      name: 'Liam Chen',
      presence: 'online',
      role: 'Staff engineer',
    },
    {
      id: 'm3',
      lastActive: minutesAgo(12),
      name: 'Sofia Rossi',
      presence: 'away',
      role: 'Product designer',
    },
    {
      id: 'm4',
      name: 'Mateo García',
      presence: 'online',
      role: 'Frontend engineer',
    },
    {
      id: 'm5',
      lastActive: minutesAgo(38),
      name: 'Priya Nair',
      presence: 'away',
      role: 'Data analyst',
    },
    {
      id: 'm6',
      lastActive: minutesAgo(60 * 5 + 10),
      name: 'Jonas Weber',
      presence: 'offline',
      role: 'Backend engineer',
    },
    {
      id: 'm7',
      lastActive: minutesAgo(60 * 26),
      name: 'Hana Kobayashi',
      presence: 'offline',
      role: 'QA engineer',
    },
  ],
  now: new Date(NOW),
  title: 'Team members',
}

const Team1 = (props: Team1Props) => {
  const { members, now, onInvite, title } = props
  const online = members.filter((member) => member.presence === 'online').length

  return (
    <Card className='@container gap-0 pb-0'>
      <CardHeader className='border-b'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {members.length} members, {online} online
        </CardDescription>
        <CardAction>
          <Button variant='outline' size='sm' onClick={onInvite}>
            <UserPlusIcon data-icon='inline-start' />
            Invite
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className='px-0'>
        <ul>
          {members.map((member) => {
            const presence = member.presence ?? 'offline'
            return (
              <li
                key={member.id}
                className='flex items-center gap-3 border-b px-6 py-3 last:border-b-0'
              >
                <PersonAvatar person={member} showPresence size='lg' />
                <div className='flex min-w-0 flex-1 flex-col gap-0.5 @md:flex-row @md:items-center @md:gap-4'>
                  <div className='flex min-w-0 flex-1 flex-col'>
                    <span className='truncate text-sm font-medium'>{member.name}</span>
                    <span className='text-muted-foreground truncate text-xs'>
                      {member.role}
                    </span>
                  </div>
                  <div className='flex flex-wrap items-center gap-x-1 gap-y-0.5 @md:w-40 @md:flex-col @md:items-end @md:gap-0.5'>
                    <PresenceIndicator presence={presence} />
                    {(presence === 'online' || member.lastActive) && (
                      <span className='text-muted-foreground text-xs'>
                        <span aria-hidden className='@md:hidden'>
                          ·{' '}
                        </span>
                        {presence === 'online' || !member.lastActive ? (
                          'Active now'
                        ) : (
                          <>
                            Last active{' '}
                            <time dateTime={member.lastActive.toISOString()}>
                              {formatLastActive(member.lastActive, now)}
                            </time>
                          </>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

export { Team1, exampleProps as team1ExampleProps, type Team1Props }
