'use client'

import { RollingText } from '@/registry/components/dashboardblocks/rolling-text'
import { getAvatarColor, getInitials } from '@/registry/components/dashboardblocks/team'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatList } from '@/registry/lib/dashboardblocks/format'
import {
  type ClipboardEvent,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
  startTransition,
  useEffect,
  useRef,
  useState,
} from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'

import { cn } from '@/lib/utils'

interface AuthLayoutProps {
  children: ReactNode
  className?: string
  description?: ReactNode
  /** Above the title, such as an `AuthIcon` or the workspace's avatar. */
  media?: ReactNode
  title: ReactNode
}

function AuthLayout({ children, className, description, media, title }: AuthLayoutProps) {
  return (
    <div
      className={cn('bg-background @container/page flex min-h-svh flex-col', className)}
    >
      <main className='flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6'>
        <div className='flex w-full max-w-sm flex-col gap-6'>
          <div className='flex flex-col items-start gap-4'>
            {media}
            <div className='flex flex-col gap-2'>
              <h1 className='text-2xl font-semibold tracking-tight text-balance'>
                {title}
              </h1>
              {description && (
                <p className='text-muted-foreground text-pretty'>{description}</p>
              )}
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}

/** The icon above an auth page's title. `waiting` pulses while the page waits on the person, such as for a passkey; `done` draws a tick for a step that just finished. */
function AuthIcon({
  children,
  className,
  tone = 'default',
}: {
  children?: ReactNode
  className?: string
  /** @default 'default' */
  tone?: 'default' | 'waiting' | 'done'
}) {
  return (
    <span
      data-slot='auth-icon'
      data-tone={tone}
      className={cn(
        'relative flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 [&_svg]:size-6',
        tone === 'done'
          ? 'animate-in zoom-in-75 fade-in bg-emerald-500/10 text-emerald-700 duration-300 ease-out motion-reduce:animate-none dark:text-emerald-400'
          : tone === 'waiting'
            ? 'bg-muted text-foreground'
            : 'bg-muted text-muted-foreground',
        className,
      )}
    >
      {tone === 'waiting' && (
        <span className='absolute -end-1 -top-1 flex size-2.5 text-(--color-chart-2)'>
          <span className='absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60 motion-reduce:animate-none' />
          <span className='relative inline-flex size-full rounded-full bg-current' />
        </span>
      )}
      {tone === 'done' ? (
        <IconPlaceholder
          lucide='CircleCheckIcon'
          tabler='IconCircleCheck'
          hugeicons='CheckmarkCircle02Icon'
          phosphor='CheckCircleIcon'
          remixicon='RiCheckboxCircleLine'
          aria-hidden
        />
      ) : (
        children
      )}
    </span>
  )
}

type WorkspaceAvatarSize = 'sm' | 'default' | 'lg'

const workspaceAvatarSize: Record<WorkspaceAvatarSize, string> = {
  default: 'size-9 rounded-lg text-xs',
  lg: 'size-12 rounded-xl text-base',
  sm: 'size-6 rounded-md text-xs',
}

function WorkspaceAvatar({
  className,
  logo,
  mark,
  name,
  size = 'default',
}: {
  className?: string
  /** An image of the workspace's logo. */
  logo?: string
  /** The workspace's mark, drawn in the primary colour, such as an SVG with `fill='currentColor'`. */
  mark?: ReactNode
  name: string
  /** @default 'default' */
  size?: WorkspaceAvatarSize
}) {
  const [failed, setFailed] = useState(false)
  const image = logo && !failed
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden font-semibold [&_svg]:size-1/2',
        workspaceAvatarSize[size],
        image
          ? 'bg-muted'
          : mark
            ? 'bg-primary text-primary-foreground'
            : getAvatarColor(name),
        className,
      )}
    >
      {image ? (
        // oxlint-disable-next-line nextjs/no-img-element -- blocks install into any React project
        <img
          src={logo}
          alt=''
          className='size-full object-cover'
          onError={() => setFailed(true)}
        />
      ) : (
        (mark ?? getInitials(name))
      )}
    </span>
  )
}

