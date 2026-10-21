'use client'

import { AuthLayout, WorkspaceAvatar } from '@/registry/components/dashboardblocks/auth'
import { AvatarStack, PersonAvatar } from '@/registry/components/dashboardblocks/team'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type ReactNode, startTransition, useState } from 'react'

import { Button, buttonVariants } from '@/components/ui/button'

import { cn } from '@/lib/utils'

interface InviteWorkspace {
  logo?: string
  members: { avatar?: string; id: string; name: string }[]
  memberCount: number
  name: string
}

interface Auth1Props {
  brand: ReactNode
  email: string
  expired?: boolean
  invitedBy: { avatar?: string; name: string }
  onAccept?: () => void | Promise<void>
  onDecline?: () => void
  role: string
  /** What the role can do, under its name. */
  roleDescription?: string
  signedInAs?: string
  switchAccountHref: string
  workspace: InviteWorkspace
}

const exampleProps: Auth1Props = {
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
  email: 'noah@northwind.io',
  invitedBy: { avatar: '/images/avatar-04.webp', name: 'Liam Chen' },
  onAccept: () => new Promise((resolve) => setTimeout(resolve, 800)),
  role: 'Member',
  roleDescription: 'Can create and edit dashboards',
  signedInAs: 'noah@northwind.io',
  switchAccountHref: '#',
  workspace: {
    memberCount: 24,
    members: [
      { avatar: '/images/avatar-05.webp', id: 'm1', name: 'Amara Okafor' },
      { avatar: '/images/avatar-04.webp', id: 'm2', name: 'Liam Chen' },
      { avatar: '/images/avatar-01.webp', id: 'm3', name: 'Sofia Rossi' },
      { avatar: '/images/avatar-06.webp', id: 'm4', name: 'Mateo García' },
    ],
    name: 'Northwind Finance',
  },
}

type Outcome = 'pending' | 'accepted' | 'declined'

const Auth1 = (props: Auth1Props) => {
  const {
    brand,
    email,
    expired = false,
    invitedBy,
    onAccept,
    onDecline,
    role,
    roleDescription,
    signedInAs,
    switchAccountHref,
    workspace,
  } = props
  const [outcome, setOutcome] = useState<Outcome>('pending')
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const wrongAccount =
    signedInAs !== undefined && signedInAs.toLowerCase() !== email.toLowerCase()

  const accept = async () => {
    setJoining(true)
    setError(null)
    try {
      await onAccept?.()
      startTransition(() => setOutcome('accepted'))
    } catch {
      startTransition(() => setError('Couldn’t join the workspace. Try again.'))
    } finally {
      startTransition(() => setJoining(false))
    }
  }

  const title = expired
    ? 'This invite has expired'
    : outcome === 'accepted'
      ? `You’ve joined ${workspace.name}`
      : outcome === 'declined'
        ? 'Invite declined'
        : `Join ${workspace.name}`

  const description = expired ? (
    `Ask ${invitedBy.name} to send a new one.`
  ) : outcome === 'accepted' ? (
    'Taking you to the workspace…'
  ) : outcome === 'declined' ? (
    `We’ve let ${invitedBy.name} know. You can close this page.`
  ) : (
    <>
      <span className='text-foreground font-medium'>{invitedBy.name}</span> invited{' '}
      <span className='text-foreground font-medium'>{email}</span> to the workspace.
    </>
  )

  return (
    <AuthLayout
      brand={brand}
      aside={signedInAs && <span className='truncate'>{signedInAs}</span>}
      media={<WorkspaceAvatar name={workspace.name} logo={workspace.logo} size='lg' />}
      title={title}
      description={description}
    >
      {!expired && outcome === 'pending' && (
        <div className='flex flex-col gap-6'>
          <dl className='flex flex-col divide-y border-y text-sm'>
            <div className='flex items-center justify-between gap-4 py-2.5'>
              <dt className='text-muted-foreground'>Invited by</dt>
              <dd className='flex min-w-0 items-center gap-2 font-medium'>
                <PersonAvatar person={invitedBy} size='sm' />
                <span className='truncate'>{invitedBy.name}</span>
              </dd>
            </div>
            <div className='flex items-center justify-between gap-4 py-2.5'>
              <dt className='text-muted-foreground'>Role</dt>
              <dd className='flex flex-col items-end text-right'>
                <span className='font-medium'>{role}</span>
                {roleDescription && (
                  <span className='text-muted-foreground text-xs'>{roleDescription}</span>
                )}
              </dd>
            </div>
            <div className='flex items-center justify-between gap-4 py-2.5'>
              <dt className='text-muted-foreground'>Members</dt>
              <dd className='flex items-center gap-2'>
                <AvatarStack
                  label={`Members of ${workspace.name}`}
                  people={workspace.members}
                  size='sm'
                />
                <span className='text-muted-foreground text-xs whitespace-nowrap tabular-nums'>
                  {workspace.memberCount} people
                </span>
              </dd>
            </div>
          </dl>

          {wrongAccount ? (
            <div className='flex flex-col gap-3'>
              <p
                role='alert'
                className='bg-muted/50 flex items-start gap-2 rounded-lg px-3 py-2 text-sm text-pretty [&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:shrink-0'
              >
                <IconPlaceholder
                  lucide='TriangleAlertIcon'
                  tabler='IconAlertTriangle'
                  hugeicons='Alert02Icon'
                  phosphor='WarningIcon'
                  remixicon='RiErrorWarningLine'
                  aria-hidden
                  className='text-orange-700 dark:text-orange-400'
                />
                <span>
                  You’re signed in as <span className='font-medium'>{signedInAs}</span>.
                  Switch to <span className='font-medium'>{email}</span> to accept.
                </span>
              </p>
              <a href={switchAccountHref} className={cn(buttonVariants(), 'w-full')}>
                Switch account
              </a>
            </div>
          ) : (
            <div className='flex flex-col gap-2'>
              <Button disabled={joining} onClick={() => void accept()}>
                {joining ? 'Joining…' : 'Accept invite'}
              </Button>
              <Button
                variant='ghost'
                disabled={joining}
                onClick={() => {
                  setOutcome('declined')
                  onDecline?.()
                }}
              >
                Decline
              </Button>
              {error && (
                <p role='alert' className='text-destructive text-sm'>
                  {error}
                </p>
              )}
            </div>
          )}
        </div>
      )}
      {outcome === 'accepted' && (
        <p role='status' className='sr-only'>
          Joined {workspace.name}
        </p>
      )}
    </AuthLayout>
  )
}

export { Auth1, exampleProps as auth1ExampleProps, type Auth1Props, type InviteWorkspace }
