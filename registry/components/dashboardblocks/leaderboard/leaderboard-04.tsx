import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  LeaderboardRank,
  LeaderboardRankChange,
} from '@/registry/components/dashboardblocks/leaderboard'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  DataTableRowHead,
  DataTableStateRows,
} from '@/registry/components/dashboardblocks/table'
import {
  formatCurrency,
  formatNumber,
  joinDetails,
} from '@/registry/lib/dashboardblocks/format'

interface Product {
  category: string
  /** Places moved since the last period, or `new` for a first entry. */
  change: number | 'new'
  id: number
  name: string
  revenue: number
  unitsSold: number
}

interface Leaderboard4Props {
  currency?: string
  /** Defaults to a sentence about the biggest climber and new entries. */
  description?: string
  /** Names the last period in the sentence, such as `last week`. */
  period?: string
  /** Leave out, or pass none, to show the empty state. */
  products?: Product[]
  status?: BlockStatus
  title: string
}

const exampleProps: Leaderboard4Props = {
  currency: 'USD',
  period: 'last week',
  products: [
    {
      id: 1,
      name: 'Studio Monitor 27"',
      category: 'Displays',
      revenue: 48_920,
      unitsSold: 112,
      change: 1,
    },
    {
      id: 2,
      name: 'Wireless Headphones',
      category: 'Audio',
      revenue: 41_370,
      unitsSold: 287,
      change: -1,
    },
    {
      id: 3,
      name: 'Ergonomic Chair',
      category: 'Furniture',
      revenue: 36_540,
      unitsSold: 84,
      change: 0,
    },
    {
      id: 4,
      name: 'Mechanical Keyboard',
      category: 'Peripherals',
      revenue: 22_815,
      unitsSold: 169,
      change: 3,
    },
    {
      id: 5,
      name: 'Desk Lamp Pro',
      category: 'Lighting',
      revenue: 14_260,
      unitsSold: 203,
      change: 'new',
    },
    {
      id: 6,
      name: 'Precision Mouse',
      category: 'Peripherals',
      revenue: 9_880,
      unitsSold: 152,
      change: -2,
    },
  ],
  title: 'Top products',
}

const ordinalRules = new Intl.PluralRules('en-US', { type: 'ordinal' })
const ordinalSuffix: Record<string, string> = { few: 'rd', one: 'st', two: 'nd' }
const ordinal = (rank: number) =>
  `${rank}${ordinalSuffix[ordinalRules.select(rank)] ?? 'th'}`

function summarize(products: Product[], period: string) {
  const climber = products
    .map((product, index) => ({ ...product, rank: index + 1 }))
    .filter((product) => typeof product.change === 'number' && product.change > 0)
    .sort((a, b) => (b.change as number) - (a.change as number))[0]
  const fresh = products.filter((product) => product.change === 'new')
  const parts = [
    climber &&
      `${climber.name} climbed ${climber.change} ${climber.change === 1 ? 'place' : 'places'} to ${ordinal(climber.rank)}`,
    fresh.length === 1 && `${fresh[0].name} is new`,
    fresh.length > 1 && `${fresh.length} products are new`,
  ].filter(Boolean)
  return parts.length > 0
    ? `${parts.join(' and ')} since ${period}.`
    : `No changes in the ranking since ${period}.`
}

const Leaderboard4 = (props: Leaderboard4Props) => {
  const {
    currency = 'USD',
    period = 'the last period',
    products = [],
    status,
    title,
  } = props
  const state = getBlockState(status, products)
  const { description = summarize(products, period) } = props

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-3'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        <DataTable caption={title} className='border-t'>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead className='w-10'>#</DataTableHead>
              <DataTableHead>Product</DataTableHead>
              <DataTableHead align='end'>Revenue</DataTableHead>
              <DataTableHead align='end' className='w-20'>
                Move
              </DataTableHead>
            </DataTableRow>
          </DataTableHeader>
          <DataTableBody>
            <DataTableStateRows colSpan={4} rows={6} />
            {!state &&
              products.map((product, index) => (
                <DataTableRow key={product.id}>
                  <DataTableCell className='pe-0'>
                    <LeaderboardRank rank={index + 1} />
                  </DataTableCell>
                  <DataTableRowHead primary truncate>
                    <span className='block truncate'>{product.name}</span>
                    <span className='text-muted-foreground block truncate text-xs font-normal'>
                      {joinDetails(
                        product.category,
                        `${formatNumber(product.unitsSold)} sold`,
                      )}
                    </span>
                  </DataTableRowHead>
                  <DataTableCell align='end' className='font-medium'>
                    {formatCurrency(product.revenue, { currency })}
                  </DataTableCell>
                  <DataTableCell align='end'>
                    <LeaderboardRankChange change={product.change} />
                  </DataTableCell>
                </DataTableRow>
              ))}
          </DataTableBody>
        </DataTable>
      </section>
    </BlockStateProvider>
  )
}

export {
  Leaderboard4,
  exampleProps as leaderboard4ExampleProps,
  type Leaderboard4Props,
  type Product,
}
