'use client'

import {
  AuthDivider,
  AuthIcon,
  AuthLayout,
  type AuthProvider,
  AuthProviderButtons,
  AuthReveal,
  AuthSwitch,
  GitHubLogo,
  GoogleLogo,
  PasswordInput,
  PasswordStrength,
  XLogo,
  getMissingPasswordRules,
} from '@/registry/components/dashboardblocks/auth'
import {
  type FormErrors,
  useSimpleForm,
} from '@/registry/components/dashboardblocks/forms'
import { RollingText } from '@/registry/components/dashboardblocks/rolling-text'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import {
  type FormEvent,
  type ReactNode,
  startTransition,
  useEffect,
  useRef,
  useState,
} from 'react'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

type Auth5Mode = 'sign-in' | 'sign-up'

type Auth5Field = 'email' | 'name' | 'password'

/** Refuse with a sentence for the whole form, such as a wrong password, or one for each field. */
type Auth5Result = {
  errors?: Partial<Record<Auth5Field, string>>
  message?: string
  status: 'error'
} | void

interface Auth5Props {
  defaultMode?: Auth5Mode
  focusOnMount?: boolean
  /** Where "Forgot password?" leads, such as a page with Auth 6. Leave it out to hide the link. */
  forgotPasswordHref?: string
  /** Send the person to the provider. A throw shows that it couldn't be reached. */
  onProvider?: (id: string) => void | Promise<void>
  /** Check the email and password again on the server; this form only checks they're filled in. */
  onSignIn?: (values: { email: string; password: string }) => Promise<Auth5Result>
  /** Check every field again on the server, the password rules included. */
  onSignUp?: (values: {
    email: string
    name: string
    password: string
  }) => Promise<Auth5Result>
  /** Named in "New to Acme Analytics?". */
  productName: string
  providers?: AuthProvider[]
  /** One sentence about signing up, such as a free trial. */
  signUpNote?: string
  /** Shown under the sign-up button, such as links to the terms. */
  terms?: ReactNode
}

