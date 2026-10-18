'use client'

import {
  formatProvenanceFilters,
  formatProvenanceWindow,
} from '@/registry/components/dashboardblocks/kpi-provenance-format'
import { Link } from '@/registry/components/dashboardblocks/link'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useId, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'

import { cn } from '@/lib/utils'

interface Provenance {
  query: string
  description: string
  /** The time range counted, shown as dates in the reader's time zone with `to` as the last day counted, or null for all time. */
  window: { from: Date; to: Date } | null
  filters: Record<string, string>
  href: string
}

interface KPIProvenanceProps {
  className?: string
  /** The button's name and the popover's title, 'How is this computed?' by default. */
  label?: string
  provenance: Provenance
}

function KPIProvenance({
  className,
  label = 'How is this computed?',
  provenance,
}: KPIProvenanceProps) {
  const [open, setOpen] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  return (
    <span className={cn('inline-flex h-lh items-center align-top', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={<Button variant='ghost' size='icon-sm' aria-label={label} />}
        >
          <IconPlaceholder
            lucide='CircleHelpIcon'
            tabler='IconHelp'
            hugeicons='HelpCircleIcon'
            phosphor='QuestionIcon'
            remixicon='RiQuestionLine'
          />
        </PopoverTrigger>
        <PopoverContent
          ref={popupRef}
          initialFocus={popupRef}
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          align='start'
          className='max-w-[calc(100vw-2rem)]'
        >
          <PopoverHeader>
            <PopoverTitle id={titleId}>{label}</PopoverTitle>
            <PopoverDescription id={descriptionId} className='text-pretty'>
              {provenance.description}
            </PopoverDescription>
          </PopoverHeader>
          <KPIProvenanceDetails
            provenance={provenance}
            onFollowLink={() => setOpen(false)}
          />
        </PopoverContent>
      </Popover>
    </span>
  )
}

function KPIProvenanceDetails({
  onFollowLink,
  provenance,
}: {
  onFollowLink: () => void
  provenance: Provenance
}) {
  const filters = formatProvenanceFilters(provenance.filters)
  return (
    <>
      <div
        role='region'
        aria-label='Details'
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrolling region must be focusable so keyboard users can scroll it
        tabIndex={0}
        className='max-h-60 overflow-y-auto rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
      >
        <dl className='flex flex-col gap-2'>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground'>Window</dt>
            <dd className='tabular-nums'>{formatProvenanceWindow(provenance.window)}</dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground'>Filters</dt>
            {filters.length === 0 ? (
              <dd>None</dd>
            ) : (
              filters.map((filter) => (
                <dd key={filter} className='break-words'>
                  {filter}
                </dd>
              ))
            )}
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground'>Query</dt>
            <dd>
              <code dir='ltr' className='font-mono break-all'>
                {provenance.query}
              </code>
            </dd>
          </div>
        </dl>
      </div>
      <Link
        href={provenance.href}
        className='self-start font-medium underline underline-offset-4'
        onClick={onFollowLink}
      >
        View the rows
      </Link>
    </>
  )
}

export { KPIProvenance }

export type { KPIProvenanceProps, Provenance }
