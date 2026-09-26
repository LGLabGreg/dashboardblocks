'use client'

import { Ring } from '@/registry/components/dashboardblocks/ring'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface DailyGoal {
  current: number
  label: string
  target: number
  unit: string
}

interface Goals4Props {
  description: string
  goals: DailyGoal[]
  title: string
}

const exampleProps: Goals4Props = {
  description: 'Today, resets at midnight',
  goals: [
    { current: 42, label: 'Calls', target: 50, unit: 'calls' },
    { current: 18, label: 'Demos', target: 15, unit: 'demos' },
    { current: 7, label: 'Proposals', target: 12, unit: 'proposals' },
  ],
  title: 'Daily activity goals',
}

const Goals4 = (props: Goals4Props) => {
  const { description, goals, title } = props
  const met = goals.filter((goal) => goal.current >= goal.target).length

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description} · {met} of {goals.length} met
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className='grid grid-cols-1 gap-4 @sm:grid-cols-3'>
          {goals.map((goal) => {
            const share = goal.target > 0 ? goal.current / goal.target : 0
            const done = goal.current >= goal.target
            return (
              <li
                key={goal.label}
                className='flex items-center gap-4 @sm:flex-col @sm:gap-3 @sm:text-center'
              >
                <Ring
                  ariaLabel={`${goal.label}: ${goal.current} of ${goal.target} ${goal.unit}`}
                  className='size-20'
                  percentage={Math.min(100, share * 100)}
                  ringColor='var(--chart-1)'
                  strokeWidth={10}
                >
                  <span aria-hidden className='text-sm font-semibold tabular-nums'>
                    {Math.round(share * 100)}%
                  </span>
                </Ring>
                <div className='flex flex-col gap-0.5 @sm:items-center'>
                  <span className='flex items-center gap-1 text-sm font-medium'>
                    {goal.label}
                    {done && (
                      <IconPlaceholder
                        lucide='CircleCheckIcon'
                        tabler='IconCircleCheck'
                        hugeicons='CheckmarkCircle02Icon'
                        phosphor='CheckCircleIcon'
                        remixicon='RiCheckboxCircleLine'
                        aria-label='Goal met'
                        className='size-4 text-emerald-700 dark:text-emerald-400'
                      />
                    )}
                  </span>
                  <span className='text-muted-foreground text-xs tabular-nums'>
                    {goal.current} of {goal.target} {goal.unit}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

export { Goals4, exampleProps as goals4ExampleProps, type Goals4Props }
