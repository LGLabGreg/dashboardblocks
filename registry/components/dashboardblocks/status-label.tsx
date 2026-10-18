import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

type StatusTone = 'good' | 'warning' | 'bad' | 'info' | 'neutral'

const statusToneClasses: Record<StatusTone, string> = {
  bad: 'text-red-700 dark:text-red-400',
  good: 'text-emerald-700 dark:text-emerald-400',
  info: 'text-sky-700 dark:text-sky-400',
  neutral: 'text-muted-foreground',
  warning: 'text-amber-800 dark:text-amber-400',
}

interface StatusLabelProps extends ComponentProps<'span'> {
  tone: StatusTone
}

function StatusLabel({ className, tone, ...props }: StatusLabelProps) {
  return (
    <span
      data-slot='status-label'
      data-tone={tone}
      className={cn(
        'text-sm font-medium whitespace-nowrap',
        statusToneClasses[tone],
        className,
      )}
      {...props}
    />
  )
}

export { StatusLabel, statusToneClasses }

export type { StatusLabelProps, StatusTone }
