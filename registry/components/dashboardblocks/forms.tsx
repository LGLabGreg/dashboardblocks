'use client'

import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  useId,
  useState,
} from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { cn } from '@/lib/utils'

/*
 * Form state without a form library: values, validation on blur and submit,
 * errors returned by the server, and dirty and submitting flags. To use React
 * Hook Form or TanStack Form instead, keep the layout and swap `useSimpleForm`
 * for the library's hook.
 */

type FormValues = Record<string, string | boolean>

/** An error message per invalid field. Leave valid fields out. */
type FormErrors<T extends FormValues> = Partial<Record<keyof T & string, string>>

type SubmitResult<T extends FormValues> = void | FormErrors<T>

interface UseSimpleFormOptions<T extends FormValues> {
  defaultValues: T
  /**
   * Saves the values. Return errors, such as "email already in use" from the
   * server, to show them on their fields.
   */
  onSubmit: (values: T) => SubmitResult<T> | Promise<SubmitResult<T>>
  /** Checks the values. Runs when a field loses focus and on submit. */
  validate?: (values: T) => FormErrors<T>
}

function hasErrors(errors: Record<string, string | undefined>) {
  return Object.values(errors).some(Boolean)
}

function useSimpleForm<T extends FormValues>({
  defaultValues,
  onSubmit,
  validate,
}: UseSimpleFormOptions<T>) {
  const formId = useId()
  const [values, setValues] = useState(defaultValues)
  const [savedValues, setSavedValues] = useState(defaultValues)
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [serverErrors, setServerErrors] = useState<FormErrors<T>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const names = Object.keys(defaultValues) as (keyof T & string)[]
  const clientErrors: FormErrors<T> = validate?.(values) ?? {}
  const errors: FormErrors<T> = {}
  for (const name of names) {
    const error =
      ((touched[name] || submitted) && clientErrors[name]) || serverErrors[name]
    if (error) errors[name] = error
  }
  const isDirty = names.some((name) => values[name] !== savedValues[name])

  const getId = (name: keyof T & string) => `${formId}-${name}`

  function setValue<K extends keyof T & string>(name: K, value: T[K]) {
    setValues((current) => ({ ...current, [name]: value }))
    setServerErrors((current) => ({ ...current, [name]: undefined }))
  }

  /** Shows the errors for `fields` and says whether they're valid, such as before a wizard's next step. */
  function validateFields(fields: (keyof T & string)[]) {
    setTouched((current) => ({
      ...current,
      ...Object.fromEntries(fields.map((name) => [name, true])),
    }))
    const invalid = fields.find((name) => clientErrors[name])
    if (invalid) document.getElementById(getId(invalid))?.focus()
    return !invalid
  }

  /** Props for an Input, Textarea or NativeSelect that edits a text value. */
  function field(name: keyof T & string) {
    const id = getId(name)
    return {
      'aria-describedby': errors[name] ? `${id}-error` : undefined,
      'aria-invalid': errors[name] ? true : undefined,
      id,
      name,
      onBlur: () => setTouched((current) => ({ ...current, [name]: true })),
      onChange: (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
      ) => setValue(name, event.target.value as T[typeof name]),
      value: String(values[name]),
    }
  }

  /** Props for a field's FieldError, so its input can point to it. */
  function error(name: keyof T & string) {
    return { children: errors[name], id: `${getId(name)}-error` }
  }

  async function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    setSubmitted(true)
    const invalid = names.find((name) => clientErrors[name])
    if (invalid) {
      document.getElementById(getId(invalid))?.focus()
      return false
    }
    setIsSubmitting(true)
    try {
      const result = await onSubmit(values)
      if (result && hasErrors(result)) {
        setServerErrors(result)
        const first = names.find((name) => result[name])
        if (first) document.getElementById(getId(first))?.focus()
        return false
      }
      setSavedValues(values)
      setSubmitted(false)
      setTouched({})
      return true
    } finally {
      setIsSubmitting(false)
    }
  }

  /** Puts back the last saved values, or starts over from `next`. */
  function reset(next: T = savedValues) {
    setValues(next)
    setSavedValues(next)
    setTouched({})
    setSubmitted(false)
    setServerErrors({})
  }

  return {
    error,
    errors,
    field,
    getId,
    isDirty,
    isSubmitting,
    reset,
    setValue,
    submit,
    validateFields,
    values,
  }
}

