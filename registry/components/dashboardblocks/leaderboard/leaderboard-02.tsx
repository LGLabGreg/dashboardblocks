import {
  Leaderboard,
  LeaderboardItem,
  LeaderboardLabel,
  LeaderboardRank,
  LeaderboardValue,
} from '@/registry/components/dashboardblocks/leaderboard'
import { Trend } from '@/registry/components/dashboardblocks/trend'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface SalesRep {
  avatar: string
  deals: number
  id: number
  name: string
  revenue: number
  trend: number
}

interface Leaderboard02Props {
  currency?: string
  description: string
  reps: SalesRep[]
  title: string
}

const exampleProps: Leaderboard02Props = {
  currency: 'USD',
  description: 'Closed-won revenue this quarter',
  reps: [
    {
      id: 1,
      name: 'Sarah Chen',
      avatar: '/images/women.jpg',
      deals: 42,
      revenue: 184_300,
      trend: 12.4,
    },
    {
      id: 2,
      name: 'Marcus Reid',
      avatar: '/images/man.jpg',
      deals: 37,
      revenue: 156_900,
      trend: 8.1,
    },
    {
      id: 3,
      name: 'Priya Patel',
      avatar: '/images/women.jpg',
      deals: 33,
      revenue: 139_450,
      trend: -2.3,
    },
    {
      id: 4,
      name: 'Diego Alvarez',
      avatar: '/images/man.jpg',
      deals: 28,
      revenue: 118_200,
      trend: 4.6,
    },
    {
      id: 5,
      name: 'Emma Larsen',
      avatar: '/images/women.jpg',
      deals: 24,
      revenue: 97_750,
      trend: 0,
    },
  ],
  title: 'Top Performers',
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
}

const Leaderboard02 = (props: Leaderboard02Props) => {
  const { currency = 'USD', description, reps, title } = props
  const formatter = new Intl.NumberFormat('en-US', {
    currency,
    maximumFractionDigits: 0,
    style: 'currency',
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Leaderboard className='gap-2'>
          {reps.map((rep, index) => (
            <LeaderboardItem key={rep.id} size='lg' className='px-0'>
              <LeaderboardRank rank={index + 1} variant='badge' medal />
              <Avatar className='size-9 outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10'>
                <AvatarImage src={rep.avatar} alt='' />
                <AvatarFallback className='text-xs'>
                  {getInitials(rep.name)}
                </AvatarFallback>
              </Avatar>
              <LeaderboardLabel>
                <p className='truncate font-medium'>{rep.name}</p>
                <p className='text-xs text-muted-foreground tabular-nums'>
                  {rep.deals} deals
                </p>
              </LeaderboardLabel>
              <LeaderboardValue className='flex flex-col items-end gap-0.5'>
                <span>{formatter.format(rep.revenue)}</span>
                <Trend
                  trend={rep.trend}
                  trendIcon='arrow'
                  className='text-xs [&_svg]:size-3'
                />
              </LeaderboardValue>
            </LeaderboardItem>
          ))}
        </Leaderboard>
      </CardContent>
    </Card>
  )
}

export {
  Leaderboard02,
  exampleProps as leaderboard02ExampleProps,
  type Leaderboard02Props,
  type SalesRep,
}