interface OtpInputProps {
  'aria-label'?: string
  'aria-describedby'?: string
  focusOnMount?: boolean
  className?: string
  disabled?: boolean
  invalid?: boolean
  /** @default 6 */
  length?: number
  onChange: (value: string) => void
  /** Called once every box is filled, such as to submit. */
  onComplete?: (value: string) => void
  value: string
}

function resolveTypedDigits(current: string, entered: string) {
  if (!current || entered.length !== 2) return entered
  return entered.startsWith(current) ? entered[1] : entered[0]
}

function OtpInput({
  'aria-describedby': describedBy,
  'aria-label': label = 'Verification code',
  focusOnMount = false,
  className,
  disabled = false,
  invalid = false,
  length = 6,
  onChange,
  onComplete,
  value,
}: OtpInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])
  const digits = Array.from({ length }, (_, index) => value[index] ?? '')

  useEffect(() => {
    if (focusOnMount) inputs.current[0]?.focus()
  }, [focusOnMount])

  const set = (next: string, focus: number) => {
    const clean = next.replace(/\D/g, '').slice(0, length)
    onChange(clean)
    inputs.current[Math.min(focus, length - 1)]?.focus()
    if (clean.length === length) onComplete?.(clean)
  }

  const isDigitInvalid = (index: number) =>
    invalid && (value.length === length || index >= value.length)

  const type = (index: number, typed: string) => {
    const entered = resolveTypedDigits(digits[index], typed.replace(/\D/g, ''))
    if (!entered) return
    if (entered.length > 1) return set(entered, entered.length)
    const next = [...digits]
    next[index] = entered
    set(next.join(''), index + 1)
  }

  const keyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      event.preventDefault()
      const at = digits[index] ? index : index - 1
      if (at < 0) return
      set(digits.slice(0, at).join(''), at)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      inputs.current[Math.max(0, index - 1)]?.focus()
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      inputs.current[Math.min(value.length, index + 1, length - 1)]?.focus()
    }
  }

  const paste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '')
    if (pasted) set(pasted, pasted.length)
  }

  return (
    <div
      role='group'
      aria-label={label}
      aria-describedby={describedBy}
      className={cn('flex justify-center gap-2', className)}
    >
      {digits.map((digit, index) => (
        <Input
          key={index}
          ref={(node) => {
            inputs.current[index] = node
          }}
          aria-label={`Digit ${index + 1} of ${length}`}
          aria-invalid={isDigitInvalid(index) || undefined}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          inputMode='numeric'
          pattern='[0-9]*'
          disabled={disabled}
          value={digit}
          tabIndex={index <= value.length ? 0 : -1}
          onChange={(event) => type(index, event.target.value)}
          onKeyDown={(event) => keyDown(index, event)}
          onPaste={paste}
          onFocus={(event) => event.target.select()}
          className='h-11 w-11 min-w-0 p-0 text-center font-mono text-base tabular-nums'
        />
      ))}
    </div>
  )
}

function maskEmail(email: string) {
  const [name, domain] = email.split('@')
  if (!domain) return email
  return `${name[0]}${'•'.repeat(Math.min(3, Math.max(1, name.length - 1)))}@${domain}`
}

/** Unfolds what it holds, such as the fields only signing up needs, and keeps it out of the tab order while folded. */
function AuthReveal({
  children,
  className,
  open,
}: {
  children: ReactNode
  className?: string
  open: boolean
}) {
  return (
    <div
      data-slot='auth-reveal'
      data-open={open || undefined}
      inert={!open}
      className={cn(
        '-mx-4 grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none',
        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
      )}
    >
      <div className='min-h-0 overflow-clip'>
        <div className={cn('px-4 pt-1', className)}>{children}</div>
      </div>
    </div>
  )
}

