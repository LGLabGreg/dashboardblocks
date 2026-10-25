'use client'

import {
  BlockStateRows,
  useBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  type KPIFormat,
  type KPIFormatter,
  KPITitle,
  KPIValue,
} from '@/registry/components/dashboardblocks/kpi'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/utils'

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
      <div className='grid gap-8 @4xl/record:grid-cols-[minmax(0,1fr)_18rem] @4xl/record:gap-10'>
        <div className='flex min-w-0 flex-col gap-8'>{children}</div>
        <aside className='flex min-w-0 flex-col gap-8'>{aside}</aside>
      </div>
    </div>
  )
}

interface RecordSectionProps extends Omit<ComponentProps<'section'>, 'title'> {
  /** Buttons on the right of the title. */
  action?: ReactNode
  description?: ReactNode
  title: string
}

function RecordSection({
  action,
  children,
  className,
  description,
  title,
  ...props
}: RecordSectionProps) {
  return (
    <section
      data-slot='record-section'
      className={cn('flex flex-col gap-3 border-t pt-4', className)}
      {...props}
    >
      <header className='flex items-start justify-between gap-3'>
        <div className='flex min-w-0 flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          {description && <p className='text-muted-foreground text-sm'>{description}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}

interface RecordHeadlineProps {
  /** Lines under the number, such as a `KPIChange` or a muted sentence. */
  children?: ReactNode
  className?: string
  format?: KPIFormat | KPIFormatter
  label: string
  /** Words after the number, such as `a month`. */
  unit?: string
  value: number
}

function RecordHeadline({
  children,
  className,
  format,
  label,
  unit,
  value,
}: RecordHeadlineProps) {
  const state = useBlockState()
  return (
    <div data-slot='record-headline' className={cn('flex flex-col gap-1', className)}>
      <KPITitle>{label}</KPITitle>
      <div className='flex flex-wrap items-baseline'>
        <KPIValue animated format={format} value={value} />
        {unit && !state && (
          <span className='text-muted-foreground ml-1 text-base'>{unit}</span>
        )}
      </div>
      {children}
    </div>
  )
}

function PropertyList({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <dl className={cn('grid gap-3 text-sm', className)}>{children}</dl>
}

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

interface RecordPlaceholderProps {
  /** Titles of the sections sketched in the side column while loading. */
  aside?: string[]
  /** Titles of the sections sketched in the main column while loading. */
  sections: string[]
}

function RecordPlaceholder({ aside = [], sections }: RecordPlaceholderProps) {
  const state = useBlockState()
  if (state !== 'loading') return null

  return (
    <RecordLayout
      aside={aside.map((title) => (
        <RecordSection key={title} title={title}>
          <BlockStateRows rows={3} />
        </RecordSection>
      ))}
    >
      {sections.map((title) => (
        <RecordSection key={title} title={title}>
          <BlockStateRows rows={4} />
        </RecordSection>
      ))}
    </RecordLayout>
  )
}

export {
  Property,
  PropertyList,
  RecordHeadline,
  RecordLayout,
  RecordPlaceholder,
  RecordSection,
}

export type { RecordHeadlineProps, RecordPlaceholderProps, RecordSectionProps }
