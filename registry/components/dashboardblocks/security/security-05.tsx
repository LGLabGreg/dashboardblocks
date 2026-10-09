'use client'

import {
  CopyButton,
  formatDate,
  useCopyToClipboard,
} from '@/registry/components/dashboardblocks/settings'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type FormEvent, type ReactNode, useId, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import { cn } from '@/lib/utils'

interface SecurityKey {
  addedAt: Date
  id: string
  /** e.g. "YubiKey 5C" or "MacBook Touch ID". */
  name: string
}

interface AuthenticatorSetup {
  /** The QR code for the authenticator app, rendered by your server or a QR library. */
  qrCode: ReactNode
  /** The same secret as text, for typing in by hand. */
  secret: string
}

interface Security5Props {
  /** When the authenticator app was added. Leave out when it isn't set up. */
  authenticatorAddedAt?: Date
  description: string
  onAddSecurityKey?: () => void
  onRemoveAuthenticator?: () => void
  onRemoveSecurityKey?: (id: string) => void
  /** Called when new recovery codes are shown, so the old ones can be revoked. */
  onRegenerateRecoveryCodes?: () => void
  /**
   * Checks a code from the authenticator app. Return `false` to show an error.
   * Without it, any six digits are accepted.
   */
  onVerify?: (code: string) => boolean | Promise<boolean>
  /** Codes to show once, after setup or when regenerated. */
  recoveryCodes: string[]
  /** Unused recovery codes left. */
  recoveryCodesLeft: number
  /** Stops the last method being removed, when the workspace requires two-factor. */
  required?: boolean
  securityKeys: SecurityKey[]
  setup: AuthenticatorSetup
  title: string
}

/** A stand-in QR code for the example. Pass a real one from your server. */
function ExampleQrCode() {
  const size = 21
  const finder = (x: number, y: number) => {
    const inside = (ox: number, oy: number) => {
      const dx = x - ox
      const dy = y - oy
      if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return null
      return (
        dx === 0 ||
        dy === 0 ||
        dx === 6 ||
        dy === 6 ||
        (dx > 1 && dx < 5 && dy > 1 && dy < 5)
      )
    }
    return inside(0, 0) ?? inside(size - 7, 0) ?? inside(0, size - 7)
  }
  const cells: [number, number][] = []
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const fixed = finder(x, y)
      const on = fixed ?? (x * 7 + y * 13 + x * y) % 5 < 2
      if (on) cells.push([x, y])
    }
  }
  return (
    <svg viewBox={`-2 -2 ${size + 4} ${size + 4}`} role='img' aria-label='QR code'>
      <rect x={-2} y={-2} width={size + 4} height={size + 4} fill='white' />
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill='black' />
      ))}
    </svg>
  )
}

const exampleProps: Security5Props = {
  description:
    'A second step at sign-in, so a password alone can’t get into your account.',
  recoveryCodes: [
    'k7p2-9xqm',
    'hd4w-ja8e',
    'r3tn-vb6c',
    'm9fz-2ksl',
    'q5ye-ut7g',
    'w8cd-n4rp',
    'b2xh-6jwa',
    'z6le-p3mt',
  ],
  recoveryCodesLeft: 8,
  securityKeys: [
    { addedAt: new Date(Date.UTC(2026, 2, 4)), id: 'k1', name: 'YubiKey 5C' },
    { addedAt: new Date(Date.UTC(2026, 6, 19)), id: 'k2', name: 'MacBook Touch ID' },
  ],
  setup: { qrCode: <ExampleQrCode />, secret: 'JBSW Y3DP EHPK 3PXP' },
  title: 'Two-factor authentication',
}

type Step = 'idle' | 'setup' | 'codes'

