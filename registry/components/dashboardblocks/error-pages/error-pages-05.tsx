'use client'

import { ErrorPageLayout } from '@/registry/components/dashboardblocks/error-pages'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import type { ReactNode } from 'react'

import { buttonVariants } from '@/components/ui/button'

type SessionEndReason =
  | 'inactive'
  | 'signed-out-elsewhere'
  | 'password-changed'
  | 'revoked'

interface ErrorPages5Props {
  brand?: ReactNode
  /** The account that was signed in, so they sign back in with the same one. */
  email?: string
  /** Minutes of inactivity before sign-out, for the `inactive` reason. */
  idleMinutes?: number
  reason: SessionEndReason
  /** Where they were, so signing in takes them back. */
  returnTo?: string
  /** Changes and filters saved as a draft before sign-out. */
  savedDraft?: boolean
  /** The sign-in page. `returnTo` is added as a query parameter. */
  signInHref: string
}

const exampleProps: ErrorPages5Props = {
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
  idleMinutes: 30,
  reason: 'inactive',
  returnTo: '/dashboards/revenue-overview',
  savedDraft: true,
  signInHref: '#',
}

const reasons: Record<SessionEndReason, (idleMinutes: number) => string> = {
  inactive: (minutes) =>
    `You were signed out after ${minutes} minutes without activity, to keep your account safe.`,
  'password-changed': () =>
    'Your password was changed, so every device was signed out. Sign in with the new password.',
  revoked: () => 'An admin ended your session. Sign in again to carry on.',
  'signed-out-elsewhere': () => 'You signed out in another tab or window.',
}

/** Adds `returnTo` to the sign-in link, keeping any query it already has. */
function withReturnTo(href: string, returnTo?: string) {
  if (!returnTo) return href
  const [path, hash = ''] = href.split('#')
  const joiner = path.includes('?') ? '&' : '?'
  return `${path}${joiner}returnTo=${encodeURIComponent(returnTo)}${hash ? `#${hash}` : ''}`
}

const ErrorPages5 = ({
  brand,
  email,
  idleMinutes = 30,
  reason,
  returnTo,
  savedDraft = false,
  signInHref,
}: ErrorPages5Props) => (
  <ErrorPageLayout
    brand={brand}
    icon={
      <IconPlaceholder
        lucide='ClockIcon'
        tabler='IconClock'
        hugeicons='Clock01Icon'
        phosphor='ClockIcon'
        remixicon='RiTimeLine'
      />
    }
    title='Your session has ended'
    description={reasons[reason](idleMinutes)}
  >
    {savedDraft && (
      <p className='bg-muted/50 flex items-start gap-2 rounded-lg border p-3 text-left text-sm [&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:shrink-0'>
        <IconPlaceholder
          lucide='SaveIcon'
          tabler='IconDeviceFloppy'
          hugeicons='FloppyDiskIcon'
          phosphor='FloppyDiskIcon'
          remixicon='RiSave3Line'
          aria-hidden
          className='text-muted-foreground'
        />
        Your unsaved changes were kept as a draft. They’ll be there when you sign back in.
      </p>
    )}
    <div className='flex flex-col items-center gap-3'>
      <a href={withReturnTo(signInHref, returnTo)} className={buttonVariants()}>
        {email ? `Sign in as ${email}` : 'Sign in again'}
      </a>
      {email && (
        <a
          href={signInHref}
          className='text-muted-foreground hover:text-foreground text-sm underline underline-offset-4'
        >
          Use another account
        </a>
      )}
    </div>
  </ErrorPageLayout>
)

export {
  ErrorPages5,
  exampleProps as errorPages5ExampleProps,
  type ErrorPages5Props,
  type SessionEndReason,
}
