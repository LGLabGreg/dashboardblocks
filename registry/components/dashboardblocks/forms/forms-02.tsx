'use client'

import {
  type FormErrors,
  FormSheet,
  isEmail,
  useSimpleForm,
} from '@/registry/components/dashboardblocks/forms'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useState } from 'react'

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
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'

// A type, not an interface, so it fits useSimpleForm's Record<string, …> constraint.
type NewCustomer = {
  company: string
  email: string
  name: string
  notes: string
  plan: string
}

interface Customer {
  email: string
  name: string
  plan: string
}

interface Forms2Props {
  customers: Customer[]
  /** Creates the customer. Return errors from the server to show them on their fields. */
  onCreate?: (values: NewCustomer) => Promise<FormErrors<NewCustomer> | void>
  plans: string[]
}

const exampleProps: Forms2Props = {
  customers: [
    { email: 'jonas@northwind.io', name: 'Jonas Weber', plan: 'Pro' },
    { email: 'priya@lumen.dev', name: 'Priya Nair', plan: 'Enterprise' },
    { email: 'mateo@fieldnote.co', name: 'Mateo Silva', plan: 'Free' },
  ],
  plans: ['Free', 'Pro', 'Enterprise'],
}

/** Stands in for a request to your API. One address is taken, to show a server error. */
async function createCustomer(values: NewCustomer) {
  await new Promise((resolve) => setTimeout(resolve, 800))
  if (values.email.toLowerCase() === 'taken@example.com') {
    return { email: 'A customer with this email already exists.' }
  }
}

function validate(values: NewCustomer): FormErrors<NewCustomer> {
  return {
    email: !values.email.trim()
      ? 'Enter an email address.'
      : !isEmail(values.email)
        ? 'Enter an email address like name@example.com.'
        : undefined,
    name: values.name.trim() ? undefined : 'Enter a name.',
  }
}

const Forms2 = (props: Forms2Props) => {
  const { customers: initialCustomers, onCreate = createCustomer, plans } = props
  const [customers, setCustomers] = useState(initialCustomers)
  const [open, setOpen] = useState(false)
  const emptyValues: NewCustomer = {
    company: '',
    email: '',
    name: '',
    notes: '',
    plan: plans[0] ?? '',
  }
  const form = useSimpleForm({
    defaultValues: emptyValues,
    onSubmit: async (values) => {
      const errors = await onCreate(values)
      if (errors) return errors
      setCustomers((current) => [
        { email: values.email, name: values.name, plan: values.plan },
        ...current,
      ])
      setOpen(false)
      form.reset(emptyValues)
    },
    validate,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
        <CardDescription>{customers.length} customers</CardDescription>
        <CardAction>
          <Button size='sm' onClick={() => setOpen(true)}>
            <IconPlaceholder
              lucide='PlusIcon'
              tabler='IconPlus'
              hugeicons='PlusSignIcon'
              phosphor='PlusIcon'
              remixicon='RiAddLine'
              data-icon='inline-start'
            />
            New customer
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul className='divide-y'>
          {customers.map((customer) => (
            <li
              key={customer.email}
              className='flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0'
            >
              <div className='flex min-w-0 flex-col'>
                <span className='truncate text-sm font-medium'>{customer.name}</span>
                <span className='text-muted-foreground truncate text-xs'>
                  {customer.email}
                </span>
              </div>
              <Badge variant='secondary'>{customer.plan}</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
      <FormSheet
        open={open}
        onOpenChange={setOpen}
        onSubmit={(event) => void form.submit(event)}
        title='New customer'
        description='Add a customer to your workspace. You can invite them later.'
        footer={
          <>
            <Button type='submit' disabled={form.isSubmitting}>
              {form.isSubmitting ? 'Creating…' : 'Create customer'}
            </Button>
            <Button type='button' variant='outline' onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </>
        }
      >
        <FieldGroup>
          <Field data-invalid={form.errors.name ? true : undefined}>
            <FieldLabel htmlFor={form.getId('name')}>Name</FieldLabel>
            <Input autoComplete='off' {...form.field('name')} />
            <FieldError {...form.error('name')} />
          </Field>
          <Field data-invalid={form.errors.email ? true : undefined}>
            <FieldLabel htmlFor={form.getId('email')}>Email</FieldLabel>
            <Input type='email' autoComplete='off' {...form.field('email')} />
            <FieldError {...form.error('email')} />
          </Field>
          <Field>
            <FieldLabel htmlFor={form.getId('company')}>Company</FieldLabel>
            <Input {...form.field('company')} />
          </Field>
          <Field>
            <FieldLabel htmlFor={form.getId('plan')}>Plan</FieldLabel>
            <NativeSelect className='w-full' {...form.field('plan')}>
              {plans.map((plan) => (
                <NativeSelectOption key={plan} value={plan}>
                  {plan}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          <Field>
            <FieldLabel htmlFor={form.getId('notes')}>Notes</FieldLabel>
            <Textarea rows={4} {...form.field('notes')} />
          </Field>
        </FieldGroup>
      </FormSheet>
    </Card>
  )
}

export { Forms2, exampleProps as forms2ExampleProps, type Forms2Props }
