'use client'

import {
  ActionCard,
  type ChoiceCardOption,
  ChoiceCards,
} from '@/registry/components/dashboardblocks/onboarding'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type FormEvent, useEffect, useId, useRef, useState } from 'react'

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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

import { cn } from '@/lib/utils'

interface Goal extends ChoiceCardOption {
  /** The dashboard set up for people who pick this goal. */
  dashboard: { description: string; href: string; title: string }
}

type Answers = {
  goals: string[]
  role: string
  teamSize: string
}

interface Onboarding4Props {
  goals: Goal[]
  /** The most goals people can pick. @default 3 */
  maxGoals?: number
  onSave?: (answers: Answers) => Promise<void>
  roles: { label: string; value: string }[]
  teamSizes: ChoiceCardOption[]
}

const exampleProps: Onboarding4Props = {
  goals: [
    {
      dashboard: {
        description: 'MRR, expansion and churn by plan.',
        href: '/dashboards/revenue',
        title: 'Revenue overview',
      },
      description: 'MRR, expansion and churn.',
      icon: (
        <IconPlaceholder
          lucide='TrendingUpIcon'
          tabler='IconTrendingUp'
          hugeicons='ChartUpIcon'
          phosphor='TrendUpIcon'
          remixicon='RiLineChartLine'
        />
      ),
      title: 'Revenue growth',
      value: 'revenue',
    },
    {
      dashboard: {
        description: 'Visits to paid, step by step and by channel.',
        href: '/dashboards/acquisition',
        title: 'Acquisition funnel',
      },
      description: 'Traffic, sign-ups and cost per sign-up.',
      icon: (
        <IconPlaceholder
          lucide='TargetIcon'
          tabler='IconTarget'
          hugeicons='Target02Icon'
          phosphor='TargetIcon'
          remixicon='RiFocus3Line'
        />
      ),
      title: 'Acquisition',
      value: 'acquisition',
    },
    {
      dashboard: {
        description: 'Monthly cohorts and the accounts at risk.',
        href: '/dashboards/retention',
        title: 'Retention cohorts',
      },
      description: 'Cohorts, active users and churn risk.',
      icon: (
        <IconPlaceholder
          lucide='UserCheckIcon'
          tabler='IconUserCheck'
          hugeicons='UserCheck01Icon'
          phosphor='UserCheckIcon'
          remixicon='RiUserFollowLine'
        />
      ),
      title: 'Retention',
      value: 'retention',
    },
    {
      dashboard: {
        description: 'Weekly users of each feature, and who stopped.',
        href: '/dashboards/features',
        title: 'Feature adoption',
      },
      description: 'Which features people use, and how often.',
      icon: (
        <IconPlaceholder
          lucide='ZapIcon'
          tabler='IconBolt'
          hugeicons='FlashIcon'
          phosphor='LightningIcon'
          remixicon='RiFlashlightLine'
        />
      ),
      title: 'Feature adoption',
      value: 'features',
    },
    {
      dashboard: {
        description: 'Backlog, first response time and CSAT.',
        href: '/dashboards/support',
        title: 'Support health',
      },
      description: 'Ticket volume, response times and CSAT.',
      icon: (
        <IconPlaceholder
          lucide='HeadphonesIcon'
          tabler='IconHeadphones'
          hugeicons='HeadphonesIcon'
          phosphor='HeadphonesIcon'
          remixicon='RiHeadphoneLine'
        />
      ),
      title: 'Customer support',
      value: 'support',
    },
    {
      dashboard: {
        description: "Today's orders, late shipments and low stock.",
        href: '/dashboards/operations',
        title: 'Operations daily',
      },
      description: 'Orders, fulfilment and stock.',
      icon: (
        <IconPlaceholder
          lucide='TruckIcon'
          tabler='IconTruck'
          hugeicons='DeliveryTruck01Icon'
          phosphor='TruckIcon'
          remixicon='RiTruckLine'
        />
      ),
      title: 'Operations',
      value: 'operations',
    },
  ],
  roles: [
    { label: 'Founder or executive', value: 'executive' },
    { label: 'Product manager', value: 'product' },
    { label: 'Engineer', value: 'engineering' },
    { label: 'Data analyst', value: 'data' },
    { label: 'Marketing', value: 'marketing' },
    { label: 'Sales or success', value: 'sales' },
    { label: 'Operations or finance', value: 'operations' },
  ],
  teamSizes: [
    { title: 'Just me', value: '1' },
    { title: '2–10', value: '2-10' },
    { title: '11–50', value: '11-50' },
    { title: '51 or more', value: '51+' },
  ],
}

/** Stands in for a request to your API. */
async function saveAnswers() {
  await new Promise((resolve) => setTimeout(resolve, 800))
}

type Errors = Partial<Record<keyof Answers, string>>

function validate(answers: Answers, maxGoals: number): Errors {
  return {
    goals:
      answers.goals.length === 0
        ? 'Pick at least one goal.'
        : answers.goals.length > maxGoals
          ? `Pick up to ${maxGoals}. Unpick one to continue.`
          : undefined,
    role: answers.role ? undefined : 'Choose your role.',
    teamSize: answers.teamSize ? undefined : 'Pick the size of your team.',
  }
}

