'use client'

import { AnimatedNumber } from '@/registry/components/dashboardblocks/animated-number'
import { KPI, KPIContent, KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { Ring } from '@/registry/components/dashboardblocks/ring'

import { CardDescription, CardTitle } from '@/components/ui/card'

interface ProgressKPI3Props {
  current: number
  goal: number
  title: string
  /** Counted items, e.g. "sales". */
  unit: string
}

const exampleProps: ProgressKPI3Props = {
  current: 7_500,
  goal: 10_000,
  title: 'Monthly goal',
  unit: 'sales',
}

const ProgressKPI3 = (props: ProgressKPI3Props) => {
  const { current, goal, title, unit } = props
  const percentage = goal > 0 ? Math.min(100, Math.max(0, (current / goal) * 100)) : 0
  const remaining = Math.max(0, goal - current)

  return (
    <KPI>
      <KPIContent className='flex-row items-center justify-between gap-4'>
        <div className='flex min-w-0 flex-col gap-4'>
          <CardTitle>{title}</CardTitle>
          <div className='flex flex-col gap-1'>
            <KPIValue className='text-2xl' value={current} animated />
            <CardDescription>
              of {goal.toLocaleString('en-US')} {unit}
            </CardDescription>
          </div>
          <p className='text-muted-foreground text-xs'>
            {remaining > 0
              ? `${remaining.toLocaleString('en-US')} ${unit} to go`
              : 'Goal reached'}
          </p>
        </div>
        <Ring
          ariaLabel={`${Math.round(percentage)}% of goal`}
          className='size-28 sm:size-32'
          percentage={percentage}
          ringColor='var(--color-chart-1)'
        >
          <AnimatedNumber
            className='text-lg font-semibold tabular-nums'
            value={Math.round(percentage)}
            formatter={(value) => `${Math.round(value)}%`}
          />
        </Ring>
      </KPIContent>
    </KPI>
  )
}

export { ProgressKPI3, exampleProps as progressKpi3ExampleProps, type ProgressKPI3Props }
