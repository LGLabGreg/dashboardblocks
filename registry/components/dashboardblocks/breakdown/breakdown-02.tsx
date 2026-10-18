'use client'

import {
  BlockStateProvider,
  BlockStateRows,
  BlockStateText,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  BreakdownBar,
  BreakdownLegend,
  formatShare,
} from '@/registry/components/dashboardblocks/breakdown'

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
  /** Leave out, or pass none, to show the empty state. */
  groups?: CompositionGroup[]
  /** What the groups are, plural, for the summary sentence. @default 'groups' */
  groupsLabel?: string
  highlight: string
  status?: BlockStatus
  title: string
}

const exampleProps: Breakdown2Props = {
  categories: [
    { color: 'var(--color-chart-2)', key: 'mobile', label: 'Mobile' },
    { color: 'var(--color-chart-3)', key: 'desktop', label: 'Desktop' },
    { color: 'var(--color-chart-4)', key: 'tablet', label: 'Tablet' },
  ],
  description: 'Sessions by device in each region over the last 30 days.',
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
  groupsLabel: 'regions',
  highlight: 'mobile',
  title: 'Device mix by region',
}

const Breakdown2 = (props: Breakdown2Props) => {
  const {
    categories,
    description,
    groups = [],
    groupsLabel = 'groups',
    highlight,
    status,
    title,
  } = props
  const state = getBlockState(status, groups.length === 0)
  const highlighted = categories.find((category) => category.key === highlight)
  const rows = groups
    .map((group) => {
      const total = categories.reduce(
        (sum, category) => sum + (group.values[category.key] ?? 0),
        0,
      )
      const leader = categories.reduce<CompositionCategory | undefined>(
        (best, category) =>
          best && (group.values[best.key] ?? 0) >= (group.values[category.key] ?? 0)
            ? best
            : category,
        undefined,
      )
      return {
        group,
        leads: leader?.key === highlight,
        share: total > 0 ? (group.values[highlight] ?? 0) / total : 0,
        total,
      }
    })
    .sort((a, b) => b.share - a.share)
  const leads = rows.filter((row) => row.leads).length

  return (
    <BlockStateProvider status={status} empty={groups.length === 0}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <div className='flex flex-col gap-3 border-t pt-4'>
          {state ? (
            <BlockStateText className='text-sm' />
          ) : (
            highlighted && (
              <p className='text-muted-foreground text-sm'>
                <span className='text-foreground font-medium'>{highlighted.label}</span>{' '}
                leads in {leads} of {rows.length} {groupsLabel}.
              </p>
            )
          )}
          <BreakdownLegend
            items={categories.map((category) => ({
              color: category.color,
              label: category.label,
            }))}
          />
        </div>
        {state === 'loading' && <BlockStateRows rows={5} />}
        {!state && (
          <table className='w-full text-sm'>
            <caption className='sr-only'>{`${title}: ${description}`}</caption>
            <thead className='text-muted-foreground text-xs'>
              <tr className='border-b'>
                <th scope='col' className='pb-2 text-left font-normal'>
                  <span className='sr-only'>Group</span>
                </th>
                <th scope='col' className='pb-2 font-normal'>
                  <span className='sr-only'>Share by category</span>
                </th>
                <th scope='col' className='pb-2 text-right font-normal'>
                  {highlighted?.label}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ group, share, total }) => (
                <tr key={group.label} className='border-b last:border-b-0'>
                  <th
                    scope='row'
                    className='w-32 py-2.5 pr-4 text-left font-normal whitespace-nowrap'
                  >
                    {group.label}
                  </th>
                  <td className='py-2.5'>
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
                  <td className='w-14 py-2.5 pl-4 text-right tabular-nums'>
                    {formatShare(share, 1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Breakdown2, exampleProps as breakdown2ExampleProps, type Breakdown2Props }
