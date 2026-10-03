'use client'

import { SettingsRow } from '@/registry/components/dashboardblocks/settings'
import { type FormEvent, useEffect, useId, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface DangerAction {
  /** The button's label, e.g. "Transfer". */
  action: string
  /**
   * Asks the person to type the workspace name before the action runs.
   * Use it for anything that can't be undone.
   */
  confirm?: boolean
  description: string
  id: string
  label: string
}

interface Settings6Props {
  actions: DangerAction[]
  description: string
  onAction?: (id: string) => void
  title: string
  /** What people type to confirm, usually the workspace name or slug. */
  workspace: string
}

const exampleProps: Settings6Props = {
  actions: [
    {
      action: 'Transfer',
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
  const { actions, description, onAction, title, workspace } = props
  const id = useId()
  const [confirming, setConfirming] = useState<string | null>(null)
  const [typed, setTyped] = useState('')
  const buttons = useRef<Record<string, HTMLButtonElement | null>>({})
  const confirmInput = useRef<HTMLInputElement>(null)
  const focusAfterRender = useRef<(() => HTMLElement | null) | null>(null)

  useEffect(() => {
    focusAfterRender.current?.()?.focus()
    focusAfterRender.current = null
  })

  const close = (actionId: string) => {
    setConfirming(null)
    setTyped('')
    focusAfterRender.current = () => buttons.current[actionId]
  }

  const confirm = (event: FormEvent<HTMLFormElement>, actionId: string) => {
    event.preventDefault()
    if (typed !== workspace) return
    close(actionId)
    onAction?.(actionId)
  }

  return (
    <Card className='ring-destructive/30 @container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className='flex flex-col divide-y border-t'>
          {actions.map((item) => {
            const open = confirming === item.id
            return (
              <li key={item.id} className='flex flex-col gap-4 py-4 last:pb-0'>
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
                    aria-describedby={`${id}-${item.id}-description`}
                    aria-expanded={item.confirm ? open : undefined}
                    aria-controls={open ? `${id}-${item.id}-form` : undefined}
                    onClick={() => {
                      if (!item.confirm) return onAction?.(item.id)
                      if (open) return close(item.id)
                      setConfirming(item.id)
                      setTyped('')
                      focusAfterRender.current = () => confirmInput.current
                    }}
                  >
                    {item.action}
                  </Button>
                </SettingsRow>
                {open && (
                  <form
                    id={`${id}-${item.id}-form`}
                    onSubmit={(event) => confirm(event, item.id)}
                    className='bg-destructive/5 border-destructive/30 flex flex-col gap-3 rounded-lg border p-4'
                  >
                    <label htmlFor={`${id}-${item.id}-confirm`} className='text-sm'>
                      Type{' '}
                      <strong className='font-mono font-semibold'>{workspace}</strong> to
                      confirm.
                    </label>
                    <Input
                      ref={confirmInput}
                      id={`${id}-${item.id}-confirm`}
                      autoComplete='off'
                      spellCheck={false}
                      value={typed}
                      onChange={(event) => setTyped(event.target.value)}
                    />
                    <div className='flex justify-end gap-2'>
                      <Button
                        type='button'
                        variant='ghost'
                        onClick={() => close(item.id)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type='submit'
                        variant='destructive'
                        disabled={typed !== workspace}
                      >
                        {item.label}
                      </Button>
                    </div>
                  </form>
                )}
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

export {
  Settings6,
  exampleProps as settings6ExampleProps,
  type DangerAction,
  type Settings6Props,
}
