import { KPIProgress, KPITrend, KPIValue } from '@/registry/kpi'

import { Card, CardContent, CardDescription } from '@/components/ui/card'

export const ProgressKPI = ({
  title = 'Revenue',
  value = '$87,500',
  change = '+7.5%',
  trend = 'up',
  percentage = 55,
}: {
  title?: string
  value?: string
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  percentage?: number
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