const Onboarding4 = (props: Onboarding4Props) => {
  const { goals, maxGoals = 3, onSave = saveAnswers, roles, teamSizes } = props
  const id = useId()
  const emptyAnswers: Answers = { goals: [], role: '', teamSize: '' }
  const [answers, setAnswers] = useState(emptyAnswers)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const errors = submitted ? validate(answers, maxGoals) : {}
  const fieldId = (name: keyof Answers) => `${id}-${name}`
  const shownSaved = useRef(saved)

  useEffect(() => {
    if (shownSaved.current === saved) return
    shownSaved.current = saved
    document.getElementById(saved ? `${id}-result` : `${id}-role`)?.focus()
  }, [id, saved])

  function set<K extends keyof Answers>(name: K, value: Answers[K]) {
    setAnswers((current) => ({ ...current, [name]: value }))
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    const current = validate(answers, maxGoals)
    const invalid = (['role', 'teamSize', 'goals'] as const).find((name) => current[name])
    if (invalid) {
      document.getElementById(fieldId(invalid))?.focus()
      return
    }
    setSaving(true)
    try {
      await onSave(answers)
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    const picked = goals.filter((goal) => answers.goals.includes(goal.value))
    return (
      <Card className='@container'>
        <CardHeader>
          <CardTitle id={`${id}-result`} tabIndex={-1} className='outline-none'>
            {picked.length === 1
              ? 'Your dashboard is ready'
              : `${picked.length} dashboards are ready`}
          </CardTitle>
          <CardDescription>
            Built from your goals, with sample data until your sources sync.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className='grid gap-3 @lg:grid-cols-2'>
            {picked.map((goal) => (
              <li key={goal.value}>
                <ActionCard
                  description={goal.dashboard.description}
                  href={goal.dashboard.href}
                  icon={goal.icon}
                  title={goal.dashboard.title}
                />
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button
            variant='outline'
            onClick={() => {
              setSaved(false)
              setSubmitted(false)
            }}
          >
            Change answers
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className='@container'>
      <form noValidate onSubmit={(event) => void onSubmit(event)} className='contents'>
        <CardHeader>
          <CardTitle>Tell us about your team</CardTitle>
          <CardDescription>
            We&apos;ll set up dashboards to match. It takes about a minute.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={errors.role ? true : undefined}>
              <FieldLabel htmlFor={fieldId('role')}>Your role</FieldLabel>
              <NativeSelect
                id={fieldId('role')}
                className='w-full @md:w-72'
                aria-invalid={errors.role ? true : undefined}
                aria-describedby={errors.role ? `${fieldId('role')}-error` : undefined}
                value={answers.role}
                onChange={(event) => set('role', event.target.value)}
              >
                <NativeSelectOption value='' disabled>
                  Choose a role
                </NativeSelectOption>
                {roles.map((role) => (
                  <NativeSelectOption key={role.value} value={role.value}>
                    {role.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError id={`${fieldId('role')}-error`}>{errors.role}</FieldError>
            </Field>
            <div className='flex flex-col gap-3'>
              <FieldTitle id={`${fieldId('teamSize')}-label`}>Team size</FieldTitle>
              <ChoiceCards
                id={fieldId('teamSize')}
                aria-labelledby={`${fieldId('teamSize')}-label`}
                aria-invalid={errors.teamSize ? true : undefined}
                aria-describedby={
                  errors.teamSize ? `${fieldId('teamSize')}-error` : undefined
                }
                className='grid-cols-2 @md:grid-cols-4'
                options={teamSizes}
                value={answers.teamSize}
                onValueChange={(value) => set('teamSize', value)}
              />
              <FieldError id={`${fieldId('teamSize')}-error`}>
                {errors.teamSize}
              </FieldError>
            </div>
            <div className='flex flex-col gap-3'>
              <div className='flex flex-col gap-1'>
                <FieldTitle id={`${fieldId('goals')}-label`}>
                  What do you want to track?
                </FieldTitle>
                <FieldDescription id={`${fieldId('goals')}-description`}>
                  Pick up to {maxGoals}.{' '}
                  <span
                    className={cn(
                      'tabular-nums',
                      answers.goals.length > maxGoals && 'text-destructive',
                    )}
                  >
                    {answers.goals.length} of {maxGoals} picked.
                  </span>
                </FieldDescription>
              </div>
              <ChoiceCards
                type='checkbox'
                id={fieldId('goals')}
                aria-labelledby={`${fieldId('goals')}-label`}
                aria-invalid={errors.goals ? true : undefined}
                aria-describedby={`${fieldId('goals')}-description${errors.goals ? ` ${fieldId('goals')}-error` : ''}`}
                className='@md:grid-cols-2'
                options={goals}
                value={answers.goals}
                onValueChange={(value) => set('goals', value)}
              />
              <FieldError id={`${fieldId('goals')}-error`}>{errors.goals}</FieldError>
            </div>
          </FieldGroup>
        </CardContent>
        <CardFooter className='justify-end gap-2 border-t'>
          <Button type='submit' disabled={saving}>
            {saving ? 'Setting up…' : 'Set up my dashboards'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export { Onboarding4, exampleProps as onboarding4ExampleProps, type Onboarding4Props }
