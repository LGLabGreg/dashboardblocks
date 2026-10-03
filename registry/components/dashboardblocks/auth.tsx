'use client'

import { getAvatarColor, getInitials } from '@/registry/components/dashboardblocks/team'
import {
  type ClipboardEvent,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'

import { Input } from '@/components/ui/input'

import { cn } from '@/lib/utils'

interface AuthLayoutProps {
  /** Top right, such as the signed-in email and a sign-out link. */
  aside?: ReactNode
  /** Your logo and product name, top left. */
  brand: ReactNode
  children: ReactNode
  className?: string
  description?: ReactNode
  /** Under the content, such as "Use another account". */
  footer?: ReactNode
  /** Above the title, such as a workspace logo. */
  media?: ReactNode
  title: ReactNode
}

/** A full-page frame for signing in and joining: your brand, then one narrow, centred column. */
function AuthLayout({
  aside,
  brand,
  children,
  className,
  description,
  footer,
  media,
  title,
}: AuthLayoutProps) {
  return (
    <div
      className={cn('bg-background @container/page flex min-h-svh flex-col', className)}
    >
      <header className='flex h-16 shrink-0 items-center justify-between gap-4 px-4 sm:px-6'>
        <div className='flex shrink-0 items-center gap-2 text-sm font-medium'>
          {brand}
        </div>
        {aside && (
          <div className='text-muted-foreground flex min-w-0 items-center gap-3 text-sm'>
            {aside}
          </div>
        )}
      </header>
      <main className='flex flex-1 flex-col items-center px-4 py-10 sm:justify-center sm:px-6 sm:pb-24'>
        <div className='flex w-full max-w-sm flex-col gap-8'>
          <div className='flex flex-col items-center gap-4 text-center'>
            {media}
            <div className='flex flex-col gap-2'>
              <h1 className='text-xl font-semibold tracking-tight text-balance'>
                {title}
              </h1>
              {description && (
                <p className='text-muted-foreground text-sm text-pretty'>{description}</p>
              )}
            </div>
          </div>
          {children}
          {footer && (
            <div className='text-muted-foreground flex flex-col items-center gap-1 text-center text-sm'>
              {footer}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

type WorkspaceAvatarSize = 'sm' | 'default' | 'lg'

const workspaceAvatarSize: Record<WorkspaceAvatarSize, string> = {
  default: 'size-9 rounded-lg text-xs',
  lg: 'size-14 rounded-xl text-base',
  sm: 'size-6 rounded-md text-[10px]',
}

/** A square logo for a workspace, or its initials in a colour picked from the name. Decorative. */
function WorkspaceAvatar({
  className,
  logo,
  name,
  size = 'default',
}: {
  className?: string
  /** An image URL. */
  logo?: string
  name: string
  /** @default 'default' */
  size?: WorkspaceAvatarSize
}) {
  const [failed, setFailed] = useState(false)
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden font-semibold',
        workspaceAvatarSize[size],
        !logo || failed ? getAvatarColor(name) : 'bg-muted',
        className,
      )}
    >
      {logo && !failed ? (
        // oxlint-disable-next-line nextjs/no-img-element -- blocks install into any React project
        <img
          src={logo}
          alt=''
          className='size-full object-cover'
          onError={() => setFailed(true)}
        />
      ) : (
        getInitials(name)
      )}
    </span>
  )
}

interface OtpInputProps {
  /** Names the group, such as "Verification code". */
  'aria-label'?: string
  'aria-describedby'?: string
  focusOnMount?: boolean
  className?: string
  disabled?: boolean
  /** Marks the boxes to fix as invalid: the empty ones, or every box of a full code. */
  invalid?: boolean
  /** @default 6 */
  length?: number
  onChange: (value: string) => void
  /** Called once every box is filled, such as to submit. */
  onComplete?: (value: string) => void
  value: string
}

/**
 * One box per digit. Typing moves to the next box, Backspace to the previous
 * one, and pasting a code fills every box. Browsers can fill it from a text
 * message, through `autocomplete="one-time-code"` on the first box.
 */
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

  const type = (index: number, typed: string) => {
    let entered = typed.replace(/\D/g, '')
    if (!entered) return
    // Typing into a filled box whose digit wasn't selected keeps both characters.
    const current = digits[index]
    if (current && entered.length === 2) {
      entered = entered.startsWith(current) ? entered[1] : entered[0]
    }
    // A whole code arrives at once from autofill or a paste into one box.
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
          // A short code: the empty boxes are the ones to fix. A full one: all of them.
          aria-invalid={
            (invalid && (value.length === length || index >= value.length)) || undefined
          }
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          inputMode='numeric'
          pattern='[0-9]*'
          disabled={disabled}
          value={digit}
          // Only the next empty box, or a filled one, takes focus from Tab.
          tabIndex={index <= value.length ? 0 : -1}
          onChange={(event) => type(index, event.target.value)}
          onKeyDown={(event) => keyDown(index, event)}
          onPaste={paste}
          onFocus={(event) => event.target.select()}
          className='w-10 min-w-0 text-center font-mono tabular-nums'
        />
      ))}
    </div>
  )
}

/** "a•••@acme.co": enough of an address to recognise it without showing all of it. */
function maskEmail(email: string) {
  const [name, domain] = email.split('@')
  if (!domain) return email
  return `${name[0]}${'•'.repeat(Math.min(3, Math.max(1, name.length - 1)))}@${domain}`
}

export { AuthLayout, OtpInput, WorkspaceAvatar, maskEmail }

export type { AuthLayoutProps, OtpInputProps, WorkspaceAvatarSize }
