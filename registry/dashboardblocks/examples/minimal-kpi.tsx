import {
  KPI,
  KPILabel,
  KPIRow,
  KPIStack,
  KPITrend,
  KPIValue,
} from '@/registry/dashboardblocks/kpi'

export const MinimalKPI = ({
  title,
  value,
  change,
  trend,
}: {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
}) => {
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
