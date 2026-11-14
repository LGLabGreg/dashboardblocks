import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface ValueChangeProps extends Omit<ComponentProps<'span'>, 'children'> {
  from: ReactNode
  to: ReactNode
}

function ValueChange({ className, from, to, ...props }: ValueChangeProps) {
  return (
    <span data-slot='value-change' className={cn('tabular-nums', className)} {...props}>
      <span className='sr-only'>from </span>
      <span className='text-muted-foreground line-through decoration-1'>{from}</span>{' '}
      <span className='whitespace-nowrap'>
        <span aria-hidden className='text-muted-foreground'>
          →
        </span>
        <span className='sr-only'>to</span> <span className='font-medium'>{to}</span>
      </span>
    </span>
  )
}

export { ValueChange }

export type { ValueChangeProps }
