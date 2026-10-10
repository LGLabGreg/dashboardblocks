'use client'

import { PersonAvatar } from '@/registry/components/dashboardblocks/team'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type FormEvent, type ReactNode, useEffect, useId, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
  onSave?: (profile: Profile) => void
  profile: Profile
  timeZones: TimeZoneOption[]
  title: string
}

const exampleProps: Settings7Props = {
  description: 'How you appear to others in the workspace, and how the app looks to you.',
  profile: {
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

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const MAX_AVATAR_BYTES = 2 * 1024 * 1024

const Settings7 = (props: Settings7Props) => {
  const { description, onAvatarChange, onSave, timeZones, title } = props
  const id = useId()
  const fileInput = useRef<HTMLInputElement>(null)
  const [saved, setSaved] = useState(props.profile)
  const [draft, setDraft] = useState(props.profile)
  const [errors, setErrors] = useState<{
    avatar?: string
    email?: string
    name?: string
  }>({})
  const [status, setStatus] = useState('')

  const objectUrls = useRef<string[]>([])
  useEffect(() => {
    const urls = objectUrls.current
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  const dirty = (Object.keys(draft) as (keyof Profile)[]).some(
    (key) => draft[key] !== saved[key],
  )
  const emailChanged = draft.email.trim().toLowerCase() !== saved.email

  const update = (patch: Partial<Profile>) => {
    setDraft((current) => ({ ...current, ...patch }))
    setStatus('')
  }

  const chooseAvatar = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      return setErrors((current) => ({ ...current, avatar: 'Choose an image file.' }))
    }
    if (file.size > MAX_AVATAR_BYTES) {
      return setErrors((current) => ({
        ...current,
        avatar: 'Choose an image under 2 MB.',
      }))
    }
    setErrors((current) => ({ ...current, avatar: undefined }))
    const url = URL.createObjectURL(file)
    objectUrls.current.push(url)
    update({ avatar: url })
    onAvatarChange?.(file)
  }

  const removeAvatar = () => {
    update({ avatar: undefined })
    setErrors((current) => ({ ...current, avatar: undefined }))
    onAvatarChange?.(null)
  }

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = draft.name.trim()
    const email = draft.email.trim().toLowerCase()
    const next = {
      email: EMAIL.test(email) ? undefined : 'Enter an email address.',
      name: name ? undefined : 'Enter your name.',
    }
    flushSync(() => setErrors((current) => ({ ...current, ...next })))
    if (next.name) return document.getElementById(`${id}-name`)?.focus()
    if (next.email) return document.getElementById(`${id}-email`)?.focus()
    const profile = { ...draft, email, name }
    setDraft(profile)
    setSaved(profile)
    setStatus(emailChanged ? `Saved. Check ${email} to confirm it.` : 'Saved.')
    onSave?.(profile)
  }

  const reset = () => {
    setDraft(saved)
    setErrors({})
    setStatus('')
  }

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <form method='post' noValidate onSubmit={save} className='contents'>
        <CardContent className='flex flex-col gap-6'>
          <div className='flex items-center gap-4'>
            <PersonAvatar
              person={{ avatar: draft.avatar, name: draft.name || saved.name }}
              size='lg'
              className='size-16'
            />
            <div className='flex flex-col gap-2'>
              <div className='flex flex-wrap gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  aria-describedby={`${id}-avatar-hint`}
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
                  {draft.avatar ? 'Change photo' : 'Upload photo'}
                </Button>
                {draft.avatar && (
                  <Button type='button' variant='ghost' size='sm' onClick={removeAvatar}>
                    Remove
                  </Button>
                )}
              </div>
              <p
                id={`${id}-avatar-hint`}
                className={cn(
                  'text-xs',
                  errors.avatar ? 'text-destructive' : 'text-muted-foreground',
                )}
              >
                {errors.avatar ?? 'JPG, PNG or GIF, up to 2 MB.'}
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

          <div className='grid gap-4 @md:grid-cols-2'>
            <div className='flex flex-col gap-2'>
              <label htmlFor={`${id}-name`} className='text-sm font-medium'>
                Name
              </label>
              <Input
                id={`${id}-name`}
                autoComplete='name'
                value={draft.name}
                onChange={(event) => update({ name: event.target.value })}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? `${id}-name-error` : undefined}
              />
              {errors.name && (
                <p id={`${id}-name-error`} className='text-destructive text-sm'>
                  {errors.name}
                </p>
              )}
            </div>
            <div className='flex flex-col gap-2'>
              <label htmlFor={`${id}-email`} className='text-sm font-medium'>
                Email
              </label>
              <Input
                id={`${id}-email`}
                type='email'
                autoComplete='email'
                value={draft.email}
                onChange={(event) => update({ email: event.target.value })}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={
                  errors.email
                    ? `${id}-email-error`
                    : emailChanged
                      ? `${id}-email-hint`
                      : undefined
                }
              />
              {errors.email ? (
                <p id={`${id}-email-error`} className='text-destructive text-sm'>
                  {errors.email}
                </p>
              ) : (
                emailChanged && (
                  <p id={`${id}-email-hint`} className='text-muted-foreground text-sm'>
                    We’ll send a link to the new address. It changes once you confirm.
                  </p>
                )
              )}
            </div>
            <div className='flex flex-col gap-2 @md:col-span-2'>
              <label htmlFor={`${id}-time-zone`} className='text-sm font-medium'>
                Time zone
              </label>
              <NativeSelect
                id={`${id}-time-zone`}
                value={draft.timeZone}
                onChange={(event) => update({ timeZone: event.target.value })}
                aria-describedby={`${id}-time-zone-hint`}
                className='w-full @md:w-1/2'
              >
                {timeZones.map((zone) => (
                  <NativeSelectOption key={zone.value} value={zone.value}>
                    {zone.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <p id={`${id}-time-zone-hint`} className='text-muted-foreground text-sm'>
                Used for dates in dashboards, reports and email digests.
              </p>
            </div>
          </div>

          <fieldset className='flex flex-col gap-2'>
            <legend className='mb-2 text-sm font-medium'>Theme</legend>
            <div className='grid grid-cols-3 gap-2'>
              {themes.map((theme) => (
                <label
                  key={theme.value}
                  className='has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:ring-ring/50 flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-3 text-sm has-focus-visible:ring-3 [&_svg]:size-5'
                >
                  <input
                    type='radio'
                    name={`${id}-theme`}
                    value={theme.value}
                    checked={draft.theme === theme.value}
                    onChange={() => update({ theme: theme.value })}
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
        </CardContent>
        <CardFooter className='flex flex-wrap items-center justify-end gap-2 border-t'>
          <p role='status' className='text-muted-foreground mr-auto text-sm'>
            {status}
          </p>
          <Button type='button' variant='ghost' disabled={!dirty} onClick={reset}>
            Cancel
          </Button>
          <Button type='submit' disabled={!dirty}>
            Save changes
          </Button>
        </CardFooter>
      </form>
    </Card>
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
