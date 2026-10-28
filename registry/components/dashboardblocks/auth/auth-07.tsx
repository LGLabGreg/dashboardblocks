'use client'

import {
  AuthIcon,
  AuthLayout,
  AuthReveal,
  AuthSwitch,
  PasswordInput,
  PasswordStrength,
  getMissingPasswordRules,
} from '@/registry/components/dashboardblocks/auth'
import {
  type FormErrors,
  useSimpleForm,
} from '@/registry/components/dashboardblocks/forms'
import { RollingText } from '@/registry/components/dashboardblocks/rolling-text'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type FormEvent, startTransition, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'

/** Refuse with a sentence for the new password, such as one found in a breach, or say the link has expired. */
type Auth7Result = { message: string; status: 'error' } | { status: 'expired' } | void

interface Auth7Props {
  /** The account the link was sent to, named under the title. */
  email?: string
  /** Where "Send a new link" leads, such as a page with Auth 6. */
  forgotPasswordHref: string
  /** The link was already used or is too old: check it on the server before the page renders. */
  linkExpired?: boolean
  /** Save the new password. Check the rules again on the server. */
  onSave?: (password: string) => Promise<Auth7Result>
  signInHref: string
}

const exampleProps: Auth7Props = {
  email: 'amara@acme.co',
  forgotPasswordHref: '#forgot-password',
  onSave: async () => {
    await new Promise((resolve) => setTimeout(resolve, 800))
  },
  signInHref: '#sign-in',
}

type Values = { confirm: string; password: string }

const Auth7 = (props: Auth7Props) => {
  const { email, forgotPasswordHref, onSave, signInHref } = props
  const [outcome, setOutcome] = useState<'expired' | 'saved' | null>(
    props.linkExpired ? 'expired' : null,
  )
  const [message, setMessage] = useState<string | null>(null)
  const refused = useRef(false)

  const form = useSimpleForm<Values>({
    defaultValues: { confirm: '', password: '' },
    onSubmit: async ({ password }) => {
      refused.current = false
      const result = await onSave?.(password)
      if (!result) return
      refused.current = true
      if (result.status === 'expired') {
        startTransition(() => setOutcome('expired'))
        return
      }
      return { password: result.message }
    },
    validate: ({ confirm, password }): FormErrors<Values> => ({
      confirm: !confirm
        ? 'Type the new password again.'
        : confirm === password
          ? undefined
          : 'The passwords don’t match.',
      password: !password
        ? 'Choose a new password.'
        : getMissingPasswordRules(password).length
          ? 'Not strong enough yet.'
          : undefined,
    }),
  })

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (form.isSubmitting) return
    setMessage(null)
    try {
      const saved = await form.submit(event)
      if (saved && !refused.current) startTransition(() => setOutcome('saved'))
    } catch {
      startTransition(() =>
        setMessage('We couldn’t save the password. Check your connection and try again.'),
      )
    }
  }

  const pending = form.isSubmitting
  const strengthId = `${form.getId('password')}-strength`
  const title =
    outcome === 'saved'
      ? 'Password saved'
      : outcome === 'expired'
        ? 'This link has expired'
        : 'Set a new password'
  const description =
    outcome === 'saved'
      ? 'Sign in with your new password.'
      : outcome === 'expired'
        ? 'Reset links work once, for a short time. Ask for a new one.'
        : email
          ? `For ${email}.`
          : 'Choose one you don’t use anywhere else.'

  return (
    <AuthLayout
      media={
        outcome === 'saved' ? (
          <AuthIcon tone='done' />
        ) : (
          <AuthIcon>
            <IconPlaceholder
              lucide='LockIcon'
              tabler='IconLock'
              hugeicons='SquareLock02Icon'
              phosphor='LockIcon'
              remixicon='RiLockLine'
              aria-hidden
            />
          </AuthIcon>
        )
      }
      title={<RollingText text={title} wrap />}
      description={<RollingText text={description} wrap />}
    >
      <div className='flex flex-col'>
        <AuthReveal open={outcome === null}>
          <form
            method='post'
            noValidate
            onSubmit={(event) => void submit(event)}
            className='flex flex-col gap-4'
          >
            <Field data-invalid={form.errors.password ? true : undefined}>
              <FieldLabel htmlFor={form.getId('password')}>New password</FieldLabel>
              <PasswordInput
                autoComplete='new-password'
                disabled={pending}
                {...form.field('password')}
                aria-describedby={
                  [strengthId, form.field('password')['aria-describedby']]
                    .filter(Boolean)
                    .join(' ') || undefined
                }
              />
              <FieldError {...form.error('password')} />
              <PasswordStrength id={strengthId} password={form.values.password} />
            </Field>
            <Field data-invalid={form.errors.confirm ? true : undefined}>
              <FieldLabel htmlFor={form.getId('confirm')}>Type it again</FieldLabel>
              <PasswordInput
                autoComplete='new-password'
                disabled={pending}
                {...form.field('confirm')}
              />
              <FieldError {...form.error('confirm')} />
            </Field>
            {message && (
              <p role='alert' className='text-destructive text-sm text-pretty'>
                {message}
              </p>
            )}
            <Button
              type='submit'
              size='lg'
              className='mt-1 aria-disabled:opacity-50'
              aria-disabled={pending || undefined}
            >
              <RollingText text={pending ? 'Saving…' : 'Save password'} />
            </Button>
          </form>
        </AuthReveal>
        <p role='status' className='sr-only'>
          {outcome === 'saved' ? 'Password saved' : ''}
        </p>
      </div>
      {outcome === 'expired' ? (
        <AuthSwitch
          href={forgotPasswordHref}
          title='Send a new link'
          description='We’ll email you another one.'
        />
      ) : (
        <AuthSwitch
          href={signInHref}
          title={outcome === 'saved' ? 'Continue to sign in' : 'Remembered it?'}
          description={
            outcome === 'saved' && email
              ? `Use ${email} and your new password.`
              : 'Back to sign in.'
          }
        />
      )}
    </AuthLayout>
  )
}

export { Auth7, exampleProps as auth7ExampleProps, type Auth7Props, type Auth7Result }
