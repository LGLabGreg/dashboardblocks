import { type VariantProps, cva } from 'class-variance-authority'
import { ArrowDown, ArrowUp, Minus, TrendingDown, TrendingUp } from 'lucide-react'

import { cn } from '@/lib/utils'

const trendVariants = cva('', {
  variants: {
    variant: {
      default: 'flex items-center text-sm font-medium',
      'icon-only': 'h-4 w-4',
      badge:
        'flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
    },
    trend: {
      up: '',
      down: '',
      neutral: '',
    },
  },
  compoundVariants: [
    {
      variant: 'default',
      trend: 'up',
      class: 'text-green-600',
    },
    {
      variant: 'default',
      trend: 'down',
      class: 'text-red-600',
    },
    {
      variant: 'default',
      trend: 'neutral',
      class: 'text-gray-500',
    },
    {
      variant: 'icon-only',
      trend: 'up',
      class: 'text-green-600',
    },
    {
      variant: 'icon-only',
      trend: 'down',
      class: 'text-red-600',
    },
    {
      variant: 'icon-only',
      trend: 'neutral',
      class: 'text-gray-500',
    },
    {
      variant: 'badge',
      trend: 'up',
      class: 'bg-green-100 text-green-800 border-green-200',
    },
    {
      variant: 'badge',
      trend: 'down',
      class: 'bg-red-100 text-red-800 border-red-200',
    },
    {
      variant: 'badge',
      trend: 'neutral',
      class: 'bg-gray-100 text-gray-800 border-gray-200',
    },
  ],
  defaultVariants: {
    variant: 'default',
    trend: 'neutral',
  },
})

interface TrendProps extends VariantProps<typeof trendVariants> {
  className?: string
  trendIcon?: 'arrow' | 'trend'
  value: string
}

function Trend({
  className,
  trend = 'neutral',
  trendIcon = 'trend',
  value,
  variant = 'default',
}: TrendProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const ArrowIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus
  const Icon = trendIcon === 'arrow' ? ArrowIcon : TrendIcon

  if (variant === 'icon-only') {
    return <Icon className={cn(trendVariants({ variant, trend }), className)} />
  }

  if (variant === 'badge') {
    return (
      <div className={cn(trendVariants({ variant, trend }), className)}>
        <Icon className='h-4 w-4' />
        {value}
      </div>
    )
  }

  return (
    <div className={cn(trendVariants({ variant, trend }), className)}>
      <Icon className='mr-1 h-4 w-4' />
      {value}
    </div>
  )
}

export { Trend, trendVariants }
export type { TrendProps }
