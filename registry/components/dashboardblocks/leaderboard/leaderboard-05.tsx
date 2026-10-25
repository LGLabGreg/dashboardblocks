'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { CountryFlag } from '@/registry/components/dashboardblocks/geo'
import {
  Leaderboard,
  LeaderboardBar,
  LeaderboardItem,
  LeaderboardLabel,
  LeaderboardRank,
  LeaderboardValue,
} from '@/registry/components/dashboardblocks/leaderboard'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatNumber, formatPercent } from '@/registry/lib/dashboardblocks/format'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

interface CountryStat {
  /** ISO 3166-1 alpha-2 code, such as `GB`. */
  code: string
  name: string
  visitors: number
}

interface Leaderboard5Props extends BlockStateProps {
  /** Leave out, or pass none, to show the empty state. */
  countries?: CountryStat[]
  /** Defaults to a sentence about the leading country and the top three. */
  description?: string
  initialCount?: number
  title: string
}

const exampleProps: Leaderboard5Props = {
  countries: [
    { code: 'US', name: 'United States', visitors: 24_318 },
    { code: 'DE', name: 'Germany', visitors: 11_204 },
    { code: 'GB', name: 'United Kingdom', visitors: 9_876 },
    { code: 'IN', name: 'India', visitors: 7_452 },
    { code: 'FR', name: 'France', visitors: 5_931 },
    { code: 'BR', name: 'Brazil', visitors: 4_207 },
    { code: 'JP', name: 'Japan', visitors: 3_618 },
    { code: 'CA', name: 'Canada', visitors: 2_944 },
  ],
  initialCount: 5,
  title: 'Top countries',
}

function summarize(ranked: CountryStat[]) {
  const total = ranked.reduce((sum, country) => sum + country.visitors, 0)
  const [first] = ranked
  if (!first || total === 0) return 'No visitors yet.'
  const share = (visitors: number) =>
    formatPercent(visitors / total, { maximumFractionDigits: 0 })
  const lead = `${first.name} sent ${share(first.visitors)} of ${formatNumber(total)} visitors`
  if (ranked.length <= 3) return `${lead}.`
  const top = ranked.slice(0, 3).reduce((sum, country) => sum + country.visitors, 0)
  return `${lead}, and the top 3 countries ${share(top)}.`
}

const pressScale =
  'transition-[color,background-color,border-color,box-shadow,scale,translate] duration-150 ease-out active:scale-[0.96]'

const swapTransition =
  'transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none'

function IconSwap({
  active,
  activeIcon,
  className,
  inactiveIcon,
  ...props
}: {
  active: boolean
  activeIcon: React.ReactNode
  className?: string
  'data-icon'?: 'inline-end' | 'inline-start'
  inactiveIcon: React.ReactNode
}) {
  return (
    <span aria-hidden='true' className={cn('relative inline-flex', className)} {...props}>
      <span
        className={cn(
          'absolute inset-0 flex items-center justify-center',
          swapTransition,
          active
            ? 'scale-100 opacity-100 blur-[0px]'
            : 'scale-[0.25] opacity-0 blur-[4px]',
        )}
      >
        {activeIcon}
      </span>
      <span
        className={cn(
          'flex',
          swapTransition,
          active
            ? 'scale-[0.25] opacity-0 blur-[4px]'
            : 'scale-100 opacity-100 blur-[0px]',
        )}
      >
        {inactiveIcon}
      </span>
    </span>
  )
}

