'use client'

import {
  StatusLabel,
  type StatusLabelProps,
  type StatusTone,
} from '@/registry/components/dashboardblocks/status-label'

import { cn } from '@/lib/utils'

type DeployStatus = 'success' | 'failed' | 'running' | 'queued' | 'rolled-back'

const deployStatusConfig: Record<
  DeployStatus,
  { cell: string; label: string; tone: StatusTone }
> = {
  failed: { cell: 'bg-red-500 dark:bg-red-400', label: 'Failed', tone: 'bad' },
  queued: {
    cell: 'border border-dashed border-muted-foreground/60',
    label: 'Queued',
    tone: 'neutral',
  },
  'rolled-back': {
    cell: 'bg-orange-500 dark:bg-orange-400',
    label: 'Rolled back',
    tone: 'warning',
  },
  running: {
    cell: 'bg-sky-500/60 dark:bg-sky-400/60 motion-safe:animate-pulse',
    label: 'Building',
    tone: 'info',
  },
  success: { cell: 'bg-emerald-600 dark:bg-emerald-500', label: 'Ready', tone: 'good' },
}

interface DeployStatusLabelProps extends Omit<StatusLabelProps, 'tone'> {
  status: DeployStatus
}

function DeployStatusLabel({ children, status, ...props }: DeployStatusLabelProps) {
  const config = deployStatusConfig[status]
  return (
    <StatusLabel data-status={status} tone={config.tone} {...props}>
      {children ?? config.label}
    </StatusLabel>
  )
}

function formatDuration(seconds: number) {
  const whole = Math.max(0, Math.round(seconds))
  if (whole < 60) return `${whole}s`
  const minutes = Math.floor(whole / 60)
  if (minutes < 60) return `${minutes}m ${String(whole % 60).padStart(2, '0')}s`
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`
}

function shortSha(sha: string) {
  return sha.slice(0, 7)
}

type DoraLevel = 'elite' | 'high' | 'medium' | 'low'

interface DoraInput {
  /** Share of deployments causing a failure in production, 0–1. */
  changeFailureRate: number
  deploysPerDay: number
  /** Median hours from commit to production. */
  leadTimeHours: number
  /** Median hours to restore service after a failure. */
  restoreHours: number
}

function getDoraLevels({
  changeFailureRate,
  deploysPerDay,
  leadTimeHours,
  restoreHours,
}: DoraInput): Record<keyof DoraInput, DoraLevel> {
  return {
    changeFailureRate:
      changeFailureRate <= 0.05
        ? 'elite'
        : changeFailureRate <= 0.1
          ? 'high'
          : changeFailureRate <= 0.15
            ? 'medium'
            : 'low',
    deploysPerDay:
      deploysPerDay >= 1
        ? 'elite'
        : deploysPerDay >= 1 / 7
          ? 'high'
          : deploysPerDay >= 1 / 30
            ? 'medium'
            : 'low',
    leadTimeHours:
      leadTimeHours < 24
        ? 'elite'
        : leadTimeHours < 24 * 7
          ? 'high'
          : leadTimeHours < 24 * 30
            ? 'medium'
            : 'low',
    restoreHours:
      restoreHours < 1
        ? 'elite'
        : restoreHours < 24
          ? 'high'
          : restoreHours < 24 * 7
            ? 'medium'
            : 'low',
  }
}

const doraLevelConfig: Record<DoraLevel, { label: string; tone: StatusTone }> = {
  elite: { label: 'Elite', tone: 'good' },
  high: { label: 'High', tone: 'info' },
  low: { label: 'Low', tone: 'bad' },
  medium: { label: 'Medium', tone: 'warning' },
}

interface DoraLabelProps extends Omit<StatusLabelProps, 'tone'> {
  level: DoraLevel
}

function DoraLabel({ children, level, ...props }: DoraLabelProps) {
  const config = doraLevelConfig[level]
  return (
    <StatusLabel data-level={level} tone={config.tone} {...props}>
      {children ?? config.label}
    </StatusLabel>
  )
}

interface DeployHistoryProps {
  className?: string
  /** Oldest first. */
  runs: { id: string; status: DeployStatus }[]
}

function DeployHistory({ className, runs }: DeployHistoryProps) {
  return (
    <span aria-hidden className={cn('flex h-5 items-stretch gap-0.5', className)}>
      {runs.map((run) => (
        <span
          key={run.id}
          className={cn(
            'min-w-1 flex-1 rounded-[2px]',
            deployStatusConfig[run.status].cell,
          )}
        />
      ))}
    </span>
  )
}

export {
  DeployHistory,
  DeployStatusLabel,
  DoraLabel,
  deployStatusConfig,
  doraLevelConfig,
  formatDuration,
  getDoraLevels,
  shortSha,
}

export type {
  DeployHistoryProps,
  DeployStatus,
  DeployStatusLabelProps,
  DoraInput,
  DoraLabelProps,
  DoraLevel,
}
