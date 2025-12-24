import { KPILineChart, KPITrend, KPIValue } from '@/registry/dashboardblocks/kpi'
import type { Props as LineProps } from 'recharts/types/cartesian/Line'

import { Card, CardContent, CardDescription } from '@/components/ui/card'

interface LineChartKPIProps {
  change?: string
  data?: unknown[]
  height?: number
  lines?: LineProps[]
  title?: string
  trend?: 'up' | 'down' | 'neutral'
  value?: string
}

export const LineChartKPI1 = ({
  change = '+4.2%',
  data = [
    {
      label: 'Mon',
      value: 4200,
      displayValues: {
        value: '4.2k visits',
      },
    },
    {
      label: 'Tue',
      value: 5100,
      displayValues: {
        value: '5.1k visits',
      },
    },
    {
      label: 'Wed',
      value: 2800,
      displayValues: {
        value: '4.8k visits',
      },
    },
    {
      label: 'Thu',
      value: 5600,
      displayValues: {
        value: '5.6k visits',
      },
    },
    {
      label: 'Fri',
      value: 6300,
      displayValues: {
        value: '6.3k visits',
      },
    },
    {
      label: 'Sat',
      value: 5400,
      displayValues: {
        value: '5.4k visits',
      },
    },
    {
      label: 'Sun',
      value: 6900,
      displayValues: {
        value: '4.9k visits',
      },
    },
  ],
  height = 120,
  lines = [
    {
      dataKey: 'value',
      stroke: 'var(--color-primary)',
    },
  ],
  title = 'Daily visitors',
  trend = 'up',
  value = '48,230',
}: LineChartKPIProps) => {
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
        <KPILineChart data={data} lines={lines} height={height} />
      </CardContent>
    </Card>
  )
}
