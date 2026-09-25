'use client'

import {
  Leaderboard,
  LeaderboardItem,
  LeaderboardLabel,
  LeaderboardRank,
  LeaderboardValue,
} from '@/registry/components/dashboardblocks/leaderboard'
import { useInView } from '@/registry/hooks/use-in-view'
import { useEffect, useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface Contributor {
  avatar: string
  id: number
  name: string
  value: number
}

interface Leaderboard03Props {
  contributors: Contributor[]
  description: string
  title: string
  unit: string
}

const exampleProps: Leaderboard03Props = {
  contributors: [
    { id: 1, name: 'Sarah Chen', avatar: '/images/women.jpg', value: 312 },
    { id: 2, name: 'Marcus Reid', avatar: '/images/man.jpg', value: 268 },
    { id: 3, name: 'Priya Patel', avatar: '/images/women.jpg', value: 241 },
    { id: 4, name: 'Diego Alvarez', avatar: '/images/man.jpg', value: 187 },
    { id: 5, name: 'Emma Larsen', avatar: '/images/women.jpg', value: 154 },
    { id: 6, name: 'Tom Becker', avatar: '/images/man.jpg', value: 129 },
  ],
  description: 'Merged commits this month',
  title: 'Top Contributors',
  unit: 'commits',
}

// Podium columns render in rank order for assistive tech and are reordered visually
const podium = [
  {
    avatar: 'size-12',
    block:
      'h-24 bg-[color-mix(in_oklab,var(--color-amber-500)_20%,var(--card))] text-amber-700 dark:text-amber-400',
    order: 'order-2',
  },
  {
    avatar: 'size-10',
    block:
      'h-16 bg-[color-mix(in_oklab,var(--color-zinc-500)_20%,var(--card))] text-zinc-700 dark:text-zinc-300',
    order: 'order-1',
  },
  {
    avatar: 'size-10',
    block:
      'h-12 bg-[color-mix(in_oklab,var(--color-orange-700)_20%,var(--card))] text-orange-800 dark:text-orange-400',
    order: 'order-3',
  },
]

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
}

const Leaderboard03 = (props: Leaderboard03Props) => {
  const { contributors, description, title, unit } = props
  const [revealed, setRevealed] = useState(false)
  const { isInView, ref } = useInView()

  const top = contributors.slice(0, 3)
  const rest = contributors.slice(3)

  useEffect(() => {
    if (isInView) {
      const frame = requestAnimationFrame(() => {
        setRevealed(true)
      })
      return () => cancelAnimationFrame(frame)
    }
  }, [isInView])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <ol
          ref={ref as React.RefObject<HTMLOListElement>}
          className='grid grid-cols-3 items-end gap-2'
        >
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
                  <div className='w-full min-w-0 space-y-0.5'>
                    <p className='truncate text-sm font-medium'>{contributor.name}</p>
                    <p className='text-xs text-muted-foreground tabular-nums'>
                      {contributor.value.toLocaleString()} {unit}
                    </p>
                  </div>
                </div>
                <div className='w-full overflow-hidden rounded-t-lg'>
                  <div
                    className={cn(
                      'flex items-start justify-center pt-2 text-lg font-semibold tabular-nums transition-transform duration-700 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none',
                      step.block,
                      revealed ? 'translate-y-0' : 'translate-y-full',
                    )}
                    style={{ transitionDelay: delay }}
                  >
                    <span className='sr-only'>Rank </span>
                    {index + 1}
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
        {rest.length > 0 && (
          <Leaderboard className='border-t pt-3'>
            {rest.map((contributor, index) => (
              <LeaderboardItem key={contributor.id} className='px-0'>
                <LeaderboardRank rank={index + 4} />
                <Avatar className='size-7 outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10'>
                  <AvatarImage src={contributor.avatar} alt='' />
                  <AvatarFallback className='text-[10px]'>
                    {getInitials(contributor.name)}
                  </AvatarFallback>
                </Avatar>
                <LeaderboardLabel className='truncate'>
                  {contributor.name}
                </LeaderboardLabel>
                <LeaderboardValue>
                  {contributor.value.toLocaleString()}
                  <span className='sr-only'> {unit}</span>
                </LeaderboardValue>
              </LeaderboardItem>
            ))}
          </Leaderboard>
        )}
      </CardContent>
    </Card>
  )
}

export {
  Leaderboard03,
  exampleProps as leaderboard03ExampleProps,
  type Contributor,
  type Leaderboard03Props,
}
