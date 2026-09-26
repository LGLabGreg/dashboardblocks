'use client'

import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type AuditSeverity = 'info' | 'warning' | 'critical'

const auditSeverityConfig: Record<
  AuditSeverity,
  { className: string; icon: ReactNode; label: string }
> = {
  critical: {
    className: 'bg-red-500/10 text-red-700 dark:text-red-400',
    icon: (
      <IconPlaceholder
        lucide='OctagonAlertIcon'
        tabler='IconAlertOctagon'
        hugeicons='AlertDiamondIcon'
        phosphor='WarningOctagonIcon'
        remixicon='RiAlarmWarningLine'
        aria-hidden
      />
    ),
    label: 'Critical',
  },
  info: {
    className: 'bg-muted text-muted-foreground',
    icon: (
      <IconPlaceholder
        lucide='InfoIcon'
        tabler='IconInfoCircle'
        hugeicons='AlertCircleIcon'
        phosphor='InfoIcon'
        remixicon='RiInformationLine'
        aria-hidden
      />
    ),
    label: 'Info',
  },
  warning: {
    className: 'bg-amber-500/10 text-amber-800 dark:text-amber-400',
    icon: (
      <IconPlaceholder
        lucide='TriangleAlertIcon'
        tabler='IconAlertTriangle'
        hugeicons='Alert02Icon'
        phosphor='WarningIcon'
        remixicon='RiErrorWarningLine'
        aria-hidden
      />
    ),
    label: 'Warning',
  },
}

/** The severity as an icon in a tinted circle, with its label for screen readers. */
function AuditSeverityIcon({
  className,
  severity,
}: {
  className?: string
  severity: AuditSeverity
}) {
  const config = auditSeverityConfig[severity]
  return (
    <span
      className={cn(
        'flex size-7 shrink-0 items-center justify-center rounded-full [&_svg]:size-3.5',
        config.className,
        className,
      )}
    >
      {config.icon}
      <span className='sr-only'>{config.label}</span>
    </span>
  )
}

type DeviceKind = 'desktop' | 'mobile'

/** A desktop or phone icon for a session's device. Decorative. */
function DeviceIcon({ className, kind }: { className?: string; kind: DeviceKind }) {
  return (
    <span
      aria-hidden
      className={cn(
        'bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4',
        className,
      )}
    >
      {kind === 'mobile' ? (
        <IconPlaceholder
          lucide='SmartphoneIcon'
          tabler='IconDeviceMobile'
          hugeicons='SmartPhone01Icon'
          phosphor='DeviceMobileIcon'
          remixicon='RiSmartphoneLine'
        />
      ) : (
        <IconPlaceholder
          lucide='MonitorIcon'
          tabler='IconDeviceDesktop'
          hugeicons='ComputerIcon'
          phosphor='MonitorIcon'
          remixicon='RiComputerLine'
        />
      )}
    </span>
  )
}

type CheckResult = 'pass' | 'warn' | 'fail'

const checkResultConfig: Record<
  CheckResult,
  { className: string; icon: ReactNode; label: string }
> = {
  fail: {
    className: 'text-red-700 dark:text-red-400',
    icon: (
      <IconPlaceholder
        lucide='CircleXIcon'
        tabler='IconCircleX'
        hugeicons='CancelCircleIcon'
        phosphor='XCircleIcon'
        remixicon='RiCloseCircleLine'
        aria-hidden
      />
    ),
    label: 'Failing',
  },
  pass: {
    className: 'text-emerald-700 dark:text-emerald-400',
    icon: (
      <IconPlaceholder
        lucide='CircleCheckIcon'
        tabler='IconCircleCheck'
        hugeicons='CheckmarkCircle02Icon'
        phosphor='CheckCircleIcon'
        remixicon='RiCheckboxCircleLine'
        aria-hidden
      />
    ),
    label: 'Passing',
  },
  warn: {
    className: 'text-amber-700 dark:text-amber-400',
    icon: (
      <IconPlaceholder
        lucide='TriangleAlertIcon'
        tabler='IconAlertTriangle'
        hugeicons='Alert02Icon'
        phosphor='WarningIcon'
        remixicon='RiErrorWarningLine'
        aria-hidden
      />
    ),
    label: 'Needs attention',
  },
}

/** A check result as an icon, with its label shown or for screen readers. */
function CheckResultLabel({
  className,
  result,
  showLabel = false,
}: {
  className?: string
  result: CheckResult
  showLabel?: boolean
}) {
  const config = checkResultConfig[result]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap [&_svg]:size-4 [&_svg]:shrink-0',
        config.className,
        className,
      )}
    >
      {config.icon}
      <span className={cn(!showLabel && 'sr-only')}>{config.label}</span>
    </span>
  )
}

/**
 * A 0–100 score from weighted checks: passing counts in full, needing
 * attention counts half, failing counts nothing.
 */
function getSecurityScore(checks: { result: CheckResult; weight?: number }[]) {
  const total = checks.reduce((sum, check) => sum + (check.weight ?? 1), 0)
  const earned = checks.reduce(
    (sum, check) =>
      sum +
      (check.weight ?? 1) *
        (check.result === 'pass' ? 1 : check.result === 'warn' ? 0.5 : 0),
    0,
  )
  return total > 0 ? Math.round((earned / total) * 100) : 0
}

const relative = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })

/** "just now", "5 minutes ago", "yesterday", from `date` to `now`. */
function formatSince(date: Date, now: Date) {
  const minutes = Math.round((now.getTime() - date.getTime()) / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return relative.format(-minutes, 'minute')
  if (minutes < 60 * 24) return relative.format(-Math.round(minutes / 60), 'hour')
  return relative.format(-Math.round(minutes / 1_440), 'day')
}

export {
  AuditSeverityIcon,
  CheckResultLabel,
  DeviceIcon,
  auditSeverityConfig,
  checkResultConfig,
  formatSince,
  getSecurityScore,
}

export type { AuditSeverity, CheckResult, DeviceKind }
