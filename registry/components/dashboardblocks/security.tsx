'use client'

import {
  StatusLabel,
  type StatusTone,
} from '@/registry/components/dashboardblocks/status-label'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import { cn } from '@/lib/utils'

type AuditSeverity = 'info' | 'warning' | 'critical'

const auditSeverityConfig: Record<AuditSeverity, { label: string; tone: StatusTone }> = {
  critical: { label: 'Critical', tone: 'bad' },
  info: { label: 'Info', tone: 'neutral' },
  warning: { label: 'Warning', tone: 'warning' },
}

function AuditSeverityLabel({
  className,
  label,
  severity,
}: {
  className?: string
  label?: string
  severity: AuditSeverity
}) {
  const config = auditSeverityConfig[severity]
  return (
    <StatusLabel className={className} tone={config.tone}>
      {label ?? config.label}
    </StatusLabel>
  )
}

type DeviceKind = 'desktop' | 'mobile'

function DeviceIcon({ className, kind }: { className?: string; kind: DeviceKind }) {
  return (
    <span
      aria-hidden
      data-slot='device-icon'
      className={cn('text-muted-foreground flex shrink-0 [&_svg]:size-4', className)}
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

const checkResultConfig: Record<CheckResult, { label: string; tone: StatusTone }> = {
  fail: { label: 'Failing', tone: 'bad' },
  pass: { label: 'Passing', tone: 'good' },
  warn: { label: 'Needs attention', tone: 'warning' },
}

function CheckResultLabel({
  className,
  label,
  result,
}: {
  className?: string
  label?: string
  result: CheckResult
}) {
  const config = checkResultConfig[result]
  return (
    <StatusLabel className={className} tone={config.tone}>
      {label ?? config.label}
    </StatusLabel>
  )
}

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

export {
  AuditSeverityLabel,
  CheckResultLabel,
  DeviceIcon,
  auditSeverityConfig,
  checkResultConfig,
  getSecurityScore,
}

export type { AuditSeverity, CheckResult, DeviceKind }
