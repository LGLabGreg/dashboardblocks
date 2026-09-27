'use client'

import { useCopyToClipboard } from '@/registry/components/dashboardblocks/settings'
import { PersonAvatar } from '@/registry/components/dashboardblocks/team'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type FormEvent, type ReactNode, useId, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

type ShareAccess = 'owner' | 'edit' | 'view'

type LinkAccess = 'restricted' | 'workspace' | 'anyone'

interface SharePerson {
  avatar?: string
  email: string
  id: string
  /** Leave out for someone invited who hasn't joined yet; the email is shown instead. */
  name?: string
  access: ShareAccess
}

interface Team6Props {
  /** The signed-in person, who can't change their own access. */
  currentPersonId: string
  description?: string
  linkAccess: LinkAccess
  onAccessChange?: (id: string, access: Exclude<ShareAccess, 'owner'> | null) => void
  onInvite?: (email: string, access: Exclude<ShareAccess, 'owner'>) => void
  onLinkAccessChange?: (access: LinkAccess) => void
  people: SharePerson[]
  title: string
  url: string
  /** Names the workspace in the link setting, e.g. "Anyone at Acme". */
  workspace: string
}

const exampleProps: Team6Props = {
  currentPersonId: 'p1',
  description: 'Revenue overview',
  linkAccess: 'workspace',
  people: [
    { access: 'owner', email: 'amara@acme.co', id: 'p1', name: 'Amara Okafor' },
    { access: 'edit', email: 'liam@acme.co', id: 'p2', name: 'Liam Chen' },
    { access: 'view', email: 'sofia@acme.co', id: 'p3', name: 'Sofia Rossi' },
    { access: 'view', email: 'board@northwind.vc', id: 'p4' },
  ],
  title: 'Share dashboard',
  url: 'https://app.acme.co/d/revenue-overview',
  workspace: 'Acme',
}

const accessLabels: Record<ShareAccess, string> = {
  edit: 'Can edit',
  owner: 'Owner',
  view: 'Can view',
}

const linkAccessConfig: Record<
  LinkAccess,
  { description: string; icon: ReactNode; label: (workspace: string) => string }
