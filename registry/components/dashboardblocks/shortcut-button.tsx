'use client'

import { type ComponentProps, useEffect, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { cn } from '@/lib/utils'

const OWNS_ITS_KEYS =
  'input, textarea, select, [contenteditable], [role=dialog], [role=alertdialog], [role=menu], [role=listbox]'

/**
 * Clicks the button when `key` is pressed alone, unless someone is typing, a menu or dialog has
 * focus, or the page already used the key.
 */
function usePressOnKey(
  key: string,
  button: { current: HTMLButtonElement | null },
  on: boolean,
) {
  useEffect(() => {
    if (!on) return
    const match = key.toLowerCase()
    const onKeyDown = (event: KeyboardEvent) => {
      // Chrome's autofill sends keydown events without a key.
      if (event.defaultPrevented || event.repeat || event.key?.toLowerCase() !== match)
        return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.target instanceof Element && event.target.closest(OWNS_ITS_KEYS)) return
      event.preventDefault()
      button.current?.click()
    }
    window.addEventListener('keydown', onKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true })
  }, [button, key, on])
}

const collapsed = {
  lg: 'max-lg:aspect-square max-lg:px-0',
  sm: 'max-sm:aspect-square max-sm:px-0',
}

interface ShortcutButtonProps extends Omit<ComponentProps<'button'>, 'ref'> {
  /** Below this width the button squares to its icon. Hide its text there too, with `max-lg:sr-only` or `max-sm:sr-only`. */
  collapseBelow?: 'lg' | 'sm'
  /** The tooltip's text, such as `New issue`. The button's name comes from `aria-label` or its text. */
  label: string
  /**
   * Presses the button when its key is pressed anywhere on the page. Leave it off when a list or
   * panel already listens for the key, as a row's actions do.
   */
  listen?: boolean
  /** The key, shown in the tooltip, such as `C`. */
  shortcut: string
  /** @default 'icon-sm' */
  size?: 'icon-sm' | 'sm'
  /** @default 'ghost' */
  variant?: 'ghost' | 'outline'
}

/** A button whose tooltip shows its label and its keyboard shortcut. */
function ShortcutButton({
  children,
  className,
  collapseBelow,
  label,
  listen = false,
  shortcut,
  size = 'icon-sm',
  variant = 'ghost',
  ...props
}: ShortcutButtonProps) {
  const button = useRef<HTMLButtonElement>(null)
  usePressOnKey(shortcut, button, listen)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant={variant}
              size={size}
              className={cn(collapseBelow && collapsed[collapseBelow], className)}
            />
          }
          aria-keyshortcuts={shortcut}
          ref={button}
          {...props}
        >
          {children}
        </TooltipTrigger>
        <TooltipContent>
          {label}
          <Kbd>{shortcut}</Kbd>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export { ShortcutButton }

export type { ShortcutButtonProps }
