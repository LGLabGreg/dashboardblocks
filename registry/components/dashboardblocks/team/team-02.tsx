'use client'

import { type Person, PersonAvatar } from '@/registry/components/dashboardblocks/team'
import { TriangleAlertIcon } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface Assignee extends Person {
  assigned: number
  capacity: number
  role?: string
}

interface Team2Props {
  description: string
  people: Assignee[]
  title: string
  /** Appended to amounts, e.g. "pts" or "h". */
  unit: string
}

const exampleProps: Team2Props = {
  description: 'Story points this sprint against each person’s capacity',
  people: [
    { assigned: 18, capacity: 20, id: 'm1', name: 'Amara Okafor', role: 'Manager' },
    { assigned: 29, capacity: 24, id: 'm2', name: 'Liam Chen', role: 'Staff engineer' },
    { assigned: 14, capacity: 20, id: 'm3', name: 'Sofia Rossi', role: 'Designer' },
    { assigned: 24, capacity: 24, id: 'm4', name: 'Mateo García', role: 'Frontend' },
    { assigned: 9, capacity: 16, id: 'm5', name: 'Priya Nair', role: 'Data' },
    { assigned: 27, capacity: 24, id: 'm6', name: 'Jonas Weber', role: 'Backend' },
  ],
  title: 'Workload',
  unit: 'pts',
}

// chart-2 rather than chart-1, which is orange in the light theme and too close to the amber overflow.
const FILL_COLOR = 'var(--chart-2)'
// Stripes as well as colour, so the part over capacity stands out without colour.
const OVER_FILL =
  'repeating-linear-gradient(135deg, var(--color-amber-500) 0 3px, color-mix(in oklab, var(--color-amber-500) 45%, var(--card)) 3px 6px)'

/** Assigned against capacity on a scale shared by every row. Decorative: the values are text beside it. */
function WorkloadBar({
  assigned,
  capacity,
  max,
}: {
  assigned: number
  capacity: number
  max: number
}) {
  const within = Math.min(assigned, capacity)
  const over = Math.max(0, assigned - capacity)
  const toPercent = (value: number) => `${max > 0 ? (value / max) * 100 : 0}%`
  return (
    <div aria-hidden className='relative h-2.5 w-full'>
      <div className='bg-muted flex h-full w-full overflow-hidden rounded-full'>
        <div
          className={cn('h-full rounded-l-full', over === 0 && 'rounded-r-full')}
          style={{ backgroundColor: FILL_COLOR, width: toPercent(within) }}
        />
        {over > 0 && (
          <div
            className='h-full rounded-r-full'
            style={{ backgroundImage: OVER_FILL, width: toPercent(over) }}
          />
        )}
      </div>
      <span
        className='bg-foreground ring-card absolute top-1/2 h-[calc(100%+8px)] w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2'
        style={{ left: toPercent(capacity) }}
      />
    </div>
  )
}

const Team2 = (props: Team2Props) => {
  const { description, people, title, unit } = props
  const max = Math.max(
    1,
    ...people.map((person) => Math.max(person.assigned, person.capacity)),
  )
  // Most loaded first, so anyone over capacity is at the top.
  const sorted = [...people].sort(
    (a, b) => b.assigned / (b.capacity || 1) - a.assigned / (a.capacity || 1),
  )
  const overCount = people.filter((person) => person.assigned > person.capacity).length
  const assigned = people.reduce((sum, person) => sum + person.assigned, 0)
  const capacity = people.reduce((sum, person) => sum + person.capacity, 0)

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <dl className='grid grid-cols-2 gap-4 @md:grid-cols-3'>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Assigned</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {assigned} <span className='text-muted-foreground text-sm'>{unit}</span>
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Capacity</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {capacity} <span className='text-muted-foreground text-sm'>{unit}</span>
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Over capacity</dt>
            <dd
              className={cn(
                'text-2xl font-semibold tracking-tight tabular-nums',
                overCount > 0 && 'text-amber-800 dark:text-amber-400',
              )}
            >
              {overCount}{' '}
              <span className='text-muted-foreground text-sm'>
                {overCount === 1 ? 'person' : 'people'}
              </span>
            </dd>
          </div>
        </dl>
        <ul className='flex flex-col border-t'>
          {sorted.map((person) => {
            const over = person.assigned - person.capacity
            const share =
              person.capacity > 0
                ? Math.round((person.assigned / person.capacity) * 100)
                : 0
            return (
              <li
                key={person.id}
                className='flex flex-col gap-2.5 border-b py-4 last:border-b-0 last:pb-0'
              >
                <div className='flex items-center gap-3'>
                  <PersonAvatar person={person} size='sm' />
                  <div className='flex min-w-0 flex-1 flex-col'>
                    <span className='truncate text-sm font-medium'>{person.name}</span>
                    {person.role && (
                      <span className='text-muted-foreground truncate text-xs'>
                        {person.role}
                      </span>
                    )}
                  </div>
                  {over > 0 && (
                    <span className='inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-amber-800 dark:text-amber-400'>
                      <TriangleAlertIcon aria-hidden className='size-3.5' />
                      Over by {over} {unit}
                    </span>
                  )}
                </div>
                <WorkloadBar
                  assigned={person.assigned}
                  capacity={person.capacity}
                  max={max}
                />
                <p className='text-muted-foreground flex justify-between gap-3 text-xs tabular-nums'>
                  <span>
                    <span className='text-foreground font-medium'>{person.assigned}</span>{' '}
                    of {person.capacity} {unit}
                  </span>
                  <span
                    className={cn(
                      over > 0 && 'font-medium text-amber-800 dark:text-amber-400',
                    )}
                  >
                    {share}%<span className='sr-only'> of capacity</span>
                  </span>
                </p>
              </li>
            )
          })}
        </ul>
        <ul className='text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 border-t pt-4 text-xs'>
          <li className='flex items-center gap-1.5'>
            <span
              aria-hidden
              className='h-2 w-3 rounded-full'
              style={{ backgroundColor: FILL_COLOR }}
            />
            Assigned
          </li>
          <li className='flex items-center gap-1.5'>
            <span
              aria-hidden
              className='h-2 w-3 rounded-full'
              style={{ backgroundImage: OVER_FILL }}
            />
            Over capacity
          </li>
          <li className='flex items-center gap-1.5'>
            <span aria-hidden className='bg-foreground h-3 w-0.5 rounded-full' />
            Capacity
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}

export { Team2, exampleProps as team2ExampleProps, type Team2Props }
