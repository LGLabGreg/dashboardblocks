import { KPITrend, KPIValue } from '@/registry/components/dashboardblocks/kpi/kpi'

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
          <KPITrend value={change} trend={trend} trendIcon='arrow' variant='badge' />
        </div>
      </CardContent>
    </Card>
  )
}
