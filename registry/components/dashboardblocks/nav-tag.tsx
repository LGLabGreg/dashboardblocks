import type { StatusTone } from '@/registry/components/dashboardblocks/status-label'
import { statusToneClasses } from '@/registry/components/dashboardblocks/status-label'
import { formatNumber } from '@/registry/lib/dashboardblocks/format'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/utils'

const navTagToneClasses: Record<StatusTone, string> = {
  bad: 'bg-red-500/5 dark:bg-red-500/10',
  good: 'bg-emerald-500/5 dark:bg-emerald-500/10',
  info: 'bg-sky-500/5 dark:bg-sky-500/10',
  neutral: 'text-foreground/70 bg-current/10',
  warning: 'bg-orange-500/5 dark:bg-orange-500/10',
}

interface NavTagProps extends ComponentProps<'span'> {
  /** Drawn before the count, such as a live dot. */
  indicator?: ReactNode
  /** `neutral` for a plain count; another tone when it needs attention. @default 'neutral' */
  tone?: StatusTone
}

function NavTag({
  children,
  className,
  indicator,
  tone = 'neutral',
  ...props
}: NavTagProps) {
  return (
    <span
      data-slot='nav-tag'
      data-tone={tone}
      className={cn(
        'inline-flex h-5 min-w-5 shrink-0 items-center justify-center gap-1 rounded-md px-1.5 text-xs font-medium whitespace-nowrap tabular-nums',
        tone !== 'neutral' && statusToneClasses[tone],
        navTagToneClasses[tone],
        className,
      )}
      {...props}
    >
      {indicator}
      {children}
    </span>
  )
}

/** Draws a plain number or string as a `NavTag`; any other node as it is. */
function renderNavTag(badge: ReactNode) {
  if (typeof badge === 'number') return <NavTag>{formatNumber(badge)}</NavTag>
  if (typeof badge === 'string') return <NavTag>{badge}</NavTag>
  return badge
}

export { NavTag, renderNavTag }

export type { NavTagProps }
