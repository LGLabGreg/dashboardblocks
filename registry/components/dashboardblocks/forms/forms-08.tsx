'use client'

import {
  type Address,
  AddressFields,
  validateAddress,
} from '@/registry/components/dashboardblocks/address-fields'
import {
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  type FormErrors,
  SaveBar,
  useSimpleForm,
} from '@/registry/components/dashboardblocks/forms'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

type BillingAddress = Address & {
  /** The person or company the invoices are made out to. */
  name: string
}

interface Forms8Props extends BlockStateProps {
  /** Leave out to show the empty state. */
  defaultValues?: BillingAddress
  description: string
  onSubmit?: (values: BillingAddress) => Promise<FormErrors<BillingAddress> | void>
  title: string
}

const exampleProps: Forms8Props = {
  defaultValues: {
    city: 'San Francisco',
    country: 'US',
    line1: '500 Howard Street',
    line2: 'Floor 4',
    name: 'Northwind Labs, Inc.',
    postalCode: '94105',
    state: 'CA',
  },
  description: 'Printed on every invoice, and used to work out sales tax.',
  title: 'Billing address',
}

async function saveAddress() {
  await new Promise((resolve) => setTimeout(resolve, 800))
}

function Forms8Content(props: Forms8Props & { defaultValues: BillingAddress }) {
  const { defaultValues, onSubmit = saveAddress } = props
  const form = useSimpleForm({
    defaultValues,
    onSubmit,
    validate: (values): FormErrors<BillingAddress> => ({
      ...validateAddress(values),
      name: values.name.trim() ? undefined : 'Enter a name for the invoices.',
    }),
  })
  const changes = form.changedFields.length

  return (
    <form method='post' noValidate onSubmit={(event) => void form.submit(event)}>
      <FieldGroup className='border-t pt-4'>
        <Field data-invalid={form.errors.name ? true : undefined}>
          <FieldLabel htmlFor={form.getId('name')}>Name on invoices</FieldLabel>
          <Input {...form.field('name')} autoComplete='organization' />
          <FieldDescription>
            Your company’s name, or yours if you pay personally.
          </FieldDescription>
          <FieldError {...form.error('name')} />
        </Field>
        <AddressFields
          errors={form.errors}
          getId={form.getId}
          value={form.values}
          onFieldChange={(field, value) => form.setValue(field, value)}
        />
      </FieldGroup>
      <SaveBar
        className='mt-6'
        isDirty={form.isDirty}
        isSubmitting={form.isSubmitting}
        message={`${changes} unsaved ${changes === 1 ? 'change' : 'changes'}`}
        onDiscard={() => form.reset()}
      />
    </form>
  )
}

const Forms8 = (props: Forms8Props) => {
  const { defaultValues, description, errorMessage, status, title } = props
  const ready = !status && defaultValues !== undefined

  return (
    <BlockStateProvider
      errorMessage={errorMessage}
      state={getBlockState(status, defaultValues)}
    >
      <section className='@container flex flex-col gap-3'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        {ready ? (
          <Forms8Content {...props} defaultValues={defaultValues} />
        ) : (
          <div className='border-t'>
            <BlockStateRows rows={4} />
          </div>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Forms8, exampleProps as forms8ExampleProps, type Forms8Props }
