'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  type FormErrors,
  FormSheet,
  isEmail,
  useSimpleForm,
} from '@/registry/components/dashboardblocks/forms'
import { OptionSelect } from '@/registry/components/dashboardblocks/option-select'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { startTransition, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

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

interface Forms2Props extends BlockStateProps {
  /** Leave out, or pass none, to show the empty state. */
  customers?: Customer[]
  onCreate?: (values: NewCustomer) => Promise<FormErrors<NewCustomer> | void>
  plans: string[]
  title: string
}

const exampleProps: Forms2Props = {
  customers: [
    { email: 'jonas@northwind.io', name: 'Jonas Weber', plan: 'Pro' },
    { email: 'priya@lumen.dev', name: 'Priya Nair', plan: 'Enterprise' },
    { email: 'mateo@fieldnote.co', name: 'Mateo Silva', plan: 'Free' },
  ],
  plans: ['Free', 'Pro', 'Enterprise'],
  title: 'Customers',
}

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
  const {
    customers: initialCustomers = [],
    onCreate = createCustomer,
    plans,
    errorMessage,
    status,
    title,
  } = props
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
      startTransition(() => {
        setCustomers((current) => [
          { email: values.email, name: values.name, plan: values.plan },
          ...current,
        ])
        setOpen(false)
        form.reset(emptyValues)
      })
    },
    validate,
  })

  return (
    <BlockStateProvider
      errorMessage={errorMessage}
      state={getBlockState(status, customers)}
    >
      <section className='@container flex flex-col gap-3'>
        <header className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <BlockReady className='text-sm'>
              <p className='text-muted-foreground text-sm'>
                {customers.length} {customers.length === 1 ? 'customer' : 'customers'},
                newest first.
              </p>
            </BlockReady>
          </div>
          <Button
            variant='outline'
            size='sm'
            disabled={status !== undefined}
            onClick={() => setOpen(true)}
          >
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
        </header>
        <div className='border-t'>
          <BlockStateRows rows={4} />
          <ul className='divide-y empty:hidden'>
            {!status &&
              customers.map((customer) => (
                <li
                  key={customer.email}
                  className='flex items-center justify-between gap-3 py-2.5'
                >
                  <div className='flex min-w-0 flex-col'>
                    <span className='truncate text-sm font-medium'>{customer.name}</span>
                    <span className='text-muted-foreground truncate text-xs'>
                      {customer.email}
                    </span>
                  </div>
                  <span className='text-muted-foreground shrink-0 text-sm'>
                    {customer.plan}
                  </span>
                </li>
              ))}
          </ul>
        </div>
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
              <OptionSelect
                className='w-full'
                options={plans.map((plan) => ({ label: plan, value: plan }))}
                {...form.select('plan')}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={form.getId('notes')}>Notes</FieldLabel>
              <Textarea rows={4} {...form.field('notes')} />
            </Field>
          </FieldGroup>
        </FormSheet>
      </section>
    </BlockStateProvider>
  )
}

export { Forms2, exampleProps as forms2ExampleProps, type Forms2Props }