function PasswordInput({ className, ...props }: Omit<ComponentProps<'input'>, 'type'>) {
  const [shown, setShown] = useState(false)
  return (
    <InputGroup className={className}>
      <InputGroupInput type={shown ? 'text' : 'password'} {...props} />
      <InputGroupAddon align='inline-end'>
        <InputGroupButton
          size='icon-xs'
          aria-label='Show password'
          aria-pressed={shown}
          disabled={props.disabled}
          onClick={() => setShown((current) => !current)}
        >
          {shown ? (
            <IconPlaceholder
              lucide='EyeOffIcon'
              tabler='IconEyeOff'
              hugeicons='ViewOffSlashIcon'
              phosphor='EyeSlashIcon'
              remixicon='RiEyeOffLine'
            />
          ) : (
            <IconPlaceholder
              lucide='EyeIcon'
              tabler='IconEye'
              hugeicons='ViewIcon'
              phosphor='EyeIcon'
              remixicon='RiEyeLine'
            />
          )}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

interface PasswordRule {
  /** What the password still needs, read as part of a sentence: "a number". */
  label: string
  test: (password: string) => boolean
}

const passwordRules: PasswordRule[] = [
  { label: '8 or more characters', test: (password) => password.length >= 8 },
  { label: 'a number', test: (password) => /\d/.test(password) },
  { label: 'an uppercase letter', test: (password) => /[A-Z]/.test(password) },
]

function getMissingPasswordRules(password: string, rules = passwordRules) {
  return rules.filter((rule) => !rule.test(password))
}

function describeMissingPasswordRules(password: string, rules = passwordRules) {
  const missing = getMissingPasswordRules(password, rules)
  return missing.length ? `Add ${formatList(missing.map((rule) => rule.label))}.` : ''
}

const strengthWords = ['Too weak', 'Weak', 'Good', 'Strong']

function PasswordStrength({
  className,
  id,
  password,
  rules = passwordRules,
}: {
  className?: string
  id?: string
  password: string
  rules?: PasswordRule[]
}) {
  const met = rules.length - getMissingPasswordRules(password, rules).length
  const word =
    strengthWords[
      Math.round((met / Math.max(rules.length, 1)) * (strengthWords.length - 1))
    ]
  return (
    <div data-slot='password-strength' className={cn('flex flex-col gap-2', className)}>
      <div
        aria-hidden
        className='grid gap-1.5'
        style={{
          gridTemplateColumns: `repeat(${rules.length}, minmax(0, 1fr))`,
        }}
      >
        {rules.map((rule, index) => (
          <span key={rule.label} className='bg-muted h-1 overflow-hidden rounded-full'>
            <span
              className='block h-full origin-left rounded-full bg-(--color-chart-2) transition-transform duration-500 ease-out motion-reduce:transition-none'
              style={{ transform: `scaleX(${index < met ? 1 : 0})` }}
            />
          </span>
        ))}
      </div>
      <p id={id} className='text-muted-foreground text-sm text-pretty'>
        {password ? (
          <>
            <span className='text-foreground font-medium'>{word}.</span>{' '}
            {describeMissingPasswordRules(password, rules) || 'Good to go.'}
          </>
        ) : (
          `Use ${formatList(rules.map((rule) => rule.label))}.`
        )}
      </p>
    </div>
  )
}

interface AuthProvider {
  icon: ReactNode
  id: string
  name: string
}

interface AuthProviderButtonsProps {
  className?: string
  disabled?: boolean
  /** Send the person to the provider. A throw shows that the provider couldn't be reached. */
  onSelect?: (id: string) => void | Promise<void>
  providers: AuthProvider[]
}

function AuthProviderButtons({
  className,
  disabled = false,
  onSelect,
  providers,
}: AuthProviderButtonsProps) {
  const [pending, setPending] = useState<string | null>(null)
  const [failed, setFailed] = useState<string | null>(null)

  const select = async (provider: AuthProvider) => {
    if (pending) return
    setPending(provider.id)
    setFailed(null)
    try {
      await onSelect?.(provider.id)
    } catch {
      startTransition(() => {
        setPending(null)
        setFailed(`We couldn’t reach ${provider.name}. Try again.`)
      })
    }
  }

  return (
    <div
      data-slot='auth-provider-buttons'
      className={cn('flex flex-col gap-2', className)}
    >
      <div
        className='grid gap-2'
        style={{
          gridTemplateColumns: `repeat(${providers.length}, minmax(0, 1fr))`,
        }}
      >
        {providers.map((provider) => {
          const isPending = pending === provider.id
          return (
            <button
              key={provider.id}
              type='button'
              aria-label={`Continue with ${provider.name}`}
              aria-disabled={disabled || (pending !== null && !isPending) || undefined}
              data-pending={isPending || undefined}
              onClick={() => {
                if (!disabled) void select(provider)
              }}
              className='border-input bg-background hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 flex h-10 min-w-0 items-center justify-center rounded-lg border outline-none transition-[background-color,opacity] duration-200 focus-visible:ring-3 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-pending:bg-muted [&_svg]:size-5'
            >
              <span aria-hidden className='flex size-5 items-center justify-center'>
                {isPending ? (
                  <IconPlaceholder
                    lucide='Loader2Icon'
                    tabler='IconLoader2'
                    hugeicons='Loading03Icon'
                    phosphor='CircleNotchIcon'
                    remixicon='RiLoader4Line'
                    className='animate-spin motion-reduce:animate-none'
                  />
                ) : (
                  provider.icon
                )}
              </span>
            </button>
          )
        })}
      </div>
      {failed && (
        <p role='alert' className='text-destructive text-sm'>
          {failed}
        </p>
      )}
    </div>
  )
}

function AuthDivider({ children = 'or' }: { children?: ReactNode }) {
  return (
    <div className='text-muted-foreground flex items-center gap-3 text-xs'>
      <span aria-hidden className='bg-border h-px flex-1' />
      {children}
      <span aria-hidden className='bg-border h-px flex-1' />
    </div>
  )
}

const formatWait = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

function CountdownRing({ seconds, total }: { seconds: number; total: number }) {
  const circumference = 2 * Math.PI * 7
  return (
    <svg viewBox='0 0 18 18' aria-hidden className='size-4 -rotate-90'>
      <circle cx='9' cy='9' r='7' fill='none' strokeWidth='2' className='stroke-muted' />
      <circle
        cx='9'
        cy='9'
        r='7'
        fill='none'
        strokeWidth='2'
        strokeLinecap='round'
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - seconds / Math.max(total, 1))}
        className='stroke-(--color-chart-2) transition-[stroke-dashoffset] duration-1000 ease-linear motion-reduce:transition-none'
      />
    </svg>
  )
}

