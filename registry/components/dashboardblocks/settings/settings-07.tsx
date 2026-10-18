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
import { PersonAvatar } from '@/registry/components/dashboardblocks/team'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import {
  type FormEvent,
  type ReactNode,
  startTransition,
  useEffect,
  useRef,
  useState,
} from 'react'

import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

import { cn } from '@/lib/utils'

type Theme = 'light' | 'dark' | 'system'

interface Profile {
  avatar?: string
  email: string
  name: string
  theme: Theme
  /** An IANA time zone, e.g. */
  timeZone: string
}

interface TimeZoneOption {
  label: string
  value: string
}

interface Settings7Props {
  description: string
  /** Called with the chosen image, or `null` when the photo is removed. */
  onAvatarChange?: (file: File | null) => void
  onSave?: (profile: Profile) => void | Promise<void>
  /** Leave out to show the empty state. */
  profile?: Profile
  status?: BlockStatus
  timeZones: TimeZoneOption[]
  title: string
}

type ProfileValues = Omit<Profile, 'avatar'> & { avatar: string }

const exampleProps: Settings7Props = {
  description: 'How you appear to others in the workspace, and how the app looks to you.',
  profile: {
    avatar: '/images/avatar-05.webp',
    email: 'amara@acme.co',
    name: 'Amara Okafor',
    theme: 'system',
    timeZone: 'Europe/London',
  },
  timeZones: [
    { label: 'Los Angeles (GMT−7)', value: 'America/Los_Angeles' },
    { label: 'New York (GMT−4)', value: 'America/New_York' },
    { label: 'London (GMT+1)', value: 'Europe/London' },
    { label: 'Berlin (GMT+2)', value: 'Europe/Berlin' },
    { label: 'Lagos (GMT+1)', value: 'Africa/Lagos' },
    { label: 'Singapore (GMT+8)', value: 'Asia/Singapore' },
    { label: 'Tokyo (GMT+9)', value: 'Asia/Tokyo' },
  ],
  title: 'Profile',
}

const themes: { icon: ReactNode; label: string; value: Theme }[] = [
  {
    icon: (
      <IconPlaceholder
        lucide='SunIcon'
        tabler='IconSun'
        hugeicons='Sun03Icon'
        phosphor='SunIcon'
        remixicon='RiSunLine'
      />
    ),
    label: 'Light',
    value: 'light',
  },
  {
    icon: (
      <IconPlaceholder
        lucide='MoonIcon'
        tabler='IconMoon'
        hugeicons='Moon02Icon'
        phosphor='MoonIcon'
        remixicon='RiMoonLine'
      />
    ),
    label: 'Dark',
    value: 'dark',
  },
  {
    icon: (
      <IconPlaceholder
        lucide='MonitorIcon'
        tabler='IconDeviceDesktop'
        hugeicons='ComputerIcon'
        phosphor='MonitorIcon'
        remixicon='RiComputerLine'
      />
    ),
    label: 'System',
    value: 'system',
  },
]

const MAX_AVATAR_BYTES = 2 * 1024 * 1024

function validate(values: ProfileValues): FormErrors<ProfileValues> {
  return {
    email: !values.email.trim()
      ? 'Enter your email address.'
      : !isEmail(values.email.trim())
        ? 'Enter an email address like name@example.com.'
        : undefined,
    name: values.name.trim() ? undefined : 'Enter your name.',
  }
}

