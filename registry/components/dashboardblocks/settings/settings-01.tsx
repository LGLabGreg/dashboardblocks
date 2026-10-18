'use client'

import {
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { Details } from '@/registry/components/dashboardblocks/details'
import {
  type Role,
  RoleMenu,
  formatRelative,
  roleConfig,
  roleOrder,
} from '@/registry/components/dashboardblocks/settings'
import { StatusLabel } from '@/registry/components/dashboardblocks/status-label'
import { PersonAvatar } from '@/registry/components/dashboardblocks/team'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type FormEvent, useId, useState } from 'react'
import { flushSync } from 'react-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Member {
  avatar?: string
  email: string
  id: string
  name: string
  role: Role
}

interface Invite {
  email: string
  id: string
  role: Role
  sentAt: Date
}

interface Settings1Props {
  /** The signed-in member, who can't change their own role or remove themselves. */
  currentMemberId: string
  description: string
  invites?: Invite[]
  /** Leave out, or pass none, to show the empty state. */
  members?: Member[]
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  onInvite?: (email: string, role: Role) => void
  onRemoveMember?: (id: string) => void
  onResendInvite?: (id: string) => void
  onRevokeInvite?: (id: string) => void
  onRoleChange?: (id: string, role: Role) => void
  seats?: number
  status?: BlockStatus
  title: string
}

const NOW = new Date(Date.UTC(2026, 8, 26, 16, 0))
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 86_400_000)

const exampleProps: Settings1Props = {
  currentMemberId: 'm1',
  description: 'Invite people to the workspace and choose what they can do.',
  invites: [
    { email: 'noah@acme.co', id: 'i1', role: 'member', sentAt: daysAgo(2) },
    { email: 'yuki@acme.co', id: 'i2', role: 'viewer', sentAt: daysAgo(9) },
  ],
  members: [
    {
      avatar: '/images/avatar-05.webp',
      email: 'amara@acme.co',
      id: 'm1',
      name: 'Amara Okafor',
      role: 'owner',
    },
    {
      avatar: '/images/avatar-04.webp',
      email: 'liam@acme.co',
      id: 'm2',
      name: 'Liam Chen',
      role: 'admin',
    },
    {
      avatar: '/images/avatar-01.webp',
      email: 'sofia@acme.co',
      id: 'm3',
      name: 'Sofia Rossi',
      role: 'member',
    },
    {
      avatar: '/images/avatar-06.webp',
      email: 'mateo@acme.co',
      id: 'm4',
      name: 'Mateo García',
      role: 'member',
    },
    {
      avatar: '/images/avatar-02.webp',
      email: 'priya@acme.co',
      id: 'm5',
      name: 'Priya Nair',
      role: 'viewer',
    },
  ],
  now: NOW,
  seats: 10,
  title: 'Members',
}

