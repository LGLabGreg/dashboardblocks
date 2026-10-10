'use client'

import { AuthLayout, OtpInput } from '@/registry/components/dashboardblocks/auth'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type FormEvent, type ReactNode, useEffect, useId, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

interface VerifyResult {
  ok: boolean
  attemptsLeft?: number
}

interface Auth3Props {
  focusOnMount?: boolean
  brand: ReactNode
  email: string
  signOutHref: string
  trustDays?: number
  onVerify?: (
    code: string,
    options: { kind: 'app' | 'recovery'; trustDevice: boolean },
  ) => VerifyResult | Promise<VerifyResult>
  onVerified?: () => void
}

const exampleProps: Auth3Props = {
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
  signOutHref: '#',
  trustDays: 30,
}

const EXAMPLE_ATTEMPTS = 5

const Auth3 = (props: Auth3Props) => {
  const {
    focusOnMount = false,
    brand,
    email,
    onVerified,
    onVerify,
    signOutHref,
    trustDays,
  } = props
  const id = useId()
  const [kind, setKind] = useState<'app' | 'recovery'>('app')
  const [code, setCode] = useState('')
  const [recovery, setRecovery] = useState('')
  const [trustDevice, setTrustDevice] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locked, setLocked] = useState(false)
  const [verified, setVerified] = useState(false)
  const [exampleAttempts, setExampleAttempts] = useState(EXAMPLE_ATTEMPTS)
  const [failures, setFailures] = useState(0)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (failures && !checking)
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, [failures, checking])

  const fail = (message: string) => {
    setError(message)
    setFailures((count) => count + 1)
  }

  const tryExampleCode = (value: string): VerifyResult => {
    const ok = kind === 'app' ? value === '123456' : /^\w{4}-\w{4}$/.test(value)
    const left = ok ? exampleAttempts : Math.max(0, exampleAttempts - 1)
    setExampleAttempts(left)
    return { attemptsLeft: left, ok }
  }

  const verify = async (value: string) => {
    if (checking || locked) return
    if (kind === 'app' && !/^\d{6}$/.test(value))
      return fail('Enter all 6 digits from your authenticator app.')
    if (kind === 'recovery' && !value.trim()) return fail('Enter a recovery code.')
    setChecking(true)
    setError(null)
    try {
      const result = onVerify
        ? await onVerify(value.trim(), { kind, trustDevice })
        : tryExampleCode(value.trim())
      if (result.ok) {
        setVerified(true)
        onVerified?.()
        return
      }
      if (result.attemptsLeft === 0) {
        setLocked(true)
        return setError('Too many tries. Wait 15 minutes, then try again.')
      }
      setCode('')
      fail(
        kind === 'app'
          ? `That code didn’t work.${result.attemptsLeft ? ` ${result.attemptsLeft} tries left.` : ''} Codes change every 30 seconds, so use the newest one.`
          : 'That recovery code didn’t work, or it has been used.',
      )
    } catch {
      fail('We couldn’t check the code. Try again.')
    } finally {
      setChecking(false)
    }
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void verify(kind === 'app' ? code : recovery)
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
        title='You’re signed in'
        description='Taking you to your dashboards…'
      >
        <p role='status' className='sr-only'>
          Signed in
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
            lucide='SmartphoneIcon'
            tabler='IconDeviceMobile'
            hugeicons='SmartPhone01Icon'
            phosphor='DeviceMobileIcon'
            remixicon='RiSmartphoneLine'
            aria-hidden
          />
        </span>
      }
      title='Two-factor authentication'
      description={
        kind === 'app'
          ? 'Enter the 6-digit code from your authenticator app.'
          : 'Enter one of the recovery codes you saved when you set up two-factor.'
      }
      footer={
        <>
          <span>
            Signed in as <span className='text-foreground'>{email}</span>
          </span>
          <a
            href={signOutHref}
            className='hover:text-foreground underline underline-offset-4'
          >
            Sign out
          </a>
        </>
      }
    >
      <form
        method='post'
        ref={formRef}
        noValidate
        onSubmit={submit}
        className='flex flex-col gap-4'
      >
        {kind === 'app' ? (
          <OtpInput
            aria-label='Code from your authenticator app'
            aria-describedby={error ? `${id}-error` : undefined}
            focusOnMount={focusOnMount}
            value={code}
            onChange={(next) => {
              setCode(next)
              setError(null)
            }}
            onComplete={(next) => void verify(next)}
            invalid={Boolean(error)}
            disabled={checking || locked}
          />
        ) : (
          <div className='flex flex-col gap-2'>
            <label htmlFor={`${id}-recovery`} className='text-sm font-medium'>
              Recovery code
            </label>
            <Input
              id={`${id}-recovery`}
              autoComplete='off'
              spellCheck={false}
              placeholder='xxxx-xxxx'
              value={recovery}
              onChange={(event) => {
                setRecovery(event.target.value)
                setError(null)
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              disabled={checking || locked}
              className='font-mono'
            />
          </div>
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
        {trustDays !== undefined && (
          <div className='flex items-center justify-between gap-4 rounded-lg border p-3'>
            <span id={`${id}-trust`} className='text-sm'>
              Trust this device for {trustDays} days
            </span>
            <Switch
              aria-labelledby={`${id}-trust`}
              checked={trustDevice}
              onCheckedChange={setTrustDevice}
            />
          </div>
        )}
        <Button type='submit' disabled={checking || locked}>
          {checking ? 'Checking…' : 'Verify'}
        </Button>
        <Button
          type='button'
          variant='ghost'
          onClick={() => {
            setKind(kind === 'app' ? 'recovery' : 'app')
            setError(null)
          }}
        >
          {kind === 'app' ? 'Use a recovery code instead' : 'Use your authenticator app'}
        </Button>
      </form>
    </AuthLayout>
  )
}

export { Auth3, exampleProps as auth3ExampleProps, type Auth3Props, type VerifyResult }
