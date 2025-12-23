import { KPIProgress, KPITrend, KPIValue } from '@/registry/kpi'

import { Card, CardContent, CardDescription } from '@/components/ui/card'

export const ProgressKPI = ({
  change = '+7.5%',
  percentage = 55,
  title = 'Revenue',
  trend = 'up',
  value = '$87,500',
}: {
  change?: string
  percentage?: number
  title?: string
  trend?: 'up' | 'down' | 'neutral'
  value?: string
} = {}) => {
  return (
    <Card>
      <CardContent className='space-y-1'>
        <div className='flex items-center justify-between'>
          <CardDescription>{title}</CardDescription>
          <KPITrend value={change} trend={trend} variant='badge' />
        </div>
        <KPIValue>{value}</KPIValue>
        <KPIProgress
          className='mt-4'
          label='of monthly target'
          target='$100k'
          percentage={percentage}
        />
      </CardContent>
    </Card>
  )
}