interface AuthResendButtonProps {
  className?: string
  /** Seconds left before it can send again; a ring counts them down. */
  cooldown: number
  onClick: () => void
  pending?: boolean
  /** The full wait in seconds, so the ring starts full. */
  total: number
}

/** Sends an email again, once its wait has run out. */
function AuthResendButton({
  className,
  cooldown,
  onClick,
  pending = false,
  total,
}: AuthResendButtonProps) {
  const waiting = cooldown > 0
  return (
    <Button
      type='button'
      variant='ghost'
      size='sm'
      className={cn('tabular-nums aria-disabled:opacity-100', className)}
      aria-disabled={waiting || pending || undefined}
      onClick={() => {
        if (!waiting && !pending) onClick()
      }}
    >
      {waiting ? (
        <CountdownRing seconds={cooldown} total={total} />
      ) : (
        <IconPlaceholder
          lucide='SendIcon'
          tabler='IconSend'
          hugeicons='SentIcon'
          phosphor='PaperPlaneTiltIcon'
          remixicon='RiSendPlaneLine'
          data-icon='inline-start'
        />
      )}
      {waiting
        ? `Send again in ${formatWait(cooldown)}`
        : pending
          ? 'Sending…'
          : 'Send again'}
    </Button>
  )
}

interface AuthSwitchProps {
  className?: string
  description: string
  /** A link to another page; leave it out and pass `onClick` to switch in place. */
  href?: string
  onClick?: () => void
  title: string
}