function Settings7Content(props: Settings7Props & { profile: Profile }) {
  const { onAvatarChange, onSave, profile, timeZones } = props
  const fileInput = useRef<HTMLInputElement>(null)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const form = useSimpleForm<ProfileValues>({
    defaultValues: { ...profile, avatar: profile.avatar ?? '' },
    onSubmit: async (values) => {
      await onSave?.({
        ...values,
        avatar: values.avatar || undefined,
        email: values.email.trim().toLowerCase(),
        name: values.name.trim(),
      })
    },
    validate,
  })
  const { values } = form
  const changes = form.changedFields.length
  const emailChanged = form.changedFields.includes('email')

  const objectUrls = useRef<string[]>([])
  useEffect(() => {
    const urls = objectUrls.current
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  const chooseAvatar = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return setAvatarError('Choose an image file.')
    if (file.size > MAX_AVATAR_BYTES) return setAvatarError('Choose an image under 2 MB.')
    setAvatarError(null)
    const url = URL.createObjectURL(file)
    objectUrls.current.push(url)
    form.setValue('avatar', url)
    setStatus('')
    onAvatarChange?.(file)
  }

  const removeAvatar = () => {
    form.setValue('avatar', '')
    setAvatarError(null)
    setStatus('')
    onAvatarChange?.(null)
  }

  const save = async (event: FormEvent<HTMLFormElement>) => {
    const email = values.email.trim().toLowerCase()
    const confirmEmail = emailChanged
    setStatus('')
    const saved = await form.submit(event)
    if (!saved) return
    startTransition(() =>
      setStatus(confirmEmail ? `Saved. Check ${email} to confirm it.` : 'Saved.'),
    )
  }

  return (
    <>
      <form method='post' noValidate onSubmit={(event) => void save(event)}>
        <div className='flex flex-col gap-6'>
          <FormSection
            title='Your details'
            description='Your photo, name and email address.'
          >
            <FieldGroup>
              <div className='flex items-center gap-4'>
                <PersonAvatar
                  person={{
                    avatar: values.avatar || undefined,
                    name: values.name || profile.name,
                  }}
                  size='lg'
                  className='size-16'
                />
                <div className='flex flex-col gap-2'>
                  <div className='flex flex-wrap gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      aria-describedby={`${form.getId('avatar')}-hint`}
                      onClick={() => fileInput.current?.click()}
                    >
                      <IconPlaceholder
                        lucide='UploadIcon'
                        tabler='IconUpload'
                        hugeicons='Upload01Icon'
                        phosphor='UploadSimpleIcon'
                        remixicon='RiUploadLine'
                        data-icon='inline-start'
                        aria-hidden
                      />
                      {values.avatar ? 'Change photo' : 'Upload photo'}
                    </Button>
                    {values.avatar && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={removeAvatar}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <p
                    id={`${form.getId('avatar')}-hint`}
                    className={cn(
                      'text-xs',
                      avatarError ? 'text-destructive' : 'text-muted-foreground',
                    )}
                  >
                    {avatarError ?? 'JPG, PNG or GIF, up to 2 MB.'}
                  </p>
                  <input
                    ref={fileInput}
                    type='file'
                    accept='image/*'
                    tabIndex={-1}
                    aria-hidden
                    className='sr-only'
                    onChange={(event) => {
                      chooseAvatar(event.target.files?.[0])
                      event.target.value = ''
                    }}
                  />
                </div>
              </div>
              <Field data-invalid={form.errors.name ? true : undefined}>
                <FieldLabel htmlFor={form.getId('name')}>Name</FieldLabel>
                <Input autoComplete='name' {...form.field('name')} />
                <FieldError {...form.error('name')} />
              </Field>
              <Field data-invalid={form.errors.email ? true : undefined}>
                <FieldLabel htmlFor={form.getId('email')}>Email</FieldLabel>
                <Input type='email' autoComplete='email' {...form.field('email')} />
                {emailChanged && !form.errors.email && (
                  <FieldDescription>
                    We’ll send a link to the new address. It changes once you confirm.
                  </FieldDescription>
                )}
                <FieldError {...form.error('email')} />
              </Field>
            </FieldGroup>
          </FormSection>
          <FormSection
            title='Preferences'
            description='Your time zone, and how the app looks.'
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={form.getId('timeZone')}>Time zone</FieldLabel>
                <NativeSelect className='w-full' {...form.field('timeZone')}>
                  {timeZones.map((zone) => (
                    <NativeSelectOption key={zone.value} value={zone.value}>
                      {zone.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <FieldDescription>
                  Used for dates in dashboards, reports and email digests.
                </FieldDescription>
              </Field>
              <fieldset className='flex flex-col gap-3'>
                <legend className='mb-3 text-sm font-medium'>Theme</legend>
                <div className='grid grid-cols-3 gap-2'>
                  {themes.map((theme) => (
                    <label
                      key={theme.value}
                      className='has-checked:border-primary has-checked:ring-primary has-focus-visible:ring-ring/50 flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-3 text-sm has-checked:ring-1 has-focus-visible:ring-3 [&_svg]:size-5'
                    >
                      <input
                        type='radio'
                        name={form.getId('theme')}
                        value={theme.value}
                        checked={values.theme === theme.value}
                        onChange={() => form.setValue('theme', theme.value)}
                        className='sr-only'
                      />
                      <span aria-hidden className='text-muted-foreground'>
                        {theme.icon}
                      </span>
                      {theme.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            </FieldGroup>
          </FormSection>
        </div>
        <p role='status' className='text-muted-foreground mt-4 text-sm empty:sr-only'>
          {form.isDirty ? '' : status}
        </p>
        <SaveBar
          className='mt-6'
          isDirty={form.isDirty}
          isSubmitting={form.isSubmitting}
          message={`${changes} unsaved ${changes === 1 ? 'change' : 'changes'}`}
          onDiscard={() => {
            form.reset()
            setAvatarError(null)
            setStatus('')
          }}
        />
      </form>
    </>
  )
}

const Settings7 = (props: Settings7Props) => {
  const { description, profile, status, title } = props
  const ready = !status && profile !== undefined

  return (
    <BlockStateProvider status={status} empty={profile === undefined}>
      <section className='@container flex flex-col gap-3'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        {ready ? (
          <Settings7Content {...props} profile={profile} />
        ) : (
          <div className='border-t'>
            <BlockStateRows rows={6} />
          </div>
        )}
      </section>
    </BlockStateProvider>
  )
}

export {
  Settings7,
  exampleProps as settings7ExampleProps,
  type Profile,
  type Settings7Props,
  type Theme,
  type TimeZoneOption,
}
