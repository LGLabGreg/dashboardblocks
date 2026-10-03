'use client'

import {
  CopyButton,
  daysBetween,
  formatDate,
  formatRelative,
  maskSecret,
} from '@/registry/components/dashboardblocks/settings'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type FormEvent, type RefObject, useEffect, useId, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

import { Badge } from '@/components/ui/badge'
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

type KeyScope = 'read' | 'write'

interface ApiKey {
  createdAt: Date
  /** Who created the key. */
  createdBy: string
  id: string
  lastUsedAt?: Date
  /** The masked key, e.g. from `maskSecret`. Never the full secret. */
  masked: string
  name: string
  scope: KeyScope
}

interface Settings2Props {
  /**
   * Creates a key and returns it with its secret, which is shown once.
   * Wire this to your API; the example makes one up.
   */
  createKey: (name: string, scope: KeyScope) => { key: ApiKey; secret: string }
  description: string
  keys: ApiKey[]
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  onRevoke?: (id: string) => void
  /**
   * Keys unused for this many days are flagged as stale.
   * @default 90
   */
  staleAfterDays?: number
  title: string
}

const NOW = new Date(Date.UTC(2026, 8, 26, 16, 0))
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 86_400_000)

const exampleProps: Settings2Props = {
  createKey: (name, scope) => {
    // A made-up key seeded from the name. Real keys come from your server.
    let seed = 2_166_136_261
    for (const char of name + scope)
      seed = Math.imul(seed ^ char.charCodeAt(0), 16_777_619)
    const secret = `sk_live_${Array.from({ length: 32 }, () => {
      seed = Math.imul(seed ^ (seed >>> 15), 2_246_822_507) + 1
      return ((seed >>> 0) % 36).toString(36)
    }).join('')}`
    return {
      key: {
        createdAt: NOW,
        createdBy: 'Amara Okafor',
        id: `key-${name}`,
        masked: maskSecret(secret),
        name,
        scope,
      },
      secret,
    }
  },
  description: 'Keys let your services call the API. Treat them like passwords.',
  keys: [
    {
      createdAt: daysAgo(210),
      createdBy: 'Liam Chen',
      id: 'k1',
      lastUsedAt: new Date(NOW.getTime() - 4 * 60_000),
      masked: 'sk_live_…9f2a',
      name: 'Production backend',
      scope: 'write',
    },
    {
      createdAt: daysAgo(64),
      createdBy: 'Sofia Rossi',
      id: 'k2',
      lastUsedAt: daysAgo(1),
      masked: 'sk_live_…c41e',
      name: 'Analytics export',
      scope: 'read',
    },
    {
      createdAt: daysAgo(320),
      createdBy: 'Mateo García',
      id: 'k3',
      lastUsedAt: daysAgo(131),
      masked: 'sk_live_…07bd',
      name: 'Old staging',
      scope: 'write',
    },
    {
      createdAt: daysAgo(12),
      createdBy: 'Liam Chen',
      id: 'k4',
      masked: 'sk_live_…e8d0',
      name: 'CI pipeline',
      scope: 'read',
    },
  ],
  now: NOW,
  title: 'API keys',
}

const scopeLabel: Record<KeyScope, string> = {
  read: 'Read only',
  write: 'Read and write',
}

