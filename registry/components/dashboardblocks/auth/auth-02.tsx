'use client'

import { AuthLayout, WorkspaceAvatar } from '@/registry/components/dashboardblocks/auth'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type ReactNode, useId, useState } from 'react'

import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { cn } from '@/lib/utils'

interface PickerWorkspace {
  href: string
  id: string
  logo?: string
  members: number
  name: string
  /** Such as "Owner" or "Member". */
  role: string
}

interface PendingInvite {
  id: string
  invitedBy: string
  logo?: string
  name: string
}

interface Auth2Props {
  brand: ReactNode
  createHref: string
  email: string
  invites: PendingInvite[]
  onAcceptInvite?: (id: string) => void | Promise<void>
  /** Signs out, so they can sign in with another account. */
  signOutHref: string
  workspaces: PickerWorkspace[]
}

const exampleProps: Auth2Props = {
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
  createHref: '#',
  email: 'amara@acme.co',
  invites: [{ id: 'i1', invitedBy: 'Liam Chen', name: 'Northwind Finance' }],
  onAcceptInvite: () => new Promise((resolve) => setTimeout(resolve, 600)),
  signOutHref: '#',
  workspaces: [
    { href: '#', id: 'w1', members: 24, name: 'Acme Analytics', role: 'Owner' },
    { href: '#', id: 'w2', members: 8, name: 'Acme Marketing', role: 'Admin' },
    { href: '#', id: 'w3', members: 112, name: 'Globex', role: 'Member' },
    { href: '#', id: 'w4', members: 3, name: 'Side project', role: 'Owner' },
  ],
}

/** Search appears once there are more workspaces than this. */
const SEARCH_AFTER = 5

const Auth2 = (props: Auth2Props) => {
  const { brand, createHref, email, onAcceptInvite, signOutHref } = props
  const id = useId()
  const [workspaces, setWorkspaces] = useState(props.workspaces)
  const [invites, setInvites] = useState(props.invites)
  const [joining, setJoining] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  const shown = workspaces.filter((workspace) =>
    workspace.name.toLowerCase().includes(query.trim().toLowerCase()),
  )

  const join = async (invite: PendingInvite) => {
    setJoining(invite.id)
    setError(null)
    try {
      await onAcceptInvite?.(invite.id)
      setInvites((current) => current.filter((item) => item.id !== invite.id))
      setWorkspaces((current) => [
        ...current,
        {
          href: '#',
          id: invite.id,
          logo: invite.logo,
          members: 0,
          name: invite.name,
          role: 'Member',
        },
      ])
    } catch {
      setError(`Couldn’t join ${invite.name}. Try again.`)
    } finally {
      setJoining(null)
    }
  }

  return (
    <AuthLayout
      brand={brand}
      title='Choose a workspace'
      description={
        <>
          Signed in as <span className='text-foreground font-medium'>{email}</span>
        </>
      }
      footer={
        <a
          href={signOutHref}
          className='hover:text-foreground underline underline-offset-4'
        >
          Use another account
        </a>
      }
    >
      <div className='flex flex-col gap-6'>
        {workspaces.length > SEARCH_AFTER && (
          <div>
            <label htmlFor={`${id}-search`} className='sr-only'>
              Find a workspace
            </label>
            <Input
              id={`${id}-search`}
              type='search'
              placeholder='Find a workspace'
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        )}

        <section aria-labelledby={`${id}-yours`} className='flex flex-col gap-2'>
          <h2 id={`${id}-yours`} className='text-muted-foreground text-xs font-medium'>
            Your workspaces
          </h2>
          {shown.length > 0 ? (
            <ul className='flex flex-col divide-y rounded-xl border'>
              {shown.map((workspace) => (
                <li key={workspace.id}>
                  <a
                    href={workspace.href}
                    className='hover:bg-muted/50 focus-visible:ring-ring/50 flex items-center gap-3 p-3 outline-none first:rounded-t-xl last:rounded-b-xl focus-visible:ring-3'
                  >
                    <WorkspaceAvatar name={workspace.name} logo={workspace.logo} />
                    <span className='flex min-w-0 flex-1 flex-col'>
                      <span className='truncate text-sm font-medium'>
                        {workspace.name}
                      </span>
                      <span className='text-muted-foreground text-xs'>
                        {workspace.role}
                        {workspace.members > 0 && (
                          <>
                            {' · '}
                            {workspace.members}{' '}
                            {workspace.members === 1 ? 'member' : 'members'}
                          </>
                        )}
                      </span>
                    </span>
                    <IconPlaceholder
                      lucide='ChevronRightIcon'
                      tabler='IconChevronRight'
                      hugeicons='ArrowRight01Icon'
                      phosphor='CaretRightIcon'
                      remixicon='RiArrowRightSLine'
                      aria-hidden
                      className='text-muted-foreground size-4 shrink-0'
                    />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className='text-muted-foreground rounded-xl border border-dashed p-4 text-center text-sm'>
              {workspaces.length > 0
                ? `No workspaces match “${query}”.`
                : 'You’re not in any workspaces yet.'}
            </p>
          )}
        </section>

        {invites.length > 0 && (
          <section aria-labelledby={`${id}-invites`} className='flex flex-col gap-2'>
            <h2
              id={`${id}-invites`}
              className='text-muted-foreground text-xs font-medium'
            >
              Invites
            </h2>
            <ul className='flex flex-col divide-y rounded-xl border'>
              {invites.map((invite) => (
                <li key={invite.id} className='flex items-center gap-3 p-3'>
                  <WorkspaceAvatar name={invite.name} logo={invite.logo} />
                  <span className='flex min-w-0 flex-1 flex-col'>
                    <span className='truncate text-sm font-medium'>{invite.name}</span>
                    <span className='text-muted-foreground truncate text-xs'>
                      From {invite.invitedBy}
                    </span>
                  </span>
                  <Button
                    size='sm'
                    variant='outline'
                    disabled={joining === invite.id}
                    aria-label={`Join ${invite.name}`}
                    onClick={() => void join(invite)}
                  >
                    {joining === invite.id ? 'Joining…' : 'Join'}
                  </Button>
                </li>
              ))}
            </ul>
            {error && (
              <p role='alert' className='text-destructive text-sm'>
                {error}
              </p>
            )}
          </section>
        )}

        <a
          href={createHref}
          className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
        >
          <IconPlaceholder
            lucide='PlusIcon'
            tabler='IconPlus'
            hugeicons='PlusSignIcon'
            phosphor='PlusIcon'
            remixicon='RiAddLine'
            data-icon='inline-start'
            aria-hidden
          />
          Create a workspace
        </a>
      </div>
    </AuthLayout>
  )
}

export {
  Auth2,
  exampleProps as auth2ExampleProps,
  type Auth2Props,
  type PendingInvite,
  type PickerWorkspace,
}
