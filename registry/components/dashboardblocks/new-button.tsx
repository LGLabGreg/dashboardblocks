'use client'

import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import type { ComponentProps, ReactNode } from 'react'

import { Button } from '@/components/ui/button'

/** A button that creates something, with a plus before its label, such as New key. @default size 'sm' */
function NewButton({
  children,
  size = 'sm',
  ...props
}: Omit<ComponentProps<typeof Button>, 'children'> & { children: ReactNode }) {
  return (
    <Button size={size} {...props}>
      <IconPlaceholder
        lucide='PlusIcon'
        tabler='IconPlus'
        hugeicons='PlusSignIcon'
        phosphor='PlusIcon'
        remixicon='RiAddLine'
        data-icon='inline-start'
      />
      {children}
    </Button>
  )
}

export { NewButton }
