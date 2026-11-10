'use client'

import {
  Announcements,
  useAnnouncements,
} from '@/registry/components/dashboardblocks/announcements'
import {
  AuthIcon,
  AuthLayout,
  AuthResendButton,
  AuthReveal,
  OtpInput,
} from '@/registry/components/dashboardblocks/auth'
import { RollingText } from '@/registry/components/dashboardblocks/rolling-text'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import {
  type FormEvent,
  startTransition,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Auth4Props {
  email: string
  focusOnMount?: boolean
  onChangeEmail?: (email: string) => void | Promise<void>
  onResend?: () => void | Promise<void>
  onVerified?: () => void
  onVerify?: (code: string) => boolean | Promise<boolean>
  /** Seconds before another email can be sent. @default 60 */
  resendAfter?: number
}

const exampleProps: Auth4Props = {
  email: 'amara@acme.co',
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Stage = 'code' | 'checking' | 'editing' | 'changing' | 'verified'

const Auth4 = (props: Auth4Props) => {
  const {
    focusOnMount = false,
    onChangeEmail,
    onResend,
    onVerified,
    onVerify,
    resendAfter = 60,
  } = props
  const id = useId()
  const [email, setEmail] = useState(props.email)
  const [code, setCode] = useState('')
  const [stage, setStage] = useState<Stage>('code')
  const [error, setError] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [said, announce] = useAnnouncements()
  const [cooldown, setCooldown] = useState(0)
  const [resending, setResending] = useState(false)
  const [draft, setDraft] = useState(props.email)
  const [failures, setFailures] = useState(0)
  const checking = stage === 'checking'
  const editing = stage === 'editing' || stage === 'changing'
  const verified = stage === 'verified'
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

  const say = (text: string) => {
    setStatus(text)
    announce(text)
  }

  const verify = async (value: string) => {
    if (stage !== 'code') return
    if (!/^\d{6}$/.test(value)) return fail('Enter all 6 digits from the email.')
    setStage('checking')
    setError(null)
    setSendError(null)
    try {
      const ok = onVerify ? await onVerify(value) : value === '123456'
      startTransition(() => {
        if (ok) {
          setStage('verified')
          announce('Email verified')
          onVerified?.()
        } else {
          setStage('code')
          setCode('')
          fail('That code didn’t work. Check the newest email, or send a new code.')
        }
      })
    } catch {
      startTransition(() => {
        setStage('code')
        fail('We couldn’t check the code. Check your connection and try again.')
      })
    }
  }

  const resend = async () => {
    if (resending || editing || verified) return
    setResending(true)
    setError(null)
    setSendError(null)
    setStatus('')
    try {
      await onResend?.()
      startTransition(() => {
        setResending(false)
        setCooldown(resendAfter)
        say(`We sent a new code to ${email}.`)
      })
    } catch {
      startTransition(() => {
        setResending(false)
        setSendError('We couldn’t send the email. Check your connection and try again.')
      })
    }
  }

  const saveEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (stage !== 'editing') return
    const address = draft.trim().toLowerCase()
    if (!EMAIL.test(address)) return fail('Enter an email address.')
    setStage('changing')
    setError(null)
    setSendError(null)
    try {
      await onChangeEmail?.(address)
      startTransition(() => {
        setEmail(address)
        setStage('code')
        setCode('')
        setCooldown(resendAfter)
        say(`We sent a code to ${address}.`)
      })
    } catch {
      startTransition(() => {
        setStage('editing')
        fail('We couldn’t change the address. Check your connection and try again.')
      })
    }
  }

  return (
    <AuthLayout
      media={
        verified ? (
          <AuthIcon tone='done' />
        ) : (
          <AuthIcon>
            <IconPlaceholder
              lucide='MailIcon'
              tabler='IconMail'
              hugeicons='MailIcon'
              phosphor='EnvelopeIcon'
              remixicon='RiMailLine'
              aria-hidden
            />
          </AuthIcon>
        )
      }
      title={<RollingText text={verified ? 'Email verified' : 'Check your email'} wrap />}
      description={
        <RollingText
          wrap
          text={
            verified
              ? 'Taking you to your workspace…'
              : `We sent a 6-digit code to ${email}. It expires in 10 minutes.`
          }
        />
      }
    >
      <AuthReveal open={!verified}>
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
              <div className='mt-2 flex flex-col gap-2'>
                <Button type='submit' disabled={stage === 'changing'}>
                  {stage === 'changing' ? 'Sending…' : 'Send code'}
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  disabled={stage === 'changing'}
                  onClick={() => {
                    setStage('code')
                    setDraft(email)
                    setError(null)
                    setSendError(null)
                  }}
                >
                  Cancel
                </Button>
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
                  setSendError(null)
                }}
                onComplete={(next) => void verify(next)}
                invalid={Boolean(error)}
                disabled={checking}
              />
              <Button type='submit' disabled={checking}>
                {checking ? 'Checking…' : 'Verify email'}
              </Button>
            </form>
          )}
          {!editing && (
            <div className='flex flex-col gap-4'>
              <p className='text-muted-foreground text-sm text-pretty'>
                Not in your inbox? Check your spam folder, or send it again.
              </p>
              <div className='-mx-2.5 flex items-center justify-between gap-2'>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  disabled={checking || resending}
                  onClick={() => {
                    setStage('editing')
                    setError(null)
                    setSendError(null)
                  }}
                >
                  <IconPlaceholder
                    lucide='PencilIcon'
                    tabler='IconPencil'
                    hugeicons='PencilEdit02Icon'
                    phosphor='PencilSimpleIcon'
                    remixicon='RiPencilLine'
                    data-icon='inline-start'
                    aria-hidden
                  />
                  Use another email
                </Button>
                <AuthResendButton
                  cooldown={cooldown}
                  total={resendAfter}
                  pending={resending}
                  onClick={() => void resend()}
                />
              </div>
            </div>
          )}
          {(error ?? sendError) && (
            <p id={`${id}-error`} role='alert' className='text-destructive text-sm'>
              {error ?? sendError}
            </p>
          )}
          {status && <p className='text-muted-foreground text-sm'>{status}</p>}
        </div>
      </AuthReveal>
      <Announcements said={said} />
    </AuthLayout>
  )
}

export { Auth4, exampleProps as auth4ExampleProps, type Auth4Props }
