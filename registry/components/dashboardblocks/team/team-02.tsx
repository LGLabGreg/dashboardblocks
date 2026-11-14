'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { StatusLabel } from '@/registry/components/dashboardblocks/status-label'
import {
  type Person,
  PersonAvatar,
  WorkloadBar,
  workloadFill,
  workloadOverFill,
} from '@/registry/components/dashboardblocks/team'
import { useReveal } from '@/registry/hooks/use-reveal'
import { formatNumber, formatPercent } from '@/registry/lib/dashboardblocks/format'

import { Card, CardContent } from '@/components/ui/card'

interface Assignee extends Person {
  assigned: number
  capacity: number
  role?: string
}

interface Team2Props extends BlockStateProps {
  /** @default a sentence naming who is over capacity */
  description?: string
  /** Leave out, or pass none, to show the empty state. */
  people?: Assignee[]
  title: string
  unit: string
}

const exampleProps: Team2Props = {
  people: [
    {
      assigned: 18,
      avatar: '/images/avatar-05.webp',
      capacity: 20,
      id: 'm1',
      name: 'Amara Okafor',
      role: 'Manager',
    },
    {
      assigned: 29,
      avatar: '/images/avatar-04.webp',
      capacity: 24,
      id: 'm2',
      name: 'Liam Carter',
      role: 'Staff engineer',
    },
    {
      assigned: 14,
      avatar: '/images/avatar-01.webp',
      capacity: 20,
      id: 'm3',
      name: 'Sofia Rossi',
      role: 'Designer',
    },
    {
      assigned: 24,
      avatar: '/images/avatar-06.webp',
      capacity: 24,
      id: 'm4',
      name: 'Mateo García',
      role: 'Frontend',
    },
    {
      assigned: 9,
      avatar: '/images/avatar-02.webp',
      capacity: 16,
      id: 'm5',
      name: 'Priya Nair',
      role: 'Data',
    },
    {
      assigned: 27,
      avatar: '/images/avatar-07.webp',
      capacity: 24,
      id: 'm6',
      name: 'Jonas Weber',
      role: 'Backend',
    },
  ],
  title: 'Workload',
  unit: 'pts',
}

function summarize(people: Assignee[]) {
  const over = people.filter((person) => person.assigned > person.capacity)
  const names = over.map((person) => person.name.split(' ')[0])
  const overText =
    over.length === 0
      ? 'Nobody is over capacity.'
      : `${names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)} are` : `${names[0]} is`} over capacity.`
  return `Story points this sprint, busiest first. ${overText}`
}

const Team2 = (props: Team2Props) => {
  const { people = [], errorMessage, status, title, unit } = props
  const state = getBlockState(status, people)
  const { ref, revealed } = useReveal<HTMLElement>(true)
  const max = Math.max(
    1,
    ...people.map((person) => Math.max(person.assigned, person.capacity)),
  )
  const sorted = [...people].sort(
    (a, b) => b.assigned / (b.capacity || 1) - a.assigned / (a.capacity || 1),
  )
  const assigned = people.reduce((sum, person) => sum + person.assigned, 0)
  const capacity = people.reduce((sum, person) => sum + person.capacity, 0)
  const load = capacity > 0 ? assigned / capacity : 0

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <Card>
        <CardContent>
          <section ref={ref} className='@container flex flex-col gap-4'>
            <header className='flex flex-col gap-0.5'>
              <h2 className='font-semibold tracking-tight'>{title}</h2>
              {props.description ? (
                <p className='text-muted-foreground text-sm'>{props.description}</p>
              ) : (
                <BlockReady className='text-sm'>
                  <p className='text-muted-foreground text-sm'>{summarize(people)}</p>
                </BlockReady>
              )}
            </header>
            <div className='flex flex-wrap items-baseline gap-x-2 border-t pt-4'>
              <KPIValue value={assigned} format={(value) => formatNumber(value)} />
              {!state && (
                <span className='text-muted-foreground text-sm'>
                  of {formatNumber(capacity)} {unit} assigned,{' '}
                  {formatPercent(load, { maximumFractionDigits: 0 })} of the team’s
                  capacity
                </span>
              )}
            </div>
            {state === 'loading' && <BlockStateRows className='border-t' rows={5} />}
            {!state && (
              <ul className='flex flex-col divide-y border-t'>
                {sorted.map((person) => {
                  const over = person.assigned - person.capacity
                  return (
                    <li key={person.id} className='flex flex-col gap-2 py-3'>
                      <div className='flex items-center gap-3'>
                        <PersonAvatar person={person} size='sm' />
                        <span className='flex min-w-0 flex-1 flex-col'>
                          <span className='truncate text-sm font-medium'>
                            {person.name}
                          </span>
                          {person.role && (
                            <span className='text-muted-foreground truncate text-xs'>
                              {person.role}
                            </span>
                          )}
                        </span>
                        <span className='flex shrink-0 items-baseline gap-2 text-xs tabular-nums'>
                          {over > 0 && (
                            <StatusLabel
                              variant='text'
                              tone='warning'
                              className='text-xs'
                            >
                              Over by {over}
                            </StatusLabel>
                          )}
                          <span className='text-muted-foreground'>
                            <span className='text-foreground font-medium'>
                              {person.assigned}
                            </span>{' '}
                            of {person.capacity} {unit}
                          </span>
                        </span>
                      </div>
                      <WorkloadBar
                        assigned={person.assigned}
                        capacity={person.capacity}
                        max={max}
                        revealed={revealed}
                      />
                    </li>
                  )
                })}
              </ul>
            )}
            {(!state || state === 'loading') && (
              <ul className='text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs'>
                <li className='flex items-center gap-1.5'>
                  <span
                    aria-hidden
                    className='h-2 w-3 rounded-full'
                    style={{ backgroundColor: workloadFill }}
                  />
                  Assigned
                </li>
                <li className='flex items-center gap-1.5'>
                  <span
                    aria-hidden
                    className='h-2 w-3 rounded-full'
                    style={{ backgroundImage: workloadOverFill }}
                  />
                  Over capacity
                </li>
                <li className='flex items-center gap-1.5'>
                  <span aria-hidden className='bg-foreground h-3 w-0.5 rounded-full' />
                  Capacity
                </li>
              </ul>
            )}
          </section>
        </CardContent>
      </Card>
    </BlockStateProvider>
  )
}

export { Team2, exampleProps as team2ExampleProps, type Team2Props }
