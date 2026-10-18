'use client'

import {
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
} from '@/registry/components/dashboardblocks/block-state'
import { InlineEditField, isEmail } from '@/registry/components/dashboardblocks/forms'
import { startTransition, useState } from 'react'

interface CustomerDetails {
  company: string
  email: string
  name: string
  phone: string
  website: string
}

interface Forms4Props {
  /** Leave out to show the empty state. */
  defaultValues?: CustomerDetails
  onSave?: (field: keyof CustomerDetails, value: string) => Promise<string | void>
  status?: BlockStatus
  title: string
}

const exampleProps: Forms4Props = {
  defaultValues: {
    company: 'Northwind Traders',
    email: 'jonas@northwind.io',
    name: 'Jonas Weber',
    phone: '',
    website: 'https://northwind.io',
  },
  title: 'Customer details',
}

async function saveField() {
  await new Promise((resolve) => setTimeout(resolve, 600))
}

function Forms4Content(props: Forms4Props & { defaultValues: CustomerDetails }) {
  const { defaultValues, onSave = saveField } = props
  const [details, setDetails] = useState(defaultValues)

  function save(field: keyof CustomerDetails) {
    return async (value: string) => {
      const error = await onSave(field, value)
      if (error) return error
      startTransition(() => setDetails((current) => ({ ...current, [field]: value })))
    }
  }

  return (
    <>
      <div className='divide-y border-y'>
        <InlineEditField
          label='Name'
          value={details.name}
          onSave={save('name')}
          validate={(value) => (value.trim() ? undefined : 'Enter a name.')}
        />
        <InlineEditField
          label='Email'
          type='email'
          value={details.email}
          onSave={save('email')}
          validate={(value) =>
            isEmail(value) ? undefined : 'Enter an email address like name@example.com.'
          }
        />
        <InlineEditField
          label='Phone'
          type='tel'
          value={details.phone}
          onSave={save('phone')}
        />
        <InlineEditField
          label='Company'
          value={details.company}
          onSave={save('company')}
        />
        <InlineEditField
          label='Website'
          type='url'
          value={details.website}
          onSave={save('website')}
          validate={(value) =>
            !value || /^https?:\/\/\S+\.\S+$/.test(value)
              ? undefined
              : 'Enter a full address, starting with https://.'
          }
        />
      </div>
    </>
  )
}

const Forms4 = (props: Forms4Props) => {
  const { defaultValues, status, title } = props
  const ready = !status && defaultValues !== undefined

  return (
    <BlockStateProvider status={status} empty={defaultValues === undefined}>
      <section className='@container flex flex-col gap-3'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>
            Each change saves as soon as you confirm it.
          </p>
        </header>
        {ready ? (
          <Forms4Content {...props} defaultValues={defaultValues} />
        ) : (
          <div className='border-t'>
            <BlockStateRows rows={5} />
          </div>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Forms4, exampleProps as forms4ExampleProps, type Forms4Props }
