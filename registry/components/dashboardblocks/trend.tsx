import { AnimatedNumber } from '@/registry/components/dashboardblocks/animated-number'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type VariantProps, cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

type TrendDirection = 'up' | 'down' | 'neutral'

const trendVariants = cva('', {
  variants: {
    variant: {
      default: 'flex items-center gap-1 text-sm font-medium',
      'icon-only': 'h-4 w-4',
      badge: 'flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
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
      class: 'text-green-700 dark:text-green-400',
    },
    {
      variant: 'default',
      direction: 'down',
      class: 'text-red-700 dark:text-red-400',
    },
    {
      variant: 'default',
      direction: 'neutral',
      class: 'text-muted-foreground',
    },
    {
      variant: 'icon-only',
      direction: 'up',
      class: 'text-green-700 dark:text-green-400',
    },
    {
      variant: 'icon-only',
      direction: 'down',
      class: 'text-red-700 dark:text-red-400',
    },
    {
      variant: 'icon-only',
      direction: 'neutral',
      class: 'text-muted-foreground',
    },
    {
      variant: 'badge',
      direction: 'up',
      class: 'bg-green-500/10 text-green-800 dark:text-green-400',
    },
    {
      variant: 'badge',
      direction: 'down',
      class: 'bg-red-500/10 text-red-700 dark:text-red-400',
    },
    {
      variant: 'badge',
      direction: 'neutral',
      class: 'bg-muted text-muted-foreground',
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
  /**
   * Which direction is good. Use `down` for metrics like latency or churn,
   * so a decrease is colored as positive.
   * @default 'up'
   */
  goodDirection?: 'up' | 'down'
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

function TrendIcon({
  className,
  direction,
  kind,
}: {
  className?: string
  direction: TrendDirection
  kind: 'arrow' | 'trend'
}) {
  if (direction === 'neutral')
    return (
      <IconPlaceholder
        lucide='MinusIcon'
        tabler='IconMinus'
        hugeicons='MinusSignIcon'
        phosphor='MinusIcon'
        remixicon='RiSubtractLine'
        className={className}
      />
    )
  if (kind === 'arrow') {
    return direction === 'up' ? (
      <IconPlaceholder
        lucide='ArrowUpIcon'
        tabler='IconArrowUp'
        hugeicons='ArrowUpIcon'
        phosphor='ArrowUpIcon'
        remixicon='RiArrowUpLine'
        className={className}
      />
    ) : (
      <IconPlaceholder
        lucide='ArrowDownIcon'
        tabler='IconArrowDown'
        hugeicons='ArrowDown01Icon'
        phosphor='ArrowDownIcon'
        remixicon='RiArrowDownLine'
        className={className}
      />
    )
  }
  return direction === 'up' ? (
    <IconPlaceholder
      lucide='TrendingUpIcon'
      tabler='IconTrendingUp'
      hugeicons='ChartUpIcon'
      phosphor='TrendUpIcon'
      remixicon='RiLineChartLine'
      className={className}
    />
  ) : (
    <IconPlaceholder
      lucide='TrendingDownIcon'
      tabler='IconTrendingDown'
      hugeicons='ChartDownIcon'
      phosphor='TrendDownIcon'
      remixicon='RiArrowDownLine'
      className={className}
    />
  )
}

function Trend({
  animated = false,
  className,
  formatter = defaultFormatter,
  goodDirection = 'up',
  trend,
  trendIcon = 'trend',
  variant = 'default',
}: TrendProps) {
  const direction = getTrendDirection(trend)
  const tone =
    goodDirection === 'down' && direction !== 'neutral'
      ? direction === 'up'
        ? 'down'
        : 'up'
      : direction

  const displayValue = animated ? (
    <AnimatedNumber value={trend} formatter={formatter} />
  ) : (
    formatter(trend)
  )

  if (variant === 'icon-only') {
    return (
      <TrendIcon
        className={cn(trendVariants({ variant, direction: tone }), className)}
        direction={direction}
        kind={trendIcon}
      />
    )
  }

  if (variant === 'badge') {
    return (
      <div className={cn(trendVariants({ variant, direction: tone }), className)}>
        <TrendIcon className='size-3.5' direction={direction} kind={trendIcon} />
        {displayValue}
      </div>
    )
  }

  return (
    <div className={cn(trendVariants({ variant, direction: tone }), className)}>
      <TrendIcon className='h-4 w-4' direction={direction} kind={trendIcon} />
      {displayValue}
    </div>
  )
}

export { Trend, trendVariants, getTrendDirection }
export type { TrendProps, TrendDirection }
