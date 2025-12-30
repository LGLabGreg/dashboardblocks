'use client'

import { AnimatedNumber } from '@/registry/components/dashboardblocks/animated-number'
import { KPI, KPIContent, KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { Ring } from '@/registry/components/dashboardblocks/ring'

import { CardDescription, CardTitle } from '@/components/ui/card'

interface ProgressKPI3Props {
  current: number
  goal: number
  title: string
  unit: string
}

const exampleProps: ProgressKPI3Props = {
  current: 7500,
  goal: 10000,
  title: 'Monthly Goal',
  unit: 'sales',
}

const ProgressKPI3 = (props: ProgressKPI3Props) => {
  const { current, goal, title, unit } = props
  const percentage = Math.min(100, Math.max(0, (current / goal) * 100))

  return (
    <KPI>
      <KPIContent>
        <div className='grid grid-cols-2 gap-4'>
          <div className='flex items-center justify-between'>
            <div className='space-y-4'>
              <CardTitle>{title}</CardTitle>
              <div className='space-y-1'>
                <KPIValue className='text-2xl' value={current} animated />
                <CardDescription>
                  of {goal.toLocaleString()} {unit}
                </CardDescription>
              </div>
            </div>
          </div>
          <div className='flex items-center justify-center'>
            <Ring
              className='h-24 w-24 sm:h-36 sm:w-36 shrink-0'
              percentage={percentage}
              ringColor='var(--color-chart-1)'
            >
              <AnimatedNumber
                className='text-lg font-bold'
                value={percentage}
                formatter={(value) => `${value.toLocaleString()}%`}
              />
            </Ring>
          </div>
        </div>
      </KPIContent>
    </KPI>
  )
}

export { ProgressKPI3, exampleProps as progressKpi3ExampleProps, type ProgressKPI3Props }
