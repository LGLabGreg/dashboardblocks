import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { KPIChange } from '@/registry/components/dashboardblocks/kpi'
import {
  Leaderboard,
  LeaderboardItem,
  LeaderboardLabel,
  LeaderboardRank,
  LeaderboardValue,
} from '@/registry/components/dashboardblocks/leaderboard'
import {
  formatCurrency,
  formatPercent,
  joinDetails,
} from '@/registry/lib/dashboardblocks/format'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { cn } from '@/lib/utils'

interface SalesRep {
  avatar: string
  deals: number
  id: number
  name: string
  /** Revenue target for the period, drawn as a mark on the rep's bar. */
  quota: number
  revenue: number
  /** Percent change in revenue on the period before. */
  trend: number
}

interface Leaderboard2Props extends BlockStateProps {
  currency?: string
  /** Defaults to a sentence about the leader and how many reps passed quota. */
  description?: string
  /** Leave out, or pass none, to show the empty state. */
  reps?: SalesRep[]
  title: string
}

const exampleProps: Leaderboard2Props = {
  currency: 'USD',
  reps: [
    {
      id: 1,
      name: 'Sarah Chen',
      avatar: '/images/avatar-01.webp',
      deals: 42,
      quota: 150_000,
      revenue: 184_300,
      trend: 12.4,
    },
    {
      id: 2,
      name: 'Marcus Reid',
      avatar: '/images/avatar-02.webp',
      deals: 37,
      quota: 150_000,
      revenue: 156_900,
      trend: 8.1,
    },
    {
      id: 3,
      name: 'Priya Patel',
      avatar: '/images/avatar-03.webp',
      deals: 33,
      quota: 125_000,
      revenue: 139_450,
      trend: -2.3,
    },
    {
      id: 4,
      name: 'Diego Alvarez',
      avatar: '/images/avatar-04.webp',
      deals: 28,
      quota: 125_000,
      revenue: 118_200,
      trend: 4.6,
    },
    {
      id: 5,
      name: 'Emma Larsen',
      avatar: '/images/avatar-05.webp',
      deals: 24,
      quota: 125_000,
      revenue: 97_750,
      trend: 0,
    },
  ],
  title: 'Top performers',
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function summarize(reps: SalesRep[], format: (value: number) => string) {
  const [first, second] = reps
  if (!first) return 'No closed deals yet.'
  const lead = second
    ? `${first.name} leads with ${format(first.revenue)}, ${format(first.revenue - second.revenue)} ahead of ${second.name}.`
    : `${first.name} leads with ${format(first.revenue)}.`
  const past = reps.filter((rep) => rep.revenue >= rep.quota).length
  return `${lead} ${past} of ${reps.length} ${reps.length === 1 ? 'rep' : 'reps'} ${past === 1 ? 'is' : 'are'} past quota.`
}

const Leaderboard2 = (props: Leaderboard2Props) => {
  const { currency = 'USD', reps = [], errorMessage, status, title } = props
  const state = getBlockState(status, reps)
  const format = (value: number) => formatCurrency(value, { currency })
  const { description = summarize(reps, format) } = props
  const scale = Math.max(...reps.map((rep) => rep.revenue / (rep.quota || 1)), 1)

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-3'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        <BlockStateRows className='border-t' rows={5} />
        {!state && (
          <Leaderboard className='gap-0 border-t'>
            {reps.map((rep, index) => {
              const attainment = rep.revenue / (rep.quota || 1)
              return (
                <LeaderboardItem
                  key={rep.id}
                  size='lg'
                  className='items-start border-b px-0 py-3 last:border-b-0'
                >
                  <LeaderboardRank rank={index + 1} className='mt-2.5' />
                  <Avatar
                    // Not the primitive's colour: the style sets no outline, so this one is the block's own
                    className='size-9 outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10'
                  >
                    <AvatarImage src={rep.avatar} alt='' />
                    <AvatarFallback className='text-xs'>
                      {getInitials(rep.name)}
                    </AvatarFallback>
                  </Avatar>
                  <LeaderboardLabel className='flex flex-col gap-1.5'>
                    <div>
                      <p className='truncate font-medium'>{rep.name}</p>
                      <p className='text-muted-foreground text-xs tabular-nums'>
                        {joinDetails(
                          `${rep.deals} deals`,
                          `${formatPercent(attainment, { maximumFractionDigits: 0 })} of quota`,
                        )}
                      </p>
                    </div>
                    <div
                      aria-hidden='true'
                      className='bg-muted relative h-1 rounded-full'
                    >
                      <div
                        className={cn(
                          'h-full rounded-full',
                          attainment >= 1
                            ? 'bg-chart-2'
                            : 'bg-[color-mix(in_oklab,var(--color-chart-2)_30%,transparent)]',
                        )}
                        style={{ width: `${(attainment / scale) * 100}%` }}
                      />
                      <div
                        className='bg-foreground absolute -top-1 -bottom-1 w-px'
                        style={{ insetInlineStart: `${(1 / scale) * 100}%` }}
                      />
                    </div>
                  </LeaderboardLabel>
                  <LeaderboardValue className='flex flex-col items-end gap-0.5'>
                    <span>{format(rep.revenue)}</span>
                    <KPIChange
                      className='text-xs font-normal'
                      comparison='last period'
                      format={format}
                      inline
                      previous={rep.revenue / (1 + rep.trend / 100)}
                      value={rep.revenue}
                      variant='short'
                    />
                  </LeaderboardValue>
                </LeaderboardItem>
              )
            })}
          </Leaderboard>
        )}
        {state !== 'empty' && state !== 'error' && (
          <p
            aria-hidden='true'
            className='text-muted-foreground flex items-center gap-2 text-xs'
          >
            <span className='bg-foreground h-3 w-px' />
            The line on each bar is the rep&apos;s quota.
          </p>
        )}
      </section>
    </BlockStateProvider>
  )
}

export {
  Leaderboard2,
  exampleProps as leaderboard2ExampleProps,
  type Leaderboard2Props,
  type SalesRep,
}
