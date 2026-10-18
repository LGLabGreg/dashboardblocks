'use client'

import {
  BlockStateProvider,
  type BlockStatus,
  Skeleton,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import {
  AvatarStack,
  type Person,
  type Presence,
  PresenceLabel,
  presenceOrder,
} from '@/registry/components/dashboardblocks/team'

import { cn } from '@/lib/utils'

interface Team3Props {
  description: string
  /** Leave out, or pass none, to show the empty state. */
  people?: Person[]
  status?: BlockStatus
  title: string
}

const roster: [string, Presence][] = [
  ['Amara Okafor', 'online'],
  ['Liam Chen', 'online'],
  ['Mateo García', 'online'],
  ['Elena Petrova', 'online'],
  ['Kwame Mensah', 'online'],
  ['Isabel Duarte', 'online'],
  ['Oskar Lind', 'online'],
  ['Sofia Rossi', 'away'],
  ['Priya Nair', 'away'],
  ['Noah Williams', 'away'],
  ['Yusuf Demir', 'away'],
  ['Jonas Weber', 'offline'],
  ['Hana Kobayashi', 'offline'],
  ['Chloé Martin', 'offline'],
  ['Arjun Mehta', 'offline'],
  ['Freya Hansen', 'offline'],
]

const avatars: Partial<Record<string, string>> = {
  'Amara Okafor': '/images/avatar-05.webp',
  'Jonas Weber': '/images/avatar-07.webp',
  'Liam Chen': '/images/avatar-04.webp',
  'Mateo García': '/images/avatar-06.webp',
  'Priya Nair': '/images/avatar-02.webp',
  'Sofia Rossi': '/images/avatar-01.webp',
}

const exampleProps: Team3Props = {
  description: 'Product and engineering',
  people: roster.map(([name, presence], index) => ({
    avatar: avatars[name],
    id: `p${index + 1}`,
    name,
    presence,
  })),
  title: 'Who’s online',
}

const barFill: Record<Presence, string> = {
  away: 'bg-amber-500',
  offline: 'bg-muted-foreground/30',
  online: 'bg-emerald-600 dark:bg-emerald-500',
}

const Team3 = (props: Team3Props) => {
  const { description, people = [], status, title } = props
  const state = getBlockState(status, people)
  const byPresence = Object.fromEntries(
    presenceOrder.map((presence) => [
      presence,
      people.filter((person) => (person.presence ?? 'offline') === presence),
    ]),
  ) as Record<Presence, Person[]>
  const online = byPresence.online.length

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          {state ? (
            <p className='text-muted-foreground text-sm'>{description}.</p>
          ) : (
            <p className='text-muted-foreground text-sm'>
              {description}, {people.length} {people.length === 1 ? 'person' : 'people'}.
            </p>
          )}
        </header>
        <div className='flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-t pt-4'>
          <div className='flex items-baseline gap-2'>
            <KPIValue value={online} format={(value) => String(value)} />
            {!state && (
              <span className='text-muted-foreground text-sm'>
                of {people.length} online now
              </span>
            )}
          </div>
          {!state && online > 0 && (
            <AvatarStack label='Online now' max={5} people={byPresence.online} />
          )}
        </div>
        {state === 'loading' && (
          <>
            <Skeleton className='h-2 w-full rounded-full' />
            <dl className='grid grid-cols-3 gap-4'>
              {presenceOrder.map((presence) => (
                <div key={presence} className='flex flex-col gap-0.5'>
                  <dt>
                    <PresenceLabel presence={presence} />
                  </dt>
                  <dd>
                    <KPIValue className='text-2xl' value={undefined} />
                  </dd>
                </div>
              ))}
            </dl>
          </>
        )}
        {!state && (
          <>
            <div
              aria-hidden
              className='bg-muted flex h-2 w-full gap-0.5 overflow-hidden rounded-full'
            >
              {presenceOrder.map((presence) =>
                byPresence[presence].length > 0 ? (
                  <div
                    key={presence}
                    className={cn('h-full', barFill[presence])}
                    style={{ flexGrow: byPresence[presence].length }}
                  />
                ) : null,
              )}
            </div>
            <dl className='grid grid-cols-3 gap-4'>
              {presenceOrder.map((presence) => (
                <div key={presence} className='flex flex-col gap-0.5'>
                  <dt>
                    <PresenceLabel presence={presence} />
                  </dt>
                  <dd className='text-2xl font-light tracking-tight tabular-nums'>
                    {byPresence[presence].length}
                  </dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Team3, exampleProps as team3ExampleProps, type Team3Props }
