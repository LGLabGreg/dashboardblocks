// Override of registry/components/dashboardblocks/multi-select.tsx for React Aria
// source-hash: 39f72c6d931f

'use client'

import { type ReactNode, useState } from 'react'

import {
  Combobox,
  ComboboxChip,
  ComboboxChipList,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
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
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  'aria-label': label,
  'aria-labelledby': labelledBy,
  className,
  disabled,
  id,
  name,
  onValueChange,
  options,
  placeholder,
  value,
}: MultiSelectProps<V>) {
  const [query, setQuery] = useState('')

  return (
    <Combobox
      allowsEmptyCollection
      aria-describedby={describedBy}
      aria-label={label}
      aria-labelledby={labelledBy}
      disabledKeys={options
        .filter((option) => option.disabled)
        .map((option) => option.value)}
      id={id}
      inputValue={query}
      isDisabled={disabled}
      isInvalid={invalid}
      name={name}
      selectionMode='multiple'
      value={[...value]}
      onChange={(keys) => {
        const picked = new Set(keys.map(String))
        const kept = value.filter((item) => picked.has(item))
        const added = options
          .map((option) => option.value)
          .filter((item) => picked.has(item) && !kept.includes(item))
        onValueChange?.([...kept, ...added])
      }}
      onInputChange={setQuery}
    >
      <ComboboxChips className={className}>
        <ComboboxChipList<MultiSelectOption<V>>>
          {(item) => (
            <ComboboxChip
              id={item.value}
              className='[&_svg]:size-3.5'
              textValue={item.label}
            >
              {item.icon}
              {item.label}
            </ComboboxChip>
          )}
        </ComboboxChipList>
        <ComboboxChipsInput placeholder={value.length === 0 ? placeholder : undefined} />
      </ComboboxChips>
      <ComboboxContent>
        <ComboboxList
          renderEmptyState={() => (
            <ComboboxEmpty>Nothing matches “{query.trim()}”.</ComboboxEmpty>
          )}
        >
          {options.map((item) => (
            <ComboboxItem
              key={item.value}
              id={item.value}
              textValue={item.label}
              value={item}
            >
              {item.icon}
              {item.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { MultiSelect }
export type { MultiSelectOption, MultiSelectProps }
