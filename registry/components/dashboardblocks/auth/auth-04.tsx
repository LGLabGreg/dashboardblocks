'use client'

import { AuthLayout, OtpInput } from '@/registry/components/dashboardblocks/auth'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type FormEvent, type ReactNode, useEffect, useId, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Auth4Props {
  focusOnMount?: boolean
  brand: ReactNode
  email: string
  /**
   * Seconds before another email can be sent.
   * @default 60
   */
  resendAfter?: number
  onChangeEmail?: (email: string) => void | Promise<void>
  onResend?: () => void | Promise<void>
  onVerify?: (code: string) => boolean | Promise<boolean>
  onVerified?: () => void
}

const exampleProps: Auth4Props = {
  brand: (
    <>
      <span className='bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md [&_svg]:size-4'>
        <IconPlaceholder
          lucide='BlocksIcon'
          tabler='IconCube'
          hugeicons='CubeIcon'
          phosphor='CubeIcon'
          remixicon='RiBox3Line'
        />
      </span>
      Acme Analytics
    </>
  ),
  email: 'amara@acme.co',
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const Auth4 = (props: Auth4Props) => {
  const {
    focusOnMount = false,
    brand,
    onChangeEmail,
    onResend,
    onVerified,
    onVerify,
    resendAfter = 60,
  } = props
  const id = useId()
  const [email, setEmail] = useState(props.email)
  const [code, setCode] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(props.email)
  const [verified, setVerified] = useState(false)
  const [failures, setFailures] = useState(0)
  const formsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  useEffect(() => {
    if (failures && !checking)
      formsRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, [failures, checking])

  const fail = (message: string) => {
    setError(message)
    setFailures((count) => count + 1)
  }

  const verify = async (value: string) => {
    if (checking) return
    if (!/^\d{6}$/.test(value)) return fail('Enter all 6 digits from the email.')
    setChecking(true)
    setError(null)
    try {
      const ok = onVerify ? await onVerify(value) : value === '123456'
      if (!ok) {
        setCode('')
        return fail('That code didn’t work. Check the newest email, or send a new code.')
      }
      setVerified(true)
      onVerified?.()
    } catch {
      fail('We couldn’t check the code. Try again.')
    } finally {
      setChecking(false)
    }
  }

  const resend = async () => {
    setError(null)
    try {
      await onResend?.()
      setCooldown(resendAfter)
      setStatus(`We sent a new code to ${email}.`)
    } catch {
      setError('We couldn’t send the email. Try again in a moment.')
    }
  }

  const saveEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const address = draft.trim().toLowerCase()
    if (!EMAIL.test(address)) return fail('Enter an email address.')
    setError(null)
    try {
      await onChangeEmail?.(address)
      setEmail(address)
      setEditing(false)
      setCode('')
      setCooldown(resendAfter)
      setStatus(`We sent a code to ${address}.`)
    } catch {
      fail('We couldn’t change the address. Try again.')
    }
  }

  if (verified) {
    return (
      <AuthLayout
        brand={brand}
        media={
          <span className='flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 [&_svg]:size-6'>
            <IconPlaceholder
              lucide='CircleCheckIcon'
              tabler='IconCircleCheck'
              hugeicons='CheckmarkCircle02Icon'
              phosphor='CheckCircleIcon'
              remixicon='RiCheckboxCircleLine'
              aria-hidden
            />
          </span>
        }
        title='Email verified'
        description='Taking you to your workspace…'
      >
        <p role='status' className='sr-only'>
          Email verified
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      brand={brand}
      media={
        <span className='bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-xl [&_svg]:size-6'>
          <IconPlaceholder
            lucide='MailIcon'
            tabler='IconMail'
            hugeicons='MailIcon'
            phosphor='EnvelopeIcon'
            remixicon='RiMailLine'
            aria-hidden
          />
        </span>
      }
      title='Check your email'
      description={
        <>
          We sent a 6-digit code to{' '}
          <span className='text-foreground font-medium break-all'>{email}</span>. It
          expires in 10 minutes.
        </>
      }
      footer={
        <>
          <p>Can’t find it? Check your spam folder.</p>
          {cooldown > 0 ? (
            <p>You can send a new code in {cooldown}s</p>
          ) : (
            <button
              type='button'
              onClick={() => void resend()}
              className='text-foreground font-medium underline underline-offset-4'
            >
              Send a new code
            </button>
          )}
        </>
      }
    >
      <div ref={formsRef} className='flex flex-col gap-4'>
        {editing ? (
          <form
            method='post'
            noValidate
            onSubmit={(event) => void saveEmail(event)}
            className='flex flex-col gap-2'
          >
            <label htmlFor={`${id}-email`} className='text-sm font-medium'>
              Email
            </label>
            <Input
              id={`${id}-email`}
              type='email'
              autoComplete='email'
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
            />
            <div className='flex justify-end gap-2'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => {
                  setEditing(false)
                  setDraft(email)
                  setError(null)
                }}
              >
                Cancel
              </Button>
              <Button type='submit'>Send code</Button>
            </div>
          </form>
        ) : (
          <form
            method='post'
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              void verify(code)
            }}
            className='flex flex-col gap-4'
          >
            <OtpInput
              aria-label='Code from the email'
              aria-describedby={error ? `${id}-error` : undefined}
              focusOnMount={focusOnMount}
              value={code}
              onChange={(next) => {
                setCode(next)
                setError(null)
              }}
              onComplete={(next) => void verify(next)}
              invalid={Boolean(error)}
              disabled={checking}
            />
            <Button type='submit' disabled={checking}>
              {checking ? 'Checking…' : 'Verify email'}
            </Button>
            <Button
              type='button'
              variant='ghost'
              onClick={() => {
                setEditing(true)
                setError(null)
              }}
            >
              Wrong address? Change it
            </Button>
          </form>
        )}
        {error && (
          <p
            id={`${id}-error`}
            role='alert'
            className='text-destructive text-center text-sm'
          >
            {error}
          </p>
        )}
        <p
          role='status'
          className='text-muted-foreground text-center text-sm empty:sr-only'
        >
          {status}
        </p>
      </div>
    </AuthLayout>
  )
}

export { Auth4, exampleProps as auth4ExampleProps, type Auth4Props }
