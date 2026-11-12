'use client'

import { ShortcutButton } from '@/registry/components/dashboardblocks/shortcut-button'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface PanelControlsProps {
  /** Buttons of the panel's own before Previous, such as Open as a page. */
  children?: ReactNode
  className?: string
  /** Closes the panel, from its button or Esc. The button carries `data-panel-close`, so a page that shows the panel on its own with a Back link can hide it and keep Esc. */
  onClose?: () => void
  /** Opens the record below this one in the list, from its button or J. Leave out at the end. */
  onNext?: () => void
  /** Opens the record above this one in the list, from its button or K. Leave out at the start. */
  onPrevious?: () => void
}

/** Previous, Next and Close for a panel opened beside a list, on K, J and Esc. */
function PanelControls({
  children,
  className,
  onClose,
  onNext,
  onPrevious,
}: PanelControlsProps) {
  const moves = onNext !== undefined || onPrevious !== undefined
  return (
    <div
      data-slot='panel-controls'
      className={cn('-me-2 flex shrink-0 items-center gap-0.5', className)}
    >
      {children}
      {moves && (
        <>
          <ShortcutButton
            aria-label='Previous'
            disabled={!onPrevious}
            label='Previous'
            listen
            onClick={onPrevious}
            shortcut='K'
          >
            <IconPlaceholder
              lucide='ChevronUpIcon'
              tabler='IconChevronUp'
              hugeicons='ArrowUp01Icon'
              phosphor='CaretUpIcon'
              remixicon='RiArrowUpSLine'
            />
          </ShortcutButton>
          <ShortcutButton
            aria-label='Next'
            disabled={!onNext}
            label='Next'
            listen
            onClick={onNext}
            shortcut='J'
          >
            <IconPlaceholder
              lucide='ChevronDownIcon'
              tabler='IconChevronDown'
              hugeicons='ArrowDown01Icon'
              phosphor='CaretDownIcon'
              remixicon='RiArrowDownSLine'
            />
          </ShortcutButton>
        </>
      )}
      {onClose && (
        <ShortcutButton
          aria-label='Close'
          data-panel-close=''
          label='Close'
          listen
          onClick={onClose}
          shortcut='Escape'
        >
          <IconPlaceholder
            lucide='XIcon'
            tabler='IconX'
            hugeicons='Cancel01Icon'
            phosphor='XIcon'
            remixicon='RiCloseLine'
          />
        </ShortcutButton>
      )}
    </div>
  )
}

export { PanelControls }
export type { PanelControlsProps }
