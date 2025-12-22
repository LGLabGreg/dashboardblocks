import {
  KPI,
  KPILabel,
  KPIRow,
  KPIStack,
  KPITrend,
  KPIValue,
} from '@/registry/dashboardblocks/kpi'

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
    <KPI>
      <KPIStack gap='2'>
        <KPILabel>{title}</KPILabel>
        <KPIRow>
          <KPIValue>{value}</KPIValue>
          <KPITrend value={change} trend={trend} />
        </KPIRow>
      </KPIStack>
    </KPI>
  )
}
