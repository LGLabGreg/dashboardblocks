import { KPIValue } from '@/registry/components/dashboardblocks/kpi/kpi'
import { Trend } from '@/registry/components/dashboardblocks/trend'

import { Card, CardContent, CardDescription } from '@/components/ui/card'

export const KPI3 = ({
  change = '-2.1%',
  description = 'Compared to last month',
  title = 'Conversion Rate',
  trend = 'down',
  value = '3.24%',
}: {
  change?: string
  description?: string
  title?: string
  trend?: 'up' | 'down' | 'neutral'
  value?: string
} = {}) => {
  return (
    <Card>
      <CardContent className='space-y-2'>
        <CardDescription>{title}</CardDescription>
        <KPIValue>{value}</KPIValue>
        <div className='flex items-center justify-between border-t pt-2 mt-3'>
          <CardDescription>{description}</CardDescription>
          <Trend value={change} trend={trend} trendIcon='arrow' variant='badge' />
        </div>
      </CardContent>
    </Card>
  )
}
