'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { Details } from '@/registry/components/dashboardblocks/details'
import {
  CopyButton,
  daysBetween,
  maskSecret,
} from '@/registry/components/dashboardblocks/settings'
import { StatusLabel } from '@/registry/components/dashboardblocks/status-label'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatDate, formatRelativeTime } from '@/registry/lib/dashboardblocks/format'
import { type FormEvent, type RefObject, useEffect, useId, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type KeyScope = 'read' | 'write'

interface ApiKey {
  createdAt: Date
  createdBy: string
  id: string
  lastUsedAt?: Date
  masked: string
  name: string
  scope: KeyScope
}

interface Settings2Props {
  /** Creates a key and returns it with its secret, which is shown once. */
  createKey: (name: string, scope: KeyScope) => { key: ApiKey; secret: string }
  /** @default a sentence counting the keys and any unused ones */
  description?: string
  /** Leave out, or pass none, to show the empty state. */
  keys?: ApiKey[]
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  onRevoke?: (id: string) => void
  /** @default 90 */
  staleAfterDays?: number
  status?: BlockStatus
  title: string
}

const NOW = new Date(Date.UTC(2026, 8, 26, 16, 0))
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 86_400_000)

const exampleProps: Settings2Props = {
  createKey: (name, scope) => {
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
  const { createKey, now, onRevoke, staleAfterDays = 90, status, title } = props
  const id = useId()
  const [keys, setKeys] = useState(props.keys ?? [])
  const unused = keys.filter(
    (key) => daysBetween(key.lastUsedAt ?? key.createdAt, now) >= staleAfterDays,
  ).length
  const description =
    props.description ??
    `${keys.length} ${keys.length === 1 ? 'key' : 'keys'} can call the API${unused > 0 ? `, ${unused} unused for ${staleAfterDays} days or more` : ''}. Treat them like passwords.`
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [scope, setScope] = useState<KeyScope>('read')
  const [revealed, setRevealed] = useState<{ name: string; secret: string } | null>(null)
  const createButton = useRef<HTMLButtonElement>(null)
  const nameInput = useRef<HTMLInputElement>(null)
  const revealedPanel = useRef<HTMLDivElement>(null)
  const focusAfterRender = useRef<RefObject<HTMLElement | null> | null>(null)

  useEffect(() => {
    focusAfterRender.current?.current?.focus()
    focusAfterRender.current = null
  })

  const create = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      flushSync(() => setNameError('Enter a name for the key, such as where it’s used.'))
      return nameInput.current?.focus()
    }
    const { key, secret } = createKey(trimmed, scope)
    setKeys((current) => [key, ...current])
    setRevealed({ name: key.name, secret })
    setCreating(false)
    focusAfterRender.current = revealedPanel
    setName('')
    setScope('read')
  }

  return (
    <BlockStateProvider state={getBlockState(status, keys)}>
      <section className='@container flex flex-col gap-3'>
        <header className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <BlockReady className='text-sm'>
              <p className='text-muted-foreground text-sm'>{description}</p>
            </BlockReady>
          </div>
          {!creating && (
            <Button
              ref={createButton}
              variant='outline'
              size='sm'
              disabled={status !== undefined}
              onClick={() => {
                setCreating(true)
                setRevealed(null)
                focusAfterRender.current = nameInput
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
          )}
        </header>
        <div className='flex flex-col gap-4'>
          {creating && (
            <form
              method='post'
              onSubmit={create}
              className='flex flex-col gap-3 rounded-lg border p-4'
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
                    focusAfterRender.current = createButton
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
              className='flex flex-col gap-2 rounded-lg border p-4 outline-none'
            >
              <p id={`${id}-revealed`} className='text-sm font-medium'>
                <StatusLabel variant='text' tone='good'>
                  Created
                </StatusLabel>{' '}
                “{revealed.name}”
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
                  focusAfterRender.current = createButton
                }}
              >
                Done
              </Button>
            </div>
          )}

          {status || keys.length === 0 ? (
            <div className='border-t'>
              <BlockStateRows rows={4} />
            </div>
          ) : (
            <ul className='flex flex-col divide-y border-t'>
              {keys.map((key) => {
                const idle = daysBetween(key.lastUsedAt ?? key.createdAt, now)
                const stale = idle >= staleAfterDays
                return (
                  <li key={key.id} className='flex items-center gap-3 py-2.5'>
                    <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                      <span className='flex min-w-0 flex-wrap items-baseline gap-x-2'>
                        <span className='truncate text-sm font-medium'>{key.name}</span>
                        {stale && (
                          <StatusLabel variant='text' tone='warning' className='text-xs'>
                            Unused for {idle} days
                          </StatusLabel>
                        )}
                      </span>
                      <Details className='text-muted-foreground text-xs'>
                        <span className='font-mono'>{key.masked}</span>
                        {scopeLabel[key.scope]}
                      </Details>
                      <Details className='text-muted-foreground text-xs'>
                        {key.lastUsedAt ? (
                          <>
                            Used{' '}
                            <time dateTime={key.lastUsedAt.toISOString()}>
                              {formatRelativeTime(key.lastUsedAt, now, { style: 'long' })}
                            </time>
                          </>
                        ) : (
                          'Never used'
                        )}
                        <>
                          Created by {key.createdBy} on{' '}
                          <time dateTime={key.createdAt.toISOString()}>
                            {formatDate(key.createdAt, 'date')}
                          </time>
                        </>
                      </Details>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
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
        </div>
      </section>
    </BlockStateProvider>
  )
}

export {
  Settings2,
  exampleProps as settings2ExampleProps,
  type ApiKey,
  type KeyScope,
  type Settings2Props,
}
