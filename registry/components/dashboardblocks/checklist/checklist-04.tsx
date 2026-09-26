'use client'

import {
  TaskCheckbox,
  getChecklistProgress,
} from '@/registry/components/dashboardblocks/checklist'
import { ProgressBar } from '@/registry/components/dashboardblocks/progress-bar'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useId, useState } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface Task {
  done?: boolean
  /** The day the task is due. Only the date part is used. */
  due: Date
  id: string
  owner?: string
  title: string
}

interface TaskGroup {
  name: string
  tasks: Task[]
}

interface Checklist4Props {
  groups: TaskGroup[]
  /** Today, for due and overdue dates. */
  now: Date
  onToggle?: (id: string, done: boolean) => void
  title: string
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

const DAY = 86_400_000
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})

/** Whole days from `now` to `due`, comparing calendar days in UTC. */
function daysUntil(due: Date, now: Date) {
  const start = (date: Date) => Math.floor(date.getTime() / DAY)
  return start(due) - start(now)
}

function DueDate({ done, due, now }: { done: boolean; due: Date; now: Date }) {
  const days = daysUntil(due, now)
  const date = dateFormatter.format(due)
  let icon = (
    <IconPlaceholder
      lucide='CalendarIcon'
      tabler='IconCalendar'
      hugeicons='CalendarIcon'
      phosphor='CalendarBlankIcon'
      remixicon='RiCalendarLine'
      aria-hidden
      className='size-3.5'
    />
  )
  let label = `Due ${date}`
  let className = 'text-muted-foreground'
  if (!done && days < 0) {
    icon = (
      <IconPlaceholder
        lucide='TriangleAlertIcon'
        tabler='IconAlertTriangle'
        hugeicons='Alert02Icon'
        phosphor='WarningIcon'
        remixicon='RiErrorWarningLine'
        aria-hidden
        className='size-3.5'
      />
    )
    label = `Overdue · ${date}`
    className = 'text-red-700 dark:text-red-400'
  } else if (!done && days === 0) {
    icon = (
      <IconPlaceholder
        lucide='ClockIcon'
        tabler='IconClock'
        hugeicons='Clock01Icon'
        phosphor='ClockIcon'
        remixicon='RiTimeLine'
        aria-hidden
        className='size-3.5'
      />
    )
    label = 'Due today'
    className = 'text-amber-800 dark:text-amber-400'
  } else if (!done && days === 1) {
    label = 'Due tomorrow'
  }
  return (
    <span className={cn('inline-flex items-center gap-1 whitespace-nowrap', className)}>
      {icon}
      <time dateTime={due.toISOString().slice(0, 10)}>{label}</time>
    </span>
  )
}

const Checklist4 = (props: Checklist4Props) => {
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
    (task) => !done.has(task.id) && daysUntil(task.due, now) < 0,
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
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {progress.done} of {progress.total} tasks done
          {overdue > 0 && `, ${overdue} overdue`}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
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
                className='text-muted-foreground flex items-center justify-between gap-3 border-b pb-2 text-xs font-medium'
              >
                {group.name}
                <span className='tabular-nums'>
                  {groupDone}/{group.tasks.length}
                  <span className='sr-only'> done</span>
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
                        <span
                          id={metaId}
                          className='text-muted-foreground flex flex-wrap items-center gap-x-2 text-xs'
                        >
                          {task.owner && <span>{task.owner}</span>}
                          <DueDate done={isDone} due={task.due} now={now} />
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </CardContent>
    </Card>
  )
}

export { Checklist4, exampleProps as checklist4ExampleProps, type Checklist4Props }
