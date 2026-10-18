'use client'

import {
  type FormErrors,
  type FormStep,
  FormSteps,
  useSimpleForm,
} from '@/registry/components/dashboardblocks/forms'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type FormEvent, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

type NewProject = {
  description: string
  environment: string
  isPublic: boolean
  name: string
  region: string
}

interface Option {
  label: string
  value: string
}

interface Forms3Props {
  environments: Option[]
  onCreate?: (values: NewProject) => Promise<FormErrors<NewProject> | void>
  regions: Option[]
  title: string
}

const exampleProps: Forms3Props = {
  environments: [
    { label: 'Production', value: 'production' },
    { label: 'Staging', value: 'staging' },
    { label: 'Development', value: 'development' },
  ],
  regions: [
    { label: 'Frankfurt (eu-central-1)', value: 'eu-central-1' },
    { label: 'Virginia (us-east-1)', value: 'us-east-1' },
    { label: 'Oregon (us-west-2)', value: 'us-west-2' },
    { label: 'Singapore (ap-southeast-1)', value: 'ap-southeast-1' },
  ],
  title: 'New project',
}

const STEPS: (FormStep & { fields: (keyof NewProject)[]; summary: string })[] = [
  {
    description: 'Name and purpose',
    fields: ['name', 'description'],
    summary: 'Name the project and say what it’s for.',
    title: 'Details',
  },
  {
    description: 'Where it runs',
    fields: ['region', 'environment', 'isPublic'],
    summary: 'Choose where it runs and who can see its dashboard.',
    title: 'Setup',
  },
  {
    description: 'Check and create',
    fields: [],
    summary: 'Check everything, then create the project.',
    title: 'Review',
  },
]

async function createProject() {
  await new Promise((resolve) => setTimeout(resolve, 800))
}

function validate(values: NewProject): FormErrors<NewProject> {
  return {
    description:
      values.description.length > 200 ? 'Keep it to 200 characters or fewer.' : undefined,
    name: !values.name.trim()
      ? 'Enter a project name.'
      : values.name.trim().length < 3
        ? 'Use at least 3 characters.'
        : undefined,
  }
}

