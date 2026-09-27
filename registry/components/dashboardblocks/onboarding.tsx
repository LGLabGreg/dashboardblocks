'use client'

import { isEmail } from '@/registry/components/dashboardblocks/forms'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import {
  type ClipboardEvent,
  type FormEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

import { cn } from '@/lib/utils'

interface OnboardingLayoutProps {
  /** Top right, such as the signed-in email and a sign-out link. */
  aside?: ReactNode
  /** Your logo and product name, top left. */
  brand: ReactNode
  children: ReactNode
  className?: string
  description?: ReactNode
  /** Under the content, pinned to the bottom while the step scrolls. Usually OnboardingActions. */
  footer?: ReactNode
  /** Wraps the content and footer in a form, so Enter and a submit button in the footer run it. */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void
  /** Above the title, such as FormSteps. */
  progress?: ReactNode
  /**
   * The current step. When it changes, focus moves to the new step's title,
   * so keyboard and screen reader users start from the top.
   */
  step?: number | string
  title: ReactNode
}

/**
 * A full-page frame for first-run setup: your brand, the step's progress,
 * title and content, and its actions. The actions stay in reach at the bottom
 * of small screens.
 */
function OnboardingLayout({
  aside,
  brand,
  children,
  className,
  description,
  footer,
  onSubmit,
  progress,
  step,
  title,
}: OnboardingLayoutProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const shownStep = useRef(step)

  // Only after a step change, never on mount.
  useEffect(() => {
    if (shownStep.current === step) return
    shownStep.current = step
    headingRef.current?.focus()
  }, [step])

  const body = (
    <>
      {progress && <div className='mb-8'>{progress}</div>}
      <div className='mb-8 flex flex-col gap-2'>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className='text-xl font-semibold tracking-tight text-balance outline-none sm:text-2xl'
        >
          {title}
        </h1>
        {description && (
          <p className='text-muted-foreground text-pretty'>{description}</p>
        )}
      </div>
      <div className='flex-1'>{children}</div>
      {footer && (
        <div className='bg-background sticky bottom-0 z-10 mt-8 border-t py-4'>
          {footer}
        </div>
      )}
    </>
  )
  const bodyClassName =
    'mx-auto flex w-full max-w-xl flex-1 flex-col pt-4 sm:mb-12 sm:flex-none sm:pt-10'

  return (
    <div className={cn('bg-background flex min-h-svh flex-col', className)}>
      <header className='flex h-16 shrink-0 items-center justify-between gap-4 px-4 sm:px-6'>
        <div className='flex min-w-0 items-center gap-2 text-sm font-medium'>{brand}</div>
        {aside && (
          <div className='text-muted-foreground flex min-w-0 items-center gap-3 text-sm'>
            {aside}
          </div>
        )}
      </header>
      <main className='flex flex-1 flex-col px-4 sm:px-6'>
        {onSubmit ? (
          <form noValidate onSubmit={onSubmit} className={bodyClassName}>
            {body}
          </form>
        ) : (
          <div className={bodyClassName}>{body}</div>
        )}
      </main>
    </div>
  )
}

interface OnboardingActionsProps {
  /** @default 'Back' */
  backLabel?: string
  className?: string
  /** @default 'Continue' */
  continueLabel?: string
  /** Leave out on the first step to hide Back. */
  onBack?: () => void
  /** Leave out to make Continue submit the form. */
  onContinue?: () => void
  /** Leave out to hide Skip. Offer it on optional steps. */
  onSkip?: () => void
  /** Disables the buttons and shows `pendingLabel` while the step saves. */
  pending?: boolean
  /** @default 'Saving…' */
  pendingLabel?: string
  /** @default 'Skip for now' */
  skipLabel?: string
}

/** Back on the left, and Skip and Continue on the right. */
function OnboardingActions({
  backLabel = 'Back',
  className,
  continueLabel = 'Continue',
  onBack,
  onContinue,
  onSkip,
  pending = false,
  pendingLabel = 'Saving…',
  skipLabel = 'Skip for now',
}: OnboardingActionsProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {onBack && (
        <Button type='button' variant='ghost' disabled={pending} onClick={onBack}>
          {backLabel}
        </Button>
      )}
      <div className='ml-auto flex items-center gap-2'>
        {onSkip && (
          <Button type='button' variant='ghost' disabled={pending} onClick={onSkip}>
            {skipLabel}
          </Button>
        )}
        <Button
          type={onContinue ? 'button' : 'submit'}
          disabled={pending}
          onClick={onContinue}
        >
          {pending ? pendingLabel : continueLabel}
          {!pending && (
            <IconPlaceholder
              lucide='ArrowRightIcon'
              tabler='IconArrowRight'
              hugeicons='ArrowRight01Icon'
              phosphor='ArrowRightIcon'
              remixicon='RiArrowRightLine'
              data-icon='inline-end'
            />
          )}
        </Button>
      </div>
    </div>
  )
}

