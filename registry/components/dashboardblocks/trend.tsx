import { AnimatedNumber } from '@/registry/components/dashboardblocks/animated-number'
import { type VariantProps, cva } from 'class-variance-authority'
import { ArrowDown, ArrowUp, Minus, TrendingDown, TrendingUp } from 'lucide-react'

import { cn } from '@/lib/utils'

type TrendDirection = 'up' | 'down' | 'neutral'

const trendVariants = cva('', {
  variants: {
    variant: {
      default: 'flex items-center text-sm font-medium',
      'icon-only': 'h-4 w-4',
      badge:
        'flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
    },
    direction: {
      up: '',
      down: '',
      neutral: '',
    },
  },
  compoundVariants: [
    {
      variant: 'default',
      direction: 'up',
      class: 'text-green-600',
    },
    {
      variant: 'default',
      direction: 'down',
      class: 'text-red-600',
    },
    {
      variant: 'default',
      direction: 'neutral',
      class: 'text-gray-500',
    },
    {
      variant: 'icon-only',
      direction: 'up',
      class: 'text-green-600',
    },
    {
      variant: 'icon-only',
      direction: 'down',
      class: 'text-red-600',
    },
    {
      variant: 'icon-only',
      direction: 'neutral',
      class: 'text-gray-500',
    },
    {
      variant: 'badge',
      direction: 'up',
      class: 'bg-green-100 text-green-800 border-green-200',
    },
    {
      variant: 'badge',
      direction: 'down',
      class: 'bg-red-100 text-red-800 border-red-200',
    },
    {
      variant: 'badge',
      direction: 'neutral',
      class: 'bg-gray-100 text-gray-800 border-gray-200',
    },
  ],
  defaultVariants: {
    variant: 'default',
    direction: 'neutral',
  },
})

interface TrendProps extends Omit<VariantProps<typeof trendVariants>, 'direction'> {
  animated?: boolean
  className?: string
  formatter?: (value: number) => string
  trend: number
  trendIcon?: 'arrow' | 'trend'
}

const defaultFormatter = (value: number): string => {
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${value.toLocaleString()}%`
}

function getTrendDirection(value: number): TrendDirection {
  if (value > 0) return 'up'
  if (value < 0) return 'down'
  return 'neutral'
}

function Trend({
  animated = false,
  className,
  formatter = defaultFormatter,
  trend,
  trendIcon = 'trend',
  variant = 'default',
}: TrendProps) {
  const direction = getTrendDirection(trend)
  const TrendIcon =
    direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus
  const ArrowIcon =
    direction === 'up' ? ArrowUp : direction === 'down' ? ArrowDown : Minus
  const Icon = trendIcon === 'arrow' ? ArrowIcon : TrendIcon

  const displayValue = animated ? (
    <AnimatedNumber value={trend} formatter={formatter} />
  ) : (
    formatter(trend)
  )

  if (variant === 'icon-only') {
    return <Icon className={cn(trendVariants({ variant, direction }), className)} />
  }

  if (variant === 'badge') {
    return (
      <div className={cn(trendVariants({ variant, direction }), className)}>
        <Icon className='h-4 w-4' />
        {displayValue}
      </div>
    )
  }

  return (
    <div className={cn(trendVariants({ variant, direction }), className)}>
      <Icon className='mr-1 h-4 w-4' />
      {displayValue}
    </div>
  )
}

export { Trend, trendVariants, getTrendDirection }
export type { TrendProps, TrendDirection }
