import {
  KPI,
  KPIDescription,
  KPIDivider,
  KPILabel,
  KPIRow,
  KPIStack,
  KPITrend,
  KPIValue,
} from '@/registry/kpi'

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
    <KPI>
      <KPIStack gap='2'>
        <KPILabel>{title}</KPILabel>
        <KPIValue>{value}</KPIValue>
        <KPIDivider className='my-2' />
        <KPIRow>
          <KPIDescription>{description}</KPIDescription>
          <KPITrend value={change} trend={trend} variant='badge' />
        </KPIRow>
      </KPIStack>
    </KPI>
  )
}
