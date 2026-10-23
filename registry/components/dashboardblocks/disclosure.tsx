'use client'

import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type ComponentProps, createContext, useContext, useId, useState } from 'react'

import { cn } from '@/lib/utils'

interface DisclosureContextValue {
  contentId: string
  open: boolean
  setOpen: (open: boolean) => void
}

const DisclosureContext = createContext<DisclosureContextValue | null>(null)

function useDisclosure() {
  const context = useContext(DisclosureContext)
  if (!context) throw new Error('Disclosure parts must be inside a Disclosure.')
  return context
}

interface DisclosureProps extends ComponentProps<'div'> {
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  open?: boolean
}

/** A line of muted text that shows or hides what's under it: a tool's input and output, a model's reasoning, a system prompt. */
function Disclosure({
  className,
  defaultOpen = false,
  onOpenChange,
  open: openProp,
  ...props
}: DisclosureProps) {
  const contentId = useId()
  const [uncontrolled, setUncontrolled] = useState(defaultOpen)
  const open = openProp ?? uncontrolled

  function setOpen(next: boolean) {
    setUncontrolled(next)
    onOpenChange?.(next)
  }

  return (
    <DisclosureContext.Provider value={{ contentId, open, setOpen }}>
      <div
        data-slot='disclosure'
        data-open={open || undefined}
        className={cn('flex min-w-0 flex-col items-start gap-2', className)}
        {...props}
      />
    </DisclosureContext.Provider>
  )
}

function DisclosureTrigger({
  children,
  className,
  onClick,
  ...props
}: ComponentProps<'button'>) {
  const { contentId, open, setOpen } = useDisclosure()
  return (
    <button
      data-slot='disclosure-trigger'
      type='button'
      aria-expanded={open}
      aria-controls={contentId}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) setOpen(!open)
      }}
      className={cn(
        'text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 flex min-w-0 items-start gap-1 rounded-sm text-start text-sm text-pretty outline-none focus-visible:ring-3 [&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:shrink-0',
        className,
      )}
      {...props}
    >
      <span className='min-w-0 break-words'>{children}</span>
      <IconPlaceholder
        lucide='ChevronRightIcon'
        tabler='IconChevronRight'
        hugeicons='ArrowRight01Icon'
        phosphor='CaretRightIcon'
        remixicon='RiArrowRightSLine'
        aria-hidden
        className={cn(
          'motion-safe:transition-transform rtl:-scale-x-100',
          open && 'rotate-90 rtl:scale-x-100',
        )}
      />
    </button>
  )
}

function DisclosureContent({ className, ...props }: ComponentProps<'div'>) {
  const { contentId, open } = useDisclosure()
  return (
    <div
      data-slot='disclosure-content'
      id={contentId}
      hidden={!open}
      className={cn('flex w-full min-w-0 flex-col gap-2', className)}
      {...props}
    />
  )
}

export { Disclosure, DisclosureContent, DisclosureTrigger }

export type { DisclosureProps }
