'use client'

import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

interface ChangeAmountProps extends ComponentProps<'span'> {
  /** Positive for a rise, negative for a fall. Zero shows `No change`. */
  change: number
}

function ChangeAmount({ change, children, className, ...props }: ChangeAmountProps) {
  if (change === 0) {
    return (
      <span data-slot='change-amount' className={className} {...props}>
        No change
      </span>
    )
  }

  return (
    <span
      data-slot='change-amount'
      className={cn(
        'inline-flex items-baseline gap-0.5 [&_svg]:size-3.5 [&_svg]:self-center',
        className,
      )}
      {...props}
    >
      {change > 0 ? (
        <IconPlaceholder
          aria-hidden
          lucide='ArrowUpIcon'
          tabler='IconArrowUp'
          hugeicons='ArrowUpIcon'
          phosphor='ArrowUpIcon'
          remixicon='RiArrowUpLine'
        />
      ) : (
        <IconPlaceholder
          aria-hidden
          lucide='ArrowDownIcon'
          tabler='IconArrowDown'
          hugeicons='ArrowDownIcon'
          phosphor='ArrowDownIcon'
          remixicon='RiArrowDownLine'
        />
      )}
      <span className='sr-only'>{change > 0 ? 'Up' : 'Down'} </span>
      {children}
    </span>
  )
}

export { ChangeAmount }
export type { ChangeAmountProps }
