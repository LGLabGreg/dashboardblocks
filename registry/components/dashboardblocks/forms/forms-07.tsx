'use client'

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
import { NumberField } from '@/registry/components/dashboardblocks/number-field'
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from '@/registry/lib/dashboardblocks/format'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'

type UsageSettings = {
  /** The share of the cap, from 1 to 100, at which the owners get an email. */
  alertAt: number | null
  /** Usage above the plan, in dollars a month, billed before new runs pause. */
  cap: number | null
  seats: number | null
}

interface Forms7Props extends BlockStateProps {
  /** Leave out to show the empty state. */
  defaultValues?: UsageSettings
  description: string
  /** People in the workspace: each needs a seat. */
  members: number
  onSubmit?: (values: UsageSettings) => Promise<FormErrors<UsageSettings> | void>
  /** A seat a month, in dollars. */
  seatPrice: number
  title: string
}

const exampleProps: Forms7Props = {
  defaultValues: { alertAt: 80, cap: 500, seats: 12 },
  description: 'Billed on the 14th of each month, with usage from the month before.',
  members: 9,
  seatPrice: 49,
  title: 'Seats and usage',
}

async function saveUsage() {
  await new Promise((resolve) => setTimeout(resolve, 800))
}

function Forms7Content(props: Forms7Props & { defaultValues: UsageSettings }) {
  const { defaultValues, members, onSubmit = saveUsage, seatPrice } = props
  const form = useSimpleForm({
    defaultValues,
    onSubmit,
    validate: (values): FormErrors<UsageSettings> => ({
      alertAt: values.alertAt === null ? 'Enter a share of the cap.' : undefined,
      cap:
        values.cap === null
          ? 'Enter a cap, or 0 to pause at the plan’s limit.'
          : undefined,
      seats: values.seats === null ? 'Enter a number of seats.' : undefined,
    }),
  })
  const changes = form.changedFields.length
  const { alertAt, cap, seats } = form.values

  return (
    <form method='post' noValidate onSubmit={(event) => void form.submit(event)}>
      <FieldGroup className='border-t pt-4'>
        <Field data-invalid={form.errors.seats ? true : undefined}>
          <FieldLabel htmlFor={form.getId('seats')}>Seats</FieldLabel>
          <NumberField
            className='@md:w-48'
            decrementLabel='Remove a seat'
            incrementLabel='Add a seat'
            max={500}
            min={members}
            stepper
            unit='seats'
            {...form.number('seats')}
          />
          <FieldDescription>
            {seats === null
              ? `${formatCurrency(seatPrice)} a seat a month. ${formatNumber(members)} are in use, so you can’t go below that.`
              : `${formatCurrency(seats * seatPrice)} a month at ${formatCurrency(seatPrice)} a seat. ${formatNumber(members)} are in use, so you can’t go below that.`}
          </FieldDescription>
          <FieldError {...form.error('seats')} />
        </Field>
        <Field data-invalid={form.errors.cap ? true : undefined}>
          <FieldLabel htmlFor={form.getId('cap')}>Usage cap</FieldLabel>
          <NumberField
            className='@md:w-56'
            currency='USD'
            min={0}
            unit='a month'
            {...form.number('cap')}
          />
          <FieldDescription>
            Usage above your plan is billed up to this amount, then new runs pause until
            the 14th.
          </FieldDescription>
          <FieldError {...form.error('cap')} />
        </Field>
        <Field data-invalid={form.errors.alertAt ? true : undefined}>
          <FieldLabel htmlFor={form.getId('alertAt')}>Email the owners at</FieldLabel>
          <NumberField
            className='@md:w-40'
            max={100}
            min={1}
            unit='% of the cap'
            {...form.number('alertAt')}
          />
          <FieldDescription>
            {alertAt !== null && cap !== null && cap > 0
              ? `They get an email once usage passes ${formatCurrency(cap * (alertAt / 100), { precision: 'exact' })}, ${formatPercent(alertAt / 100)} of ${formatCurrency(cap, { precision: 'exact' })}.`
              : 'They get an email once usage passes this share of the cap.'}
          </FieldDescription>
          <FieldError {...form.error('alertAt')} />
        </Field>
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

const Forms7 = (props: Forms7Props) => {
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
          <Forms7Content {...props} defaultValues={defaultValues} />
        ) : (
          <div className='border-t'>
            <BlockStateRows rows={3} />
          </div>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Forms7, exampleProps as forms7ExampleProps, type Forms7Props }
