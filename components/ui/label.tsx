'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    // oxlint-disable-next-line jsx-a11y/label-has-associated-control -- shadcn's label; callers pass htmlFor
    <label
      data-slot='label'
      className={cn(
        'cn-label flex items-center select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  )
}

export { Label }
