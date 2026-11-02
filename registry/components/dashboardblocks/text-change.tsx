import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

interface TextChangeProps extends ComponentProps<'ins'> {
  change: 'added' | 'removed'
}

/** Text a change added, tinted in the chart colour, or removed, struck through in muted text. Screen readers hear “added” or “removed” before it. */
function TextChange({ change, children, className, ...props }: TextChangeProps) {
  const Mark = change === 'added' ? 'ins' : 'del'
  return (
    <Mark
      data-slot='text-change'
      data-change={change}
      className={cn(
        '[box-decoration-break:clone]',
        change === 'added'
          ? 'bg-chart-2/20 text-foreground rounded-sm no-underline'
          : 'text-muted-foreground decoration-muted-foreground/70',
        className,
      )}
      {...props}
    >
      <span className='sr-only'>{change === 'added' ? 'added ' : 'removed '}</span>
      {children}
    </Mark>
  )
}

export { TextChange }
export type { TextChangeProps }
