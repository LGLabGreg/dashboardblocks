'use client'

import { renderTag } from '@/registry/components/dashboardblocks/tag'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type ReactNode, useId } from 'react'

import { FieldLabel } from '@/components/ui/field'

import { cn } from '@/lib/utils'

interface ChoiceCardOption {
  /** Right of the title, such as a price or a limit: a value people compare between cards. */
  aside?: ReactNode
  /** A short label beside the title, such as `Popular`; a string is drawn as a `Tag`. */
  badge?: ReactNode
  description?: ReactNode
  disabled?: boolean
  icon?: ReactNode
  title: string
  value: string
}

interface ChoiceCardsBaseProps {
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  'aria-label'?: string
  'aria-labelledby'?: string
  /** Set the columns here, such as `@md:grid-cols-2`. */
  className?: string
  /** Given to the first option's input, so a label or validation can focus it. */
  id?: string
  name?: string
  options: ChoiceCardOption[]
}

interface SingleChoiceCardsProps extends ChoiceCardsBaseProps {
  onValueChange: (value: string) => void
  /** @default 'radio' */
  type?: 'radio'
  value: string
}

interface MultipleChoiceCardsProps extends ChoiceCardsBaseProps {
  onValueChange: (value: string[]) => void
  type: 'checkbox'
  value: readonly string[]
}

type ChoiceCardsProps = SingleChoiceCardsProps | MultipleChoiceCardsProps

function ChoiceCards(props: ChoiceCardsProps) {
  const { className, id, name, options } = props
  const generatedName = useId()
  const multiple = props.type === 'checkbox'
  const selected = props.type === 'checkbox' ? props.value : [props.value]

  function change(value: string, checked: boolean) {
    if (props.type === 'checkbox') {
      const picked = props.value
      props.onValueChange(
        options
          .map((option) => option.value)
          .filter((item) => (item === value ? checked : picked.includes(item))),
      )
    } else if (checked) {
      props.onValueChange(value)
    }
  }

  return (
    <div
      data-slot='choice-cards'
      role={multiple ? 'group' : 'radiogroup'}
      aria-describedby={props['aria-describedby']}
      aria-invalid={props['aria-invalid']}
      aria-label={props['aria-label']}
      aria-labelledby={props['aria-labelledby']}
      className={cn('group/choice-cards grid gap-3', className)}
    >
      {options.map((option, index) => {
        const checked = selected.includes(option.value)
        const inputId = index === 0 && id ? id : `${generatedName}-${index}`
        return (
          <FieldLabel
            key={option.value}
            htmlFor={inputId}
            className='group-aria-invalid/choice-cards:border-destructive/60 cursor-pointer has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50'
          >
            <span data-slot='field' className='flex w-full items-start gap-3'>
              <input
                id={inputId}
                type={multiple ? 'checkbox' : 'radio'}
                name={name ?? generatedName}
                value={option.value}
                checked={checked}
                disabled={option.disabled}
                data-checked={checked || undefined}
                aria-labelledby={`${inputId}-title`}
                aria-describedby={
                  [
                    option.aside ? `${inputId}-aside` : '',
                    option.description ? `${inputId}-description` : '',
                  ]
                    .filter(Boolean)
                    .join(' ') || undefined
                }
                onChange={(event) => change(option.value, event.target.checked)}
                className='sr-only'
              />
              {option.icon && (
                <span
                  aria-hidden
                  className='bg-muted text-foreground group-has-[:checked]/field-label:bg-primary group-has-[:checked]/field-label:text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-md transition-colors [&_svg]:size-4'
                >
                  {option.icon}
                </span>
              )}
              <span className='flex min-w-0 flex-1 flex-col gap-1'>
                <span className='flex flex-wrap items-center gap-x-2 gap-y-1'>
                  <span id={`${inputId}-title`} className='text-sm font-medium'>
                    {option.title}
                  </span>
                  {option.badge && renderTag(option.badge)}
                  {option.aside && (
                    <span
                      id={`${inputId}-aside`}
                      className='ms-auto text-end text-sm font-medium whitespace-nowrap tabular-nums'
                    >
                      {option.aside}
                    </span>
                  )}
                </span>
                {option.description && (
                  <span
                    id={`${inputId}-description`}
                    className='text-muted-foreground group-has-[:checked]/field-label:text-foreground/70 text-sm leading-snug font-normal text-pretty'
                  >
                    {option.description}
                  </span>
                )}
              </span>
              <ChoiceIndicator multiple={multiple} />
            </span>
          </FieldLabel>
        )
      })}
    </div>
  )
}

function ChoiceIndicator({ multiple }: { multiple: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'border-input dark:bg-input/30 group-has-[:checked]/field-label:border-primary group-has-[:checked]/field-label:bg-primary dark:group-has-[:checked]/field-label:bg-primary text-primary-foreground mt-0.5 flex size-4 shrink-0 items-center justify-center border shadow-xs transition-colors',
        multiple ? 'rounded-[4px]' : 'rounded-full',
      )}
    >
      {multiple ? (
        <IconPlaceholder
          lucide='CheckIcon'
          tabler='IconCheck'
          hugeicons='Tick02Icon'
          phosphor='CheckIcon'
          remixicon='RiCheckLine'
          strokeWidth={3}
          className='hidden size-3 group-has-[:checked]/field-label:block'
        />
      ) : (
        <span className='bg-primary-foreground hidden size-1.5 rounded-full group-has-[:checked]/field-label:block' />
      )}
    </span>
  )
}

export { ChoiceCards }

export type { ChoiceCardOption, ChoiceCardsProps }
