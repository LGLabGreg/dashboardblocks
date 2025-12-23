import { ArrowDown, ArrowUp, Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { ReactNode } from 'react'

import { Progress } from '@/components/ui/progress'

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

export const KPIProgress = ({
  percentage,
  label,
  target,
  className = '',
  progressClassName = '',
}: {
  percentage: number
  label?: string
  target?: string
  className?: string
  progressClassName?: string
}) => {
  const safePercentage = Number.isFinite(percentage) ? percentage : 0
  const normalized = Math.min(100, Math.max(0, safePercentage))

  return (
    <div className={`space-y-2 ${className}`}>
      <div className='flex items-center justify-between text-sm text-muted-foreground'>
        <span>
          <span className='font-semibold text-foreground'>{Math.round(normalized)}%</span>
          {label ? ` ${label}` : null}
        </span>
        <span className='text-sm font-semibold text-foreground'>{target}</span>
      </div>
      <Progress value={normalized} className={progressClassName} />
    </div>
  )
}
