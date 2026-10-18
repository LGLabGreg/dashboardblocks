'use client'

import {
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
} from '@/registry/components/dashboardblocks/block-state'
import {
  type FormErrors,
  FormSection,
  isEmail,
  SaveBar,
  useSimpleForm,
} from '@/registry/components/dashboardblocks/forms'

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

type WorkspaceSettings = {
  bio: string
  email: string
  name: string
  slug: string
  timezone: string
  weeklyDigest: boolean
  workspaceName: string
}

interface Forms1Props {
  /** Leave out to show the empty state. */
  defaultValues?: WorkspaceSettings
  description: string
  domain: string
  onSubmit?: (values: WorkspaceSettings) => Promise<FormErrors<WorkspaceSettings> | void>
  status?: BlockStatus
  timezones: { label: string; value: string }[]
  title: string
}

const BIO_LIMIT = 160

const exampleProps: Forms1Props = {
  defaultValues: {
    bio: 'Runs growth at Acme. Ask me about funnels.',
    email: 'amara@acme.com',
    name: 'Amara Okafor',
    slug: 'acme-store',
    timezone: 'Europe/London',
    weeklyDigest: true,
    workspaceName: 'Acme Store',
  },
  description: 'Your profile, and the workspace you share with your team.',
  domain: 'app.example.com',
  timezones: [
    { label: 'Pacific Time (Los Angeles)', value: 'America/Los_Angeles' },
    { label: 'Eastern Time (New York)', value: 'America/New_York' },
    { label: 'Greenwich Mean Time (London)', value: 'Europe/London' },
    { label: 'Central European Time (Berlin)', value: 'Europe/Berlin' },
    { label: 'Japan Standard Time (Tokyo)', value: 'Asia/Tokyo' },
  ],
  title: 'Settings',
}

async function saveSettings(values: WorkspaceSettings) {
  await new Promise((resolve) => setTimeout(resolve, 800))
  if (values.slug === 'acme') return { slug: 'That URL is already taken.' }
}

function validate(values: WorkspaceSettings): FormErrors<WorkspaceSettings> {
  return {
    bio:
      values.bio.length > BIO_LIMIT
        ? `Keep it to ${BIO_LIMIT} characters or fewer.`
        : undefined,
    email: !values.email.trim()
      ? 'Enter your email address.'
      : !isEmail(values.email)
        ? 'Enter an email address like name@example.com.'
        : undefined,
    name: values.name.trim() ? undefined : 'Enter your name.',
    slug: !/^[a-z0-9-]{3,}$/.test(values.slug)
      ? 'Use at least 3 lowercase letters, numbers or dashes.'
      : undefined,
    workspaceName: values.workspaceName.trim() ? undefined : 'Enter a workspace name.',
  }
}

function Forms1Content(props: Forms1Props & { defaultValues: WorkspaceSettings }) {
  const { defaultValues, domain, onSubmit = saveSettings, timezones } = props
  const form = useSimpleForm({ defaultValues, onSubmit, validate })
  const { values } = form
  const changes = form.changedFields.length

  return (
    <>
      <form method='post' noValidate onSubmit={(event) => void form.submit(event)}>
        <div className='flex flex-col gap-6'>
          <FormSection title='Profile' description='How you appear to your team.'>
            <FieldGroup>
              <Field data-invalid={form.errors.name ? true : undefined}>
                <FieldLabel htmlFor={form.getId('name')}>Name</FieldLabel>
                <Input autoComplete='name' {...form.field('name')} />
                <FieldError {...form.error('name')} />
              </Field>
              <Field data-invalid={form.errors.email ? true : undefined}>
                <FieldLabel htmlFor={form.getId('email')}>Email</FieldLabel>
                <Input type='email' autoComplete='email' {...form.field('email')} />
                <FieldError {...form.error('email')} />
              </Field>
              <Field data-invalid={form.errors.bio ? true : undefined}>
                <FieldLabel htmlFor={form.getId('bio')}>Bio</FieldLabel>
                <Textarea rows={3} {...form.field('bio')} />
                <FieldDescription>
                  {values.bio.length} of {BIO_LIMIT} characters
                </FieldDescription>
                <FieldError {...form.error('bio')} />
              </Field>
            </FieldGroup>
          </FormSection>
          <FormSection
            title='Workspace'
            description='The name and address your team uses to find this workspace.'
          >
            <FieldGroup>
              <Field data-invalid={form.errors.workspaceName ? true : undefined}>
                <FieldLabel htmlFor={form.getId('workspaceName')}>
                  Workspace name
                </FieldLabel>
                <Input {...form.field('workspaceName')} />
                <FieldError {...form.error('workspaceName')} />
              </Field>
              <Field data-invalid={form.errors.slug ? true : undefined}>
                <FieldLabel htmlFor={form.getId('slug')}>URL</FieldLabel>
                <Input autoCapitalize='none' spellCheck={false} {...form.field('slug')} />
                <FieldDescription>
                  {domain}/{values.slug || 'your-workspace'}
                </FieldDescription>
                <FieldError {...form.error('slug')} />
              </Field>
            </FieldGroup>
          </FormSection>
          <FormSection
            title='Preferences'
            description='Your time zone, and the emails you get.'
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={form.getId('timezone')}>Time zone</FieldLabel>
                <NativeSelect className='w-full' {...form.field('timezone')}>
                  {timezones.map((timezone) => (
                    <NativeSelectOption key={timezone.value} value={timezone.value}>
                      {timezone.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <FieldDescription>
                  Reports and digests use this time zone.
                </FieldDescription>
              </Field>
              <Field orientation='horizontal'>
                <FieldContent>
                  <FieldTitle id={`${form.getId('weeklyDigest')}-label`}>
                    Weekly digest
                  </FieldTitle>
                  <FieldDescription id={`${form.getId('weeklyDigest')}-description`}>
                    A summary of your workspace every Monday morning.
                  </FieldDescription>
                </FieldContent>
                <Switch
                  aria-labelledby={`${form.getId('weeklyDigest')}-label`}
                  aria-describedby={`${form.getId('weeklyDigest')}-description`}
                  checked={values.weeklyDigest}
                  onCheckedChange={(checked) => form.setValue('weeklyDigest', checked)}
                />
              </Field>
            </FieldGroup>
          </FormSection>
        </div>
        <SaveBar
          className='mt-6'
          isDirty={form.isDirty}
          isSubmitting={form.isSubmitting}
          message={`${changes} unsaved ${changes === 1 ? 'change' : 'changes'}`}
          onDiscard={() => form.reset()}
        />
      </form>
    </>
  )
}

const Forms1 = (props: Forms1Props) => {
  const { defaultValues, description, status, title } = props
  const ready = !status && defaultValues !== undefined

  return (
    <BlockStateProvider status={status} empty={defaultValues === undefined}>
      <section className='@container flex flex-col gap-3'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        {ready ? (
          <Forms1Content {...props} defaultValues={defaultValues} />
        ) : (
          <div className='border-t'>
            <BlockStateRows rows={6} />
          </div>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Forms1, exampleProps as forms1ExampleProps, type Forms1Props }
