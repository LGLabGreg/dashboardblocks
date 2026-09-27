'use client'

import { StepIndicator } from '@/registry/components/dashboardblocks/checklist'
import {
  type FormErrors,
  type FormStep,
  FormSteps,
  useSimpleForm,
} from '@/registry/components/dashboardblocks/forms'
import {
  type ChoiceCardOption,
  ChoiceCards,
  getFilledInvites,
  getInviteErrors,
  type Invite,
  InviteList,
  OnboardingActions,
  OnboardingLayout,
  slugify,
} from '@/registry/components/dashboardblocks/onboarding'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type FormEvent, useId, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'

// A type, not an interface, so it fits useSimpleForm's Record<string, …> constraint.
type NewWorkspace = {
  name: string
  slug: string
  useCase: string
}

interface Onboarding1Props {
  /** The role new invites start with. */
  defaultRole: string
  /** Where workspaces live, shown before the URL name. */
  domain: string
  /** Checks the URL name is free. Return a message when it isn't. */
  onCheckSlug?: (slug: string) => Promise<string | void>
  /** Creates the workspace and sends the invites. */
  onComplete?: (workspace: NewWorkspace, invites: Invite[]) => Promise<void>
  product: string
  roles: { label: string; value: string }[]
  useCases: ChoiceCardOption[]
  /** The signed-in person, shown top right. */
  userEmail: string
}

const exampleProps: Onboarding1Props = {
  defaultRole: 'member',
  domain: 'lumen.app',
  product: 'Lumen',
  roles: [
    { label: 'Admin', value: 'admin' },
    { label: 'Member', value: 'member' },
    { label: 'Viewer', value: 'viewer' },
  ],
  useCases: [
    {
      badge: <Badge variant='secondary'>Popular</Badge>,
      description: 'Sign-ups, activation, feature adoption and retention.',
      icon: (
        <IconPlaceholder
          lucide='ChartLineIcon'
          tabler='IconChartLine'
          hugeicons='ChartIcon'
          phosphor='ChartLineIcon'
          remixicon='RiLineChartLine'
        />
      ),
      title: 'Product analytics',
      value: 'product',
    },
    {
      description: 'MRR, churn, invoices and cash flow.',
      icon: (
        <IconPlaceholder
          lucide='CoinsIcon'
          tabler='IconCoins'
          hugeicons='Coins01Icon'
          phosphor='CoinsIcon'
          remixicon='RiCoinsLine'
        />
      ),
      title: 'Revenue and finance',
      value: 'revenue',
    },
    {
      description: 'Campaigns, channels, spend and attribution.',
      icon: (
        <IconPlaceholder
          lucide='MegaphoneIcon'
          tabler='IconSpeakerphone'
          hugeicons='Megaphone01Icon'
          phosphor='MegaphoneIcon'
          remixicon='RiMegaphoneLine'
        />
      ),
      title: 'Marketing',
      value: 'marketing',
    },
    {
      description: 'Orders, stock levels and fulfilment times.',
      icon: (
        <IconPlaceholder
          lucide='PackageIcon'
          tabler='IconPackage'
          hugeicons='PackageIcon'
          phosphor='PackageIcon'
          remixicon='RiBox3Line'
        />
      ),
      title: 'Operations',
      value: 'operations',
    },
  ],
  userEmail: 'priya@fernhill.co',
}

const STEPS: FormStep[] = [
  { description: 'Name and URL', title: 'Workspace' },
  { description: 'What you track', title: 'Use case' },
  { description: 'Invite people', title: 'Team' },
]

const RESERVED = ['admin', 'api', 'app', 'help', 'settings', 'www']

/** Stands in for a request to your API. "acme" is taken, to show a server error. */
async function checkSlug(slug: string) {
  await new Promise((resolve) => setTimeout(resolve, 600))
  if (slug === 'acme') return 'That URL is taken. Try another.'
}

/** Stands in for a request to your API. */
async function createWorkspace() {
  await new Promise((resolve) => setTimeout(resolve, 900))
}

