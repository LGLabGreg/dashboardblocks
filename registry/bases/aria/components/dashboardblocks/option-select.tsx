// Override of registry/components/dashboardblocks/option-select.tsx for React Aria
// source-hash: b5475cdd6ea9

'use client'

import type { KeyboardEvent, Ref } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SelectOption<V extends string = string> {
  disabled?: boolean
  label: string
  value: V
}

interface OptionSelectProps<V extends string = string> {
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  'aria-label'?: string
  className?: string
  defaultOpen?: boolean
  disabled?: boolean
  id?: string
  name?: string
  onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void
  onOpenChange?: (open: boolean) => void
  onValueChange?: (value: V) => void
  options: readonly SelectOption<V>[]
  /** Shown while `value` is `null`. */
  placeholder?: string
  ref?: Ref<HTMLButtonElement>
  size?: 'default' | 'sm'
  value: V | null
  [data: `data-${string}`]: string | undefined
}

function OptionSelect<V extends string>({
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  'aria-label': label,
  className,
  defaultOpen,
  disabled,
  id,
  name,
  onOpenChange,
  onValueChange,
  options,
  placeholder,
  value,
  ...props
}: OptionSelectProps<V>) {
  return (
    <Select
      aria-describedby={describedBy}
      aria-label={label}
      className={className}
      defaultOpen={defaultOpen}
      disabledKeys={options
        .filter((option) => option.disabled)
        .map((option) => option.value)}
      id={id}
      isDisabled={disabled}
      isInvalid={invalid}
      name={name}
      placeholder={placeholder}
      selectedKey={value}
      onOpenChange={onOpenChange}
      onSelectionChange={(key) => {
        const option = options.find((item) => item.value === key)
        if (option) onValueChange?.(option.value)
      }}
    >
      <SelectTrigger {...props}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} id={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export { OptionSelect }
export type { OptionSelectProps, SelectOption }
