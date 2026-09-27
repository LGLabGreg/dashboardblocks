'use client'

import { InlineEditField, isEmail } from '@/registry/components/dashboardblocks/forms'
import { useState } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface CustomerDetails {
  company: string
  email: string
  name: string
  phone: string
  website: string
}

interface Forms4Props {
  defaultValues: CustomerDetails
  /** Saves one field. Return an error message to keep it open and show the message. */
  onSave?: (field: keyof CustomerDetails, value: string) => Promise<string | void>
}

const exampleProps: Forms4Props = {
  defaultValues: {
    company: 'Northwind Traders',
    email: 'jonas@northwind.io',
    name: 'Jonas Weber',
    phone: '',
    website: 'https://northwind.io',
  },
}

/** Stands in for a request to your API. */
async function saveField() {
  await new Promise((resolve) => setTimeout(resolve, 600))
}

const Forms4 = (props: Forms4Props) => {
  const { defaultValues, onSave = saveField } = props
  const [details, setDetails] = useState(defaultValues)

  function save(field: keyof CustomerDetails) {
    return async (value: string) => {
      const error = await onSave(field, value)
      if (error) return error
      setDetails((current) => ({ ...current, [field]: value }))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer details</CardTitle>
        <CardDescription>Changes save as soon as you confirm them.</CardDescription>
      </CardHeader>
      <CardContent className='divide-y'>
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
      </CardContent>
    </Card>
  )
}

export { Forms4, exampleProps as forms4ExampleProps, type Forms4Props }
