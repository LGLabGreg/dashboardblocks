'use client'

import {
  AuthIcon,
  AuthLayout,
  AuthResendButton,
  AuthReveal,
  AuthSwitch,
} from '@/registry/components/dashboardblocks/auth'
import {
  type FormErrors,
  useSimpleForm,
} from '@/registry/components/dashboardblocks/forms'
import { RollingText } from '@/registry/components/dashboardblocks/rolling-text'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type FormEvent, startTransition, useEffect, useRef, useState } from 'react'

import { Button, buttonVariants } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

/** Refuse with a sentence for the email field, such as an address with no account. */
type Auth6Result = { message: string; status: 'error' } | void

interface Auth6Props {
  defaultEmail?: string
  focusOnMount?: boolean
  /** How long the link works, read as "It works for 30 minutes.". */
  linkLifetime?: string
  /** Mail apps to open once the link is sent. */
  mailLinks?: { href: string; name: string }[]
  /** Send the reset link. Many products resolve even for an address with no account, so the form doesn't say who has one. */
  onSend?: (email: string) => Promise<Auth6Result>
  /** Seconds before the link can be sent again. @default 60 */
  resendAfter?: number
  signInHref: string
}

const exampleProps: Auth6Props = {
  defaultEmail: 'amara@acme.co',
  linkLifetime: '30 minutes',
  mailLinks: [
    { href: 'https://mail.google.com', name: 'Gmail' },
    { href: 'https://outlook.live.com', name: 'Outlook' },
  ],
  onSend: async () => {
    await new Promise((resolve) => setTimeout(resolve, 700))
  },
  signInHref: '#sign-in',
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const Auth6 = (props: Auth6Props) => {
  const {
    defaultEmail = '',
    focusOnMount = false,
    linkLifetime,
    mailLinks = [],
    onSend,
    resendAfter = 60,
    signInHref,
  } = props
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [notices, setNotices] = useState<{ id: number; text: string }[]>([])
  const refused = useRef(false)
  const sentRef = useRef<HTMLDivElement>(null)
  const focused = useRef<string | null | false>(focusOnMount ? false : null)

  const form = useSimpleForm<{ email: string }>({
    defaultValues: { email: defaultEmail },
    onSubmit: async ({ email }) => {
      refused.current = false
      const result = await onSend?.(email.trim().toLowerCase())
      if (result?.status !== 'error') return
      refused.current = true
      return { email: result.message }
    },
    validate: ({ email }): FormErrors<{ email: string }> => ({
      email: !email.trim()
        ? 'Enter your email address.'
        : EMAIL.test(email.trim())
          ? undefined
          : 'Enter an email address like name@company.com.',
    }),
  })

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  useEffect(() => {
    if (sentTo === focused.current) return
    focused.current = sentTo
    if (sentTo === null) document.getElementById(form.getId('email'))?.focus()
    else sentRef.current?.querySelector<HTMLElement>('a, button')?.focus()
  }, [form, sentTo])

  const announce = (text: string) =>
    setNotices((current) => [...current.slice(-2), { id: Date.now(), text }])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (form.isSubmitting) return
    setMessage(null)
    try {
      const saved = await form.submit(event)
      if (saved && !refused.current) {
        const address = form.values.email.trim().toLowerCase()
        startTransition(() => {
          setSentTo(address)
          setCooldown(resendAfter)
          announce(`We sent a reset link to ${address}.`)
        })
      }
    } catch {
      startTransition(() =>
        setMessage('We couldn’t send the email. Check your connection and try again.'),
      )
    }
  }

  const resend = async () => {
    if (!sentTo) return
    setResending(true)
    setMessage(null)
    try {
      const result = await onSend?.(sentTo)
      startTransition(() => {
        if (result?.status === 'error') setMessage(result.message)
        else {
          setCooldown(resendAfter)
          announce(`We sent another link to ${sentTo}.`)
        }
      })
    } catch {
      startTransition(() =>
        setMessage('We couldn’t send the email. Check your connection and try again.'),
      )
    } finally {
      startTransition(() => setResending(false))
    }
  }

  const sent = sentTo !== null
  const pending = form.isSubmitting

  return (
    <AuthLayout
      media={
        <AuthIcon>
          {sent ? (
            <IconPlaceholder
              lucide='MailIcon'
              tabler='IconMail'
              hugeicons='MailIcon'
              phosphor='EnvelopeIcon'
              remixicon='RiMailLine'
              aria-hidden
            />
          ) : (
            <IconPlaceholder
              lucide='KeyRoundIcon'
              tabler='IconKey'
              hugeicons='Key01Icon'
              phosphor='KeyIcon'
              remixicon='RiKey2Line'
              aria-hidden
            />
          )}
        </AuthIcon>
      }
      title={
        <RollingText text={sent ? 'Check your email' : 'Reset your password'} wrap />
      }
      description={
        <RollingText
          wrap
          text={
            sent
              ? `We sent a link to ${sentTo}.${linkLifetime ? ` It works for ${linkLifetime}.` : ''}`
              : 'Enter your email and we’ll send you a link to set a new one.'
          }
        />
      }
    >
      <div className='flex flex-col'>
        <AuthReveal open={!sent}>
          <form
            method='post'
            noValidate
            onSubmit={(event) => void submit(event)}
            className='flex flex-col gap-5'
          >
            <Field data-invalid={form.errors.email ? true : undefined}>
              <FieldLabel htmlFor={form.getId('email')}>Email</FieldLabel>
              <Input
                type='email'
                autoComplete='email'
                disabled={pending}
                {...form.field('email')}
              />
              <FieldError {...form.error('email')} />
            </Field>
            <Button
              type='submit'
              size='lg'
              className='aria-disabled:opacity-50'
              aria-disabled={pending || undefined}
            >
              <RollingText text={pending ? 'Sending link…' : 'Send reset link'} />
            </Button>
          </form>
        </AuthReveal>
        <AuthReveal open={sent}>
          <div ref={sentRef} className='flex flex-col gap-4'>
            {mailLinks.length > 0 && (
              <div
                className='grid gap-2'
                style={{
                  gridTemplateColumns: `repeat(${mailLinks.length}, minmax(0, 1fr))`,
                }}
              >
                {mailLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target='_blank'
                    rel='noreferrer'
                    className={buttonVariants({ variant: 'outline' })}
                  >
                    Open {link.name}
                    <span className='sr-only'> (opens in a new tab)</span>
                    <IconPlaceholder
                      lucide='ArrowRightIcon'
                      tabler='IconArrowRight'
                      hugeicons='ArrowRight01Icon'
                      phosphor='ArrowRightIcon'
                      remixicon='RiArrowRightLine'
                      data-icon='inline-end'
                    />
                  </a>
                ))}
              </div>
            )}
            <p className='text-muted-foreground text-sm text-pretty'>
              Not in your inbox? Check your spam folder, or send it again.
            </p>
            <div className='-mx-2.5 flex items-center justify-between gap-2'>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => {
                  setSentTo(null)
                  setCooldown(0)
                  setMessage(null)
                }}
              >
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
        </AuthReveal>
        {message && (
          <p role='alert' className='text-destructive mt-4 text-sm text-pretty'>
            {message}
          </p>
        )}
        <div role='status' aria-atomic='false' className='sr-only'>
          {notices.map((notice) => (
            <div key={notice.id}>{notice.text}</div>
          ))}
        </div>
      </div>
      <AuthSwitch
        href={signInHref}
        title='Remembered it?'
        description='Back to sign in.'
      />
    </AuthLayout>
  )
}

export { Auth6, exampleProps as auth6ExampleProps, type Auth6Props, type Auth6Result }
