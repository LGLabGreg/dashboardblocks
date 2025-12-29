import { cn } from '@/lib/utils'

export interface UsageMeterValueProps {
  children: React.ReactNode
  className?: string
}

export const UsageMeterValue = ({ children, className }: UsageMeterValueProps) => {
  return (
    <span className={cn('text-2xl font-semibold tracking-tight', className)}>
      {children}
    </span>
  )
}

export interface UsageMeterLimitProps {
  children: React.ReactNode
  className?: string
}

export const UsageMeterLimit = ({ children, className }: UsageMeterLimitProps) => {
  return (
    <span className={cn('text-sm text-muted-foreground', className)}>{children}</span>
  )
}

export interface UsageMeterStatusProps {
  children?: React.ReactNode
  className?: string
  percentage: number
  warningThreshold?: number
}

export const UsageMeterStatus = ({
  children,
  className,
  percentage,
  warningThreshold = 80,
}: UsageMeterStatusProps) => {
  const safePercentage = Number.isFinite(percentage) ? percentage : 0
  const normalized = Math.min(100, Math.max(0, safePercentage))
  const isCritical = normalized >= 95
  const isWarning = normalized >= warningThreshold

  const defaultMessage = isCritical ? 'Critical' : isWarning ? 'Warning' : 'Normal'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        isCritical
          ? 'bg-destructive/10 text-destructive'
          : isWarning
            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500'
            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500',
        className,
      )}
    >
      {children ?? defaultMessage}
    </span>
  )
}