const INVITE_EXPIRY_DAYS = 7

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const Settings1 = (props: Settings1Props) => {
  const {
    currentMemberId,
    description,
    now,
    onInvite,
    onRemoveMember,
    onResendInvite,
    onRevokeInvite,
    onRoleChange,
    seats,
    status,
    title,
  } = props
  const emailId = useId()
  const [members, setMembers] = useState(props.members ?? [])
  const [invites, setInvites] = useState(props.invites ?? [])
  const state = getBlockState(status, props.members)
  const ready = !state
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('member')
  const [error, setError] = useState<string | null>(null)

  const used = members.length + invites.length
  const full = seats !== undefined && ready && used >= seats
  const sorted = [...members].sort(
    (a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role),
  )

  const fail = (message: string) => {
    flushSync(() => setError(message))
    document.getElementById(emailId)?.focus()
  }

  const invite = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const address = email.trim().toLowerCase()
    if (!EMAIL.test(address)) return fail('Enter an email address.')
    if (
      members.some((member) => member.email === address) ||
      invites.some((pending) => pending.email === address)
    ) {
      return fail(`${address} is already in the workspace or invited.`)
    }
    setInvites((current) => [
      { email: address, id: `invite-${address}`, role, sentAt: now },
      ...current,
    ])
    setEmail('')
    setError(null)
    onInvite?.(address, role)
  }

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-5'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>
            {description}
            {ready && seats !== undefined && (
              <>
                {' '}
                {used} of {seats} seats used.
              </>
            )}
          </p>
        </header>
        <form method='post' onSubmit={invite} noValidate className='flex flex-col gap-2'>
          <label htmlFor={emailId} className='text-sm font-medium'>
            Invite by email
          </label>
          <div className='flex flex-col gap-2 @md:flex-row'>
            <Input
              id={emailId}
              type='email'
              autoComplete='off'
              placeholder='name@company.com'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${emailId}-error` : undefined}
              disabled={full || status !== undefined}
              className='@md:flex-1'
            />
            <div className='flex gap-2'>
              <RoleMenu
                label='Role for the invite'
                value={role}
                onValueChange={setRole}
              />
              <Button
                type='submit'
                disabled={full || status !== undefined}
                className='flex-1 @md:flex-none'
              >
                Send invite
              </Button>
            </div>
          </div>
          {error && (
            <p id={`${emailId}-error`} className='text-destructive text-sm'>
              {error}
            </p>
          )}
          {full && (
            <p className='text-muted-foreground text-sm'>
              Every seat is taken. Remove a member or add seats to invite more.
            </p>
          )}
        </form>

        <section aria-labelledby={`${emailId}-members`} className='flex flex-col gap-1'>
          <h3 id={`${emailId}-members`} className='text-sm font-medium'>
            {ready
              ? `${members.length} ${members.length === 1 ? 'member' : 'members'}`
              : 'Members'}
          </h3>
          {!ready && (
            <div className='border-t'>
              <BlockStateRows rows={5} />
            </div>
          )}
          {ready && (
            <ul className='flex flex-col divide-y border-t'>
              {sorted.map((member) => {
                const isYou = member.id === currentMemberId
                const locked = isYou || member.role === 'owner'
                return (
                  <li key={member.id} className='flex items-center gap-3 py-2.5'>
                    <PersonAvatar person={member} />
                    <div className='flex min-w-0 flex-1 flex-col'>
                      <span className='truncate text-sm font-medium'>
                        {member.name}
                        {isYou && (
                          <span className='text-muted-foreground font-normal'>
                            {' '}
                            (you)
                          </span>
                        )}
                      </span>
                      <span className='text-muted-foreground truncate text-xs'>
                        {member.email}
                      </span>
                    </div>
                    {locked ? (
                      <span className='text-muted-foreground px-2.5 text-sm'>
                        {roleConfig[member.role].label}
                      </span>
                    ) : (
                      <>
                        <RoleMenu
                          label={`Role for ${member.name}`}
                          value={member.role}
                          onValueChange={(next) => {
                            setMembers((current) =>
                              current.map((item) =>
                                item.id === member.id ? { ...item, role: next } : item,
                              ),
                            )
                            onRoleChange?.(member.id, next)
                          }}
                        />
                        <Button
                          variant='ghost'
                          size='icon-sm'
                          aria-label={`Remove ${member.name}`}
                          onClick={() => {
                            setMembers((current) =>
                              current.filter((item) => item.id !== member.id),
                            )
                            onRemoveMember?.(member.id)
                          }}
                        >
                          <IconPlaceholder
                            lucide='XIcon'
                            tabler='IconX'
                            hugeicons='Cancel01Icon'
                            phosphor='XIcon'
                            remixicon='RiCloseLine'
                            aria-hidden
                          />
                        </Button>
                      </>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {ready && invites.length > 0 && (
          <section aria-labelledby={`${emailId}-invites`} className='flex flex-col gap-1'>
            <h3 id={`${emailId}-invites`} className='text-sm font-medium'>
              {invites.length} pending {invites.length === 1 ? 'invite' : 'invites'}
            </h3>
            <ul className='flex flex-col divide-y border-t'>
              {invites.map((pending) => {
                const expired =
                  now.getTime() - pending.sentAt.getTime() >
                  INVITE_EXPIRY_DAYS * 86_400_000
                return (
                  <li
                    key={pending.id}
                    className='flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5'
                  >
                    <span
                      aria-hidden
                      className='bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-full [&_svg]:size-4'
                    >
                      <IconPlaceholder
                        lucide='MailIcon'
                        tabler='IconMail'
                        hugeicons='MailIcon'
                        phosphor='EnvelopeIcon'
                        remixicon='RiMailLine'
                      />
                    </span>
                    <div className='flex min-w-0 flex-1 flex-col'>
                      <span className='truncate text-sm font-medium'>
                        {pending.email}
                      </span>
                      <Details className='text-muted-foreground text-xs'>
                        {roleConfig[pending.role].label}
                        {expired ? (
                          <StatusLabel tone='warning' className='text-xs'>
                            Expired
                          </StatusLabel>
                        ) : (
                          <>
                            Sent{' '}
                            <time dateTime={pending.sentAt.toISOString()}>
                              {formatRelative(pending.sentAt, now)}
                            </time>
                          </>
                        )}
                      </Details>
                    </div>
                    <div className='flex gap-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        aria-label={`Resend invite to ${pending.email}`}
                        onClick={() => {
                          setInvites((current) =>
                            current.map((item) =>
                              item.id === pending.id ? { ...item, sentAt: now } : item,
                            ),
                          )
                          onResendInvite?.(pending.id)
                        }}
                      >
                        Resend
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        aria-label={`Revoke invite to ${pending.email}`}
                        onClick={() => {
                          setInvites((current) =>
                            current.filter((item) => item.id !== pending.id),
                          )
                          onRevokeInvite?.(pending.id)
                        }}
                      >
                        Revoke
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </section>
    </BlockStateProvider>
  )
}

export {
  Settings1,
  exampleProps as settings1ExampleProps,
  type Invite,
  type Member,
  type Settings1Props,
}
