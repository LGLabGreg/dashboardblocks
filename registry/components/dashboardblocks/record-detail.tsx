import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * A record's page: the main content, and a narrower column of details beside it
 * on wide screens or below it on narrow ones.
 */
function RecordLayout({
  aside,
  children,
  className,
}: {
  aside: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('@container/record', className)}>
      <div className='grid gap-6 @4xl/record:grid-cols-[minmax(0,1fr)_20rem]'>
        <div className='flex min-w-0 flex-col gap-6'>{children}</div>
        <aside className='flex min-w-0 flex-col gap-6'>{aside}</aside>
      </div>
    </div>
  )
}

/** Labels and values, one pair per row. */
function PropertyList({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <dl className={cn('grid gap-3 text-sm', className)}>{children}</dl>
}

/** One label and value in a PropertyList. */
function Property({
  children,
  className,
  label,
}: {
  children: ReactNode
  className?: string
  label: ReactNode
}) {
  return (
    <div
      className={cn('grid grid-cols-[7rem_minmax(0,1fr)] items-start gap-3', className)}
    >
      <dt className='text-muted-foreground'>{label}</dt>
      <dd className='min-w-0 break-words'>{children}</dd>
    </div>
  )
}

interface RecordStat {
  label: string
  /** A second line, such as a change or a comparison. */
  note?: ReactNode
  value: ReactNode
}

/** Headline numbers for the record, in a row that wraps. */
function RecordStats({ className, items }: { className?: string; items: RecordStat[] }) {
  return (
    <dl
      className={cn(
        'grid grid-cols-2 gap-4 @xl/record:auto-cols-fr @xl/record:grid-flow-col @xl/record:grid-cols-none',
        className,
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className='bg-card text-card-foreground flex flex-col gap-1 rounded-xl p-4 ring-1 ring-foreground/10'
        >
          <dt className='text-muted-foreground text-sm'>{item.label}</dt>
          <dd className='text-xl font-semibold tabular-nums'>{item.value}</dd>
          {item.note && <dd className='text-muted-foreground text-xs'>{item.note}</dd>}
        </div>
      ))}
    </dl>
  )
}

export { Property, PropertyList, RecordLayout, RecordStats }

export type { RecordStat }
