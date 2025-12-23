import { KPITrend, KPIValue } from '@/registry/kpi'

import { Card, CardContent, CardDescription } from '@/components/ui/card'

export const MinimalKPI = ({
  title = 'Total Revenue',
  value = '$45,231.89',
  change = '+20.1%',
  trend = 'up',
}: {
  title?: string
  value?: string
  change?: string
  trend?: 'up' | 'down' | 'neutral'
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
