import { Icon } from '@/registry/components/dashboardblocks/icon'
import {
  Leaderboard,
  LeaderboardItem,
  LeaderboardLabel,
  LeaderboardRank,
  LeaderboardRankChange,
  LeaderboardValue,
} from '@/registry/components/dashboardblocks/leaderboard'
import {
  Armchair,
  Headphones,
  Keyboard,
  Lamp,
  type LucideIcon,
  Monitor,
  Mouse,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface Product {
  category: string
  change: number | 'new'
  icon: LucideIcon
  id: number
  name: string
  revenue: number
  unitsSold: number
}

interface Leaderboard04Props {
  currency?: string
  description: string
  products: Product[]
  title: string
}

const exampleProps: Leaderboard04Props = {
  currency: 'USD',
  description: 'By revenue, rank change vs last week',
  products: [
    {
      id: 1,
      name: 'Studio Monitor 27"',
      category: 'Displays',
      icon: Monitor,
      revenue: 48_920,
      unitsSold: 112,
      change: 1,
    },
    {
      id: 2,
      name: 'Wireless Headphones',
      category: 'Audio',
      icon: Headphones,
      revenue: 41_370,
      unitsSold: 287,
      change: -1,
    },
    {
      id: 3,
      name: 'Ergonomic Chair',
      category: 'Furniture',
      icon: Armchair,
      revenue: 36_540,
      unitsSold: 84,
      change: 0,
    },
    {
      id: 4,
      name: 'Mechanical Keyboard',
      category: 'Peripherals',
      icon: Keyboard,
      revenue: 22_815,
      unitsSold: 169,
      change: 3,
    },
    {
      id: 5,
      name: 'Desk Lamp Pro',
      category: 'Lighting',
      icon: Lamp,
      revenue: 14_260,
      unitsSold: 203,
      change: 'new',
    },
    {
      id: 6,
      name: 'Precision Mouse',
      category: 'Peripherals',
      icon: Mouse,
      revenue: 9_880,
      unitsSold: 152,
      change: -2,
    },
  ],
  title: 'Top Products',
}

// Layered transparent shadows give the tile depth without a hard border
const tileSurface =
  'bg-card text-foreground shadow-[0_0_0_1px_oklch(0_0_0/0.06),0_1px_2px_-1px_oklch(0_0_0/0.06),0_2px_4px_0_oklch(0_0_0/0.04)] dark:shadow-[0_0_0_1px_oklch(1_0_0/0.08)]'

const Leaderboard04 = (props: Leaderboard04Props) => {
  const { currency = 'USD', description, products, title } = props
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
          {products.map((product, index) => (
            <LeaderboardItem key={product.id} size='lg' className='px-0'>
              <LeaderboardRank rank={index + 1} />
              <Icon
                icon={product.icon}
                size='md'
                variant='ghost'
                className={cn('[&_svg]:stroke-[1.5]', tileSurface)}
              />
              <LeaderboardLabel>
                <p className='truncate font-medium'>{product.name}</p>
                <p className='truncate text-xs text-muted-foreground'>
                  {product.category}
                </p>
              </LeaderboardLabel>
              <LeaderboardValue>
                <p>{formatter.format(product.revenue)}</p>
                <p className='text-xs font-normal text-muted-foreground'>
                  {product.unitsSold.toLocaleString()} sold
                </p>
              </LeaderboardValue>
              <div className='flex w-9 shrink-0 justify-end'>
                <LeaderboardRankChange change={product.change} />
              </div>
            </LeaderboardItem>
          ))}
        </Leaderboard>
      </CardContent>
    </Card>
  )
}

export {
  Leaderboard04,
  exampleProps as leaderboard04ExampleProps,
  type Leaderboard04Props,
  type Product,
}
