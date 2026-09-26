'use client'

import {
  AvatarStack,
  type Person,
  type Presence,
  PresenceIndicator,
  presenceOrder,
} from '@/registry/components/dashboardblocks/team'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface Team3Props {
  description: string
  /** Everyone on the team. People without a presence count as offline. */
  people: Person[]
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

const exampleProps: Team3Props = {
  description: 'Product and engineering',
  people: roster.map(([name, presence], index) => ({
    id: `p${index + 1}`,
    name,
    presence,
  })),
  title: 'Who’s online',
}

/** Solid fills for the share bar, matching each presence dot. */
const barFill: Record<Presence, string> = {
  away: 'bg-amber-500',
  offline: 'bg-muted-foreground/30',
  online: 'bg-emerald-600 dark:bg-emerald-500',
}

const Team3 = (props: Team3Props) => {
  const { description, people, title } = props
  const byPresence = Object.fromEntries(
    presenceOrder.map((presence) => [
      presence,
      people.filter((person) => (person.presence ?? 'offline') === presence),
    ]),
  ) as Record<Presence, Person[]>
  const online = byPresence.online.length

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description} · {people.length} members
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <div className='flex flex-wrap items-end justify-between gap-x-6 gap-y-3'>
          <p className='flex items-baseline gap-2'>
            <span className='text-3xl font-semibold tracking-tight tabular-nums'>
              {online}
            </span>
            <span className='text-muted-foreground text-sm'>
              of {people.length} online now
            </span>
          </p>
          {online > 0 && (
            <AvatarStack
              label='Online now'
              max={5}
              people={byPresence.online}
              size='lg'
            />
          )}
        </div>
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
        <dl className='grid grid-cols-3 gap-4 border-t pt-4'>
          {presenceOrder.map((presence) => (
            <div key={presence} className='flex flex-col gap-1'>
              <dt>
                <PresenceIndicator presence={presence} />
              </dt>
              <dd className='text-xl font-semibold tracking-tight tabular-nums'>
                {byPresence[presence].length}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}

export { Team3, exampleProps as team3ExampleProps, type Team3Props }
