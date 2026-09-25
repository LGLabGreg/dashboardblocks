'use client'

import {
  BreakdownBar,
  BreakdownLegend,
  formatShare,
} from '@/registry/components/dashboardblocks/breakdown'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface CompositionCategory {
  color: string
  key: string
  label: string
}

interface CompositionGroup {
  label: string
  values: Record<string, number>
}

interface Breakdown2Props {
  categories: CompositionCategory[]
  description: string
  groups: CompositionGroup[]
  /** The category whose share is labelled at the end of each row. */
  highlight: string
  title: string
}

const exampleProps: Breakdown2Props = {
  categories: [
    { color: 'var(--chart-1)', key: 'mobile', label: 'Mobile' },
    { color: 'var(--chart-2)', key: 'desktop', label: 'Desktop' },
    { color: 'var(--chart-3)', key: 'tablet', label: 'Tablet' },
  ],
  description: 'Sessions by device, last 30 days',
  groups: [
    { label: 'Asia Pacific', values: { desktop: 9_120, mobile: 21_480, tablet: 1_940 } },
    { label: 'Latin America', values: { desktop: 4_310, mobile: 8_760, tablet: 820 } },
    { label: 'Europe', values: { desktop: 14_920, mobile: 13_410, tablet: 2_310 } },
    {
      label: 'North America',
      values: { desktop: 18_240, mobile: 14_630, tablet: 3_180 },
    },
    { label: 'Africa', values: { desktop: 1_120, mobile: 3_870, tablet: 140 } },
  ],
  highlight: 'mobile',
  title: 'Device mix by region',
}

const Breakdown2 = (props: Breakdown2Props) => {
  const { categories, description, groups, highlight, title } = props
  const highlighted = categories.find((category) => category.key === highlight)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <BreakdownLegend
          items={categories.map((category) => ({
            color: category.color,
            label: category.label,
          }))}
        />
        <table className='w-full text-sm'>
          <caption className='sr-only'>{`${title}: ${description}`}</caption>
          <thead className='text-muted-foreground text-xs'>
            <tr>
              <th scope='col' className='pb-2 text-left font-normal'>
                Region
              </th>
              <th scope='col' className='pb-2 font-normal'>
                <span className='sr-only'>Share by device</span>
              </th>
              <th scope='col' className='pb-2 text-right font-normal'>
                {highlighted?.label}
              </th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => {
              const total = categories.reduce(
                (sum, category) => sum + (group.values[category.key] ?? 0),
                0,
              )
              return (
                <tr key={group.label}>
                  <th
                    scope='row'
                    className='w-32 py-2 pr-4 text-left font-normal whitespace-nowrap'
                  >
                    {group.label}
                  </th>
                  <td className='py-2'>
                    <BreakdownBar
                      className='h-2.5'
                      segments={categories.map((category) => ({
                        color: category.color,
                        label: category.label,
                        value: group.values[category.key] ?? 0,
                      }))}
                    />
                    <span className='sr-only'>
                      {categories
                        .map(
                          (category) =>
                            `${category.label} ${formatShare(group.values[category.key] ?? 0, total)}`,
                        )
                        .join(', ')}
                    </span>
                  </td>
                  <td className='w-14 py-2 pl-4 text-right font-medium tabular-nums'>
                    {formatShare(group.values[highlight] ?? 0, total)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

export { Breakdown2, exampleProps as breakdown2ExampleProps, type Breakdown2Props }
