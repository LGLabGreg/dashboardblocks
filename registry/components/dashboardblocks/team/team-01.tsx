'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  type Person,
  PersonAvatar,
  PresenceLabel,
  formatLastActive,
} from '@/registry/components/dashboardblocks/team'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import { Button } from '@/components/ui/button'

interface Member extends Person {
  lastActive?: Date
  role: string
}

interface Team1Props {
  /** @default a sentence counting who's online and away */
  description?: string
  /** Leave out, or pass none, to show the empty state. */
  members?: Member[]
  now: Date
  onInvite?: () => void
  status?: BlockStatus
  title: string
}

const NOW = Date.UTC(2026, 8, 25, 14, 30)
const minutesAgo = (minutes: number) => new Date(NOW - minutes * 60_000)

const exampleProps: Team1Props = {
  members: [
    {
      avatar: '/images/avatar-05.webp',
      id: 'm1',
      name: 'Amara Okafor',
      presence: 'online',
      role: 'Engineering manager',
    },
    {
      avatar: '/images/avatar-04.webp',
      id: 'm2',
      name: 'Liam Chen',
      presence: 'online',
      role: 'Staff engineer',
    },
    {
      avatar: '/images/avatar-01.webp',
      id: 'm3',
      lastActive: minutesAgo(12),
      name: 'Sofia Rossi',
      presence: 'away',
      role: 'Product designer',
    },
    {
      avatar: '/images/avatar-06.webp',
      id: 'm4',
      name: 'Mateo García',
      presence: 'online',
      role: 'Frontend engineer',
    },
    {
      avatar: '/images/avatar-02.webp',
      id: 'm5',
      lastActive: minutesAgo(38),
      name: 'Priya Nair',
      presence: 'away',
      role: 'Data analyst',
    },
    {
      avatar: '/images/avatar-07.webp',
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

function summarize(members: Member[]) {
  const online = members.filter((member) => member.presence === 'online').length
  const away = members.filter((member) => member.presence === 'away').length
  const people = `${members.length} ${members.length === 1 ? 'person' : 'people'}`
  if (online === 0) return `${people}, nobody online right now.`
  return `${people}, ${online} online now${away > 0 ? ` and ${away} away` : ''}.`
}

const Team1 = (props: Team1Props) => {
  const { description, members = [], now, onInvite, status, title } = props
  const state = getBlockState(status, members)

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-3'>
        <header className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            {description ? (
              <p className='text-muted-foreground text-sm'>{description}</p>
            ) : (
              <BlockReady className='text-sm'>
                <p className='text-muted-foreground text-sm'>{summarize(members)}</p>
              </BlockReady>
            )}
          </div>
          <Button variant='outline' size='sm' onClick={onInvite}>
            <IconPlaceholder
              lucide='UserPlusIcon'
              tabler='IconUserPlus'
              hugeicons='UserAdd01Icon'
              phosphor='UserPlusIcon'
              remixicon='RiUserAddLine'
              data-icon='inline-start'
            />
            Invite
          </Button>
        </header>
        <BlockStateRows className='border-t' rows={members.length || 5} />
        {!state && (
          <ul className='flex flex-col divide-y border-t'>
            {members.map((member) => {
              const presence = member.presence ?? 'offline'
              return (
                <li key={member.id} className='flex items-center gap-3 py-2.5'>
                  <PersonAvatar person={member} showPresence />
                  <div className='flex min-w-0 flex-1 flex-col'>
                    <span className='truncate text-sm font-medium'>{member.name}</span>
                    <span className='text-muted-foreground truncate text-xs'>
                      {member.role}
                    </span>
                  </div>
                  <span className='flex shrink-0 flex-col items-end text-xs'>
                    <PresenceLabel presence={presence} className='text-xs' />
                    {presence !== 'online' && member.lastActive && (
                      <time
                        className='text-muted-foreground tabular-nums'
                        dateTime={member.lastActive.toISOString()}
                      >
                        {formatLastActive(member.lastActive, now)}
                      </time>
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Team1, exampleProps as team1ExampleProps, type Team1Props }
