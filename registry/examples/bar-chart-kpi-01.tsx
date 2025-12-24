import { KPIBarChart, type KPIBarChartProps, KPITrend, KPIValue } from '@/registry/kpi'

import { Card, CardContent, CardDescription } from '@/components/ui/card'

interface BarChartKPI1Props {
  change?: string
  chartProps?: KPIBarChartProps
  title?: string
  trend?: 'up' | 'down' | 'neutral'
  value?: string
}

export const BarChartKPI1 = ({
  change = '+7.5%',
  chartProps = {
    barColor: 'var(--color-primary)',
    data: [
      { label: 'Monday', value: 32, displayValue: '$12,345' },
      { label: 'Tuesday', value: 45, displayValue: '$10,234' },
      { label: 'Wednesday', value: 28, displayValue: '$8,765' },
      { label: 'Thursday', value: 52, displayValue: '$6,543' },
      { label: 'Friday', value: 61, displayValue: '$4,321' },
      { label: 'Saturday', value: 48, displayValue: '$2,109' },
      { label: 'Sunday', value: 57, displayValue: '$1,234' },
    ],
    height: 160,
  },
  title = 'Revenue',
  trend = 'up',
  value = '$87,500',
}: BarChartKPI1Props) => {
  return (
    <Card>
      <CardContent>
        <div className='space-y-1'>
          <div className='flex items-center justify-between'>
            <CardDescription>{title}</CardDescription>
            <KPITrend value={change} trend={trend} variant='badge' />
          </div>
          <KPIValue>{value}</KPIValue>
        </div>
        <KPIBarChart {...chartProps} />
      </CardContent>
    </Card>
  )
}
