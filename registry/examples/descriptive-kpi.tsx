import { KPITrend, KPIValue } from '@/registry/kpi'

import { Card, CardContent, CardDescription, CardFooter } from '@/components/ui/card'

export const DescriptiveKPI = ({
  title = 'Conversion Rate',
  value = '3.24%',
  change = '-2.1%',
  trend = 'down',
  description = 'Compared to last month',
}: {
  title?: string
  value?: string
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  description?: string
} = {}) => {
  return (
    <Card>
      <CardContent className='space-y-2'>
        <CardDescription>{title}</CardDescription>
        <KPIValue>{value}</KPIValue>
        <div className='flex items-center justify-between border-t pt-2 mt-3'>
          <CardDescription>{description}</CardDescription>
          <KPITrend value={change} trend={trend} variant='badge' />
        </div>
      </CardContent>
    </Card>
  )
}
