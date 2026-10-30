'use client'

import {
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  type ChoiceCardOption,
  ChoiceCards,
} from '@/registry/components/dashboardblocks/choice-cards'
import {
  type FormErrors,
  SaveBar,
  useSimpleForm,
} from '@/registry/components/dashboardblocks/forms'
import { Tag } from '@/registry/components/dashboardblocks/tag'
import { formatCurrency, formatPercent } from '@/registry/lib/dashboardblocks/format'

import {
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldTitle,
} from '@/components/ui/field'

type BillingSettings = {
  addOns: readonly string[]
  period: 'month' | 'year'
}

interface AddOn {
  description: string
  /** An add-on the workspace's plan can't have, such as one on a higher plan. */
  disabled?: boolean
  id: string
  name: string
  /** What the price is for: the workspace (`month`) or each seat (`seat`), a month. */
  per: 'month' | 'seat'
  /** A month, in dollars. */
  price: number
}

interface Forms6Props extends BlockStateProps {
  addOns: AddOn[]
  /** Leave out to show the empty state. */
  defaultValues?: BillingSettings
  description: string
  onSubmit?: (values: BillingSettings) => Promise<FormErrors<BillingSettings> | void>
  /** A seat a month, in dollars, paid monthly or once a year. */
  seatPrice: { month: number; year: number }
  title: string
}

const exampleProps: Forms6Props = {
  addOns: [
    {
      description:
        'Replies within 4 hours, around the clock, from the same two engineers.',
      id: 'priority-support',
      name: 'Priority support',
      per: 'month',
      price: 99,
    },
    {
      description:
        'Sign in with Okta, Entra ID or Google, and add or remove people from it.',
      id: 'sso',
      name: 'SSO and SCIM',
      per: 'seat',
      price: 4,
    },
    {
      description: 'Every change anyone makes, kept for a year and exported as CSV.',
      id: 'audit-log',
      name: 'Audit log',
      per: 'month',
      price: 29,
    },
    {
      description:
        'Events copied to Snowflake or BigQuery every hour. On the Business plan.',
      disabled: true,
      id: 'warehouse-sync',
      name: 'Warehouse sync',
      per: 'month',
      price: 199,
    },
  ],
  defaultValues: { addOns: ['audit-log'], period: 'month' },
  description: 'Changes apply from your next invoice, on Nov 14.',
  seatPrice: { month: 49, year: 41 },
  title: 'Billing',
}

async function saveBilling() {
  await new Promise((resolve) => setTimeout(resolve, 800))
}

function Price({ per, value }: { per: string; value: number }) {
  return (
    <>
      {formatCurrency(value)}
      <span className='text-muted-foreground group-has-[:checked]/field-label:text-foreground/70 font-normal'>
        {' '}
        {per}
      </span>
    </>
  )
}

function Forms6Content(props: Forms6Props & { defaultValues: BillingSettings }) {
  const { addOns, defaultValues, onSubmit = saveBilling, seatPrice } = props
  const form = useSimpleForm({ defaultValues, onSubmit })
  const changes = form.changedFields.length
  const periodId = form.getId('period')
  const addOnsId = form.getId('addOns')

  const periods: ChoiceCardOption[] = [
    {
      aside: <Price per='a seat' value={seatPrice.month} />,
      description: 'Billed each month. Cancel any time.',
      title: 'Monthly',
      value: 'month',
    },
    {
      aside: <Price per='a seat' value={seatPrice.year} />,
      badge: (
        <Tag tone='good'>
          Save{' '}
          {formatPercent(1 - seatPrice.year / seatPrice.month, {
            maximumFractionDigits: 0,
          })}
        </Tag>
      ),
      description: `Billed ${formatCurrency(seatPrice.year * 12)} a seat once a year.`,
      title: 'Yearly',
      value: 'year',
    },
  ]
  const addOnOptions: ChoiceCardOption[] = addOns.map((addOn) => ({
    aside: (
      <Price per={addOn.per === 'seat' ? 'a seat' : 'a month'} value={addOn.price} />
    ),
    description: addOn.description,
    disabled: addOn.disabled,
    title: addOn.name,
    value: addOn.id,
  }))

  return (
    <form method='post' noValidate onSubmit={(event) => void form.submit(event)}>
      <FieldGroup className='border-t pt-4'>
        <div className='flex flex-col gap-3'>
          <FieldTitle id={`${periodId}-label`}>Billing period</FieldTitle>
          <ChoiceCards
            aria-labelledby={`${periodId}-label`}
            className='@md:grid-cols-2'
            options={periods}
            {...form.select('period')}
          />
          <FieldError {...form.error('period')} />
        </div>
        <div className='flex flex-col gap-3'>
          <div className='flex flex-col gap-1'>
            <FieldTitle id={`${addOnsId}-label`}>Add-ons</FieldTitle>
            <FieldDescription>
              Prices are a month, billed with your plan.
            </FieldDescription>
          </div>
          <ChoiceCards type='checkbox' options={addOnOptions} {...form.list('addOns')} />
          <FieldError {...form.error('addOns')} />
        </div>
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

const Forms6 = (props: Forms6Props) => {
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
          <Forms6Content {...props} defaultValues={defaultValues} />
        ) : (
          <div className='border-t'>
            <BlockStateRows rows={3} />
          </div>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Forms6, exampleProps as forms6ExampleProps, type Forms6Props }
