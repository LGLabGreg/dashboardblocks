'use client'

import {
  BreakdownLegend,
  useReveal,
} from '@/registry/components/dashboardblocks/breakdown'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface ShareShift {
  current: number
  label: string
  previous: number
}

interface Breakdown4Props {
  currentLabel: string
  description: string
  items: ShareShift[]
  previousLabel: string
  title: string
}

const exampleProps: Breakdown4Props = {
  currentLabel: 'This quarter',
  description: 'Share of new signups by acquisition channel',
  items: [
    { current: 34.2, label: 'Organic search', previous: 29.8 },
    { current: 22.6, label: 'Direct', previous: 24.1 },
    { current: 18.9, label: 'Paid social', previous: 13.4 },
    { current: 14.1, label: 'Referral', previous: 17.2 },
    { current: 10.2, label: 'Email', previous: 15.5 },
  ],
  previousLabel: 'Last quarter',
  title: 'Channel share shift',
}

const CURRENT_COLOR = 'var(--chart-1)'
const PREVIOUS_COLOR =
  'color-mix(in oklab, var(--chart-1) 45%, var(--color-muted-foreground))'

const Breakdown4 = (props: Breakdown4Props) => {
  const { currentLabel, description, items, previousLabel, title } = props
  const { ref, revealed } = useReveal<HTMLTableSectionElement>(true)
  const values = items.flatMap((item) => [item.current, item.previous])
  // Pad the data range so the extreme dots sit inside the track.
  const pad = (Math.max(...values) - Math.min(...values)) * 0.1 || 1
  const min = Math.max(0, Math.min(...values) - pad)
  const max = Math.max(...values) + pad
  const scale = (value: number) => `${((value - min) / (max - min)) * 100}%`

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <BreakdownLegend
          items={[
            { color: PREVIOUS_COLOR, label: previousLabel },
            { color: CURRENT_COLOR, label: currentLabel },
          ]}
        />
        <table className='w-full text-sm'>
          <caption className='sr-only'>{`${title}: ${description}`}</caption>
          <thead className='sr-only'>
            <tr>
              <th scope='col'>Channel</th>
              <th scope='col'>{previousLabel}</th>
              <th scope='col'>{currentLabel}</th>
              <th scope='col'>Change</th>
            </tr>
          </thead>
          <tbody ref={ref}>
            {items.map((item) => {
              const delta = item.current - item.previous
              const low = Math.min(item.current, item.previous)
              const high = Math.max(item.current, item.previous)
              return (
                <tr key={item.label}>
                  <th
                    scope='row'
                    className='w-32 py-2.5 pr-4 text-left font-normal whitespace-nowrap'
                  >
                    {item.label}
                  </th>
                  <td className='sr-only'>{item.previous.toFixed(1)}%</td>
                  <td className='w-full py-2.5' aria-hidden>
                    <div className='relative h-3'>
                      <div className='bg-border absolute inset-x-0 top-1/2 h-px -translate-y-1/2' />
                      <div
                        className='absolute top-1/2 h-0.5 -translate-y-1/2 rounded-full transition-[left,width] duration-700 ease-out motion-reduce:transition-none'
                        style={{
                          backgroundColor: PREVIOUS_COLOR,
                          left: revealed ? scale(low) : scale(item.previous),
                          width: revealed ? `calc(${scale(high)} - ${scale(low)})` : '0%',
                        }}
                      />
                      <span
                        className='ring-card absolute top-1/2 size-2.5 -translate-1/2 rounded-full ring-2'
                        style={{
                          backgroundColor: PREVIOUS_COLOR,
                          left: scale(item.previous),
                        }}
                      />
                      <span
                        className='ring-card absolute top-1/2 size-2.5 -translate-1/2 rounded-full ring-2 transition-[left] duration-700 ease-out motion-reduce:transition-none'
                        style={{
                          backgroundColor: CURRENT_COLOR,
                          left: revealed ? scale(item.current) : scale(item.previous),
                        }}
                      />
                    </div>
                  </td>
                  <td className='w-14 py-2.5 pl-4 text-right font-medium tabular-nums'>
                    {item.current.toFixed(1)}%
                  </td>
                  <td className='text-muted-foreground py-2.5 pl-2 text-right text-xs whitespace-nowrap tabular-nums'>
                    <span className='inline-flex items-center justify-end gap-0.5'>
                      {delta > 0 ? (
                        <IconPlaceholder
                          lucide='ArrowUpIcon'
                          tabler='IconArrowUp'
                          hugeicons='ArrowUpIcon'
                          phosphor='ArrowUpIcon'
                          remixicon='RiArrowUpLine'
                          aria-hidden
                          className='size-3'
                        />
                      ) : delta < 0 ? (
                        <IconPlaceholder
                          lucide='ArrowDownIcon'
                          tabler='IconArrowDown'
                          hugeicons='ArrowDown01Icon'
                          phosphor='ArrowDownIcon'
                          remixicon='RiArrowDownLine'
                          aria-hidden
                          className='size-3'
                        />
                      ) : (
                        <IconPlaceholder
                          lucide='MinusIcon'
                          tabler='IconMinus'
                          hugeicons='MinusSignIcon'
                          phosphor='MinusIcon'
                          remixicon='RiSubtractLine'
                          aria-hidden
                          className='size-3'
                        />
                      )}
                      <span className='sr-only'>
                        {delta > 0 ? 'Up' : delta < 0 ? 'Down' : 'No change'}
                      </span>
                      {Math.abs(delta).toFixed(1)} pts
                    </span>
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

export { Breakdown4, exampleProps as breakdown4ExampleProps, type Breakdown4Props }
