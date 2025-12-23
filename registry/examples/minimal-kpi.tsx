import { KPITrend, KPIValue } from '@/registry/kpi'

import { Card, CardContent, CardDescription } from '@/components/ui/card'

export const MinimalKPI = ({
  change = '+20.1%',
  title = 'Total Revenue',
  trend = 'up',
  value = '$45,231.89',
}: {
  change?: string
  title?: string
  trend?: 'up' | 'down' | 'neutral'
  value?: string
} = {}) => {
  return (
    <Card>
      <CardContent className='space-y-2'>
        <CardDescription>{title}</CardDescription>
        <div className='flex items-center justify-between'>
          <KPIValue>{value}</KPIValue>
          <KPITrend value={change} trend={trend} />
        </div>
      </CardContent>
    </Card>
  )
}
