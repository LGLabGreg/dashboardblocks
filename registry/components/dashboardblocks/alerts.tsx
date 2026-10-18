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

const relativeFormatter = new Intl.RelativeTimeFormat('en-US', {
  numeric: 'auto',
  style: 'short',
})

function formatRelativeTime(date: Date, now: Date) {
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000)
  const minutes = Math.round(seconds / 60)
  const hours = Math.round(minutes / 60)
  const days = Math.round(hours / 24)
  if (Math.abs(seconds) < 60) return 'just now'
  if (Math.abs(minutes) < 60) return relativeFormatter.format(minutes, 'minute')
  if (Math.abs(hours) < 24) return relativeFormatter.format(hours, 'hour')
  return relativeFormatter.format(days, 'day')
}

export { SeverityLabel, formatRelativeTime, severityConfig, severityOrder }

export type { AlertSeverity, SeverityConfig, SeverityLabelProps }
