'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  Leaderboard,
  LeaderboardItem,
  LeaderboardLabel,
  LeaderboardRank,
  LeaderboardValue,
} from '@/registry/components/dashboardblocks/leaderboard'
import { useReveal } from '@/registry/hooks/use-reveal'
import { formatNumber, formatPercent } from '@/registry/lib/dashboardblocks/format'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { cn } from '@/lib/utils'

interface Contributor {
  avatar: string
  id: number
  name: string
  value: number
}

interface Leaderboard3Props extends BlockStateProps {
  /** Leave out, or pass none, to show the empty state. */
  contributors?: Contributor[]
  /** Defaults to a sentence about the winner's lead. */
  description?: string
  title: string
  unit: string
}

const exampleProps: Leaderboard3Props = {
  contributors: [
    { id: 1, name: 'Sarah Chen', avatar: '/images/avatar-01.webp', value: 312 },
    { id: 2, name: 'Marcus Reid', avatar: '/images/avatar-02.webp', value: 268 },
    { id: 3, name: 'Priya Patel', avatar: '/images/avatar-03.webp', value: 241 },
    { id: 4, name: 'Diego Alvarez', avatar: '/images/avatar-04.webp', value: 187 },
    { id: 5, name: 'Emma Larsen', avatar: '/images/avatar-05.webp', value: 154 },
    { id: 6, name: 'Tom Becker', avatar: '/images/avatar-07.webp', value: 129 },
  ],
  title: 'Top contributors',
  unit: 'commits',
}

const PODIUM_HEIGHT = 112

const podium = [
  {
    avatar: 'size-12',
    order: 'order-2',
    step: 'bg-[color-mix(in_oklab,var(--color-chart-2)_45%,transparent)]',
  },
  {
    avatar: 'size-10',
    order: 'order-1',
    step: 'bg-[color-mix(in_oklab,var(--color-chart-2)_22%,transparent)]',
  },
  {
    avatar: 'size-10',
    order: 'order-3',
    step: 'bg-[color-mix(in_oklab,var(--color-chart-2)_22%,transparent)]',
  },
]

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function summarize(contributors: Contributor[], unit: string) {
  const [first, second] = contributors
  if (!first) return `No ${unit} yet.`
  const total = contributors.reduce((sum, contributor) => sum + contributor.value, 0)
  const share = formatPercent(first.value / (total || 1), { maximumFractionDigits: 0 })
  return second
    ? `${first.name} leads with ${formatNumber(first.value)} ${unit}, ${formatNumber(first.value - second.value)} more than ${second.name} and ${share} of the team's ${formatNumber(total)}.`
    : `${first.name} leads with ${formatNumber(first.value)} ${unit}.`
}

interface PodiumProps {
  top: Contributor[]
  unit: string
}

function Podium({ top, unit }: PodiumProps) {
  const { ref, revealed } = useReveal<HTMLOListElement>(true)
  const max = Math.max(top[0]?.value ?? 0, 1)

  return (
    <ol ref={ref} className='grid grid-cols-3 items-end gap-2 border-y pt-4'>
      {top.map((contributor, index) => {
        const step = podium[index]
        const delay = `${index * 100}ms`
        return (
          <li
            key={contributor.id}
            className={cn('flex min-w-0 flex-col items-center', step.order)}
          >
            <div
              className={cn(
                'flex w-full flex-col items-center gap-2 pb-3 text-center transition-[opacity,translate,filter] duration-400 ease-out motion-reduce:transition-none',
                revealed
                  ? 'translate-y-0 opacity-100 blur-[0px]'
                  : 'translate-y-3 opacity-0 blur-[4px]',
              )}
              style={{ transitionDelay: delay }}
            >
              <Avatar
                // Not the primitive's colour: the style sets no outline, so this one is the block's own
                className={cn(
                  'outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10',
                  step.avatar,
                )}
              >
                <AvatarImage src={contributor.avatar} alt='' />
                <AvatarFallback className='text-xs'>
                  {getInitials(contributor.name)}
                </AvatarFallback>
              </Avatar>
              <div className='flex w-full min-w-0 flex-col'>
                <p className='truncate text-sm font-medium'>{contributor.name}</p>
                <p>
                  <span
                    className={cn(
                      'font-light tracking-tight tabular-nums',
                      index === 0 ? 'text-3xl' : 'text-2xl',
                    )}
                  >
                    {formatNumber(contributor.value)}
                  </span>
                  <span className='text-muted-foreground ml-1 text-base font-normal tracking-normal'>
                    {unit}
                  </span>
                </p>
              </div>
            </div>
            <div className='w-full overflow-hidden rounded-t-lg'>
              <div
                className={cn(
                  'text-foreground flex items-start justify-center pt-2 text-sm font-medium tabular-nums transition-transform duration-700 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none',
                  step.step,
                  revealed ? 'translate-y-0' : 'translate-y-full',
                )}
                style={{
                  height: Math.max(32, (contributor.value / max) * PODIUM_HEIGHT),
                  transitionDelay: delay,
                }}
              >
                <span className='sr-only'>Rank </span>
                {index + 1}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

const Leaderboard3 = (props: Leaderboard3Props) => {
  const { contributors = [], errorMessage, status, title, unit } = props
  const state = getBlockState(status, contributors)
  const { description = summarize(contributors, unit) } = props
  const top = contributors.slice(0, 3)
  const rest = contributors.slice(3)

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        <BlockStateRows className='border-t' rows={6} />
        {!state && <Podium top={top} unit={unit} />}
        {!state && rest.length > 0 && (
          <Leaderboard className='gap-0'>
            {rest.map((contributor, index) => (
              <LeaderboardItem
                key={contributor.id}
                className='border-b px-0 py-2.5 last:border-b-0'
              >
                <LeaderboardRank rank={index + 4} />
                <Avatar
                  // Not the primitive's colour: the style sets no outline, so this one is the block's own
                  className='size-7 outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10'
                >
                  <AvatarImage src={contributor.avatar} alt='' />
                  <AvatarFallback className='text-xs'>
                    {getInitials(contributor.name)}
                  </AvatarFallback>
                </Avatar>
                <LeaderboardLabel className='truncate'>
                  {contributor.name}
                </LeaderboardLabel>
                <LeaderboardValue>
                  {formatNumber(contributor.value)}
                  <span className='text-muted-foreground text-xs font-normal'>
                    {' '}
                    {unit}
                  </span>
                </LeaderboardValue>
              </LeaderboardItem>
            ))}
          </Leaderboard>
        )}
      </section>
    </BlockStateProvider>
  )
}

export {
  Leaderboard3,
  exampleProps as leaderboard3ExampleProps,
  type Contributor,
  type Leaderboard3Props,
}