const Settings2 = (props: Settings2Props) => {
  const { createKey, description, now, onRevoke, staleAfterDays = 90, title } = props
  const id = useId()
  const [keys, setKeys] = useState(props.keys)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [scope, setScope] = useState<KeyScope>('read')
  const [revealed, setRevealed] = useState<{ name: string; secret: string } | null>(null)
  const createButton = useRef<HTMLButtonElement>(null)
  const nameInput = useRef<HTMLInputElement>(null)
  const revealedPanel = useRef<HTMLDivElement>(null)
  // Focus moves after the next render, once its target exists, so it's never lost with an unmounted button.
  const focusNext = useRef<RefObject<HTMLElement | null> | null>(null)

  useEffect(() => {
    focusNext.current?.current?.focus()
    focusNext.current = null
  })

  const create = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      // The error renders before focus moves, so the field is read with it.
      flushSync(() => setNameError('Enter a name for the key, such as where it’s used.'))
      return nameInput.current?.focus()
    }
    const { key, secret } = createKey(trimmed, scope)
    setKeys((current) => [key, ...current])
    setRevealed({ name: key.name, secret })
    setCreating(false)
    focusNext.current = revealedPanel
    setName('')
    setScope('read')
  }

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {!creating && (
          <CardAction>
            <Button
              ref={createButton}
              variant='outline'
              size='sm'
              onClick={() => {
                setCreating(true)
                setRevealed(null)
                focusNext.current = nameInput
              }}
            >
              <IconPlaceholder
                lucide='PlusIcon'
                tabler='IconPlus'
                hugeicons='PlusSignIcon'
                phosphor='PlusIcon'
                remixicon='RiAddLine'
                data-icon='inline-start'
              />
              Create key
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        {creating && (
          <form
            onSubmit={create}
            className='bg-muted/50 flex flex-col gap-3 rounded-lg border p-4'
          >
            <div className='flex flex-col gap-2'>
              <label htmlFor={`${id}-name`} className='text-sm font-medium'>
                Key name
              </label>
              <Input
                ref={nameInput}
                id={`${id}-name`}
                autoComplete='off'
                placeholder='e.g. Production backend'
                value={name}
                onChange={(event) => {
                  setName(event.target.value)
                  setNameError(null)
                }}
                aria-invalid={nameError ? true : undefined}
                aria-describedby={nameError ? `${id}-name-error` : undefined}
              />
              {nameError && (
                <p
                  id={`${id}-name-error`}
                  role='alert'
                  className='text-destructive text-sm'
                >
                  {nameError}
                </p>
              )}
            </div>
            <fieldset className='flex flex-col gap-2'>
              <legend className='mb-2 text-sm font-medium'>Access</legend>
              <div className='flex flex-wrap gap-x-4 gap-y-2'>
                {(Object.keys(scopeLabel) as KeyScope[]).map((option) => (
                  <label key={option} className='flex items-center gap-2 text-sm'>
                    <input
                      type='radio'
                      name={`${id}-scope`}
                      value={option}
                      checked={scope === option}
                      onChange={() => setScope(option)}
                      className='accent-primary size-4'
                    />
                    {scopeLabel[option]}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className='flex justify-end gap-2'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => {
                  setCreating(false)
                  setNameError(null)
                  focusNext.current = createButton
                }}
              >
                Cancel
              </Button>
              <Button type='submit'>Create key</Button>
            </div>
          </form>
        )}

        {revealed && (
          <div
            ref={revealedPanel}
            role='group'
            aria-labelledby={`${id}-revealed`}
            tabIndex={-1}
            className='flex flex-col gap-2 rounded-lg border border-emerald-600/30 bg-emerald-500/5 p-4 outline-none'
          >
            <p id={`${id}-revealed`} className='text-sm font-medium'>
              “{revealed.name}” is ready
            </p>
            <p className='text-muted-foreground text-sm'>
              Copy the key now. You won’t be able to see it again.
            </p>
            <div className='bg-background flex items-center gap-2 rounded-md border py-1 pr-1 pl-3'>
              <span className='min-w-0 flex-1 truncate font-mono text-xs'>
                {revealed.secret}
              </span>
              <CopyButton label='Copy API key' value={revealed.secret} />
            </div>
            <Button
              variant='ghost'
              size='sm'
              className='self-end'
              onClick={() => {
                setRevealed(null)
                focusNext.current = createButton
              }}
            >
              Done
            </Button>
          </div>
        )}

        {keys.length === 0 ? (
          <p className='text-muted-foreground py-6 text-center text-sm'>
            No keys yet. Create one to start calling the API.
          </p>
        ) : (
          <ul className='flex flex-col divide-y border-t'>
            {keys.map((key) => {
              const idle = daysBetween(key.lastUsedAt ?? key.createdAt, now)
              const stale = idle >= staleAfterDays
              return (
                <li
                  key={key.id}
                  className='flex flex-col gap-2 py-3 @md:flex-row @md:items-center @md:gap-4'
                >
                  <div className='flex min-w-0 flex-1 flex-col gap-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <span className='truncate text-sm font-medium'>{key.name}</span>
                      <Badge variant='outline'>{scopeLabel[key.scope]}</Badge>
                      {stale && (
                        <Badge
                          variant='outline'
                          className='text-amber-800 dark:text-amber-400'
                        >
                          Unused {idle} days
                        </Badge>
                      )}
                    </div>
                    <span className='text-muted-foreground font-mono text-xs'>
                      {key.masked}
                    </span>
                  </div>
                  <div className='text-muted-foreground flex flex-col text-xs @md:w-44 @md:items-end'>
                    <span>
                      {key.lastUsedAt ? (
                        <>
                          Last used{' '}
                          <time dateTime={key.lastUsedAt.toISOString()}>
                            {formatRelative(key.lastUsedAt, now)}
                          </time>
                        </>
                      ) : (
                        'Never used'
                      )}
                    </span>
                    <span>
                      Created{' '}
                      <time dateTime={key.createdAt.toISOString()}>
                        {formatDate(key.createdAt)}
                      </time>{' '}
                      by {key.createdBy}
                    </span>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    className='self-start @md:self-center'
                    aria-label={`Revoke ${key.name}`}
                    onClick={() => {
                      setKeys((current) => current.filter((item) => item.id !== key.id))
                      onRevoke?.(key.id)
                    }}
                  >
                    Revoke
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export {
  Settings2,
  exampleProps as settings2ExampleProps,
  type ApiKey,
  type KeyScope,
  type Settings2Props,
}
