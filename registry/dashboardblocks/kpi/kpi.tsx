import { ArrowDown, ArrowUp, Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { ReactNode } from 'react'

import { Card, CardContent } from '@/components/ui/card'

// Base KPI Container
export const KPI = ({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) => {
  return (
    <Card className={className}>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

// KPI Label/Title
export const KPILabel = ({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) => {
  return (
    <div className={`text-sm font-medium text-muted-foreground ${className}`}>
      {children}
    </div>
  )
}

// KPI Value
export const KPIValue = ({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) => {
  return <div className={`text-3xl font-bold ${className}`}>{children}</div>
}

// KPI Trend Component
export const KPITrend = ({
  value,
  trend = 'neutral',
  variant = 'default',
  className = '',
}: {
  value: string
  trend?: 'up' | 'down' | 'neutral'
  variant?: 'default' | 'icon-only' | 'badge'
  className?: string
}) => {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-500',
  }

  const badgeColors = {
    up: 'bg-green-100 text-green-800 border-green-200',
    down: 'bg-red-100 text-red-800 border-red-200',
    neutral: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  if (variant === 'icon-only') {
    return <TrendIcon className={`h-4 w-4 ${trendColors[trend]} ${className}`} />
  }

  if (variant === 'badge') {
    const ArrowIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus
    return (
      <div
        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeColors[trend]} ${className}`}
      >
        <ArrowIcon className='mr-1 inline h-3 w-3' />
        {value}
      </div>
    )
  }

  return (
    <div
      className={`flex items-center text-sm font-medium ${trendColors[trend]} ${className}`}
    >
      <TrendIcon className='mr-1 h-4 w-4' />
      {value}
    </div>
  )
}

// KPI Row - For horizontal layouts
export const KPIRow = ({
  children,
  className = '',
  align = 'between',
}: {
  children: ReactNode
  className?: string
  align?: 'between' | 'start' | 'end' | 'center'
}) => {
  const alignmentClasses = {
    between: 'justify-between',
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
  }

  return (
    <div className={`flex items-baseline ${alignmentClasses[align]} ${className}`}>
      {children}
    </div>
  )
}

// KPI Stack - For vertical layouts
export const KPIStack = ({
  children,
  className = '',
  gap = '2',
}: {
  children: ReactNode
  className?: string
  gap?: '1' | '2' | '3' | '4'
}) => {
  const gapClasses = {
    '1': 'space-y-1',
    '2': 'space-y-2',
    '3': 'space-y-3',
    '4': 'space-y-4',
  }

  return <div className={`${gapClasses[gap]} ${className}`}>{children}</div>
}

// KPI Description
export const KPIDescription = ({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) => {
  return <div className={`text-xs text-muted-foreground ${className}`}>{children}</div>
}

// KPI Divider
export const KPIDivider = ({ className = '' }: { className?: string }) => {
  return <div className={`border-t ${className}`} />
}

// ===== COMPOSED EXAMPLES =====

// MinimalKPI using composable components
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

// Alternative composition - Compact version
export const CompactKPI = ({
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

// Alternative composition - With description
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

// Demo showing composability
export const ComposableKPIDemo = () => {
  return (
    <div className='grid gap-4 md:grid-cols-2'>
      {/* Standard MinimalKPI */}
      <MinimalKPI title='Total Revenue' value='$45,231' change='+12.5%' trend='up' />

      {/* Compact version */}
      <CompactKPI title='Active Users' value='2,345' change='+8.2%' trend='up' />

      {/* With description */}
      <DescriptiveKPI
        title='Conversion Rate'
        value='3.24%'
        change='+0.5%'
        trend='up'
        description='vs last month'
      />

      {/* Custom composition using primitives */}
      <KPI>
        <KPIStack gap='3'>
          <KPIRow>
            <KPILabel>Custom Layout</KPILabel>
            <KPITrend value='+5%' trend='up' variant='icon-only' />
          </KPIRow>
          <KPIValue className='text-4xl'>$99,999</KPIValue>
          <KPIDescription>Completely custom using primitives</KPIDescription>
        </KPIStack>
      </KPI>

      {/* Another custom composition */}
      <KPI>
        <KPIRow align='start' className='gap-4'>
          <KPIStack gap='1'>
            <KPILabel>Sales</KPILabel>
            <KPIValue className='text-2xl'>$125K</KPIValue>
            <KPIDescription>This quarter</KPIDescription>
          </KPIStack>
          <KPITrend value='+27.5%' trend='up' variant='badge' />
        </KPIRow>
      </KPI>
    </div>
  )
}