/** Only checks the fields up to the current step. */
function validate(values: NewWorkspace, step: number): FormErrors<NewWorkspace> {
  const slug = values.slug
  return {
    name: !values.name.trim()
      ? 'Enter a name for your workspace.'
      : values.name.trim().length > 48
        ? 'Keep it to 48 characters or fewer.'
        : undefined,
    slug: !slug
      ? 'Enter a URL for your workspace.'
      : !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)
        ? 'Use lowercase letters, numbers and single dashes.'
        : slug.length < 3 || slug.length > 32
          ? 'Use 3 to 32 characters.'
          : RESERVED.includes(slug)
            ? 'That URL is reserved. Try another.'
            : undefined,
    useCase: step >= 1 && !values.useCase ? "Pick what you'll use it for." : undefined,
  }
}

const Onboarding1 = (props: Onboarding1Props) => {
  const {
    defaultRole,
    domain,
    onCheckSlug = checkSlug,
    onComplete = createWorkspace,
    product,
    roles,
    useCases,
    userEmail,
  } = props
  const invitesId = useId()
  const [step, setStep] = useState(0)
  const [slugEdited, setSlugEdited] = useState(false)
  const newInvites = (): Invite[] => [
    { email: '', id: 'invite-1', role: defaultRole },
    { email: '', id: 'invite-2', role: defaultRole },
  ]
  const [invites, setInvites] = useState(newInvites)
  const [inviteErrors, setInviteErrors] = useState<Partial<Record<string, string>>>()
  const [finishing, setFinishing] = useState(false)
  const [sent, setSent] = useState<Invite[] | null>(null)
  const emptyValues: NewWorkspace = { name: '', slug: '', useCase: '' }
  const form = useSimpleForm({
    defaultValues: emptyValues,
    onSubmit: async (values) => {
      if (step !== 0) return
      const taken = await onCheckSlug(values.slug)
      if (taken) return { slug: taken }
    },
    validate: (values) => validate(values, step),
  })
  const { values } = form
  const useCase = useCases.find((option) => option.value === values.useCase)

  async function finish(list: Invite[]) {
    const filled = getFilledInvites(list)
    const errors = getInviteErrors(filled)
    const invalid = filled.find((invite) => errors[invite.id])
    if (invalid) {
      setInviteErrors(errors)
      document.getElementById(`${invitesId}-${invalid.id}`)?.focus()
      return
    }
    setFinishing(true)
    try {
      await onComplete(values, filled)
      setSent(filled)
    } finally {
      setFinishing(false)
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    if (step === STEPS.length - 1) {
      event.preventDefault()
      await finish(invites)
    } else if (await form.submit(event)) {
      setStep(step + 1)
    }
  }

  function startOver() {
    form.reset(emptyValues)
    setSlugEdited(false)
    setInvites(newInvites())
    setInviteErrors(undefined)
    setSent(null)
    setStep(0)
  }

  const brand = (
    <>
      <span className='bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md [&_svg]:size-4'>
        <IconPlaceholder
          lucide='BlocksIcon'
          tabler='IconCube'
          hugeicons='CubeIcon'
          phosphor='CubeIcon'
          remixicon='RiBox3Line'
        />
      </span>
      {product}
    </>
  )
  const aside = (
    <>
      <span className='hidden truncate sm:inline'>{userEmail}</span>
      {/* oxlint-disable-next-line nextjs/no-html-link-for-pages -- blocks work with any router */}
      <a href='/logout' className='text-foreground font-medium hover:underline'>
        Sign out
      </a>
    </>
  )

  if (sent) {
    return (
      <OnboardingLayout
        aside={aside}
        brand={brand}
        step='done'
        title={`${values.name} is ready`}
        description={`Your workspace lives at ${domain}/${values.slug}. Everything here can be changed later in Settings.`}
      >
        <ul className='flex flex-col gap-4'>
          <li className='flex items-center gap-3 text-sm'>
            <StepIndicator state='done' />
            Workspace created
          </li>
          <li className='flex items-center gap-3 text-sm'>
            <StepIndicator state='done' />
            Dashboards suggested for {useCase?.title.toLowerCase() ?? values.useCase}
          </li>
          <li className='flex items-center gap-3 text-sm'>
            <StepIndicator state={sent.length > 0 ? 'done' : 'skipped'} />
            {sent.length === 0
              ? 'No one invited yet'
              : sent.length === 1
                ? `Invite sent to ${sent[0].email}`
                : `${sent.length} invites sent`}
          </li>
        </ul>
        <div className='mt-8 flex flex-wrap gap-2'>
          <a href={`/${values.slug}`} className={buttonVariants()}>
            Open {values.name}
            <IconPlaceholder
              lucide='ArrowRightIcon'
              tabler='IconArrowRight'
              hugeicons='ArrowRight01Icon'
              phosphor='ArrowRightIcon'
              remixicon='RiArrowRightLine'
              data-icon='inline-end'
            />
          </a>
          <Button variant='ghost' onClick={startOver}>
            Start over
          </Button>
        </div>
      </OnboardingLayout>
    )
  }

  return (
    <OnboardingLayout
      aside={aside}
      brand={brand}
      step={step}
      onSubmit={(event) => void onSubmit(event)}
      progress={<FormSteps current={step} steps={STEPS} />}
      title={
        step === 0
          ? 'Create your workspace'
          : step === 1
            ? `What will you use ${product} for?`
            : 'Invite your team'
      }
      description={
        step === 0
          ? "A workspace holds your team's dashboards, data sources and reports."
          : step === 1
            ? "We'll suggest dashboards and data sources to match. You can track anything later."
            : 'Dashboards work best with the people who act on them. Invites expire after 7 days.'
      }
      footer={
        <OnboardingActions
          continueLabel={step === STEPS.length - 1 ? 'Finish setup' : 'Continue'}
          pending={form.isSubmitting || finishing}
          pendingLabel={step === 0 ? 'Checking…' : 'Creating workspace…'}
          onBack={step > 0 ? () => setStep(step - 1) : undefined}
          onSkip={step === STEPS.length - 1 ? () => void finish([]) : undefined}
        />
      }
    >
      {step === 0 && (
        <FieldGroup>
          <Field data-invalid={form.errors.name ? true : undefined}>
            <FieldLabel htmlFor={form.getId('name')}>Workspace name</FieldLabel>
            <Input
              autoComplete='organization'
              placeholder='Fernhill Coffee'
              {...form.field('name')}
              onChange={(event) => {
                form.setValue('name', event.target.value)
                if (!slugEdited) form.setValue('slug', slugify(event.target.value))
              }}
            />
            <FieldError {...form.error('name')} />
          </Field>
          <Field data-invalid={form.errors.slug ? true : undefined}>
            <FieldLabel htmlFor={form.getId('slug')}>Workspace URL</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>{domain}/</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                autoCapitalize='none'
                autoComplete='off'
                spellCheck={false}
                {...form.field('slug')}
                aria-describedby={`${form.getId('slug')}-description${form.errors.slug ? ` ${form.getId('slug')}-error` : ''}`}
                onChange={(event) => {
                  setSlugEdited(true)
                  form.setValue('slug', event.target.value.toLowerCase())
                }}
              />
            </InputGroup>
            <FieldDescription id={`${form.getId('slug')}-description`}>
              Lowercase letters, numbers and dashes. Changing it later breaks shared
              links.
            </FieldDescription>
            <FieldError {...form.error('slug')} />
          </Field>
        </FieldGroup>
      )}
      {step === 1 && (
        <div className='flex flex-col gap-3'>
          <ChoiceCards
            id={form.getId('useCase')}
            aria-label='Use case'
            aria-invalid={form.errors.useCase ? true : undefined}
            aria-describedby={
              form.errors.useCase ? `${form.getId('useCase')}-error` : undefined
            }
            className='sm:grid-cols-2'
            options={useCases}
            value={values.useCase}
            onValueChange={(value) => form.setValue('useCase', value)}
          />
          <FieldError {...form.error('useCase')} />
        </div>
      )}
      {step === 2 && (
        <InviteList
          id={invitesId}
          errors={inviteErrors}
          roles={roles}
          value={invites}
          onValueChange={(next) => {
            setInvites(next)
            // Once errors are showing, keep them up to date as people fix them.
            if (inviteErrors) setInviteErrors(getInviteErrors(getFilledInvites(next)))
          }}
        />
      )}
    </OnboardingLayout>
  )
}

export { Onboarding1, exampleProps as onboarding1ExampleProps, type Onboarding1Props }
