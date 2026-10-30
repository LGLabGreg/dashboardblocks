'use client'

import {
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { CountryFlag } from '@/registry/components/dashboardblocks/country-flag'
import {
  type FormErrors,
  SaveBar,
  useSimpleForm,
} from '@/registry/components/dashboardblocks/forms'
import {
  MultiSelect,
  type MultiSelectOption,
} from '@/registry/components/dashboardblocks/multi-select'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'

type ReportSettings = {
  markets: readonly string[]
  metrics: readonly string[]
  recipients: readonly string[]
}

interface Country {
  /** ISO 3166-1 alpha-2 code, such as `DE`. */
  code: string
  name: string
}

interface Forms5Props extends BlockStateProps {
  countries: Country[]
  /** Leave out to show the empty state. */
  defaultValues?: ReportSettings
  description: string
  /** @default 5 */
  maxMetrics?: number
  metrics: MultiSelectOption[]
  onSubmit?: (values: ReportSettings) => Promise<FormErrors<ReportSettings> | void>
  people: MultiSelectOption[]
  title: string
}

const exampleProps: Forms5Props = {
  countries: [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'ES', name: 'Spain' },
    { code: 'SE', name: 'Sweden' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'JP', name: 'Japan' },
    { code: 'BR', name: 'Brazil' },
    { code: 'IN', name: 'India' },
  ],
  defaultValues: {
    markets: ['US', 'GB', 'DE'],
    metrics: ['mrr', 'new-customers', 'churn'],
    recipients: ['amara', 'jonas'],
  },
  description: 'Sent every Monday at 9:00 with last week’s numbers.',
  metrics: [
    { label: 'MRR', value: 'mrr' },
    { label: 'New customers', value: 'new-customers' },
    { label: 'Churn rate', value: 'churn' },
    { label: 'Active users', value: 'active-users' },
    { label: 'Trial conversion', value: 'trial-conversion' },
    { label: 'Average revenue per account', value: 'arpa' },
    { label: 'Net revenue retention', value: 'nrr' },
    { label: 'Support tickets', value: 'tickets' },
  ],
  people: [
    { label: 'Amara Okafor', value: 'amara' },
    { label: 'Jonas Weber', value: 'jonas' },
    { label: 'Li Wei', value: 'li' },
    { label: 'Sofia Marquez', value: 'sofia' },
    { label: 'Ravi Shah', value: 'ravi' },
    { label: 'Hanna Becker', value: 'hanna' },
    { label: 'Noor Haddad', value: 'noor' },
  ],
  title: 'Weekly report',
}

async function saveReport() {
  await new Promise((resolve) => setTimeout(resolve, 800))
}

function Forms5Content(props: Forms5Props & { defaultValues: ReportSettings }) {
  const {
    countries,
    defaultValues,
    maxMetrics = 5,
    metrics,
    onSubmit = saveReport,
    people,
  } = props
  const form = useSimpleForm({
    defaultValues,
    onSubmit,
    validate: (values): FormErrors<ReportSettings> => ({
      markets: values.markets.length === 0 ? 'Pick at least one market.' : undefined,
      metrics:
        values.metrics.length === 0
          ? 'Pick at least one metric.'
          : values.metrics.length > maxMetrics
            ? `Pick ${maxMetrics} metrics or fewer, so the email stays short.`
            : undefined,
      recipients:
        values.recipients.length === 0 ? 'Pick at least one person.' : undefined,
    }),
  })
  const changes = form.changedFields.length
  const markets = countries.map((country) => ({
    icon: <CountryFlag code={country.code} />,
    label: country.name,
    value: country.code,
  }))

  return (
    <form method='post' noValidate onSubmit={(event) => void form.submit(event)}>
      <FieldGroup className='border-t pt-4'>
        <Field data-invalid={form.errors.recipients ? true : undefined}>
          <FieldLabel
            id={`${form.getId('recipients')}-label`}
            htmlFor={form.getId('recipients')}
          >
            Send to
          </FieldLabel>
          <MultiSelect
            options={people}
            placeholder='Add people'
            {...form.list('recipients')}
          />
          <FieldError {...form.error('recipients')} />
        </Field>
        <Field data-invalid={form.errors.metrics ? true : undefined}>
          <FieldLabel
            id={`${form.getId('metrics')}-label`}
            htmlFor={form.getId('metrics')}
          >
            Metrics
          </FieldLabel>
          <MultiSelect
            options={metrics}
            placeholder='Add metrics'
            {...form.list('metrics')}
          />
          <FieldDescription>
            {form.values.metrics.length} picked, up to {maxMetrics}. The email shows them
            in this order.
          </FieldDescription>
          <FieldError {...form.error('metrics')} />
        </Field>
        <Field data-invalid={form.errors.markets ? true : undefined}>
          <FieldLabel
            id={`${form.getId('markets')}-label`}
            htmlFor={form.getId('markets')}
          >
            Markets
          </FieldLabel>
          <MultiSelect
            options={markets}
            placeholder='Add countries'
            {...form.list('markets')}
          />
          <FieldDescription>Each metric is split by these countries.</FieldDescription>
          <FieldError {...form.error('markets')} />
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

const Forms5 = (props: Forms5Props) => {
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
          <Forms5Content {...props} defaultValues={defaultValues} />
        ) : (
          <div className='border-t'>
            <BlockStateRows rows={3} />
          </div>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Forms5, exampleProps as forms5ExampleProps, type Forms5Props }
