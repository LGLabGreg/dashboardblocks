'use client'

import {
  GoalProgress,
  GoalProgressKey,
  PaceBadge,
  getPace,
} from '@/registry/components/dashboardblocks/goals'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

/** A goal that accumulates over the period, such as a count or a sum. Rates don't pace linearly. */
interface Goal {
  current: number
  formatter?: (value: number) => string
  label: string
  owner: string
  target: number
}

interface Goals2Props {
  description: string
  /** Share of the period that has passed, 0–1. */
  elapsed: number
  goals: Goal[]
  title: string
}

const exampleProps: Goals2Props = {
  description: 'Q3, week 12 of 13',
  elapsed: 12 / 13,
  goals: [
    {
      current: 1_184,
      label: 'New paying customers',
      owner: 'Growth',
      target: 1_200,
    },
    {
      current: 71,
      formatter: (value) => `${Math.round(value)}`,
      label: 'Enterprise deals closed',
      owner: 'Sales',
      target: 60,
    },
    {
      current: 2_140,
      label: 'Support tickets resolved',
      owner: 'Support',
      target: 2_400,
    },
    {
      current: 9,
      formatter: (value) => `${Math.round(value)}`,
      label: 'Integrations shipped',
      owner: 'Platform',
      target: 12,
    },
  ],
  title: 'Team goals',
}

const Goals2 = (props: Goals2Props) => {
  const { description, elapsed, goals, title } = props

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <ul className='flex flex-col'>
          {goals.map((goal) => {
            const format =
              goal.formatter ?? ((value: number) => Math.round(value).toLocaleString())
            const pace = getPace({ current: goal.current, elapsed, target: goal.target })
            return (
              <li
                key={goal.label}
                className='flex flex-col gap-2.5 border-b py-4 first:pt-0 last:border-b-0 last:pb-0'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex min-w-0 flex-col'>
                    <span className='text-sm font-medium'>{goal.label}</span>
                    <span className='text-muted-foreground text-xs'>{goal.owner}</span>
                  </div>
                  <PaceBadge status={pace.status} />
                </div>
                <GoalProgress
                  current={goal.current}
                  expected={pace.status === 'met' ? undefined : pace.expected}
                  size='sm'
                  target={goal.target}
                />
                <p className='text-muted-foreground flex justify-between gap-3 text-xs tabular-nums'>
                  <span>
                    <span className='text-foreground font-medium'>
                      {format(goal.current)}
                    </span>{' '}
                    of {format(goal.target)}
                  </span>
                  <span>{Math.round((goal.current / goal.target) * 100)}%</span>
                </p>
              </li>
            )
          })}
        </ul>
        <GoalProgressKey className='border-t pt-4' />
      </CardContent>
    </Card>
  )
}

export { Goals2, exampleProps as goals2ExampleProps, type Goals2Props }
