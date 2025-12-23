import { ArrowDown, ArrowUp, Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { ReactNode } from 'react'

import { Card, CardContent } from '@/components/ui/card'

import { cn } from '@/lib/utils'

export const KPI = ({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) => {
  return (
    <Card className={cn('w-full', className)}>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

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

export const KPIRow = ({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) => {
  return (
    <div className={cn('flex items-center justify-between', className)}>{children}</div>
  )
}

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

export const KPIValue = ({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) => {
  return <div className={`text-3xl font-bold ${className}`}>{children}</div>
}

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
        className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeColors[trend]} ${className}`}
      >
        <ArrowIcon className='h-3 w-3' />
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

export const KPIDescription = ({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) => {
  return <div className={`text-xs text-muted-foreground ${className}`}>{children}</div>
}

export const KPIDivider = ({ className = '' }: { className?: string }) => {
  return <div className={`border-t ${className}`} />
}
