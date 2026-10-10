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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
}

const STEPS: (FormStep & { fields: (keyof NewProject)[] })[] = [
  { description: 'Name and purpose', fields: ['name', 'description'], title: 'Details' },
  {
    description: 'Where it runs',
    fields: ['region', 'environment', 'isPublic'],
    title: 'Setup',
  },
  { description: 'Check and create', fields: [], title: 'Review' },
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
  const { environments, onCreate = createProject, regions } = props
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
      <Card>
        <CardContent className='flex flex-col items-center gap-3 py-8 text-center'>
          <IconPlaceholder
            lucide='CircleCheckIcon'
            tabler='IconCircleCheckFilled'
            hugeicons='CheckmarkCircle01Icon'
            phosphor='CheckCircleIcon'
            remixicon='RiCheckboxCircleFill'
            className='text-primary size-8'
          />
          <div className='flex flex-col gap-1'>
            <p className='font-medium' role='status'>
              {created} is ready
            </p>
            <p className='text-muted-foreground text-sm'>
              Your project was created in {labelOf(regions, values.region)}.
            </p>
          </div>
          <Button variant='outline' onClick={startOver}>
            Create another project
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <form
        method='post'
        noValidate
        onSubmit={(event) => void onSubmit(event)}
        className='contents'
      >
        <CardHeader>
          <CardTitle>New project</CardTitle>
          <CardDescription>
            Step {step + 1} of {STEPS.length}
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-6'>
          <FormSteps current={step} steps={STEPS} />
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
                <FieldDescription>
                  Pick the region closest to your users.
                </FieldDescription>
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
            <dl className='grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[10rem_1fr]'>
              <dt className='text-muted-foreground'>Name</dt>
              <dd className='font-medium'>{values.name}</dd>
              <dt className='text-muted-foreground'>Description</dt>
              <dd>{values.description || 'None'}</dd>
              <dt className='text-muted-foreground'>Region</dt>
              <dd>{labelOf(regions, values.region)}</dd>
              <dt className='text-muted-foreground'>Environment</dt>
              <dd>{labelOf(environments, values.environment)}</dd>
              <dt className='text-muted-foreground'>Dashboard</dt>
              <dd>{values.isPublic ? 'Public' : 'Private'}</dd>
            </dl>
          )}
        </CardContent>
        <CardFooter className='justify-between gap-2'>
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
        </CardFooter>
      </form>
    </Card>
  )
}

export { Forms3, exampleProps as forms3ExampleProps, type Forms3Props }
