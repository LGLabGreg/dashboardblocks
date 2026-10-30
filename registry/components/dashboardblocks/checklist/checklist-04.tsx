'use client'

import {
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  SkeletonText,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  TaskCheckbox,
  describeChecklistProgress,
  getChecklistProgress,
} from '@/registry/components/dashboardblocks/checklist'
import { Details } from '@/registry/components/dashboardblocks/details'
import { ProgressBar } from '@/registry/components/dashboardblocks/progress-bar'
import {
  UrgencyLabel,
  getDay,
  getDayOffset,
  getUrgency,
} from '@/registry/components/dashboardblocks/schedule'
import { formatDate } from '@/registry/lib/dashboardblocks/format'
import { useId, useState } from 'react'

import { cn } from '@/lib/utils'

interface Task {
  done?: boolean
  due: Date
  id: string
  owner?: string
  title: string
}

interface TaskGroup {
  name: string
  tasks: Task[]
}

interface Checklist4Props extends BlockStateProps {
  /** Leave out, or pass none, to show the empty state. */
  groups?: TaskGroup[]
  now: Date
  onToggle?: (id: string, done: boolean) => void
  title: string
}

interface TaskGroupsProps extends Omit<Checklist4Props, 'groups' | 'status'> {
  groups: TaskGroup[]
}

const NOW = Date.UTC(2026, 8, 26, 9, 0)
const day = (offset: number) => new Date(NOW + offset * 86_400_000)

const exampleProps: Checklist4Props = {
  groups: [
    {
      name: 'Product',
      tasks: [
        {
          done: true,
          due: day(-6),
          id: 't1',
          owner: 'Maya',
          title: 'Freeze pricing page copy',
        },
        {
          done: true,
          due: day(-3),
          id: 't2',
          owner: 'Leo',
          title: 'Ship plan picker to 100%',
        },
        { due: day(-1), id: 't3', owner: 'Leo', title: 'Migrate legacy annual plans' },
      ],
    },
    {
      name: 'Marketing',
      tasks: [
        {
          done: true,
          due: day(-2),
          id: 't4',
          owner: 'Ana',
          title: 'Record launch demo video',
        },
        { due: day(0), id: 't5', owner: 'Ana', title: 'Schedule launch email' },
        { due: day(3), id: 't6', owner: 'Sam', title: 'Publish launch blog post' },
      ],
    },
    {
      name: 'Support',
      tasks: [
        { done: true, due: day(-4), id: 't7', owner: 'Kai', title: 'Update billing FAQ' },
        { due: day(2), id: 't8', owner: 'Kai', title: 'Brief the support team' },
      ],
    },
  ],
  now: new Date(NOW),
  title: 'Pricing launch',
}

const SOON_DAYS = 2

function DueDate({ done, due, now }: { done: boolean; due: Date; now: Date }) {
  const offset = getDayOffset(due, now)
  const day = getDay(due)
  const date = formatDate(day, 'day')
  const urgency = done ? 'later' : getUrgency(due, now, 'UTC', SOON_DAYS)
  const label =
    urgency === 'overdue'
      ? `${-offset} ${offset === -1 ? 'day' : 'days'} overdue`
      : urgency === 'today'
        ? 'Due today'
        : offset === 1
          ? 'Due tomorrow'
          : `Due ${date}`
  return (
    <time dateTime={day.toISOString().slice(0, 10)}>
      <UrgencyLabel
        className={cn(urgency === 'later' && 'font-normal')}
        label={label}
        urgency={urgency}
      />
    </time>
  )
}

