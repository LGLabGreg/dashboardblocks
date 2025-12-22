import {
  KPI,
  KPIDescription,
  KPIDivider,
  KPILabel,
  KPIRow,
  KPIStack,
  KPITrend,
  KPIValue,
} from '@/registry/dashboardblocks/kpi'

export const DescriptiveKPI = ({
  title,
  value,
  change,
  trend,
  description,
}: {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  description: string
}) => {
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