interface ChoiceCardOption {
  /** Beside the title, such as a "Popular" badge. */
  badge?: ReactNode
  description?: ReactNode
  disabled?: boolean
  /** An icon or logo element, shown in a tile before the title. */
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
  /** The inputs' name. Leave out to generate one. */
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
  value: string[]
}

type ChoiceCardsProps = SingleChoiceCardsProps | MultipleChoiceCardsProps

/**
 * Large selectable cards with an icon, a title and a description. Built on
 * native radio buttons or checkboxes, so Tab reaches the group and the arrow
 * keys move between radio options. Name the group with `aria-labelledby`.
 */
function ChoiceCards(props: ChoiceCardsProps) {
  const { className, id, name, options } = props
  const generatedName = useId()
  const multiple = props.type === 'checkbox'
  const selected = props.type === 'checkbox' ? props.value : [props.value]

  function change(value: string, checked: boolean) {
    if (props.type === 'checkbox') {
      props.onValueChange(
        checked ? [...props.value, value] : props.value.filter((item) => item !== value),
      )
    } else if (checked) {
      props.onValueChange(value)
    }
  }

  return (
    <div
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
                  option.description ? `${inputId}-description` : undefined
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
                <span className='flex flex-wrap items-center gap-2'>
                  <span id={`${inputId}-title`} className='text-sm font-medium'>
                    {option.title}
                  </span>
                  {option.badge}
                </span>
                {option.description && (
                  <span
                    id={`${inputId}-description`}
                    className='text-muted-foreground text-sm leading-snug font-normal text-pretty'
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

/** The radio dot or checkbox tick in a choice card's corner. */
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

interface Invite {
  email: string
  id: string
  /** One of the `roles` values. */
  role: string
}

interface InviteListProps {
  /** @default 'Add another' */
  addLabel?: string
  className?: string
  /** An error per invite id, such as from getInviteErrors or your API. */
  errors?: Partial<Record<string, string>>
  /** Starts each email input's id, `${id}-${invite.id}`, so validation can focus a row. */
  id?: string
  /** The most rows. @default 10 */
  max?: number
  onValueChange: (invites: Invite[]) => void
  /** @default 'name@company.com' */
  placeholder?: string
  roles: { label: string; value: string }[]
  /** Keep at least one row. */
  value: Invite[]
}

/**
 * Rows of an email address and a role, to invite people. Pasting a list of
 * addresses into an email field fills a row for each one.
 */
function InviteList({
  addLabel = 'Add another',
  className,
  errors = {},
  id,
  max = 10,
  onValueChange,
  placeholder = 'name@company.com',
  roles,
  value,
}: InviteListProps) {
  const baseId = useId()
  const created = useRef(0)
  const focusNext = useRef<string | null>(null)
  const [announcement, setAnnouncement] = useState('')

  const emailId = (invite: Invite) => `${id ?? baseId}-${invite.id}`

  // Moves focus after adding or removing a row: the change the user just made.
  useEffect(() => {
    if (!focusNext.current) return
    document.getElementById(focusNext.current)?.focus()
    focusNext.current = null
  }, [value])

  function createInvite(email: string, role: string): Invite {
    created.current += 1
    return { email, id: `${baseId}-new-${created.current}`, role }
  }

  function update(index: number, change: Partial<Invite>) {
    onValueChange(
      value.map((invite, i) => (i === index ? { ...invite, ...change } : invite)),
    )
  }

  function add() {
    const role = value.at(-1)?.role ?? roles[0]?.value ?? ''
    const invite = createInvite('', role)
    focusNext.current = emailId(invite)
    onValueChange([...value, invite])
  }

  function remove(index: number) {
    const next = value.filter((_, i) => i !== index)
    focusNext.current = emailId(next[Math.min(index, next.length - 1)])
    onValueChange(next)
    setAnnouncement(
      value[index].email
        ? `Removed ${value[index].email}`
        : `Removed invite ${index + 1}`,
    )
  }

  function paste(event: ClipboardEvent<HTMLInputElement>, index: number) {
    const emails = event.clipboardData
      .getData('text')
      .split(/[\s,;]+/)
      .map((part) => part.replace(/^<|>$/g, ''))
      .filter(Boolean)
    if (emails.length < 2) return
    event.preventDefault()
    const current = value[index]
    const room = max - value.length + 1
    const added = emails
      .slice(0, room)
      .map((email, i) =>
        i === 0 ? { ...current, email } : createInvite(email, current.role),
      )
    onValueChange([...value.slice(0, index), ...added, ...value.slice(index + 1)])
    setAnnouncement(
      emails.length > room
        ? `Added ${added.length} of ${emails.length} addresses. You can invite up to ${max} people at once.`
        : `Added ${added.length} addresses`,
    )
  }

  return (
    <div className={cn('@container', className)}>
      <div className='grid grid-cols-[minmax(0,1fr)_6.5rem_auto] gap-x-2 gap-y-3 @sm:grid-cols-[minmax(0,1fr)_8rem_auto]'>
        {/* Column headings. Each control has its own label. */}
        <span aria-hidden className='text-sm font-medium'>
          Email
        </span>
        <span aria-hidden className='col-span-2 text-sm font-medium'>
          Role
        </span>
        <ul className='col-span-full grid grid-cols-subgrid gap-y-3'>
          {value.map((invite, index) => {
            const inputId = emailId(invite)
            const error = errors[invite.id]
            const label = invite.email.trim() || `invite ${index + 1}`
            return (
              <li
                key={invite.id}
                className='col-span-full grid grid-cols-subgrid items-start gap-y-2'
              >
                <Input
                  id={inputId}
                  type='email'
                  autoComplete='off'
                  spellCheck={false}
                  aria-label={`Email ${index + 1}`}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? `${inputId}-error` : undefined}
                  placeholder={placeholder}
                  value={invite.email}
                  onChange={(event) => update(index, { email: event.target.value })}
                  onPaste={(event) => paste(event, index)}
                />
                <NativeSelect
                  className='w-full'
                  aria-label={`Role for ${label}`}
                  value={invite.role}
                  onChange={(event) => update(index, { role: event.target.value })}
                >
                  {roles.map((role) => (
                    <NativeSelectOption key={role.value} value={role.value}>
                      {role.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  aria-label={`Remove ${label}`}
                  // One row always stays, so there is somewhere to type.
                  className={cn(value.length === 1 && 'invisible')}
                  onClick={() => remove(index)}
                >
                  <IconPlaceholder
                    lucide='XIcon'
                    tabler='IconX'
                    hugeicons='Cancel01Icon'
                    phosphor='XIcon'
                    remixicon='RiCloseLine'
                  />
                </Button>
                <FieldError id={`${inputId}-error`} className='col-span-full'>
                  {error}
                </FieldError>
              </li>
            )
          })}
        </ul>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='col-span-full justify-self-start'
          disabled={value.length >= max}
          onClick={add}
        >
          <IconPlaceholder
            lucide='PlusIcon'
            tabler='IconPlus'
            hugeicons='PlusSignIcon'
            phosphor='PlusIcon'
            remixicon='RiAddLine'
            data-icon='inline-start'
          />
          {addLabel}
        </Button>
      </div>
      <p role='status' className='sr-only'>
        {announcement}
      </p>
    </div>
  )
}

/**
 * An error per invite: a valid address, not added twice and not already a
 * member. Blank rows are fine; drop them with getFilledInvites.
 */
function getInviteErrors(
  invites: Invite[],
  { members = [] }: { /** Emails already in the workspace. */ members?: string[] } = {},
) {
  const errors: Partial<Record<string, string>> = {}
  const memberEmails = new Set(members.map((email) => email.toLowerCase()))
  const seen = new Set<string>()
  for (const invite of invites) {
    const email = invite.email.trim().toLowerCase()
    if (!email) continue
    if (!isEmail(email)) {
      errors[invite.id] = 'Enter an email address like name@example.com.'
    } else if (memberEmails.has(email)) {
      errors[invite.id] = `${invite.email.trim()} is already in the workspace.`
    } else if (seen.has(email)) {
      errors[invite.id] = "You've already added this address."
    }
    seen.add(email)
  }
  return errors
}

/** The invites with an email address, trimmed. */
function getFilledInvites(invites: Invite[]) {
  return invites
    .map((invite) => ({ ...invite, email: invite.email.trim() }))
    .filter((invite) => invite.email)
}

interface ActionCardProps {
  /** Beside the title, such as a "Recommended" badge. */
  badge?: ReactNode
  className?: string
  description?: ReactNode
  /** Where the card goes. Leave out and pass `onClick` for a button. */
  href?: string
  icon?: ReactNode
  /** Under the description, such as "About 2 minutes". */
  meta?: ReactNode
  onClick?: () => void
  title: string
}

/** A large card that starts a task, such as importing data. The whole card is the link or button. */
function ActionCard({
  badge,
  className,
  description,
  href,
  icon,
  meta,
  onClick,
  title,
}: ActionCardProps) {
  const id = useId()
  const target = (
    <>
      <span aria-hidden className='absolute inset-0' />
      {title}
    </>
  )
  const describedBy = description ? `${id}-description` : undefined
  return (
    <Card
      size='sm'
      className={cn(
        'hover:bg-muted/50 has-[:focus-visible]:ring-ring/50 relative h-full transition-colors has-[:focus-visible]:ring-3',
        className,
      )}
    >
      <CardContent className='flex items-start gap-3'>
        {icon && (
          <span
            aria-hidden
            className='bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg]:size-5'
          >
            {icon}
          </span>
        )}
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <span className='flex flex-wrap items-center gap-2'>
            {href ? (
              <a
                href={href}
                onClick={onClick}
                aria-describedby={describedBy}
                className='text-sm font-medium outline-none'
              >
                {target}
              </a>
            ) : (
              <button
                type='button'
                onClick={onClick}
                aria-describedby={describedBy}
                className='text-left text-sm font-medium outline-none'
              >
                {target}
              </button>
            )}
            {badge}
          </span>
          {description && (
            <p id={describedBy} className='text-muted-foreground text-sm text-pretty'>
              {description}
            </p>
          )}
          {meta && <p className='text-muted-foreground mt-1 text-xs'>{meta}</p>}
        </div>
        <IconPlaceholder
          lucide='ArrowRightIcon'
          tabler='IconArrowRight'
          hugeicons='ArrowRight01Icon'
          phosphor='ArrowRightIcon'
          remixicon='RiArrowRightLine'
          aria-hidden
          className='text-muted-foreground group-hover/card:text-foreground mt-0.5 size-4 shrink-0 transition-[color,translate] group-hover/card:translate-x-0.5 motion-reduce:transition-none'
        />
      </CardContent>
    </Card>
  )
}

/** "Fernhill & Co." → "fernhill-co": lowercase letters, numbers and single dashes, for a URL. */
function slugify(text: string, maxLength = 32) {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, maxLength)
    .replace(/^-+|-+$/g, '')
}

export {
  ActionCard,
  ChoiceCards,
  getFilledInvites,
  getInviteErrors,
  InviteList,
  OnboardingActions,
  OnboardingLayout,
  slugify,
}

export type {
  ActionCardProps,
  ChoiceCardOption,
  ChoiceCardsProps,
  Invite,
  InviteListProps,
  OnboardingActionsProps,
  OnboardingLayoutProps,
}
