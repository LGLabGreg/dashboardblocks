'use client'

import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox'
import { type ReactNode, useState } from 'react'

import { buttonVariants } from '@/components/ui/button'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox'

interface MultiSelectOption<V extends string = string> {
  disabled?: boolean
  /** Drawn before the label, in the list and on its chip, such as a flag or an avatar. */
  icon?: ReactNode
  label: string
  value: V
}

interface MultiSelectProps<V extends string = string> {
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  'aria-label'?: string
  /**
   * Name the field with this rather than a `<label htmlFor>` alone: while the list is open,
   * Base UI hides the rest of the page from screen readers, the label included.
   */
  'aria-labelledby'?: string
  className?: string
  disabled?: boolean
  id?: string
  /** Submits each picked value under this name, as a native multiple select does. */
  name?: string
  onValueChange?: (value: V[]) => void
  options: readonly MultiSelectOption<V>[]
  /** Shown while nothing is picked. */
  placeholder?: string
  /** The values picked, in the order they were picked. */
  value: readonly V[]
}

function MultiSelect<V extends string>({
  className,
  disabled,
  name,
  onValueChange,
  options,
  placeholder,
  value,
  ...props
}: MultiSelectProps<V>) {
  const anchor = useComboboxAnchor()
  const [query, setQuery] = useState('')
  const picked = value
    .map((item) => options.find((option) => option.value === item))
    .filter((option) => option !== undefined)

  return (
    <Combobox
      autoHighlight
      disabled={disabled}
      inputValue={query}
      isItemEqualToValue={(item, current) => item.value === current.value}
      itemToStringLabel={(item) => item.label}
      itemToStringValue={(item) => item.value}
      items={options}
      multiple
      name={name}
      value={picked}
      onInputValueChange={setQuery}
      onValueChange={(next, details) => {
        // Base UI clears every pick on Escape; let Escape close what's around the field instead.
        if (details.reason === 'escape-key') {
          details.allowPropagation()
          return
        }
        onValueChange?.(next.map((option) => option.value))
      }}
    >
      <ComboboxChips ref={anchor} className={className}>
        <ComboboxValue>
          {(items: MultiSelectOption<V>[]) =>
            items.map((item) => (
              <ComboboxChip
                key={item.value}
                className='[&_svg]:size-3.5'
                showRemove={false}
              >
                {item.icon}
                {item.label}
                <ComboboxPrimitive.ChipRemove
                  aria-label={`Remove ${item.label}`}
                  className={buttonVariants({
                    className: '-ml-1 opacity-50 hover:opacity-100',
                    size: 'icon-xs',
                    variant: 'ghost',
                  })}
                  data-slot='combobox-chip-remove'
                >
                  <IconPlaceholder
                    lucide='XIcon'
                    tabler='IconX'
                    hugeicons='Cancel01Icon'
                    phosphor='XIcon'
                    remixicon='RiCloseLine'
                    className='pointer-events-none'
                  />
                </ComboboxPrimitive.ChipRemove>
              </ComboboxChip>
            ))
          }
        </ComboboxValue>
        <ComboboxChipsInput
          {...props}
          placeholder={picked.length === 0 ? placeholder : undefined}
        />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>Nothing matches “{query.trim()}”.</ComboboxEmpty>
        <ComboboxList>
          {(item: MultiSelectOption<V>) => (
            <ComboboxItem key={item.value} disabled={item.disabled} value={item}>
              {item.icon}
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { MultiSelect }
export type { MultiSelectOption, MultiSelectProps }
