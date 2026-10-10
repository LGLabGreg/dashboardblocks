'use client'

import { ErrorPageLayout } from '@/registry/components/dashboardblocks/error-pages'
import { PersonAvatar } from '@/registry/components/dashboardblocks/team'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type FormEvent, type ReactNode, useId, useState } from 'react'

import { Button, buttonVariants } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ErrorPages2Props {
  brand?: ReactNode
  homeHref: string
  onRequestAccess?: (message: string) => void | Promise<void>
  owner: { avatar?: string; name: string }
  /** Starts in the sent state, when a request is already waiting. */
  requested?: boolean
  resource: string
  signedInAs: string
  switchAccountHref: string
}

const exampleProps: ErrorPages2Props = {
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
  homeHref: '#',
  onRequestAccess: () => new Promise((resolve) => setTimeout(resolve, 800)),
  owner: { name: 'Amara Okafor' },
  resource: 'the Revenue overview dashboard',
  signedInAs: 'noah@acme.co',
  switchAccountHref: '#',
}

const ErrorPages2 = (props: ErrorPages2Props) => {
  const {
    brand,
    homeHref,
    onRequestAccess,
    owner,
    resource,
    signedInAs,
    switchAccountHref,
  } = props
  const id = useId()
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(props.requested ?? false)
  const [error, setError] = useState<string | null>(null)

  const request = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSending(true)
    setError(null)
    try {
      await onRequestAccess?.(message.trim())
      setSent(true)
    } catch {
      setError('The request didn’t send. Try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <ErrorPageLayout
      brand={brand}
      code='403'
      icon={
        <IconPlaceholder
          lucide='LockIcon'
          tabler='IconLock'
          hugeicons='SquareLock02Icon'
          phosphor='LockIcon'
          remixicon='RiLockLine'
        />
      }
      title='You don’t have access'
      description={`You need permission to view ${resource}.`}
    >
      <div className='flex flex-col gap-4 rounded-xl border p-4 text-left'>
        <div className='flex items-center gap-3'>
          <PersonAvatar person={owner} />
          <p className='text-sm'>
            <span className='font-medium'>{owner.name}</span>{' '}
            <span className='text-muted-foreground'>can give you access.</span>
          </p>
        </div>
        {sent ? (
          <p
            role='status'
            className='flex items-start gap-2 text-sm text-emerald-700 dark:text-emerald-400 [&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:shrink-0'
          >
            <IconPlaceholder
              lucide='CircleCheckIcon'
              tabler='IconCircleCheck'
              hugeicons='CheckmarkCircle02Icon'
              phosphor='CheckCircleIcon'
              remixicon='RiCheckboxCircleLine'
              aria-hidden
            />
            Request sent. We’ll email you when {owner.name.split(' ')[0]} replies.
          </p>
        ) : (
          <form
            method='post'
            onSubmit={(event) => void request(event)}
            className='flex flex-col gap-3'
          >
            <label htmlFor={`${id}-message`} className='text-sm font-medium'>
              Message{' '}
              <span className='text-muted-foreground font-normal'>(optional)</span>
            </label>
            <Textarea
              id={`${id}-message`}
              rows={3}
              placeholder='Why you need access'
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              aria-describedby={error ? `${id}-error` : undefined}
            />
            {error && (
              <p id={`${id}-error`} className='text-destructive text-sm'>
                {error}
              </p>
            )}
            <Button type='submit' disabled={sending}>
              {sending ? 'Sending…' : 'Request access'}
            </Button>
          </form>
        )}
      </div>
      <div className='flex flex-col items-center gap-3 text-sm'>
        <p className='text-muted-foreground'>
          Signed in as <span className='text-foreground font-medium'>{signedInAs}</span>.{' '}
          <a
            href={switchAccountHref}
            className='text-foreground font-medium underline underline-offset-4'
          >
            Switch account
          </a>
        </p>
        <a href={homeHref} className={buttonVariants({ variant: 'ghost' })}>
          Back to dashboards
        </a>
      </div>
    </ErrorPageLayout>
  )
}

export { ErrorPages2, exampleProps as errorPages2ExampleProps, type ErrorPages2Props }
