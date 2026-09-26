'use client'

import {
  RetentionBar,
  RetentionBarKey,
  RetentionChange,
  formatRetention,
} from '@/registry/components/dashboardblocks/retention'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface RetentionMilestone {
  /** e.g. "Day 7". */
  label: string
  /** Share of the current cohort still active, 0–1. */
  current: number
  /** The same share for the cohort before, 0–1. */
  previous: number
}

interface Retention3Props {
  description: string
  milestones: RetentionMilestone[]
  /** Names the cohort compared against. @default 'Previous cohort' */
  previousLabel?: string
  title: string
}

const exampleProps: Retention3Props = {
  description: 'August signups, compared with July',
  milestones: [
    { current: 0.584, label: 'Day 1', previous: 0.561 },
    { current: 0.392, label: 'Day 7', previous: 0.366 },
    { current: 0.247, label: 'Day 30', previous: 0.253 },
  ],
  previousLabel: 'July',
  title: 'Retention milestones',
}

const Retention3 = (props: Retention3Props) => {
  const { description, milestones, previousLabel = 'Previous cohort', title } = props

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <ul className='flex flex-col gap-5'>
          {milestones.map((milestone) => (
            <li key={milestone.label} className='flex flex-col gap-2'>
              <div className='flex items-end justify-between gap-4'>
                <span className='text-muted-foreground text-sm'>{milestone.label}</span>
                <span className='flex items-baseline gap-2'>
                  <span className='text-xl font-semibold tracking-tight tabular-nums'>
                    {formatRetention(milestone.current, 1)}
                  </span>
                  <RetentionChange
                    difference={milestone.current - milestone.previous}
                    versus={`${previousLabel}, ${formatRetention(milestone.previous, 1)}`}
                  />
                </span>
              </div>
              <RetentionBar previous={milestone.previous} value={milestone.current} />
            </li>
          ))}
        </ul>
        <RetentionBarKey label={previousLabel} />
      </CardContent>
    </Card>
  )
}

export {
  Retention3,
  exampleProps as retention3ExampleProps,
  type Retention3Props,
  type RetentionMilestone,
}
