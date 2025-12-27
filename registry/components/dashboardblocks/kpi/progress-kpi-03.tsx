import { KPIRing, KPIValue } from '@/registry/components/dashboardblocks/kpi/kpi'

import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'

interface ProgressKPI3Props {
  className?: string
  current?: number
  goal?: number
  title?: string
  unit?: string
}

export const ProgressKPI3 = ({
  className = '',
  current = 7500,
  goal = 10000,
  title = 'Monthly Goal',
  unit = 'sales',
}: ProgressKPI3Props) => {
  const percentage = Math.min(100, Math.max(0, (current / goal) * 100))

  return (
    <Card className={className}>
      <CardContent>
        <div className='grid grid-cols-2 gap-4'>
          <div className='flex items-center justify-between'>
            <div className='space-y-4'>
              <CardTitle>{title}</CardTitle>
              <div className='space-y-1'>
                <KPIValue className='text-2xl'>{current.toLocaleString()}</KPIValue>
                <CardDescription>
                  of {goal.toLocaleString()} {unit}
                </CardDescription>
              </div>
            </div>
          </div>
          <div className='flex items-center justify-center'>
            <KPIRing
              className='h-24 w-24 sm:h-36 sm:w-36 shrink-0'
              percentage={percentage}
              ringColor='var(--color-chart-1)'
            >
              <span className='text-lg font-bold'>{Math.round(percentage)}%</span>
            </KPIRing>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