function TaskGroups(props: TaskGroupsProps) {
  const { groups, now, onToggle, title } = props
  const id = useId()
  const [done, setDone] = useState(
    () =>
      new Set(
        groups.flatMap((group) =>
          group.tasks.filter((task) => task.done).map((task) => task.id),
        ),
      ),
  )
  const [announcement, setAnnouncement] = useState('')
  const tasks = groups.flatMap((group) => group.tasks)
  const progress = getChecklistProgress(
    tasks.map((task) => ({ state: done.has(task.id) ? 'done' : 'todo' })),
  )
  const overdue = tasks.filter(
    (task) => !done.has(task.id) && getDayOffset(task.due, now) < 0,
  ).length

  const toggle = (task: Task, checked: boolean) => {
    setDone((current) => {
      const next = new Set(current)
      if (checked) next.add(task.id)
      else next.delete(task.id)
      return next
    })
    setAnnouncement(`${task.title} marked ${checked ? 'done' : 'not done'}`)
    onToggle?.(task.id, checked)
  }

  return (
    <section className='@container flex flex-col gap-3'>
      <header className='flex flex-col gap-0.5'>
        <h2 className='font-semibold tracking-tight'>{title}</h2>
        <p className='text-muted-foreground text-sm'>
          {describeChecklistProgress(progress, { one: 'task', other: 'tasks' })}
          {overdue > 0 ? `, ${overdue} overdue.` : '.'}
        </p>
      </header>
      <p role='status' className='sr-only'>
        {announcement}
      </p>
      <div aria-hidden>
        <ProgressBar
          className='h-1.5'
          fillClassName='motion-reduce:transition-none'
          percentage={progress.percentage}
        />
      </div>
      <div className='flex flex-col gap-4'>
        {groups.map((group, groupIndex) => {
          const headingId = `${id}-group-${groupIndex}`
          const groupDone = group.tasks.filter((task) => done.has(task.id)).length
          return (
            <section
              key={group.name}
              aria-labelledby={headingId}
              className='flex flex-col'
            >
              <h3
                id={headingId}
                className='flex items-baseline justify-between gap-3 border-b pb-2 text-sm font-medium'
              >
                {group.name}
                {/* Not a count: the group's progress, written as words */}
                <span className='text-muted-foreground font-normal tabular-nums'>
                  {groupDone} of {group.tasks.length} done
                </span>
              </h3>
              <ul>
                {group.tasks.map((task) => {
                  const checkboxId = `${id}-${task.id}`
                  const metaId = `${checkboxId}-meta`
                  const isDone = done.has(task.id)
                  return (
                    <li
                      key={task.id}
                      className='flex items-start gap-3 border-b py-2.5 last:border-b-0'
                    >
                      <TaskCheckbox
                        id={checkboxId}
                        checked={isDone}
                        aria-describedby={metaId}
                        className='mt-0.5'
                        onChange={(event) => toggle(task, event.target.checked)}
                      />
                      <div className='flex min-w-0 flex-1 flex-col gap-0.5 @md:flex-row @md:items-baseline @md:justify-between @md:gap-3'>
                        <label
                          htmlFor={checkboxId}
                          className={cn(
                            'cursor-pointer text-sm',
                            isDone && 'text-muted-foreground line-through',
                          )}
                        >
                          {task.title}
                        </label>
                        <Details
                          id={metaId}
                          className='text-muted-foreground text-sm @md:shrink-0'
                        >
                          {task.owner}
                          <DueDate done={isDone} due={task.due} now={now} />
                        </Details>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>
    </section>
  )
}

const Checklist4 = (props: Checklist4Props) => {
  const { groups = [], errorMessage, status, title } = props
  const state = getBlockState(
    status,
    groups.flatMap((group) => group.tasks),
  )

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      {state ? (
        <section className='@container flex flex-col gap-3'>
          <header className='flex flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            {state === 'loading' && (
              <span className='text-sm'>
                <SkeletonText className='w-2/3' />
              </span>
            )}
          </header>
          {state === 'loading' && <ProgressBar className='h-1.5' percentage={0} />}
          <BlockStateRows className='border-t' rows={6} />
        </section>
      ) : (
        <TaskGroups {...props} groups={groups} />
      )}
    </BlockStateProvider>
  )
}

export { Checklist4, exampleProps as checklist4ExampleProps, type Checklist4Props }
