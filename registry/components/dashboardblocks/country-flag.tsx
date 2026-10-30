'use client'

import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import * as Flags from 'country-flag-icons/react/3x2'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

const flags: Partial<Record<string, (props: { className?: string }) => ReactNode>> = Flags

function CountryFlag({ className, code }: { className?: string; code?: string }) {
  const Flag = code ? flags[code.toUpperCase()] : undefined
  return (
    <span
      aria-hidden
      data-slot='country-flag'
      className={cn('inline-flex w-6 shrink-0 items-center justify-center', className)}
    >
      {Flag ? (
        <span className='after:ring-foreground/10 relative flex w-5 overflow-hidden rounded-xs after:absolute after:inset-0 after:rounded-xs after:ring-1 after:ring-inset'>
          <Flag className='block h-auto! w-full!' />
        </span>
      ) : (
        <IconPlaceholder
          lucide='GlobeIcon'
          tabler='IconGlobe'
          hugeicons='Globe02Icon'
          phosphor='GlobeIcon'
          remixicon='RiGlobeLine'
          className='text-muted-foreground size-4'
        />
      )}
    </span>
  )
}

export { CountryFlag }
