import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/utils'

type StatusTone = 'good' | 'warning' | 'bad' | 'info' | 'neutral'

const statusToneClasses: Record<StatusTone, string> = {
  bad: 'text-red-700 dark:text-red-400',
  good: 'text-emerald-700 dark:text-emerald-400',
  info: 'text-sky-700 dark:text-sky-400',
  neutral: 'text-muted-foreground',
  warning: 'text-orange-700 dark:text-orange-400',
}

interface StatusLabelProps extends ComponentProps<'span'> {
  /** Drawn before the label in a badge, in place of the dot. */
  indicator?: ReactNode
  tone: StatusTone
  /**
   * `badge` for a status that stands on its own; `text` for one inside a
   * sentence or a `Details` line.
   * @default 'badge'
   */
  variant?: 'badge' | 'text'
}

function StatusLabel({
  children,
  className,
  indicator,
  tone,
  variant = 'badge',
  ...props
}: StatusLabelProps) {
  return (
    <span
      data-slot='status-label'
      data-tone={tone}
      data-variant={variant}
      className={cn(
        'font-medium whitespace-nowrap',
        variant === 'badge'
          ? 'inline-flex h-fit w-fit items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-xs [&_svg]:size-3.5 [&_svg]:shrink-0'
          : 'text-sm',
        statusToneClasses[tone],
        className,
      )}
      {...props}
    >
      {variant === 'badge' &&
        (indicator ?? (
          <span aria-hidden className='size-1.5 shrink-0 rounded-full bg-current' />
        ))}
      {children}
    </span>
  )
}

export { StatusLabel, statusToneClasses }

export type { StatusLabelProps, StatusTone }
