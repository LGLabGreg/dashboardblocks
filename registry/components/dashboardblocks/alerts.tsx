'use client'

import {
  StatusLabel,
  type StatusLabelProps,
  type StatusTone,
} from '@/registry/components/dashboardblocks/status-label'

type AlertSeverity = 'critical' | 'warning' | 'info' | 'resolved'

interface SeverityConfig {
  label: string
  tone: StatusTone
}

const severityConfig: Record<AlertSeverity, SeverityConfig> = {
  critical: { label: 'Critical', tone: 'bad' },
  info: { label: 'Info', tone: 'info' },
  resolved: { label: 'Resolved', tone: 'good' },
  warning: { label: 'Warning', tone: 'warning' },
}

const severityOrder: AlertSeverity[] = ['critical', 'warning', 'info', 'resolved']

interface SeverityLabelProps extends Omit<StatusLabelProps, 'tone'> {
  severity: AlertSeverity
}

function SeverityLabel({ children, severity, ...props }: SeverityLabelProps) {
  const config = severityConfig[severity]
  return (
    <StatusLabel data-severity={severity} tone={config.tone} {...props}>
      {children ?? config.label}
    </StatusLabel>
  )
}

export { SeverityLabel, severityConfig, severityOrder }

export type { AlertSeverity, SeverityConfig, SeverityLabelProps }
