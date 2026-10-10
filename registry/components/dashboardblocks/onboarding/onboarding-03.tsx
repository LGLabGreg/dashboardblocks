'use client'

import { BlockMessage } from '@/registry/components/dashboardblocks/block-state'
import { Link } from '@/registry/components/dashboardblocks/link'
import {
  type ChoiceCardOption,
  ChoiceCards,
} from '@/registry/components/dashboardblocks/onboarding'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type FormEvent, type ReactNode, useEffect, useId, useRef, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FieldError } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

interface DataSource {
  category: string
  description: string
  id: string
  logo?: ReactNode
  name: string
  popular?: boolean
}

interface Onboarding3Props {
  onConnect?: (id: string) => Promise<void>
  onContinue?: (id: string) => void
  requestHref: string
  sources: DataSource[]
}

const exampleProps: Onboarding3Props = {
  requestHref: '/sources/request',
  sources: [
    {
      category: 'Databases',
      description: 'Tables and views from Postgres 12 or later.',
      id: 'postgres',
      name: 'PostgreSQL',
      popular: true,
    },
    {
      category: 'Payments',
      description: 'Charges, subscriptions, refunds and payouts.',
      id: 'stripe',
      name: 'Stripe',
      popular: true,
    },
    {
      category: 'Warehouses',
      description: 'Datasets from any Google Cloud project.',
      id: 'bigquery',
      name: 'BigQuery',
    },
    {
      category: 'Warehouses',
      description: 'Databases and schemas through a key pair.',
      id: 'snowflake',
      name: 'Snowflake',
    },
    {
      category: 'CRM',
      description: 'Contacts, companies, deals and pipelines.',
      id: 'hubspot',
      name: 'HubSpot',
    },
    {
      category: 'CRM',
      description: 'Accounts, opportunities and custom objects.',
      id: 'salesforce',
      name: 'Salesforce',
    },
    {
      category: 'E-commerce',
      description: 'Orders, products, customers and inventory.',
      id: 'shopify',
      name: 'Shopify',
    },
    {
      category: 'Marketing',
      description: 'Sessions, events and conversions from GA4.',
      id: 'ga4',
      name: 'Google Analytics',
    },
    {
      category: 'Spreadsheets',
      description: 'Any sheet you can open, synced every hour.',
      id: 'sheets',
      name: 'Google Sheets',
    },
  ],
}

async function connectSource(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 1500))
  if (id === 'snowflake') {
    throw new Error(
      'Snowflake rejected the key pair. Check the user has USAGE on the warehouse.',
    )
  }
}

type Status =
  | { state: 'picking' }
  | { id: string; state: 'connecting' | 'connected' }
  | { id: string; message: string; state: 'failed' }

function toOption(source: DataSource): ChoiceCardOption {
  return {
    badge: source.popular ? <Badge variant='secondary'>Popular</Badge> : undefined,
    description: source.description,
    icon: source.logo ?? <span className='text-sm font-semibold'>{source.name[0]}</span>,
    title: source.name,
    value: source.id,
  }
}