const exampleProps: Auth5Props = {
  forgotPasswordHref: '#forgot-password',
  onSignIn: async ({ password }) => {
    await new Promise((resolve) => setTimeout(resolve, 700))
    if (password !== 'Northwind1')
      return {
        message:
          'That email and password don’t match. Try again, or reset your password.',
        status: 'error',
      }
  },
  onSignUp: async () => {
    await new Promise((resolve) => setTimeout(resolve, 900))
  },
  productName: 'Acme Analytics',
  providers: [
    { icon: <GoogleLogo />, id: 'google', name: 'Google' },
    { icon: <XLogo />, id: 'x', name: 'X' },
    { icon: <GitHubLogo />, id: 'github', name: 'GitHub' },
  ],
  signUpNote: 'Free for 14 days. No card needed.',
  terms: (
    <>
      By creating an account you agree to the{' '}
      <a href='#terms' className='text-foreground underline underline-offset-4'>
        Terms
      </a>{' '}
      and the{' '}
      <a href='#privacy' className='text-foreground underline underline-offset-4'>
        Privacy Policy
      </a>
      .
    </>
  ),
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Values = Record<Auth5Field, string>

const Auth5 = (props: Auth5Props) => {
  const {
    defaultMode = 'sign-in',
    focusOnMount = false,
    forgotPasswordHref,
    onProvider,
    onSignIn,
    onSignUp,
    productName,
    providers = [],
    signUpNote,
    terms,
  } = props
  const [mode, setMode] = useState(defaultMode)
  const [message, setMessage] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const refused = useRef(false)
  const focusedMode = useRef<Auth5Mode | null>(focusOnMount ? null : defaultMode)
  const signUp = mode === 'sign-up'

  const form = useSimpleForm<Values>({
    defaultValues: { email: '', name: '', password: '' },
    onSubmit: async ({ email, name, password }) => {
      refused.current = false
      const values = { email: email.trim().toLowerCase(), password }
      const result = signUp
        ? await onSignUp?.({ ...values, name: name.trim() })
        : await onSignIn?.(values)
      if (result?.status !== 'error') return
      refused.current = true
      startTransition(() => setMessage(result.message ?? null))
      return result.errors
    },
    validate: ({ email, name, password }): FormErrors<Values> => ({
      email: !email.trim()
        ? 'Enter your email address.'
        : EMAIL.test(email.trim())
          ? undefined
          : 'Enter an email address like name@company.com.',
      name: signUp && !name.trim() ? 'Enter your name.' : undefined,
      password: !password
        ? signUp
          ? 'Choose a password.'
          : 'Enter your password.'
        : signUp && getMissingPasswordRules(password).length
          ? 'Not strong enough yet.'
          : undefined,
    }),
  })

  useEffect(() => {
    if (mode === focusedMode.current) return
    focusedMode.current = mode
    document.getElementById(form.getId(mode === 'sign-up' ? 'name' : 'email'))?.focus()
  }, [form, mode])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (form.isSubmitting) return
    setMessage(null)
    try {
      const saved = await form.submit(event)
      if (saved && !refused.current) startTransition(() => setDone(true))
    } catch {
      startTransition(() =>
        setMessage(
          signUp
            ? 'We couldn’t create your account. Check your connection and try again.'
            : 'We couldn’t sign you in. Check your connection and try again.',
        ),
      )
    }
  }

  const switchMode = () => {
    setMode(signUp ? 'sign-in' : 'sign-up')
    setMessage(null)
  }

  const pending = form.isSubmitting
  const strengthId = `${form.getId('password')}-strength`

  return (
    <AuthLayout
      media={
        done ? (
          <AuthIcon tone='done' />
        ) : (
          <AuthIcon>
            <IconPlaceholder
              lucide='LogInIcon'
              tabler='IconLogin'
              hugeicons='Login03Icon'
              phosphor='SignInIcon'
              remixicon='RiLoginBoxLine'
              aria-hidden
            />
          </AuthIcon>
        )
      }
      title={
        <RollingText
          text={
            done
              ? signUp
                ? 'Account created'
                : 'You’re signed in'
              : signUp
                ? 'Create your account'
                : 'Welcome back'
          }
          wrap
        />
      }
      description={
        <RollingText
          text={
            done
              ? 'Taking you to your workspace…'
              : signUp
                ? (signUpNote ?? 'It takes a minute.')
                : 'Sign in to pick up where you left off.'
          }
          wrap
        />
      }
    >
      <AuthReveal open={!done}>
        <div className='flex flex-col gap-6'>
          <form
            method='post'
            noValidate
            onSubmit={(event) => void submit(event)}
            className='flex flex-col'
          >
            <AuthReveal open={signUp} className='pb-4'>
              <Field data-invalid={form.errors.name ? true : undefined}>
                <FieldLabel htmlFor={form.getId('name')}>Name</FieldLabel>
                <Input autoComplete='name' disabled={pending} {...form.field('name')} />
                <FieldError {...form.error('name')} />
              </Field>
            </AuthReveal>
            <div className='flex flex-col gap-4'>
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
              <Field data-invalid={form.errors.password ? true : undefined}>
                <div className='flex items-baseline justify-between gap-3'>
                  <FieldLabel htmlFor={form.getId('password')}>Password</FieldLabel>
                  {forgotPasswordHref && (
                    <a
                      href={forgotPasswordHref}
                      inert={signUp}
                      className='text-muted-foreground hover:text-foreground text-sm underline-offset-4 transition-opacity duration-200 hover:underline data-[hidden]:opacity-0'
                      data-hidden={signUp || undefined}
                    >
                      Forgot password?
                    </a>
                  )}
                </div>
                <PasswordInput
                  autoComplete={signUp ? 'new-password' : 'current-password'}
                  disabled={pending}
                  {...form.field('password')}
                  aria-describedby={
                    [signUp && strengthId, form.field('password')['aria-describedby']]
                      .filter(Boolean)
                      .join(' ') || undefined
                  }
                />
                <FieldError {...form.error('password')} />
              </Field>
            </div>
            <AuthReveal open={signUp} className='pt-3'>
              <PasswordStrength id={strengthId} password={form.values.password} />
            </AuthReveal>
            {message && (
              <p role='alert' className='text-destructive mt-4 text-sm text-pretty'>
                {message}
              </p>
            )}
            <Button
              type='submit'
              size='lg'
              className='mt-5 aria-disabled:opacity-50'
              aria-disabled={pending || undefined}
            >
              <RollingText
                text={
                  pending
                    ? signUp
                      ? 'Creating account…'
                      : 'Signing in…'
                    : signUp
                      ? 'Create account'
                      : 'Sign in'
                }
              />
            </Button>
            {terms && (
              <AuthReveal open={signUp} className='pt-3'>
                <p className='text-muted-foreground text-xs text-pretty'>{terms}</p>
              </AuthReveal>
            )}
          </form>
          {providers.length > 0 && (
            <>
              <AuthDivider />
              <AuthProviderButtons
                providers={providers}
                disabled={pending}
                onSelect={onProvider}
              />
            </>
          )}
          <AuthSwitch
            title={signUp ? 'Already have an account?' : `New to ${productName}?`}
            description={
              signUp
                ? providers.length
                  ? 'Sign in with your email or an account you already use.'
                  : 'Sign in with your email.'
                : signUpNote
                  ? `Create an account. ${signUpNote}`
                  : 'Create an account.'
            }
            onClick={switchMode}
          />
        </div>
      </AuthReveal>
      <p role='status' className='sr-only'>
        {done ? (signUp ? 'Account created' : 'You’re signed in') : ''}
      </p>
    </AuthLayout>
  )
}

export { Auth5, exampleProps as auth5ExampleProps, type Auth5Props, type Auth5Result }