/** The last row of an auth page, leading to the other way in: from signing in to signing up, or back to sign-in. */
function AuthSwitch({ className, description, href, onClick, title }: AuthSwitchProps) {
  const content = (
    <>
      <span className='flex min-w-0 flex-1 flex-col gap-0.5'>
        <RollingText text={title} wrap className='text-sm font-medium' />
        <RollingText text={description} wrap className='text-muted-foreground text-sm' />
      </span>
      <span
        aria-hidden
        className='bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full transition-transform duration-200 ease-out group-hover/switch:translate-x-0.5 motion-reduce:transition-none [&_svg]:size-4'
      >
        <IconPlaceholder
          lucide='ArrowRightIcon'
          tabler='IconArrowRight'
          hugeicons='ArrowRight01Icon'
          phosphor='ArrowRightIcon'
          remixicon='RiArrowRightLine'
        />
      </span>
    </>
  )
  const rowClassName =
    'group/switch hover:bg-muted/60 focus-visible:ring-ring/50 -mx-3 flex w-[calc(100%+1.5rem)] items-center gap-3 rounded-lg px-3 py-2.5 text-start outline-none transition-colors duration-200 focus-visible:ring-3'
  return (
    <div data-slot='auth-switch' className={cn('border-t pt-3', className)}>
      {href ? (
        <a href={href} className={rowClassName}>
          {content}
        </a>
      ) : (
        <button type='button' onClick={onClick} className={rowClassName}>
          {content}
        </button>
      )}
    </div>
  )
}

function GoogleLogo({ className, ...props }: ComponentProps<'svg'>) {
  return (
    <svg viewBox='0 0 24 24' aria-hidden className={cn('size-5', className)} {...props}>
      <path
        fill='#4285F4'
        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z'
      />
      <path
        fill='#34A853'
        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z'
      />
      <path
        fill='#FBBC05'
        d='M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.66-2.84z'
      />
      <path
        fill='#EA4335'
        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z'
      />
    </svg>
  )
}

function XLogo({ className, ...props }: ComponentProps<'svg'>) {
  return (
    <svg
      viewBox='0 0 24 24'
      aria-hidden
      className={cn('size-5 fill-current', className)}
      {...props}
    >
      <path d='M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z' />
    </svg>
  )
}

function GitHubLogo({ className, ...props }: ComponentProps<'svg'>) {
  return (
    <svg
      viewBox='0 0 24 24'
      aria-hidden
      className={cn('size-5 fill-current', className)}
      {...props}
    >
      <path d='M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .32.21.69.82.57A12 12 0 0 0 12 .3' />
    </svg>
  )
}

export {
  AuthDivider,
  AuthIcon,
  AuthLayout,
  AuthProviderButtons,
  AuthResendButton,
  AuthReveal,
  AuthSwitch,
  GitHubLogo,
  GoogleLogo,
  OtpInput,
  PasswordInput,
  PasswordStrength,
  WorkspaceAvatar,
  XLogo,
  describeMissingPasswordRules,
  getMissingPasswordRules,
  maskEmail,
  passwordRules,
}

export type {
  AuthLayoutProps,
  AuthProvider,
  AuthProviderButtonsProps,
  AuthResendButtonProps,
  AuthSwitchProps,
  OtpInputProps,
  PasswordRule,
  WorkspaceAvatarSize,
}