const Onboarding3 = (props: Onboarding3Props) => {
  const { onConnect = connectSource, onContinue, requestHref, sources } = props
  const id = useId()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [selected, setSelected] = useState('')
  const [error, setError] = useState<string>()
  const [status, setStatus] = useState<Status>({ state: 'picking' })
  const attempt = useRef(0)
  const messageRef = useRef<HTMLDivElement>(null)
  const shownState = useRef(status.state)

  const categories = [...new Set(sources.map((source) => source.category))]
  const search = query.trim().toLowerCase()
  const visible = sources.filter(
    (source) =>
      (!category || source.category === category) &&
      (!search ||
        `${source.name} ${source.category} ${source.description}`
          .toLowerCase()
          .includes(search)),
  )
  const source = sources.find(
    (item) => item.id === (status.state === 'picking' ? selected : status.id),
  )

  useEffect(() => {
    const from = shownState.current
    shownState.current = status.state
    if (from === status.state) return
    const message = messageRef.current
    if (status.state === 'picking') document.getElementById(`${id}-search`)?.focus()
    else if (message && !message.contains(document.activeElement)) message.focus()
  }, [id, status.state])

  async function connect(sourceId: string) {
    attempt.current += 1
    const current = attempt.current
    setStatus({ id: sourceId, state: 'connecting' })
    try {
      await onConnect(sourceId)
      if (current === attempt.current) setStatus({ id: sourceId, state: 'connected' })
    } catch (caught) {
      if (current !== attempt.current) return
      setStatus({
        id: sourceId,
        message:
          caught instanceof Error ? caught.message : 'Something went wrong. Try again.',
        state: 'failed',
      })
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected) {
      setError('Pick a source to connect.')
      document.getElementById(`${id}-sources`)?.focus()
      return
    }
    void connect(selected)
  }

  function cancelPendingConnection() {
    attempt.current += 1
  }

  function backToSources() {
    cancelPendingConnection()
    setStatus({ state: 'picking' })
  }

  const announcement =
    status.state === 'connecting'
      ? `Connecting to ${source?.name}`
      : status.state === 'connected'
        ? `${source?.name} is connected`
        : status.state === 'failed'
          ? `Couldn't connect to ${source?.name}`
          : ''

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle id={`${id}-title`}>Connect a data source</CardTitle>
        <CardDescription>
          Pick where your data lives. You can add more sources later.
        </CardDescription>
      </CardHeader>
      <p role='status' className='sr-only'>
        {announcement}
      </p>
      {status.state === 'picking' ? (
        <form method='post' noValidate onSubmit={onSubmit} className='contents'>
          <CardContent className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2 @md:flex-row'>
              <InputGroup className='@md:flex-1'>
                <InputGroupAddon>
                  <IconPlaceholder
                    lucide='SearchIcon'
                    tabler='IconSearch'
                    hugeicons='SearchIcon'
                    phosphor='MagnifyingGlassIcon'
                    remixicon='RiSearchLine'
                  />
                </InputGroupAddon>
                <InputGroupInput
                  id={`${id}-search`}
                  type='search'
                  aria-label='Search sources'
                  aria-controls={`${id}-results`}
                  placeholder='Search sources…'
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </InputGroup>
              <NativeSelect
                aria-label='Category'
                className='w-full @md:w-44'
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <NativeSelectOption value=''>All categories</NativeSelectOption>
                {categories.map((item) => (
                  <NativeSelectOption key={item} value={item}>
                    {item}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <p role='status' className='sr-only'>
              {visible.length === 1 ? '1 source' : `${visible.length} sources`}
            </p>
            <div id={`${id}-results`}>
              {visible.length > 0 ? (
                <ChoiceCards
                  id={`${id}-sources`}
                  aria-labelledby={`${id}-title`}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? `${id}-error` : undefined}
                  className='@lg:grid-cols-2 @3xl:grid-cols-3'
                  options={visible.map(toOption)}
                  value={selected}
                  onValueChange={(value) => {
                    setSelected(value)
                    setError(undefined)
                  }}
                />
              ) : (
                <BlockMessage
                  className='rounded-lg border border-dashed'
                  icon={
                    <IconPlaceholder
                      lucide='SearchXIcon'
                      tabler='IconZoomCancel'
                      hugeicons='SearchRemoveIcon'
                      phosphor='MagnifyingGlassMinusIcon'
                      remixicon='RiSearchLine'
                    />
                  }
                  title='No sources match'
                  description='Check the spelling or try another category.'
                  action={
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        setQuery('')
                        setCategory('')
                        document.getElementById(`${id}-search`)?.focus()
                      }}
                    >
                      Clear filters
                    </Button>
                  }
                />
              )}
            </div>
            <FieldError id={`${id}-error`}>{error}</FieldError>
          </CardContent>
          <CardFooter className='flex-col items-stretch gap-3 border-t @md:flex-row @md:items-center @md:justify-between'>
            <p className='text-muted-foreground text-sm'>
              Can&apos;t find yours?{' '}
              <Link
                href={requestHref}
                className='text-foreground font-medium underline underline-offset-4'
              >
                Request a source
              </Link>
            </p>
            <Button type='submit'>{source ? `Connect ${source.name}` : 'Connect'}</Button>
          </CardFooter>
        </form>
      ) : (
        <CardContent>
          <div ref={messageRef} tabIndex={-1} className='outline-none'>
            {status.state === 'connecting' && (
              <BlockMessage
                icon={
                  <IconPlaceholder
                    lucide='LoaderCircleIcon'
                    tabler='IconLoader2'
                    hugeicons='Loading03Icon'
                    phosphor='CircleNotchIcon'
                    remixicon='RiLoader4Line'
                    className='animate-spin motion-reduce:animate-none'
                  />
                }
                title={`Connecting to ${source?.name}…`}
                description='Approve access in the window that opened. It usually takes less than a minute.'
                action={
                  <Button variant='ghost' size='sm' onClick={backToSources}>
                    Cancel
                  </Button>
                }
              />
            )}
            {status.state === 'connected' && (
              <BlockMessage
                icon={
                  <IconPlaceholder
                    lucide='CircleCheckIcon'
                    tabler='IconCircleCheck'
                    hugeicons='CheckmarkCircle02Icon'
                    phosphor='CheckCircleIcon'
                    remixicon='RiCheckboxCircleLine'
                    className='text-emerald-700 dark:text-emerald-400'
                  />
                }
                title={`${source?.name} is connected`}
                description="We're importing the last 90 days. Your first dashboard will be ready in a few minutes."
                action={
                  <div className='flex flex-wrap justify-center gap-2'>
                    <Button onClick={() => onContinue?.(status.id)}>Continue</Button>
                    <Button variant='outline' onClick={backToSources}>
                      Connect another
                    </Button>
                  </div>
                }
              />
            )}
            {status.state === 'failed' && (
              <BlockMessage
                tone='error'
                icon={
                  <IconPlaceholder
                    lucide='TriangleAlertIcon'
                    tabler='IconAlertTriangle'
                    hugeicons='Alert02Icon'
                    phosphor='WarningIcon'
                    remixicon='RiErrorWarningLine'
                  />
                }
                title={`Couldn't connect to ${source?.name}`}
                description={status.message}
                action={
                  <div className='flex flex-wrap justify-center gap-2'>
                    <Button onClick={() => void connect(status.id)}>Try again</Button>
                    <Button variant='outline' onClick={backToSources}>
                      Pick another source
                    </Button>
                  </div>
                }
              />
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export { Onboarding3, exampleProps as onboarding3ExampleProps, type Onboarding3Props }
