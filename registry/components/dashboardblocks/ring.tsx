import { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export interface RingProps {
  ariaLabel?: string
  children?: ReactNode
  className?: string
  percentage: number
  radius?: number
  ringColor?: string
  ringTrackColor?: string
  strokeWidth?: number
}

export const Ring = ({
  ariaLabel,
  children,
  className = '',
  percentage,
  radius = 40,
  ringColor = 'var(--color-primary)',
  ringTrackColor = 'var(--color-muted)',
  strokeWidth = 12,
}: RingProps) => {
  const safePercentage = Number.isFinite(percentage) ? percentage : 0
  const normalized = Math.min(100, Math.max(0, safePercentage))
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (normalized / 100) * circumference

  return (
    <div
      className={cn('relative shrink-0', className)}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : undefined}
    >
      <svg className='h-full w-full -rotate-90' viewBox='0 0 100 100'>
        <circle
          cx='50'
          cy='50'
          r={radius}
          fill='none'
          stroke={ringTrackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx='50'
          cy='50'
          r={radius}
          fill='none'
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap='round'
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className='transition-all duration-500 ease-out'
        />
      </svg>
      <div className='absolute inset-0 flex items-center justify-center'>
        {children ?? (
          <span className='text-sm font-semibold'>{Math.round(normalized)}%</span>
        )}
      </div>
    </div>
  )
}
