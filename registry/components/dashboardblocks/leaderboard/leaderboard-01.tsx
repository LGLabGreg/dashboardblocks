import {
  Leaderboard,
  LeaderboardBar,
  LeaderboardItem,
  LeaderboardLabel,
  LeaderboardValue,
} from '@/registry/components/dashboardblocks/leaderboard'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface PageStat {
  path: string
  visitors: number
}

interface Leaderboard01Props {
  description: string
  onViewAll?: () => void
  pages: PageStat[]
  title: string
}

const exampleProps: Leaderboard01Props = {
  description: 'Unique visitors, last 30 days',
  pages: [
    { path: '/', visitors: 18_420 },
    { path: '/pricing', visitors: 9_312 },
    { path: '/docs/getting-started', visitors: 7_845 },
    { path: '/blog/launch-week', visitors: 5_127 },
    { path: '/changelog', visitors: 3_406 },
    { path: '/careers', visitors: 1_982 },
  ],
  title: 'Top Pages',
}

const Leaderboard01 = (props: Leaderboard01Props) => {
  const { description, onViewAll, pages, title } = props
  const max = Math.max(...pages.map((page) => page.visitors), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <Button
            variant='outline'
            size='sm'
            onClick={onViewAll}
            className='transition-[color,background-color,border-color,box-shadow,scale,translate] duration-150 ease-out active:scale-[0.96]'
          >
            View all
            <ArrowRight data-icon='inline-end' />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className='flex flex-col gap-2'>
        <div className='flex justify-between px-2 text-xs font-medium text-muted-foreground'>
          <span>Page</span>
          <span>Visitors</span>
        </div>
        <Leaderboard>
          {pages.map((page, index) => (
            <LeaderboardItem key={page.path}>
              <LeaderboardBar value={(page.visitors / max) * 100} delay={index * 100} />
              <LeaderboardLabel className='truncate'>{page.path}</LeaderboardLabel>
              <LeaderboardValue>{page.visitors.toLocaleString()}</LeaderboardValue>
            </LeaderboardItem>
          ))}
        </Leaderboard>
      </CardContent>
    </Card>
  )
}

export {
  Leaderboard01,
  exampleProps as leaderboard01ExampleProps,
  type Leaderboard01Props,
  type PageStat,
}
