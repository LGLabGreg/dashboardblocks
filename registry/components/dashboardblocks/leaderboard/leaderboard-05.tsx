'use client'

import {
  Leaderboard,
  LeaderboardBar,
  LeaderboardItem,
  LeaderboardLabel,
  LeaderboardRank,
  LeaderboardValue,
} from '@/registry/components/dashboardblocks/leaderboard'
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  ChevronDown,
  ChevronUp,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface CountryStat {
  code: string
  name: string
  visitors: number
}

interface Leaderboard05Props {
  countries: CountryStat[]
  description: string
  initialCount?: number
  title: string
}

const exampleProps: Leaderboard05Props = {
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
  description: 'Visitors by country, last 7 days',
  initialCount: 5,
  title: 'Top Countries',
}

const pressScale =
  'transition-[color,background-color,border-color,box-shadow,scale,translate] duration-150 ease-out active:scale-[0.96]'

const swapTransition =
  'transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none'

// Keeps both icons mounted and cross-fades them so the swap animates in both directions
function IconSwap({
  active,
  activeIcon: ActiveIcon,
  className,
  inactiveIcon: InactiveIcon,
  ...props
}: {
  active: boolean
  activeIcon: LucideIcon
  className?: string
  'data-icon'?: 'inline-end' | 'inline-start'
  inactiveIcon: LucideIcon
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
        <ActiveIcon />
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
        <InactiveIcon />
      </span>
    </span>
  )
}

const Leaderboard05 = (props: Leaderboard05Props) => {
  const { countries, description, initialCount = 5, title } = props
  const [ascending, setAscending] = useState(false)
  const [expanded, setExpanded] = useState(false)
  // Bars fill once on first view; after the user interacts, rows render at their final width
  const [interacted, setInteracted] = useState(false)

  const ranked = [...countries].sort((a, b) => b.visitors - a.visitors)
  const total = ranked.reduce((sum, country) => sum + country.visitors, 0) || 1
  const max = ranked[0]?.visitors || 1
  const ordered = ascending ? [...ranked].reverse() : ranked
  const visible = expanded ? ordered : ordered.slice(0, initialCount)
  const canExpand = countries.length > initialCount

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <Button
            variant='ghost'
            size='icon-sm'
            aria-label={ascending ? 'Sort by most visitors' : 'Sort by fewest visitors'}
            onClick={() => {
              setInteracted(true)
              setAscending((value) => !value)
            }}
            className={pressScale}
          >
            <IconSwap
              active={ascending}
              activeIcon={ArrowUpNarrowWide}
              inactiveIcon={ArrowDownWideNarrow}
            />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Leaderboard>
          {visible.map((country, index) => {
            const share = (country.visitors / total) * 100
            return (
              <LeaderboardItem key={country.code}>
                <LeaderboardBar
                  animated={!interacted}
                  delay={index * 100}
                  value={(country.visitors / max) * 100}
                />
                <LeaderboardRank rank={ranked.indexOf(country) + 1} />
                <span
                  aria-hidden='true'
                  className='w-6 shrink-0 font-mono text-xs text-muted-foreground'
                >
                  {country.code}
                </span>
                <LeaderboardLabel className='truncate'>{country.name}</LeaderboardLabel>
                <span className='shrink-0 text-xs text-muted-foreground tabular-nums'>
                  {share.toFixed(1)}%
                </span>
                <LeaderboardValue className='w-14'>
                  {country.visitors.toLocaleString()}
                </LeaderboardValue>
              </LeaderboardItem>
            )
          })}
        </Leaderboard>
      </CardContent>
      {canExpand && (
        <CardFooter>
          <Button
            variant='ghost'
            size='sm'
            aria-expanded={expanded}
            onClick={() => {
              setInteracted(true)
              setExpanded((value) => !value)
            }}
            className={cn(
              'w-full text-muted-foreground aria-expanded:bg-transparent aria-expanded:text-muted-foreground aria-expanded:hover:bg-muted aria-expanded:hover:text-foreground',
              pressScale,
            )}
          >
            {expanded ? 'Show less' : `Show all ${countries.length}`}
            <IconSwap
              active={expanded}
              activeIcon={ChevronUp}
              data-icon='inline-end'
              inactiveIcon={ChevronDown}
            />
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

export {
  Leaderboard05,
  exampleProps as leaderboard05ExampleProps,
  type CountryStat,
  type Leaderboard05Props,
}
