'use client'

import {
  type Role,
  RoleMenu,
  formatRelative,
  roleConfig,
  roleOrder,
} from '@/registry/components/dashboardblocks/settings'
import { PersonAvatar } from '@/registry/components/dashboardblocks/team'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type FormEvent, useId, useState } from 'react'
import { flushSync } from 'react-dom'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
  invites: Invite[]
  members: Member[]
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  onInvite?: (email: string, role: Role) => void
  onRemoveMember?: (id: string) => void
  onResendInvite?: (id: string) => void
  onRevokeInvite?: (id: string) => void
  onRoleChange?: (id: string, role: Role) => void
  /** Seats on the plan. Leave out for unlimited. */
  seats?: number
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
    { email: 'amara@acme.co', id: 'm1', name: 'Amara Okafor', role: 'owner' },
    { email: 'liam@acme.co', id: 'm2', name: 'Liam Chen', role: 'admin' },
    { email: 'sofia@acme.co', id: 'm3', name: 'Sofia Rossi', role: 'member' },
    { email: 'mateo@acme.co', id: 'm4', name: 'Mateo García', role: 'member' },
    { email: 'priya@acme.co', id: 'm5', name: 'Priya Nair', role: 'viewer' },
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
    title,
  } = props
  const emailId = useId()
  const [members, setMembers] = useState(props.members)
  const [invites, setInvites] = useState(props.invites)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('member')
  const [error, setError] = useState<string | null>(null)

  const used = members.length + invites.length
  const full = seats !== undefined && used >= seats
  const sorted = [...members].sort(
    (a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role),
  )

  const fail = (message: string) => {
    // The error renders before focus moves, so the field is read with it.
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
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
          {seats !== undefined && (
            <>
              {' '}
              {used} of {seats} seats used.
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-6'>
        <form onSubmit={invite} noValidate className='flex flex-col gap-2'>
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
              disabled={full}
              className='@md:flex-1'
            />
            <div className='flex gap-2'>
              <RoleMenu
                label='Role for the invite'
                value={role}
                onValueChange={setRole}
              />
              <Button type='submit' disabled={full} className='flex-1 @md:flex-none'>
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

        <section aria-labelledby={`${emailId}-members`} className='flex flex-col gap-2'>
          <h3 id={`${emailId}-members`} className='text-sm font-medium'>
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </h3>
          <ul className='flex flex-col divide-y border-t'>
            {sorted.map((member) => {
              const isYou = member.id === currentMemberId
              const locked = isYou || member.role === 'owner'
              return (
                <li key={member.id} className='flex items-center gap-3 py-3'>
                  <PersonAvatar person={member} />
                  <div className='flex min-w-0 flex-1 flex-col'>
                    <span className='truncate text-sm font-medium'>
                      {member.name}
                      {isYou && (
                        <span className='text-muted-foreground font-normal'> (you)</span>
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
        </section>

        {invites.length > 0 && (
          <section aria-labelledby={`${emailId}-invites`} className='flex flex-col gap-2'>
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
                    className='flex flex-wrap items-center gap-x-3 gap-y-2 py-3'
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
                      <span className='text-muted-foreground text-xs'>
                        {roleConfig[pending.role].label} ·{' '}
                        {expired ? (
                          <span className='text-amber-800 dark:text-amber-400'>
                            Expired
                          </span>
                        ) : (
                          <>
                            Sent{' '}
                            <time dateTime={pending.sentAt.toISOString()}>
                              {formatRelative(pending.sentAt, now)}
                            </time>
                          </>
                        )}
                      </span>
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
      </CardContent>
    </Card>
  )
}

export {
  Settings1,
  exampleProps as settings1ExampleProps,
  type Invite,
  type Member,
  type Settings1Props,
}
