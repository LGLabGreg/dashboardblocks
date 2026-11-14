'use client'

import { LockedNote } from '@/registry/components/dashboardblocks/locked-note'
import {
  OptionSelect,
  type SelectOption,
} from '@/registry/components/dashboardblocks/option-select'
import { SettingsRow } from '@/registry/components/dashboardblocks/settings'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import {
  type FormEvent,
  type KeyboardEvent,
  startTransition,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DangerChoice {
  label: string
  options: readonly SelectOption[]
  placeholder?: string
}

interface DangerAction {
  action: string
  /** Asks the person to pick one of `options` before the action runs, such as who to hand the workspace to. The pick goes to `onAction`. */
  choose?: DangerChoice
  /** Asks the person to type the workspace name before the action runs. */
  confirm?: boolean
  description: string
  disabled?: boolean
  id: string
  label: string
}

interface Settings6Props {
  actions: DangerAction[]
  description: string
  /** Why the actions are off, shown under the description when the block gets no `onAction`: `Only Sofia Rossi, the owner, can do either.` */
  lockedMessage?: string
  /**
   * `choice` is the value picked from the action's `choose`, for an action that has one. Return a
   * promise to keep the action's form open, and every action off, until it settles. Left out,
   * every action is off.
   */
  onAction?: (id: string, choice?: string) => void | Promise<unknown>
  title: string
  workspace: string
}

const exampleProps: Settings6Props = {
  actions: [
    {
      action: 'Transfer',
      choose: {
        label: 'New owner',
        options: [
          { label: 'Maya Chen', value: 'maya' },
          { label: 'Leo Martins', value: 'leo' },
        ],
        placeholder: 'Pick an admin',
      },
      description: 'Make another admin the owner. You will become an admin.',
      id: 'transfer',
      label: 'Transfer ownership',
    },
    {
      action: 'Archive',
      description:
        'Stop syncs and alerts, and make dashboards read-only. You can restore it later.',
      id: 'archive',
      label: 'Archive workspace',
    },
    {
      action: 'Delete',
      confirm: true,
      description:
        'Permanently delete the workspace, its dashboards, data sources and API keys. This can’t be undone.',
      id: 'delete',
      label: 'Delete workspace',
    },
  ],
  description: 'Actions that affect everyone in the workspace.',
  title: 'Danger zone',
  workspace: 'acme-analytics',
}

const Settings6 = (props: Settings6Props) => {
  const { actions, description, lockedMessage, onAction, title, workspace } = props
  const locked = !onAction
  const id = useId()
  const [confirming, setConfirming] = useState<string | null>(null)
  const [typed, setTyped] = useState('')
  const [choice, setChoice] = useState<string | null>(null)
  const buttons = useRef<Record<string, HTMLButtonElement | null>>({})
  const firstField = useRef<HTMLElement | null>(null)
  const focusAfterRender = useRef<(() => HTMLElement | null) | null>(null)
  const section = useRef<HTMLElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const lockedFor = useRef(locked)
  const [running, setRunning] = useState<string | null>(null)
  const [settled, setSettled] = useState({ count: 0, id: '' })
  const settledFor = useRef(0)

  useEffect(() => {
    focusAfterRender.current?.()?.focus()
    focusAfterRender.current = null
  })

  useEffect(() => {
    if (locked === lockedFor.current) return
    lockedFor.current = locked
    const active = document.activeElement
    if (locked && (active === document.body || section.current?.contains(active)))
      heading.current?.focus()
  }, [locked])

  useEffect(() => {
    if (settled.count === settledFor.current) return
    settledFor.current = settled.count
    const button = buttons.current[settled.id]
    ;(button && !button.disabled ? button : heading.current)?.focus()
  }, [settled])

  const asks = (item: DangerAction) => item.confirm || !!item.choose
  const ready = (item: DangerAction) =>
    (!item.confirm || typed === workspace) &&
    (!item.choose || item.choose.options.some((option) => option.value === choice))

  const reset = () => {
    setConfirming(null)
    setTyped('')
    setChoice(null)
  }

  const close = (actionId: string) => {
    reset()
    focusAfterRender.current = () => {
      const button = buttons.current[actionId]
      return button && !button.disabled ? button : heading.current
    }
  }

  const confirm = (event: FormEvent<HTMLFormElement>, item: DangerAction) => {
    event.preventDefault()
    if (!ready(item) || running) return
    const result = onAction?.(item.id, choice ?? undefined)
    if (!result) return close(item.id)
    setRunning(item.id)
    void result.finally(() =>
      startTransition(() => {
        setRunning(null)
        reset()
        setSettled((previous) => ({ count: previous.count + 1, id: item.id }))
      }),
    )
  }

  const onFormKeyDown = (event: KeyboardEvent<HTMLFormElement>, item: DangerAction) => {
    if (event.key !== 'Escape' || event.defaultPrevented || running) return
    if (!event.currentTarget.contains(event.target as Node)) return
    event.preventDefault()
    close(item.id)
  }

  return (
    <section ref={section} className='@container flex flex-col gap-3'>
      <header className='flex flex-col gap-0.5'>
        <h2
          ref={heading}
          tabIndex={-1}
          className='font-semibold tracking-tight outline-none'
        >
          {title}
        </h2>
        <p className='text-muted-foreground text-sm'>{description}</p>
        {locked && lockedMessage && <LockedNote>{lockedMessage}</LockedNote>}
      </header>
      <ul className='flex flex-col divide-y border-t'>
        {actions.map((item) => {
          const open = confirming === item.id && !locked
          return (
            <li key={item.id} className='flex flex-col gap-3 py-3'>
              <SettingsRow
                id={`${id}-${item.id}`}
                label={item.label}
                description={item.description}
              >
                <Button
                  ref={(node) => {
                    buttons.current[item.id] = node
                  }}
                  variant={item.confirm ? 'destructive' : 'outline'}
                  size='sm'
                  disabled={item.disabled || locked || running !== null}
                  aria-describedby={`${id}-${item.id}-description`}
                  aria-expanded={asks(item) ? open : undefined}
                  aria-controls={open ? `${id}-${item.id}-form` : undefined}
                  onClick={() => {
                    if (!asks(item)) return onAction?.(item.id)
                    if (open) return close(item.id)
                    setConfirming(item.id)
                    setTyped('')
                    setChoice(null)
                    focusAfterRender.current = () => firstField.current
                  }}
                >
                  {item.action}
                </Button>
              </SettingsRow>
              {open && (
                // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Escape from any field in the form closes it, as Cancel does
                <form
                  method='post'
                  id={`${id}-${item.id}-form`}
                  onSubmit={(event) => confirm(event, item)}
                  onKeyDown={(event) => onFormKeyDown(event, item)}
                  className='flex flex-col gap-3 rounded-lg border p-4'
                >
                  {item.choose && (
                    <div className='flex flex-col gap-2'>
                      <label htmlFor={`${id}-${item.id}-choice`} className='text-sm'>
                        {item.choose.label}
                      </label>
                      <OptionSelect
                        ref={(node) => {
                          firstField.current = node
                        }}
                        id={`${id}-${item.id}-choice`}
                        className='w-full'
                        options={item.choose.options}
                        placeholder={item.choose.placeholder}
                        value={choice}
                        onValueChange={setChoice}
                      />
                    </div>
                  )}
                  {item.confirm && (
                    <div className='flex flex-col gap-2'>
                      <label htmlFor={`${id}-${item.id}-confirm`} className='text-sm'>
                        Type{' '}
                        <strong className='font-mono font-semibold'>{workspace}</strong>{' '}
                        to confirm.
                      </label>
                      <Input
                        ref={(node) => {
                          if (!item.choose) firstField.current = node
                        }}
                        id={`${id}-${item.id}-confirm`}
                        autoComplete='off'
                        spellCheck={false}
                        value={typed}
                        onChange={(event) => setTyped(event.target.value)}
                      />
                    </div>
                  )}
                  <div className='flex flex-wrap justify-end gap-2'>
                    <Button
                      type='button'
                      variant='ghost'
                      disabled={running !== null}
                      onClick={() => close(item.id)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type='submit'
                      variant={item.confirm ? 'destructive' : 'default'}
                      disabled={!ready(item) || running !== null}
                      aria-busy={running === item.id ? true : undefined}
                    >
                      {running === item.id && (
                        <IconPlaceholder
                          lucide='Loader2Icon'
                          tabler='IconLoader'
                          hugeicons='Loading03Icon'
                          phosphor='SpinnerIcon'
                          remixicon='RiLoaderLine'
                          data-icon='inline-start'
                          className='animate-spin motion-reduce:animate-none'
                        />
                      )}
                      {item.label}
                    </Button>
                  </div>
                </form>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export {
  Settings6,
  exampleProps as settings6ExampleProps,
  type DangerAction,
  type DangerChoice,
  type Settings6Props,
}
