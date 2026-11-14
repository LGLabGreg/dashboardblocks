'use client'

import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

/** Why a block's settings are read only: a line with a lock, under the header's description. */
function LockedNote({ children, className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot='locked-note'
      className={cn(
        'text-muted-foreground mt-2 flex items-center gap-1.5 text-sm [&_svg]:size-3.5',
        className,
      )}
      {...props}
    >
      <IconPlaceholder
        lucide='LockIcon'
        tabler='IconLock'
        hugeicons='SquareLock02Icon'
        phosphor='LockIcon'
        remixicon='RiLockLine'
      />
      {children}
    </p>
  )
}

export { LockedNote }
