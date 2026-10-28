'use client'

import {
  AuthIcon,
  AuthLayout,
  AuthSwitch,
  OtpInput,
} from '@/registry/components/dashboardblocks/auth'
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
import { Switch } from '@/components/ui/switch'

interface VerifyResult {
  ok: boolean
  attemptsLeft?: number
}

interface Auth3Props {
  email: string
  focusOnMount?: boolean
  onVerified?: () => void
  onVerify?: (
    code: string,
    options: { kind: 'app' | 'recovery'; trustDevice: boolean },
  ) => VerifyResult | Promise<VerifyResult>
  signOutHref: string
  trustDays?: number
}

const exampleProps: Auth3Props = {
  email: 'amara@acme.co',
  signOutHref: '#',
  trustDays: 30,
}

const EXAMPLE_ATTEMPTS = 5

const Auth3 = (props: Auth3Props) => {
  const {
    email,
    focusOnMount = false,
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
      startTransition(() => {
        if (result.ok) {
          setVerified(true)
          onVerified?.()
        } else if (result.attemptsLeft === 0) {
          setLocked(true)
          setError('Too many tries. Wait 15 minutes, then try again.')
        } else {
          setCode('')
          fail(
            kind === 'app'
              ? `That code didn’t work.${result.attemptsLeft ? ` ${result.attemptsLeft} tries left.` : ''} Codes change every 30 seconds, so use the newest one.`
              : 'That recovery code didn’t work, or it has been used.',
          )
        }
      })
    } catch {
      startTransition(() => fail('We couldn’t check the code. Try again.'))
    } finally {
      startTransition(() => setChecking(false))
    }
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void verify(kind === 'app' ? code : recovery)
  }

  if (verified) {
    return (
      <AuthLayout
        media={<AuthIcon tone='done' />}
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
      media={
        <AuthIcon>
          <IconPlaceholder
            lucide='SmartphoneIcon'
            tabler='IconDeviceMobile'
            hugeicons='SmartPhone01Icon'
            phosphor='DeviceMobileIcon'
            remixicon='RiSmartphoneLine'
            aria-hidden
          />
        </AuthIcon>
      }
      title='Two-factor authentication'
      description={
        kind === 'app'
          ? 'Enter the 6-digit code from your authenticator app.'
          : 'Enter one of the recovery codes you saved when you set up two-factor.'
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
          <p id={`${id}-error`} role='alert' className='text-destructive text-sm'>
            {error}
          </p>
        )}
        {trustDays !== undefined && (
          <div className='flex items-center justify-between gap-4 border-y py-3'>
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
      <AuthSwitch
        href={signOutHref}
        title='Use another account'
        description={`Sign out of ${email} first.`}
      />
    </AuthLayout>
  )
}

export { Auth3, exampleProps as auth3ExampleProps, type Auth3Props, type VerifyResult }
