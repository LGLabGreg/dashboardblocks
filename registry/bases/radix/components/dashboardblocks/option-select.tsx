// Override of registry/components/dashboardblocks/option-select.tsx for Radix UI
// source-hash: 6d98dc21ea8a

'use client'

import type { KeyboardEvent, ReactNode, Ref } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SelectOption<V extends string = string> {
  disabled?: boolean
  /** Shown before the label, in the menu and once picked, such as a country's flag. */
  icon?: ReactNode
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

function OptionLabel({ option }: { option: SelectOption }) {
  if (!option.icon) return option.label
  return (
    <span className='flex min-w-0 items-center gap-2'>
      {option.icon}
      <span className='truncate'>{option.label}</span>
    </span>
  )
}

function OptionSelect<V extends string>({
  defaultOpen,
  disabled,
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
      defaultOpen={defaultOpen}
      disabled={disabled}
      name={name}
      value={value ?? ''}
      onOpenChange={onOpenChange}
      onValueChange={(next) => {
        const option = options.find((item) => item.value === next)
        if (option) onValueChange?.(option.value)
      }}
    >
      <SelectTrigger {...props}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
            <OptionLabel option={option} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export { OptionSelect }
export type { OptionSelectProps, SelectOption }