> = {
  anyone: {
    description: 'Anyone on the internet with the link can view.',
    icon: (
      <IconPlaceholder
        lucide='GlobeIcon'
        tabler='IconGlobe'
        hugeicons='Globe02Icon'
        phosphor='GlobeIcon'
        remixicon='RiGlobeLine'
      />
    ),
    label: () => 'Anyone with the link',
  },
  restricted: {
    description: 'Only people added above can open the link.',
    icon: (
      <IconPlaceholder
        lucide='LockIcon'
        tabler='IconLock'
        hugeicons='SquareLock02Icon'
        phosphor='LockIcon'
        remixicon='RiLockLine'
      />
    ),
    label: () => 'Only people added',
  },
  workspace: {
    description: 'Everyone in the workspace can view with the link.',
    icon: (
      <IconPlaceholder
        lucide='UsersIcon'
        tabler='IconUsers'
        hugeicons='UserGroupIcon'
        phosphor='UsersIcon'
        remixicon='RiTeamLine'
      />
    ),
    label: (workspace) => `Anyone at ${workspace}`,
  },
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const Team6 = (props: Team6Props) => {
  const {
    currentPersonId,
    description,
    onAccessChange,
    onInvite,
    onLinkAccessChange,
    title,
    url,
    workspace,
  } = props
  const id = useId()
  const [people, setPeople] = useState(props.people)
  const [linkAccess, setLinkAccess] = useState(props.linkAccess)
  const [email, setEmail] = useState('')
  const [access, setAccess] = useState<Exclude<ShareAccess, 'owner'>>('view')
  const [error, setError] = useState<string | null>(null)
  const { copied, copy } = useCopyToClipboard()

  const invite = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const address = email.trim().toLowerCase()
    if (!EMAIL.test(address)) return setError('Enter an email address.')
    if (people.some((person) => person.email === address)) {
      return setError(`${address} already has access.`)
    }
    setPeople((current) => [
      ...current,
      { access, email: address, id: `share-${address}` },
    ])
    setEmail('')
    setError(null)
    onInvite?.(address, access)
  }

  const change = (person: SharePerson, value: string) => {
    if (value === 'remove') {
      setPeople((current) => current.filter((item) => item.id !== person.id))
      return onAccessChange?.(person.id, null)
    }
    const next = value as Exclude<ShareAccess, 'owner'>
    setPeople((current) =>
      current.map((item) => (item.id === person.id ? { ...item, access: next } : item)),
    )
    onAccessChange?.(person.id, next)
  }

  const link = linkAccessConfig[linkAccess]

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className='flex flex-col gap-6'>
        <form onSubmit={invite} noValidate className='flex flex-col gap-2'>
          <label htmlFor={`${id}-email`} className='sr-only'>
            Add people by email
          </label>
          <div className='flex flex-col gap-2 @md:flex-row'>
            <Input
              id={`${id}-email`}
              type='email'
              autoComplete='off'
              placeholder='Add people by email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              className='@md:flex-1'
            />
            <div className='flex gap-2'>
              <NativeSelect
                aria-label='Access for new people'
                value={access}
                onChange={(event) =>
                  setAccess(event.target.value as Exclude<ShareAccess, 'owner'>)
                }
              >
                <NativeSelectOption value='view'>{accessLabels.view}</NativeSelectOption>
                <NativeSelectOption value='edit'>{accessLabels.edit}</NativeSelectOption>
              </NativeSelect>
              <Button type='submit' className='flex-1 @md:flex-none'>
                Invite
              </Button>
            </div>
          </div>
          {error && (
            <p id={`${id}-error`} className='text-destructive text-sm'>
              {error}
            </p>
          )}
        </form>

        <section aria-labelledby={`${id}-people`} className='flex flex-col gap-2'>
          <h3 id={`${id}-people`} className='text-sm font-medium'>
            People with access
          </h3>
          <ul className='flex flex-col gap-3'>
            {people.map((person) => {
              const isYou = person.id === currentPersonId
              const name = person.name ?? person.email
              return (
                <li key={person.id} className='flex items-center gap-3'>
                  {person.name ? (
                    <PersonAvatar person={{ ...person, name: person.name }} />
                  ) : (
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
                  )}
                  <div className='flex min-w-0 flex-1 flex-col'>
                    <span className='truncate text-sm font-medium'>
                      {name}
                      {isYou && (
                        <span className='text-muted-foreground font-normal'> (you)</span>
                      )}
                    </span>
                    <span className='text-muted-foreground truncate text-xs'>
                      {person.name ? person.email : 'Invited'}
                    </span>
                  </div>
                  {isYou || person.access === 'owner' ? (
                    <span className='text-muted-foreground px-2.5 text-sm'>
                      {accessLabels[person.access]}
                    </span>
                  ) : (
                    <NativeSelect
                      size='sm'
                      aria-label={`Access for ${name}`}
                      value={person.access}
                      onChange={(event) => change(person, event.target.value)}
                    >
                      <NativeSelectOption value='view'>
                        {accessLabels.view}
                      </NativeSelectOption>
                      <NativeSelectOption value='edit'>
                        {accessLabels.edit}
                      </NativeSelectOption>
                      <NativeSelectOption value='remove'>Remove</NativeSelectOption>
                    </NativeSelect>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        <section aria-labelledby={`${id}-link`} className='flex flex-col gap-2'>
          <h3 id={`${id}-link`} className='text-sm font-medium'>
            General access
          </h3>
          <div className='flex items-center gap-3'>
            <span
              aria-hidden
              className='bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-full [&_svg]:size-4'
            >
              {link.icon}
            </span>
            <div className='flex min-w-0 flex-1 flex-col items-start gap-0.5'>
              <NativeSelect
                size='sm'
                aria-label='Who can open the link'
                aria-describedby={`${id}-link-description`}
                value={linkAccess}
                onChange={(event) => {
                  const next = event.target.value as LinkAccess
                  setLinkAccess(next)
                  onLinkAccessChange?.(next)
                }}
              >
                {(Object.keys(linkAccessConfig) as LinkAccess[]).map((value) => (
                  <NativeSelectOption key={value} value={value}>
                    {linkAccessConfig[value].label(workspace)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <span
                id={`${id}-link-description`}
                className='text-muted-foreground text-xs'
              >
                {link.description}
              </span>
            </div>
          </div>
        </section>
      </CardContent>
      <CardFooter className='flex items-center gap-2 border-t'>
        <span className='text-muted-foreground min-w-0 flex-1 truncate text-sm'>
          {url}
        </span>
        <Button variant='outline' size='sm' onClick={() => void copy(url)}>
          {copied ? (
            <IconPlaceholder
              lucide='CheckIcon'
              tabler='IconCheck'
              hugeicons='Tick02Icon'
              phosphor='CheckIcon'
              remixicon='RiCheckLine'
              data-icon='inline-start'
              aria-hidden
            />
          ) : (
            <IconPlaceholder
              lucide='LinkIcon'
              tabler='IconLink'
              hugeicons='Link01Icon'
              phosphor='LinkIcon'
              remixicon='RiLinkM'
              data-icon='inline-start'
              aria-hidden
            />
          )}
          {copied ? 'Copied' : 'Copy link'}
        </Button>
      </CardFooter>
    </Card>
  )
}

export {
  Team6,
  exampleProps as team6ExampleProps,
  type LinkAccess,
  type ShareAccess,
  type SharePerson,
  type Team6Props,
}
