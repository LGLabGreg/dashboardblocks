'use client'

import {
  type StatusTone,
  statusToneClasses,
} from '@/registry/components/dashboardblocks/status-label'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

type AgentRingStatus =
  | 'running'
  | 'waiting'
  | 'done'
  | 'warning'
  | 'failed'
  | 'stopped'
  | 'idle'

const RING_TONES: Record<AgentRingStatus, StatusTone> = {
  done: 'good',
  failed: 'bad',
  idle: 'neutral',
  running: 'info',
  stopped: 'neutral',
  waiting: 'warning',
  warning: 'warning',
}

interface AgentRingProps extends ComponentProps<'span'> {
  /** `idle` draws the track alone, for something that hasn't started or has nothing to show. Size the mark inside with `--agent-ring-icon`. */
  status: AgentRingStatus
  /** Colours the ring in place of its status's own tone, such as `info` for a wait that isn't on a person. */
  tone?: StatusTone
}

function agentInitials(name: string) {
  const words = name.split(/\s+/).filter(Boolean)
  const letters =
    words.length > 1
      ? words
          .slice(0, 2)
          .map((word) => word[0])
          .join('')
      : name.slice(0, 2)
  return letters.toUpperCase()
}

interface AgentMarkProps extends Omit<AgentRingProps, 'children' | 'status'> {
  /** @default the first letters of its first two words, or its first two letters: `CC` for Claude Code, `AT` for Atlas */
  initials?: string
  name: string
  /** @default 'idle' */
  status?: AgentRingStatus
}

/** An agent's initials in its ring. */
function AgentMark({ initials, name, status = 'idle', ...props }: AgentMarkProps) {
  return (
    <AgentRing status={status} {...props}>
      <span className='leading-none'>{initials ?? agentInitials(name)}</span>
    </AgentRing>
  )
}

/** A ring around `children`: an arc spins while running, the ring pulses while waiting, and it closes into a tick, an exclamation mark, a cross or a dash once done, warning, failed or stopped. */
function AgentRing({ children, className, status, tone, ...props }: AgentRingProps) {
  const closed =
    status === 'done' ||
    status === 'warning' ||
    status === 'failed' ||
    status === 'stopped'
  return (
    <span
      data-slot='agent-ring'
      data-status={status}
      aria-hidden
      className={cn(
        'relative inline-flex size-9 shrink-0 items-center justify-center text-xs [--agent-ring-icon:1rem]',
        statusToneClasses[tone ?? RING_TONES[status]],
        className,
      )}
      {...props}
    >
      <svg viewBox='0 0 36 36' className='absolute inset-0 size-full overflow-visible'>
        <circle
          cx='18'
          cy='18'
          r='17'
          fill='none'
          stroke='var(--color-border)'
          strokeWidth='2'
        />
        <g
          className={cn(
            'origin-center',
            status === 'running' && 'animate-spin motion-reduce:animate-none',
          )}
        >
          <circle
            cx='18'
            cy='18'
            r='17'
            fill='none'
            pathLength={100}
            stroke='currentColor'
            strokeDasharray='100'
            strokeDashoffset={status === 'running' ? 72 : status === 'idle' ? 100 : 0}
            strokeLinecap='round'
            strokeOpacity={status === 'idle' ? 0 : 1}
            strokeWidth='2'
            transform='rotate(-90 18 18)'
            className='transition-all duration-700 ease-out motion-reduce:transition-none'
          />
        </g>
      </svg>
      {status === 'waiting' && (
        <span className='absolute -end-0.5 -top-0.5 flex size-[clamp(0.375rem,28%,0.625rem)]'>
          <span className='absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60 motion-reduce:animate-none' />
          <span className='relative inline-flex size-full rounded-full bg-current' />
        </span>
      )}
      {closed ? (
        <span
          key={status}
          className='motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-50 relative flex duration-300 [&_svg]:size-(--agent-ring-icon)'
        >
          {status === 'done' ? (
            <IconPlaceholder
              lucide='CheckIcon'
              tabler='IconCheck'
              hugeicons='Tick02Icon'
              phosphor='CheckIcon'
              remixicon='RiCheckLine'
            />
          ) : status === 'warning' ? (
            <svg
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeWidth='2'
            >
              <path d='M12 5v9' />
              <path d='M12 19h.01' />
            </svg>
          ) : status === 'failed' ? (
            <IconPlaceholder
              lucide='XIcon'
              tabler='IconX'
              hugeicons='Cancel01Icon'
              phosphor='XIcon'
              remixicon='RiCloseLine'
            />
          ) : (
            <IconPlaceholder
              lucide='MinusIcon'
              tabler='IconMinus'
              hugeicons='MinusSignIcon'
              phosphor='MinusIcon'
              remixicon='RiSubtractLine'
            />
          )}
        </span>
      ) : (
        <span className='text-foreground relative flex font-medium [&_svg]:size-(--agent-ring-icon)'>
          {children}
        </span>
      )}
    </span>
  )
}

export { AgentMark, AgentRing, agentInitials }

export type { AgentMarkProps, AgentRingProps, AgentRingStatus }
