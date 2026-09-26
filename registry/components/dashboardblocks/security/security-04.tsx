'use client'

import { Ring } from '@/registry/components/dashboardblocks/ring'
import {
  type CheckResult,
  CheckResultLabel,
  getSecurityScore,
} from '@/registry/components/dashboardblocks/security'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface SecurityCheck {
  /** What passing looks like, or what to do. */
  detail: string
  id: string
  label: string
  result: CheckResult
  /** How much the check counts towards the score. @default 1 */
  weight?: number
}

interface Security4Props {
  checks: SecurityCheck[]
  description: string
  title: string
}

const exampleProps: Security4Props = {
  checks: [
    {
      detail: '87% of members, 4 admins without it',
      id: 'mfa',
      label: 'Multi-factor authentication',
      result: 'warn',
      weight: 3,
    },
    {
      detail: 'Turned off 35 minutes ago',
      id: 'sso',
      label: 'SSO enforced',
      result: 'fail',
      weight: 2,
    },
    {
      detail: '2 keys unused for over 90 days',
      id: 'keys',
      label: 'API keys rotated',
      result: 'warn',
    },
    {
      detail: 'Last 30 days exported to your SIEM',
      id: 'audit',
      label: 'Audit log streaming',
      result: 'pass',
    },
    {
      detail: 'Only from approved domains',
      id: 'domains',
      label: 'Invite restrictions',
      result: 'pass',
    },
    {
      detail: 'Sessions expire after 12 hours',
      id: 'sessions',
      label: 'Session timeout',
      result: 'pass',
    },
  ],
  description: 'Workspace settings checked against recommended practice',
  title: 'Security posture',
}

const ORDER: Record<CheckResult, number> = { fail: 0, pass: 2, warn: 1 }

const Security4 = (props: Security4Props) => {
  const { checks, description, title } = props
  const score = getSecurityScore(checks)
  const sorted = [...checks].sort((a, b) => ORDER[a.result] - ORDER[b.result])
  const failing = checks.filter((check) => check.result === 'fail').length
  const warnings = checks.filter((check) => check.result === 'warn').length
  // A text colour class, drawn with currentColor, so it works with any theme.
  const color =
    score >= 80
      ? 'text-emerald-600 dark:text-emerald-500'
      : score >= 60
        ? 'text-amber-500'
        : 'text-destructive'

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <div className='flex items-center gap-4'>
          <Ring
            ariaLabel={`Security score ${score} out of 100`}
            className={`size-20 ${color}`}
            percentage={score}
            ringColor='currentColor'
            strokeWidth={9}
          >
            <span
              aria-hidden
              className='text-foreground text-xl font-semibold tabular-nums'
            >
              {score}
            </span>
          </Ring>
          <div className='flex flex-col gap-0.5'>
            <span className='text-sm font-medium'>
              {score >= 80 ? 'Good' : score >= 60 ? 'Needs work' : 'At risk'}
            </span>
            <span className='text-muted-foreground text-sm'>
              {failing > 0 ? `${failing} failing` : 'Nothing failing'}
              {warnings > 0 ? `, ${warnings} to look at` : ''}
            </span>
          </div>
        </div>
        <ul className='flex flex-col divide-y border-t'>
          {sorted.map((check) => (
            <li key={check.id} className='flex items-start gap-3 py-2.5'>
              <CheckResultLabel className='mt-0.5' result={check.result} />
              <div className='flex min-w-0 flex-col gap-0.5'>
                <span className='text-sm font-medium'>{check.label}</span>
                <span className='text-muted-foreground text-xs'>{check.detail}</span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export {
  Security4,
  exampleProps as security4ExampleProps,
  type Security4Props,
  type SecurityCheck,
}
