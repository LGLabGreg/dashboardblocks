'use client'

import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import {
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  startTransition,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { flushSync } from 'react-dom'

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

type FormValues = Record<string, string | boolean>

type FormErrors<T extends FormValues> = Partial<Record<keyof T & string, string>>

type SubmitResult<T extends FormValues> = void | FormErrors<T>

interface UseSimpleFormOptions<T extends FormValues> {
  defaultValues: T
  onSubmit: (values: T) => SubmitResult<T> | Promise<SubmitResult<T>>
  validate?: (values: T) => FormErrors<T>
}

function focusFirstOf(ids: string[]) {
  const elements = ids
    .map((id) => document.getElementById(id))
    .filter((element) => element !== null)
  elements.sort((a, b) =>
    a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
  )
  elements[0]?.focus()
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
  const [refusedIds, setRefusedIds] = useState<string[] | null>(null)
  const focusedRefusal = useRef<string[] | null>(null)

  useEffect(() => {
    if (!refusedIds || refusedIds === focusedRefusal.current) return
    focusedRefusal.current = refusedIds
    focusFirstOf(refusedIds)
  }, [refusedIds])

  const names = Object.keys(defaultValues) as (keyof T & string)[]
  const clientErrors: FormErrors<T> = validate?.(values) ?? {}
  const errors: FormErrors<T> = {}
  for (const name of names) {
    const error =
      ((touched[name] || submitted) && clientErrors[name]) || serverErrors[name]
    if (error) errors[name] = error
  }
  const changedFields = names.filter((name) => values[name] !== savedValues[name])
  const isDirty = changedFields.length > 0

  const getId = (name: keyof T & string) => `${formId}-${name}`

  function focusFirst(invalid: (keyof T & string)[]) {
    focusFirstOf(invalid.map(getId))
  }

  function setValue<K extends keyof T & string>(name: K, value: T[K]) {
    setValues((current) => ({ ...current, [name]: value }))
    setServerErrors((current) => ({ ...current, [name]: undefined }))
  }

  function validateFields(fields: (keyof T & string)[]) {
    flushSync(() =>
      setTouched((current) => ({
        ...current,
        ...Object.fromEntries(fields.map((name) => [name, true])),
      })),
    )
    const invalid = fields.filter((name) => clientErrors[name])
    focusFirst(invalid)
    return invalid.length === 0
  }

  function field(name: keyof T & string) {
    const id = getId(name)
    return {
      'aria-describedby': errors[name] ? `${id}-error` : undefined,
      'aria-invalid': errors[name] ? true : undefined,
      id,
      name,
      onBlur: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const next = event.relatedTarget
        if (
          !event.currentTarget.value.trim() ||
          (next instanceof HTMLButtonElement &&
            next.type === 'submit' &&
            next.form === event.currentTarget.form)
        )
          return
        setTouched((current) => ({ ...current, [name]: true }))
      },
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setValue(name, event.target.value as T[typeof name]),
      value: String(values[name]),
    }
  }

  function select(name: keyof T & string) {
    const id = getId(name)
    return {
      'aria-describedby': errors[name] ? `${id}-error` : undefined,
      'aria-invalid': errors[name] ? true : undefined,
      id,
      name,
      onValueChange: (value: string) => setValue(name, value as T[typeof name]),
      value: String(values[name]),
    }
  }

  function error(name: keyof T & string) {
    return { children: errors[name], id: `${getId(name)}-error` }
  }

  /**
   * Validates, then saves in one transition, so a page the save refreshes and
   * `onSaved`'s own updates show together. Resolves to `true` once saved;
   * rejects when `onSubmit` throws.
   */
  async function submit(
    event?: FormEvent<HTMLFormElement>,
    { onSaved }: { onSaved?: () => void } = {},
  ) {
    event?.preventDefault()
    flushSync(() => setSubmitted(true))
    const invalid = names.filter((name) => clientErrors[name])
    if (invalid.length) {
      focusFirst(invalid)
      return false
    }
    setIsSubmitting(true)
    return new Promise<boolean>((resolve, reject) => {
      startTransition(async () => {
        try {
          const result = await onSubmit(values)
          if (result && hasErrors(result)) {
            startTransition(() => {
              setServerErrors(result)
              setRefusedIds(names.filter((name) => result[name]).map(getId))
            })
            resolve(false)
            return
          }
          startTransition(() => {
            setSavedValues(values)
            setSubmitted(false)
            setTouched({})
            onSaved?.()
          })
          resolve(true)
        } catch (error) {
          reject(error)
        } finally {
          startTransition(() => setIsSubmitting(false))
        }
      })
    })
  }

  function reset(next: T = savedValues) {
    setValues(next)
    setSavedValues(next)
    setTouched({})
    setSubmitted(false)
    setServerErrors({})
  }

  return {
    changedFields,
    error,
    errors,
    field,
    getId,
    isDirty,
    isSubmitting,
    reset,
    select,
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

function FormSection({ children, className, description, title }: FormSectionProps) {
  return (
    <section className={cn('@container border-t pt-4', className)}>
      <div className='grid gap-4 @3xl:grid-cols-[16rem_1fr] @3xl:gap-8'>
        <div className='flex flex-col gap-0.5'>
          <h3 className='text-sm font-medium'>{title}</h3>
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
  current: number
  steps: FormStep[]
}

function FormSteps({ className, current, steps }: FormStepsProps) {
  return (
    <ol className={cn('@container flex gap-3', className)}>
      {steps.map((step, index) => {
        const state =
          index < current ? 'done' : index === current ? 'current' : 'upcoming'
        return (
          <li
            key={step.title}
            aria-current={state === 'current' ? 'step' : undefined}
            data-state={state}
            className='group/step data-[state=upcoming]:border-border border-foreground flex min-w-0 flex-1 flex-col gap-0.5 border-t-2 pt-2'
          >
            <span className='flex min-w-0 items-center gap-1.5 text-sm'>
              {state === 'done' ? (
                <IconPlaceholder
                  lucide='CheckIcon'
                  tabler='IconCheck'
                  hugeicons='Tick02Icon'
                  phosphor='CheckIcon'
                  remixicon='RiCheckLine'
                  aria-hidden
                  className='text-muted-foreground size-3.5 shrink-0'
                />
              ) : (
                <span className='text-muted-foreground tabular-nums'>{index + 1}</span>
              )}
              <span className='group-data-[state=upcoming]/step:text-muted-foreground truncate font-medium'>
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
              <span className='text-muted-foreground hidden truncate text-xs @md:block'>
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
  footer: ReactNode
  onOpenChange: (open: boolean) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  open: boolean
  title: string
}

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
  const [bodyInset, setBodyInset] = useState<string>()
  const measureHeader = useCallback((header: HTMLDivElement | null) => {
    if (header) setBodyInset(getComputedStyle(header).paddingInlineStart)
  }, [])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={cn('sm:max-w-md', className)}>
        <form
          method='post'
          noValidate
          onSubmit={onSubmit}
          className='flex min-h-0 flex-1 flex-col'
        >
          <SheetHeader ref={measureHeader}>
            <SheetTitle>{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
          <div
            className='min-h-0 flex-1 overflow-y-auto px-4 py-2'
            style={{ paddingInline: bodyInset }}
          >
            {children}
          </div>
          <SheetFooter>{footer}</SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

interface InlineEditFieldProps {
  className?: string
  emptyLabel?: string
  label: string
  onSave: (value: string) => string | void | Promise<string | void>
  type?: 'email' | 'tel' | 'text' | 'url'
  validate?: (value: string) => string | undefined
  value: string
}

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
      startTransition(() => {
        if (failed) setError(failed)
        else cancel()
      })
    } finally {
      startTransition(() => setIsSaving(false))
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
    <div className={cn('@container py-2.5', className)}>
      <div className='grid gap-1.5 @md:grid-cols-[10rem_minmax(0,1fr)] @md:items-start @md:gap-4'>
        <span id={`${id}-label`} className='text-muted-foreground pt-2 text-sm'>
          {label}
        </span>
        {editing ? (
          <div className='flex flex-col gap-1.5'>
            <div className='flex gap-2'>
              <Input
                // oxlint-disable-next-line jsx-a11y/no-autofocus -- the field replaces the Edit button the person just pressed
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
    </div>
  )
}

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
