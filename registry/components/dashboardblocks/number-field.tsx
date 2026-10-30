'use client'

import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import {
  formatNumber,
  getCurrencyDigits,
  getCurrencySymbol,
} from '@/registry/lib/dashboardblocks/format'
import { type KeyboardEvent, type ReactNode, useState } from 'react'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'

import { cn } from '@/lib/utils'

interface NumberFieldProps {
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  'aria-label'?: string
  'aria-labelledby'?: string
  /** Set the width here, such as `@md:w-48`: a `Field` makes it full width. */
  className?: string
  /** A currency code, such as `EUR`: its symbol goes before the value, and the value keeps its cents. */
  currency?: string
  /** Names the minus button. @default 'Decrease' */
  decrementLabel?: string
  disabled?: boolean
  id?: string
  /** Names the plus button. @default 'Increase' */
  incrementLabel?: string
  max?: number
  min?: number
  name?: string
  /** Called as the person types, with `null` while the field is empty. A value outside `min` and `max` is brought back inside it when the field loses focus. */
  onValueChange: (value: number | null) => void
  placeholder?: string
  /** With a `currency`: `exact` keeps its cents (`1,250.00`), `whole` rounds to whole units (`1,250`). @default 'exact' */
  precision?: 'exact' | 'whole'
  readOnly?: boolean
  /** The step of the arrow keys and the minus and plus buttons, which also sets the decimals kept. @default 1 */
  step?: number
  /** Shows minus and plus buttons, such as for a number of seats. */
  stepper?: boolean
  /** After the value, such as `seats` or `a month`. */
  unit?: ReactNode
  value: number | null
}

function decimalsOf(step: number) {
  const [, decimals = ''] = String(step).split('.')
  return decimals.length
}

function parse(text: string) {
  const cleaned = text.replace(/[^\d.-]/g, '')
  if (!/\d/.test(cleaned)) return null
  const value = Number(cleaned)
  return Number.isFinite(value) ? value : null
}

function NumberField({
  className,
  currency,
  decrementLabel = 'Decrease',
  disabled,
  incrementLabel = 'Increase',
  max,
  min,
  onValueChange,
  precision = 'exact',
  readOnly,
  step = 1,
  stepper = false,
  unit,
  value,
  ...props
}: NumberFieldProps) {
  const [text, setText] = useState<string | null>(null)
  const decimals =
    currency && precision === 'exact' ? getCurrencyDigits(currency) : decimalsOf(step)

  function format(next: number) {
    return formatNumber(next, {
      maximumFractionDigits: decimals,
      minimumFractionDigits: currency && precision === 'exact' ? decimals : 0,
    })
  }

  function fit(next: number) {
    const rounded = Number(next.toFixed(decimals))
    return Math.min(max ?? Infinity, Math.max(min ?? -Infinity, rounded))
  }

  function stepBy(direction: 1 | -1) {
    const next = fit((value ?? min ?? 0) + direction * step)
    setText(null)
    onValueChange(next)
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (readOnly) return
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
    event.preventDefault()
    stepBy(event.key === 'ArrowUp' ? 1 : -1)
  }

  const shown = text ?? (value === null ? '' : format(value))

  return (
    <InputGroup data-slot='number-field' className={cn('w-full', className)}>
      {currency && (
        <InputGroupAddon>
          <InputGroupText>{getCurrencySymbol(currency)}</InputGroupText>
        </InputGroupAddon>
      )}
      <InputGroupInput
        {...props}
        autoComplete='off'
        disabled={disabled}
        readOnly={readOnly}
        inputMode={decimals > 0 ? 'decimal' : 'numeric'}
        value={shown}
        onChange={(event) => {
          const typed = event.target.value.replace(/[^\d.,-]/g, '')
          setText(typed)
          onValueChange(parse(typed))
        }}
        onBlur={() => {
          setText(null)
          if (value !== null && fit(value) !== value) onValueChange(fit(value))
        }}
        onKeyDown={onKeyDown}
        className='tabular-nums'
      />
      {(unit || stepper) && (
        <InputGroupAddon align='inline-end'>
          {unit && <InputGroupText>{unit}</InputGroupText>}
          {stepper && (
            <>
              <InputGroupButton
                size='icon-xs'
                aria-label={decrementLabel}
                disabled={
                  disabled ||
                  readOnly ||
                  (min !== undefined && value !== null && value <= min)
                }
                onClick={() => stepBy(-1)}
              >
                <IconPlaceholder
                  lucide='MinusIcon'
                  tabler='IconMinus'
                  hugeicons='MinusSignIcon'
                  phosphor='MinusIcon'
                  remixicon='RiSubtractLine'
                />
              </InputGroupButton>
              <InputGroupButton
                size='icon-xs'
                aria-label={incrementLabel}
                disabled={
                  disabled ||
                  readOnly ||
                  (max !== undefined && value !== null && value >= max)
                }
                onClick={() => stepBy(1)}
              >
                <IconPlaceholder
                  lucide='PlusIcon'
                  tabler='IconPlus'
                  hugeicons='PlusSignIcon'
                  phosphor='PlusIcon'
                  remixicon='RiAddLine'
                />
              </InputGroupButton>
            </>
          )}
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}

export { NumberField }

export type { NumberFieldProps }