interface FormSectionProps {
  children: ReactNode
  className?: string
  description?: ReactNode
  title: string
}

/** A group of fields with its title and description beside them on wide screens. */
function FormSection({ children, className, description, title }: FormSectionProps) {
  return (
    <section className={cn('@container', className)}>
      <div className='grid gap-4 @3xl:grid-cols-[16rem_1fr] @3xl:gap-8'>
        <div className='flex flex-col gap-1'>
          <h3 className='font-medium'>{title}</h3>
          {description && (
            <p className='text-muted-foreground text-sm text-pretty'>{description}</p>
          )}
        </div>
        <div className='min-w-0'>{children}</div>
      </div>
    </section>
  )
}

interface SaveBarProps {
  className?: string
  isDirty: boolean
  isSubmitting: boolean
  /** @default 'You have unsaved changes' */
  message?: string
  onDiscard: () => void
  /** @default 'Save changes' */
  saveLabel?: string
}

/**
 * A bar that sticks to the bottom of the form while there are unsaved changes.
 * Put it inside the <form>: its save button submits it.
 */
function SaveBar({
  className,
  isDirty,
  isSubmitting,
  message = 'You have unsaved changes',
  onDiscard,
  saveLabel = 'Save changes',
}: SaveBarProps) {
  if (!isDirty && !isSubmitting) return null
  return (
    <div
      role='region'
      aria-label='Unsaved changes'
      className={cn(
        'bg-popover text-popover-foreground animate-in fade-in slide-in-from-bottom-2 sticky bottom-4 z-10 mx-auto flex w-full max-w-xl items-center justify-between gap-3 rounded-xl p-2 pl-4 shadow-lg ring-1 ring-foreground/10',
        className,
      )}
    >
      <p className='text-sm'>{message}</p>
      <div className='flex gap-2'>
        <Button type='button' variant='ghost' disabled={isSubmitting} onClick={onDiscard}>
          Discard
        </Button>
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : saveLabel}
        </Button>
      </div>
    </div>
  )
}

interface FormStep {
  description?: string
  title: string
}

interface FormStepsProps {
  className?: string
  /** The index of the current step. */
  current: number
  steps: FormStep[]
}