function labelOf(options: Option[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value
}

const Forms3 = (props: Forms3Props) => {
  const { environments, onCreate = createProject, regions, title } = props
  const [step, setStep] = useState(0)
  const [created, setCreated] = useState<string | null>(null)
  const emptyValues: NewProject = {
    description: '',
    environment: environments[0]?.value ?? '',
    isPublic: false,
    name: '',
    region: regions[0]?.value ?? '',
  }
  const form = useSimpleForm({ defaultValues: emptyValues, onSubmit: onCreate, validate })
  const { values } = form
  const last = step === STEPS.length - 1

  function next() {
    if (form.validateFields(STEPS[step].fields)) setStep(step + 1)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    if (!last) {
      event.preventDefault()
      next()
      return
    }
    if (await form.submit(event)) setCreated(values.name)
  }

  function startOver() {
    form.reset(emptyValues)
    setStep(0)
    setCreated(null)
  }

  if (created) {
    return (
      <section className='@container flex flex-col gap-3'>
        <div role='status' className='flex flex-col gap-0.5'>
          <h2 className='flex items-center gap-2 font-semibold tracking-tight'>
            <IconPlaceholder
              lucide='CircleCheckIcon'
              tabler='IconCircleCheckFilled'
              hugeicons='CheckmarkCircle01Icon'
              phosphor='CheckCircleIcon'
              remixicon='RiCheckboxCircleFill'
              aria-hidden
              className='size-4 shrink-0 text-emerald-700 dark:text-emerald-400'
            />
            {created} is ready
          </h2>
          <p className='text-muted-foreground text-sm'>
            Created in {labelOf(regions, values.region)}, for{' '}
            {labelOf(environments, values.environment).toLowerCase()}, with a{' '}
            {values.isPublic ? 'public' : 'private'} dashboard.
          </p>
        </div>
        <div className='border-t pt-4'>
          <Button variant='outline' size='sm' onClick={startOver}>
            Create another project
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className='@container flex flex-col gap-4'>
      <header className='flex flex-col gap-0.5'>
        <h2 className='font-semibold tracking-tight'>{title}</h2>
        <p className='text-muted-foreground text-sm'>
          Step {step + 1} of {STEPS.length}. {STEPS[step].summary}
        </p>
      </header>
      <FormSteps current={step} steps={STEPS} />
      <form
        method='post'
        noValidate
        onSubmit={(event) => void onSubmit(event)}
        className='flex flex-col gap-4'
      >
        {step === 0 && (
          <FieldGroup>
            <Field data-invalid={form.errors.name ? true : undefined}>
              <FieldLabel htmlFor={form.getId('name')}>Project name</FieldLabel>
              <Input autoComplete='off' {...form.field('name')} />
              <FieldError {...form.error('name')} />
            </Field>
            <Field data-invalid={form.errors.description ? true : undefined}>
              <FieldLabel htmlFor={form.getId('description')}>Description</FieldLabel>
              <Textarea rows={3} {...form.field('description')} />
              <FieldDescription>
                Optional. Shown to everyone in the workspace.
              </FieldDescription>
              <FieldError {...form.error('description')} />
            </Field>
          </FieldGroup>
        )}
        {step === 1 && (
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={form.getId('region')}>Region</FieldLabel>
              <NativeSelect className='w-full' {...form.field('region')}>
                {regions.map((region) => (
                  <NativeSelectOption key={region.value} value={region.value}>
                    {region.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldDescription>Pick the region closest to your users.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor={form.getId('environment')}>Environment</FieldLabel>
              <NativeSelect className='w-full' {...form.field('environment')}>
                {environments.map((environment) => (
                  <NativeSelectOption key={environment.value} value={environment.value}>
                    {environment.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field orientation='horizontal'>
              <FieldContent>
                <FieldTitle id={`${form.getId('isPublic')}-label`}>
                  Public dashboard
                </FieldTitle>
                <FieldDescription id={`${form.getId('isPublic')}-description`}>
                  Anyone with the link can view it, without signing in.
                </FieldDescription>
              </FieldContent>
              <Switch
                aria-labelledby={`${form.getId('isPublic')}-label`}
                aria-describedby={`${form.getId('isPublic')}-description`}
                checked={values.isPublic}
                onCheckedChange={(checked) => form.setValue('isPublic', checked)}
              />
            </Field>
          </FieldGroup>
        )}
        {step === 2 && (
          <dl className='divide-y border-y text-sm'>
            {[
              ['Name', values.name],
              ['Description', values.description || 'None'],
              ['Region', labelOf(regions, values.region)],
              ['Environment', labelOf(environments, values.environment)],
              ['Dashboard', values.isPublic ? 'Public' : 'Private'],
            ].map(([term, detail]) => (
              <div
                key={term}
                className='grid gap-1 py-2.5 @md:grid-cols-[10rem_minmax(0,1fr)] @md:gap-4'
              >
                <dt className='text-muted-foreground'>{term}</dt>
                <dd className='min-w-0 break-words'>{detail}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className='flex items-center justify-between gap-2 border-t pt-4'>
          <Button
            type='button'
            variant='outline'
            disabled={step === 0 || form.isSubmitting}
            onClick={() => setStep(step - 1)}
          >
            Back
          </Button>
          {last ? (
            <Button key='create' type='submit' disabled={form.isSubmitting}>
              {form.isSubmitting ? 'Creating…' : 'Create project'}
            </Button>
          ) : (
            <Button key='next' type='button' onClick={next}>
              Next
            </Button>
          )}
        </div>
      </form>
    </section>
  )
}

export { Forms3, exampleProps as forms3ExampleProps, type Forms3Props }