const Security5 = (props: Security5Props) => {
  const {
    description,
    onAddSecurityKey,
    onRegenerateRecoveryCodes,
    onRemoveAuthenticator,
    onRemoveSecurityKey,
    onVerify,
    recoveryCodes,
    required = false,
    setup,
    title,
  } = props
  const id = useId()
  const [authenticator, setAuthenticator] = useState(props.authenticatorAddedAt)
  const [keys, setKeys] = useState(props.securityKeys)
  const [codesLeft, setCodesLeft] = useState(props.recoveryCodesLeft)
  const [step, setStep] = useState<Step>('idle')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const { copied, copy } = useCopyToClipboard()

  const methods = (authenticator ? 1 : 0) + keys.length
  const enabled = methods > 0
  const locked = required && methods === 1

  const verify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const digits = code.replace(/\s/g, '')
    if (!/^\d{6}$/.test(digits)) return setError('Enter the 6-digit code from the app.')
    setVerifying(true)
    const ok = onVerify ? await onVerify(digits) : true
    setVerifying(false)
    if (!ok) {
      return setError(
        'That code didn’t work. Codes change every 30 seconds, so try the newest one.',
      )
    }
    setAuthenticator(new Date())
    setCodesLeft(recoveryCodes.length)
    setCode('')
    setError(null)
    setStep('codes')
  }

  const download = () => {
    const blob = new Blob([`${recoveryCodes.join('\n')}\n`], { type: 'text/plain' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'recovery-codes.txt'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const statusBadge = (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3.5',
        enabled
          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
          : 'bg-amber-500/10 text-amber-800 dark:text-amber-400',
      )}
    >
      {enabled ? (
        <IconPlaceholder
          lucide='CircleCheckIcon'
          tabler='IconCircleCheck'
          hugeicons='CheckmarkCircle02Icon'
          phosphor='CheckCircleIcon'
          remixicon='RiCheckboxCircleLine'
          aria-hidden
        />
      ) : (
        <IconPlaceholder
          lucide='TriangleAlertIcon'
          tabler='IconAlertTriangle'
          hugeicons='Alert02Icon'
          phosphor='WarningIcon'
          remixicon='RiErrorWarningLine'
          aria-hidden
        />
      )}
      {enabled ? 'On' : 'Off'}
    </span>
  )

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>{statusBadge}</CardAction>
      </CardHeader>
      <CardContent>
        <ul className='flex flex-col divide-y border-t'>
          <li className='flex flex-col gap-4 py-4'>
            <div className='flex items-start gap-3'>
              <span
                aria-hidden
                className='bg-muted text-muted-foreground hidden size-9 shrink-0 items-center justify-center rounded-lg @sm:flex [&_svg]:size-4'
              >
                <IconPlaceholder
                  lucide='SmartphoneIcon'
                  tabler='IconDeviceMobile'
                  hugeicons='SmartPhone01Icon'
                  phosphor='DeviceMobileIcon'
                  remixicon='RiSmartphoneLine'
                />
              </span>
              <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                <span id={`${id}-app`} className='text-sm font-medium'>
                  Authenticator app
                </span>
                <span className='text-muted-foreground text-sm'>
                  {authenticator ? (
                    <>
                      Added{' '}
                      <time dateTime={authenticator.toISOString()}>
                        {formatDate(authenticator)}
                      </time>
                    </>
                  ) : (
                    'Codes from an app like 1Password, Authy or Google Authenticator.'
                  )}
                </span>
              </div>
              {authenticator ? (
                <Button
                  variant='ghost'
                  size='sm'
                  disabled={locked}
                  aria-describedby={locked ? `${id}-required` : undefined}
                  onClick={() => {
                    setAuthenticator(undefined)
                    onRemoveAuthenticator?.()
                  }}
                >
                  Remove
                </Button>
              ) : (
                step === 'idle' && (
                  <Button variant='outline' size='sm' onClick={() => setStep('setup')}>
                    Set up
                  </Button>
                )
              )}
            </div>

            {step === 'setup' && (
              <form
                method='post'
                onSubmit={(event) => void verify(event)}
                noValidate
                aria-labelledby={`${id}-app`}
                className='flex flex-col gap-4 rounded-lg border p-4 @md:flex-row'
              >
                <div className='size-36 shrink-0 self-center overflow-hidden rounded-md border bg-white p-1 @md:self-start [&_svg]:size-full'>
                  {setup.qrCode}
                </div>
                <div className='flex min-w-0 flex-1 flex-col gap-3'>
                  <p className='text-sm'>
                    Scan the code with your authenticator app, or enter this key:
                  </p>
                  <div className='bg-background flex items-center gap-1 rounded-md border py-1 pr-1 pl-3'>
                    <code className='min-w-0 flex-1 truncate font-mono text-sm'>
                      {setup.secret}
                    </code>
                    <CopyButton
                      label='Copy setup key'
                      value={setup.secret.replace(/\s/g, '')}
                    />
                  </div>
                  <div className='flex flex-col gap-2'>
                    <label htmlFor={`${id}-code`} className='text-sm font-medium'>
                      Code from the app
                    </label>
                    <div className='flex gap-2'>
                      <Input
                        id={`${id}-code`}
                        inputMode='numeric'
                        autoComplete='one-time-code'
                        maxLength={7}
                        placeholder='123 456'
                        value={code}
                        onChange={(event) => setCode(event.target.value)}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={error ? `${id}-code-error` : undefined}
                        className='w-32 font-mono tracking-widest tabular-nums'
                      />
                      <Button type='submit' disabled={verifying}>
                        {verifying ? 'Checking…' : 'Verify'}
                      </Button>
                      <Button
                        type='button'
                        variant='ghost'
                        onClick={() => {
                          setStep('idle')
                          setCode('')
                          setError(null)
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                    {error && (
                      <p id={`${id}-code-error`} className='text-destructive text-sm'>
                        {error}
                      </p>
                    )}
                  </div>
                </div>
              </form>
            )}
          </li>

          <li className='flex flex-col gap-3 py-4'>
            <div className='flex items-start gap-3'>
              <span
                aria-hidden
                className='bg-muted text-muted-foreground hidden size-9 shrink-0 items-center justify-center rounded-lg @sm:flex [&_svg]:size-4'
              >
                <IconPlaceholder
                  lucide='KeyRoundIcon'
                  tabler='IconKey'
                  hugeicons='Key01Icon'
                  phosphor='KeyIcon'
                  remixicon='RiKey2Line'
                />
              </span>
              <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                <span className='text-sm font-medium'>Security keys and passkeys</span>
                <span className='text-muted-foreground text-sm'>
                  A hardware key, or your device’s fingerprint or face unlock.
                </span>
              </div>
              <Button variant='outline' size='sm' onClick={onAddSecurityKey}>
                Add
              </Button>
            </div>
            {keys.length > 0 && (
              <ul className='flex flex-col gap-2 @sm:pl-12'>
                {keys.map((key) => (
                  <li key={key.id} className='flex items-center gap-3'>
                    <div className='flex min-w-0 flex-1 flex-col'>
                      <span className='truncate text-sm'>{key.name}</span>
                      <span className='text-muted-foreground text-xs'>
                        Added{' '}
                        <time dateTime={key.addedAt.toISOString()}>
                          {formatDate(key.addedAt)}
                        </time>
                      </span>
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      disabled={locked}
                      aria-label={`Remove ${key.name}`}
                      aria-describedby={locked ? `${id}-required` : undefined}
                      onClick={() => {
                        setKeys((current) => current.filter((item) => item.id !== key.id))
                        onRemoveSecurityKey?.(key.id)
                      }}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </li>

          {enabled && (
            <li className='flex flex-col gap-4 py-4 last:pb-0'>
              <div className='flex items-start gap-3'>
                <span
                  aria-hidden
                  className='bg-muted text-muted-foreground hidden size-9 shrink-0 items-center justify-center rounded-lg @sm:flex [&_svg]:size-4'
                >
                  <IconPlaceholder
                    lucide='LockIcon'
                    tabler='IconLock'
                    hugeicons='SquareLock02Icon'
                    phosphor='LockIcon'
                    remixicon='RiLockLine'
                  />
                </span>
                <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                  <span id={`${id}-codes`} className='text-sm font-medium'>
                    Recovery codes
                  </span>
                  <span
                    className={cn(
                      'text-sm',
                      codesLeft <= 2
                        ? 'text-amber-800 dark:text-amber-400'
                        : 'text-muted-foreground',
                    )}
                  >
                    {codesLeft} left. Each works once, if you lose your other methods.
                  </span>
                </div>
                {step !== 'codes' && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      setCodesLeft(recoveryCodes.length)
                      setStep('codes')
                      onRegenerateRecoveryCodes?.()
                    }}
                  >
                    New codes
                  </Button>
                )}
              </div>
              {step === 'codes' && (
                <section
                  aria-labelledby={`${id}-codes`}
                  className='bg-muted/50 flex flex-col gap-3 rounded-lg border p-4'
                >
                  <p className='text-sm'>
                    Save these somewhere safe. They won’t be shown again, and any older
                    codes no longer work.
                  </p>
                  <ol className='bg-background grid grid-cols-2 gap-x-6 gap-y-1 rounded-md border p-3 font-mono text-sm @md:grid-cols-4'>
                    {recoveryCodes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                  <div className='flex flex-wrap gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => void copy(recoveryCodes.join('\n'))}
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                    <Button variant='outline' size='sm' onClick={download}>
                      Download
                    </Button>
                    <Button size='sm' className='ml-auto' onClick={() => setStep('idle')}>
                      I’ve saved them
                    </Button>
                  </div>
                </section>
              )}
            </li>
          )}
        </ul>
        {locked && (
          <p
            id={`${id}-required`}
            className='text-muted-foreground border-t pt-4 text-sm'
          >
            Your workspace requires two-factor, so add another method before removing this
            one.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export {
  Security5,
  exampleProps as security5ExampleProps,
  type AuthenticatorSetup,
  type Security5Props,
  type SecurityKey,
}
