'use client'

import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type DeployStatus = 'success' | 'failed' | 'running' | 'queued' | 'rolled-back'

const deployStatusConfig: Record<
  DeployStatus,
  { cell: string; className: string; icon: ReactNode; label: string }
> = {
  failed: {
    cell: 'bg-red-500 dark:bg-red-400',
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
    label: 'Failed',
  },
  queued: {
    cell: 'border border-dashed border-muted-foreground/60',
    className: 'text-muted-foreground',
    icon: (
      <IconPlaceholder
        lucide='CircleDashedIcon'
        tabler='IconCircleDashed'
        hugeicons='DashedLineCircleIcon'
        phosphor='CircleDashedIcon'
        remixicon='RiLoaderLine'
        aria-hidden
      />
    ),
    label: 'Queued',
  },
  'rolled-back': {
    cell: 'bg-amber-500 dark:bg-amber-400',
    className: 'text-amber-700 dark:text-amber-400',
    icon: (
      <IconPlaceholder
        lucide='Undo2Icon'
        tabler='IconArrowBackUp'
        hugeicons='Undo02Icon'
        phosphor='ArrowUUpLeftIcon'
        remixicon='RiArrowGoBackLine'
        aria-hidden
      />
    ),
    label: 'Rolled back',
  },
  running: {
    cell: 'bg-sky-500/60 dark:bg-sky-400/60 motion-safe:animate-pulse',
    className: 'text-sky-700 dark:text-sky-400',
    icon: (
      <IconPlaceholder
        lucide='LoaderCircleIcon'
        tabler='IconLoader2'
        hugeicons='Loading03Icon'
        phosphor='CircleNotchIcon'
        remixicon='RiLoader4Line'
        aria-hidden
        className='motion-safe:animate-spin'
      />
    ),
    label: 'Running',
  },
  success: {
    cell: 'bg-emerald-600 dark:bg-emerald-500',
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
    label: 'Ready',
  },
}

/** The status icon with its label, shown or for screen readers only. */
function DeployStatusLabel({
  className,
  showLabel = true,
  status,
}: {
  className?: string
  showLabel?: boolean
  status: DeployStatus
}) {
  const config = deployStatusConfig[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0',
        config.className,
        className,
      )}
    >
      {config.icon}
      <span className={cn(!showLabel && 'sr-only')}>{config.label}</span>
    </span>
  )
}

/** "45s", "3m 12s", "1h 04m". */
function formatDuration(seconds: number) {
  const whole = Math.max(0, Math.round(seconds))
  if (whole < 60) return `${whole}s`
  const minutes = Math.floor(whole / 60)
  if (minutes < 60) return `${minutes}m ${String(whole % 60).padStart(2, '0')}s`
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`
}

/** The first 7 characters of a commit hash. */
function shortSha(sha: string) {
  return sha.slice(0, 7)
}

type DoraLevel = 'elite' | 'high' | 'medium' | 'low'

interface DoraInput {
  /** Share of deployments causing a failure in production, 0–1. */
  changeFailureRate: number
  /** Deployments per day. */
  deploysPerDay: number
  /** Median hours from commit to production. */
  leadTimeHours: number
  /** Median hours to restore service after a failure. */
  restoreHours: number
}

/**
 * Rates each of the four DORA metrics against the widely used bands: elite,
 * high, medium or low. Bands vary between reports; adjust them to yours.
 */
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

const doraLevelConfig: Record<DoraLevel, { className: string; label: string }> = {
  elite: {
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    label: 'Elite',
  },
  high: { className: 'bg-sky-500/10 text-sky-700 dark:text-sky-400', label: 'High' },
  low: { className: 'bg-red-500/10 text-red-700 dark:text-red-400', label: 'Low' },
  medium: {
    className: 'bg-amber-500/10 text-amber-800 dark:text-amber-400',
    label: 'Medium',
  },
}

/** The DORA band as a labelled badge. */
function DoraBadge({ className, level }: { className?: string; level: DoraLevel }) {
  const config = doraLevelConfig[level]
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}

interface DeployHistoryProps {
  className?: string
  /** Oldest first. */
  runs: { id: string; status: DeployStatus }[]
}

/**
 * One cell per run, oldest on the left, coloured by status: a failed run
 * reads at a glance. Decorative: give the counts as text beside it.
 */
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
  DoraBadge,
  deployStatusConfig,
  doraLevelConfig,
  formatDuration,
  getDoraLevels,
  shortSha,
}

export type { DeployHistoryProps, DeployStatus, DoraInput, DoraLevel }
