import { type VariantProps, cva } from 'class-variance-authority'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

const itemVariants = cva('flex items-start gap-4', {
  variants: {
    align: {
      center: 'items-center',
      start: 'items-start',
    },
    size: {
      default: 'gap-4',
      sm: 'gap-3',
    },
  },
  defaultVariants: {
    align: 'start',
    size: 'default',
  },
})

const contentVariants = cva('flex-1 text-sm', {
  variants: {
    layout: {
      inline: 'space-y-0',
      stacked: 'space-y-1',
    },
  },
  defaultVariants: {
    layout: 'stacked',
  },
})

const indicatorVariants = cva('inline-flex items-center justify-center rounded-full', {
  variants: {
    status: {
      error: '',
      info: '',
      progress: '',
      success: '',
    },
    variant: {
      dot: 'size-2',
      ring: 'size-5 p-1.5',
    },
  },
  compoundVariants: [
    {
      status: 'success',
      variant: 'dot',
      class: 'bg-green-600',
    },
    {
      status: 'progress',
      variant: 'dot',
      class: 'bg-blue-600',
    },
    {
      status: 'error',
      variant: 'dot',
      class: 'bg-red-600',
    },
    {
      status: 'info',
      variant: 'dot',
      class: 'bg-purple-600',
    },
    {
      status: 'success',
      variant: 'ring',
      class:
        'bg-[color-mix(in_oklab,var(--color-green-600)_15%,var(--card))] text-green-600 dark:text-green-500',
    },
    {
      status: 'progress',
      variant: 'ring',
      class:
        'bg-[color-mix(in_oklab,var(--color-blue-600)_15%,var(--card))] text-blue-600 dark:text-blue-500',
    },
    {
      status: 'error',
      variant: 'ring',
      class:
        'bg-[color-mix(in_oklab,var(--color-red-600)_15%,var(--card))] text-red-600 dark:text-red-500',
    },
    {
      status: 'info',
      variant: 'ring',
      class:
        'bg-[color-mix(in_oklab,var(--color-purple-600)_15%,var(--card))] text-purple-600 dark:text-purple-500',
    },
  ],
  defaultVariants: {
    status: 'info',
    variant: 'dot',
  },
})

const timelinePositions = {
  center: 'left-20.5',
  start: 'left-5',
} as const

type ActivityFeedItemProps = {
  align?: VariantProps<typeof itemVariants>['align']
  children: ReactNode
  className?: string
  size?: VariantProps<typeof itemVariants>['size']
}

type ActivityFeedContentProps = {
  children: ReactNode
  className?: string
  layout?: VariantProps<typeof contentVariants>['layout']
}

interface ActivityFeedIndicatorProps extends VariantProps<typeof indicatorVariants> {
  className?: string
}

type ActivityFeedTimelineProps = {
  children: ReactNode
  className?: string
  lineClassName?: string
  linePosition?: keyof typeof timelinePositions
}

function ActivityFeedItem({
  align = 'start',
  children,
  className = '',
  size = 'default',
}: ActivityFeedItemProps) {
  return (
    <div className={cn('relative', itemVariants({ align, size }), className)}>
      {children}
    </div>
  )
}

function ActivityFeedContent({
  children,
  className = '',
  layout = 'stacked',
}: ActivityFeedContentProps) {
  return <div className={cn(contentVariants({ layout }), className)}>{children}</div>
}

function ActivityFeedIndicator({
  className = '',
  status = 'info',
  variant = 'dot',
}: ActivityFeedIndicatorProps) {
  if (variant === 'ring') {
    return (
      <span className={cn(indicatorVariants({ status, variant }), className)}>
        <span className='size-2 rounded-full bg-current' />
      </span>
    )
  }

  return <span className={cn(indicatorVariants({ status, variant }), className)} />
}

function ActivityFeedTimeline({
  children,
  className = '',
  lineClassName = '',
  linePosition = 'start',
}: ActivityFeedTimelineProps) {
  return (
    <div className={cn('relative space-y-6', className)}>
      <div
        aria-hidden='true'
        className={cn(
          'absolute inset-y-0 w-px bg-border',
          timelinePositions[linePosition],
          lineClassName,
        )}
      />
      {children}
    </div>
  )
}

export {
  ActivityFeedContent,
  ActivityFeedIndicator,
  ActivityFeedItem,
  ActivityFeedTimeline,
}