const Leaderboard5 = (props: Leaderboard5Props) => {
  const { countries = [], initialCount = 5, errorMessage, status, title } = props
  const state = getBlockState(status, countries)
  const [ascending, setAscending] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [skipBarAnimation, setSkipBarAnimation] = useState(false)

  const ranked = [...countries].sort((a, b) => b.visitors - a.visitors)
  const total = ranked.reduce((sum, country) => sum + country.visitors, 0) || 1
  const max = ranked[0]?.visitors || 1
  const ordered = ascending ? [...ranked].reverse() : ranked
  const visible = expanded ? ordered : ordered.slice(0, initialCount)
  const canExpand = !state && countries.length > initialCount
  const { description = summarize(ranked) } = props

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <BlockReady className='text-sm'>
              <p className='text-muted-foreground text-sm'>{description}</p>
            </BlockReady>
          </div>
          <Button
            variant='ghost'
            size='icon-sm'
            aria-label={ascending ? 'Sort by most visitors' : 'Sort by fewest visitors'}
            disabled={state !== undefined}
            onClick={() => {
              setSkipBarAnimation(true)
              setAscending((value) => !value)
            }}
            className={pressScale}
          >
            <IconSwap
              active={ascending}
              activeIcon={
                <IconPlaceholder
                  lucide='ArrowUpNarrowWideIcon'
                  tabler='IconSortAscending'
                  hugeicons='SortByUp01Icon'
                  phosphor='SortAscendingIcon'
                  remixicon='RiSortAsc'
                />
              }
              inactiveIcon={
                <IconPlaceholder
                  lucide='ArrowDownWideNarrowIcon'
                  tabler='IconSortDescending'
                  hugeicons='SortByDown01Icon'
                  phosphor='SortDescendingIcon'
                  remixicon='RiSortDesc'
                />
              }
            />
          </Button>
        </header>
        <div className='flex flex-col gap-2 border-t pt-4'>
          <BlockStateRows rows={initialCount} />
          {!state && (
            <Leaderboard>
              {visible.map((country, index) => {
                const share = country.visitors / total
                return (
                  <LeaderboardItem key={country.code}>
                    <LeaderboardBar
                      animated={!skipBarAnimation}
                      className={
                        country === ranked[0]
                          ? 'bg-[color-mix(in_oklab,var(--color-chart-2)_32%,transparent)]'
                          : undefined
                      }
                      delay={index * 100}
                      value={(country.visitors / max) * 100}
                    />
                    <LeaderboardRank rank={ranked.indexOf(country) + 1} />
                    <CountryFlag code={country.code} />
                    <LeaderboardLabel className='truncate'>
                      {country.name}
                    </LeaderboardLabel>
                    <span className='shrink-0 text-xs text-muted-foreground tabular-nums'>
                      {formatPercent(share, {
                        maximumFractionDigits: 1,
                        minimumFractionDigits: 1,
                      })}
                    </span>
                    <LeaderboardValue className='w-14'>
                      {formatNumber(country.visitors)}
                    </LeaderboardValue>
                  </LeaderboardItem>
                )
              })}
            </Leaderboard>
          )}
          {canExpand && (
            <Button
              variant='ghost'
              size='sm'
              aria-expanded={expanded}
              onClick={() => {
                setSkipBarAnimation(true)
                setExpanded((value) => !value)
              }}
              className={cn('self-start', pressScale)}
            >
              {expanded ? 'Show less' : `Show all ${countries.length}`}
              <IconSwap
                active={expanded}
                activeIcon={
                  <IconPlaceholder
                    lucide='ChevronUpIcon'
                    tabler='IconChevronUp'
                    hugeicons='ArrowUp01Icon'
                    phosphor='CaretUpIcon'
                    remixicon='RiArrowUpSLine'
                  />
                }
                data-icon='inline-end'
                inactiveIcon={
                  <IconPlaceholder
                    lucide='ChevronDownIcon'
                    tabler='IconChevronDown'
                    hugeicons='ArrowDownIcon'
                    phosphor='CaretDownIcon'
                    remixicon='RiArrowDownSLine'
                  />
                }
              />
            </Button>
          )}
        </div>
      </section>
    </BlockStateProvider>
  )
}

export {
  Leaderboard5,
  exampleProps as leaderboard5ExampleProps,
  type CountryStat,
  type Leaderboard5Props,
}
