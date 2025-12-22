import {
  KPI,
  KPILabel,
  KPIRow,
  KPIStack,
  KPITrend,
  KPIValue,
} from '@/registry/dashboardblocks/kpi'

export const CompactKPI = ({
  title = 'Active Users',
  value = '2,420',
  change = '+12.5%',
  trend = 'up',
}: {
  title?: string
  value?: string
  change?: string
  trend?: 'up' | 'down' | 'neutral'
} = {}) => {
  return (
    <KPI>
      <KPIRow>
        <KPIStack gap='1'>
          <KPILabel>{title}</KPILabel>
          <KPIValue className='text-2xl'>{value}</KPIValue>
        </KPIStack>
        <KPITrend value={change} trend={trend} variant='badge' />
      </KPIRow>
    </KPI>
  )
}
