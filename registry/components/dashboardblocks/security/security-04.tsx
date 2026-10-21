'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  Gauge,
  type GaugeBand,
  GaugeToneLabel,
  GaugeValue,
  getGaugeBand,
} from '@/registry/components/dashboardblocks/gauge'
import {
  type CheckResult,
  CheckResultLabel,
  getSecurityScore,
} from '@/registry/components/dashboardblocks/security'

interface SecurityCheck {
  detail: string
  id: string
  label: string
  result: CheckResult
  weight?: number
}

interface Security4Props {
  /** Leave out, or pass none, to show the empty state. */
  checks?: SecurityCheck[]
  description: string
  status?: BlockStatus
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
  description: 'Workspace settings checked against recommended practice.',
  title: 'Security posture',
}

const BANDS: GaugeBand[] = [
  { from: 0, label: 'At risk', to: 60, tone: 'critical' },
  { from: 60, label: 'Needs work', to: 80, tone: 'caution' },
  { from: 80, label: 'Good', to: 100, tone: 'positive' },
]

const ORDER: Record<CheckResult, number> = { fail: 0, pass: 2, warn: 1 }

const countChecks = (count: number) => `${count} ${count === 1 ? 'check' : 'checks'}`

const Security4 = (props: Security4Props) => {
  const { checks = [], description, status, title } = props
  const state = getBlockState(status, checks)
  const score = getSecurityScore(checks)
  const band = getGaugeBand(score, BANDS)
  const sorted = [...checks].sort((a, b) => ORDER[a.result] - ORDER[b.result])
  const failing = checks.filter((check) => check.result === 'fail').length
  const warnings = checks.filter((check) => check.result === 'warn').length
  const passing = checks.length - failing - warnings

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4 [--gauge-surface:var(--color-background)]'>
        <header className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </div>
          {!state && band && (
            <GaugeToneLabel className='mt-0.5' label={band.label} tone={band.tone} />
          )}
        </header>
        <div className='flex items-center gap-5 border-t pt-4'>
          <Gauge
            bands={BANDS}
            className='w-full max-w-32 shrink-0'
            colorByBand
            label={title}
            sweep={270}
            thickness={11}
            value={score}
            valueText={`${score} out of 100${band ? `, ${band.label.toLowerCase()}` : ''}`}
          >
            <GaugeValue className='text-3xl'>{score}</GaugeValue>
            {!state && <span className='text-muted-foreground text-xs'>out of 100</span>}
          </Gauge>
          <BlockReady className='w-full text-sm'>
            <p className='text-sm text-pretty'>
              {failing > 0 ? (
                <span className='font-medium text-red-700 dark:text-red-400'>
                  {countChecks(failing)} failing
                </span>
              ) : (
                <span className='font-medium'>Nothing failing</span>
              )}
              {warnings > 0 && <>, {countChecks(warnings)} to look at</>}.{' '}
              <span className='text-muted-foreground'>
                {passing} of {checks.length} pass.
              </span>
            </p>
          </BlockReady>
        </div>
        {state === 'loading' && <BlockStateRows className='border-t' rows={6} />}
        {!state && (
          <ul className='flex flex-col border-t'>
            {sorted.map((check) => (
              <li
                key={check.id}
                className='flex items-start gap-3 border-b py-2.5 last:border-b-0'
              >
                <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                  <span className='text-sm font-medium'>{check.label}</span>
                  <span className='text-muted-foreground text-xs'>{check.detail}</span>
                </div>
                <CheckResultLabel result={check.result} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </BlockStateProvider>
  )
}

export {
  Security4,
  exampleProps as security4ExampleProps,
  type Security4Props,
  type SecurityCheck,
}