/** Numbered steps for a multi-step form, with done steps ticked. */
function FormSteps({ className, current, steps }: FormStepsProps) {
  return (
    <ol className={cn('flex gap-2', className)}>
      {steps.map((step, index) => {
        const state =
          index < current ? 'done' : index === current ? 'current' : 'upcoming'
        return (
          <li
            key={step.title}
            aria-current={state === 'current' ? 'step' : undefined}
            data-state={state}
            className='group/step flex min-w-0 flex-1 flex-col gap-2'
          >
            <span className='bg-muted group-data-[state=current]/step:bg-primary group-data-[state=done]/step:bg-primary h-1 rounded-full' />
            <span className='flex min-w-0 items-center gap-1.5 text-sm'>
              {state === 'done' ? (
                <IconPlaceholder
                  lucide='CircleCheckIcon'
                  tabler='IconCircleCheckFilled'
                  hugeicons='CheckmarkCircle01Icon'
                  phosphor='CheckCircleIcon'
                  remixicon='RiCheckboxCircleFill'
                  className='text-primary size-4 shrink-0'
                />
              ) : (
                <span className='text-muted-foreground group-data-[state=current]/step:text-foreground text-xs tabular-nums'>
                  {index + 1}.
                </span>
              )}
              <span className='text-muted-foreground group-data-[state=current]/step:text-foreground truncate font-medium'>
                {step.title}
              </span>
              <span className='sr-only'>
                {state === 'done'
                  ? ', done'
                  : state === 'upcoming'
                    ? ', not started'
                    : ''}
              </span>
            </span>
            {step.description && (
              <span className='text-muted-foreground hidden text-xs sm:block'>
                {step.description}
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}

interface FormSheetProps {
  children: ReactNode
  className?: string
  description?: ReactNode
  /** The buttons, such as cancel and a submit button. */
  footer: ReactNode
  onOpenChange: (open: boolean) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  open: boolean
  title: string
}

/** A form in a panel that slides in from the side, for creating or editing a record. */
function FormSheet({
  children,
  className,
  description,
  footer,
  onOpenChange,
  onSubmit,
  open,
  title,
}: FormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={cn('sm:max-w-md', className)}>
        <form noValidate onSubmit={onSubmit} className='flex min-h-0 flex-1 flex-col'>
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
          <div className='min-h-0 flex-1 overflow-y-auto px-4 py-2'>{children}</div>
          <SheetFooter>{footer}</SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

interface InlineEditFieldProps {
  className?: string
  /** Shown when the value is empty. @default 'Not set' */
  emptyLabel?: string
  label: string
  /** Saves the value. Return an error message to keep editing and show it. */
  onSave: (value: string) => string | void | Promise<string | void>
  type?: 'email' | 'tel' | 'text' | 'url'
  /** Returns an error message when the value is invalid. */
  validate?: (value: string) => string | undefined
  value: string
}

/**
 * A label and value that turns into an input to edit it. Enter saves and
 * Escape cancels.
 */
function InlineEditField({
  className,
  emptyLabel = 'Not set',
  label,
  onSave,
  type = 'text',
  validate,
  value,
}: InlineEditFieldProps) {
  const id = useId()
  const [draft, setDraft] = useState<string | null>(null)
  const [error, setError] = useState<string>()
  const [isSaving, setIsSaving] = useState(false)
  const editing = draft !== null

  function cancel() {
    setDraft(null)
    setError(undefined)
  }

  async function save() {
    if (draft === null) return
    if (draft === value) return cancel()
    const invalid = validate?.(draft)
    if (invalid) return setError(invalid)
    setIsSaving(true)
    try {
      const failed = await onSave(draft)
      if (failed) setError(failed)
      else cancel()
    } finally {
      setIsSaving(false)
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      void save()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      cancel()
    }
  }

  return (
    <div
      className={cn(
        'grid gap-1.5 py-3 sm:grid-cols-[10rem_1fr] sm:items-start sm:gap-4',
        className,
      )}
    >
      <span id={`${id}-label`} className='text-muted-foreground pt-2 text-sm'>
        {label}
      </span>
      {editing ? (
        <div className='flex flex-col gap-1.5'>
          <div className='flex gap-2'>
            <Input
              // Focus moves into the field the user just asked to edit.
              // oxlint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              type={type}
              aria-labelledby={`${id}-label`}
              value={draft}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              disabled={isSaving}
              onChange={(event) => {
                setDraft(event.target.value)
                setError(undefined)
              }}
              onKeyDown={onKeyDown}
            />
            <Button type='button' disabled={isSaving} onClick={() => void save()}>
              {isSaving ? 'Saving…' : 'Save'}
            </Button>
            <Button type='button' variant='ghost' disabled={isSaving} onClick={cancel}>
              Cancel
            </Button>
          </div>
          {error && (
            <p id={`${id}-error`} role='alert' className='text-destructive text-sm'>
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className='flex min-h-9 items-center justify-between gap-2'>
          <span className={cn('truncate text-sm', !value && 'text-muted-foreground')}>
            {value || emptyLabel}
          </span>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            aria-label={`Edit ${label.toLowerCase()}`}
            onClick={() => setDraft(value)}
          >
            <IconPlaceholder
              lucide='PencilIcon'
              tabler='IconPencil'
              hugeicons='PencilEdit02Icon'
              phosphor='PencilSimpleIcon'
              remixicon='RiPencilLine'
            />
            Edit
          </Button>
        </div>
      )}
    </div>
  )
}

/** A loose email check: something@something.something. */
function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export {
  FormSection,
  FormSheet,
  FormSteps,
  InlineEditField,
  isEmail,
  SaveBar,
  useSimpleForm,
}

export type {
  FormErrors,
  FormSectionProps,
  FormSheetProps,
  FormStep,
  FormStepsProps,
  FormValues,
  InlineEditFieldProps,
  SaveBarProps,
  UseSimpleFormOptions,
}
