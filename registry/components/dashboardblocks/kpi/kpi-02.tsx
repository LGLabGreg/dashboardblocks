import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { Trend } from '@/registry/components/dashboardblocks/trend'

import { Card, CardContent, CardDescription } from '@/components/ui/card'

export const KPI2 = ({
  change = '+12.5%',
  title = 'Active Users',
  trend = 'up',
  value = '2,420',
}: {
  change?: string
  title?: string
  trend?: 'up' | 'down' | 'neutral'
  value?: string
} = {}) => {
  return (
    <Card>
      <CardContent className='space-y-2'>
        <div className='flex items-center justify-between'>
          <CardDescription>{title}</CardDescription>
          <Trend value={change} trend={trend} variant='badge' />
        </div>
        <KPIValue>{value}</KPIValue>
      </CardContent>
    </Card>
  )
}
