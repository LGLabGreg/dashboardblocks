'use client'

import { Link } from '@/registry/components/dashboardblocks/link'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { Fragment, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { cn } from '@/lib/utils'

function PageHeader({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <header className={cn('@container/page-header flex flex-col gap-4', className)}>
      {children}
    </header>
  )
}

function PageHeaderRow({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 @2xl/page-header:flex-row @2xl/page-header:items-start @2xl/page-header:justify-between',
        className,
      )}
    >
      {children}
    </div>
  )
}

interface PageHeaderHeadingProps {
  badge?: ReactNode
  className?: string
  description?: ReactNode
  media?: ReactNode
  title: ReactNode
  wrap?: boolean
}

function PageHeaderHeading({
  badge,
  className,
  description,
  media,
  title,
  wrap = false,
}: PageHeaderHeadingProps) {
  return (
    <div className={cn('flex min-w-0 items-start gap-3', className)}>
      {media}
      <div className='flex min-w-0 flex-col gap-0.5'>
        <div className='flex min-w-0 flex-wrap items-center gap-2'>
          <h1
            className={cn(
              'text-2xl font-semibold tracking-tight',
              wrap ? 'break-words text-balance' : 'truncate',
            )}
          >
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className='text-muted-foreground text-sm text-pretty'>{description}</p>
        )}
      </div>
    </div>
  )
}

function PageHeaderActions({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex shrink-0 flex-wrap items-center gap-2', className)}>
      {children}
    </div>
  )
}

interface PageHeaderFact {
  detail?: ReactNode
  label: string
  value: ReactNode
}

function PageHeaderFacts({
  className,
  items,
}: {
  className?: string
  items: PageHeaderFact[]
}) {
  return (
    <dl
      className={cn(
        'grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-4 @2xl/page-header:flex @2xl/page-header:gap-x-12',
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className='flex min-w-0 flex-col gap-1'>
          <dt className='text-muted-foreground text-sm'>{item.label}</dt>
          <dd className='text-2xl font-light tracking-tight tabular-nums'>
            {item.value}
          </dd>
          {item.detail && (
            <dd className='text-muted-foreground text-xs text-pretty'>{item.detail}</dd>
          )}
        </div>
      ))}
    </dl>
  )
}

function BackLink({
  children,
  className,
  href,
}: {
  children: ReactNode
  className?: string
  href: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        'text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex w-fit items-center gap-1 rounded-md text-sm outline-none focus-visible:ring-[3px] [&_svg]:size-4 [&_svg]:shrink-0',
        className,
      )}
    >
      <IconPlaceholder
        lucide='ChevronLeftIcon'
        tabler='IconChevronLeft'
        hugeicons='ArrowLeft01Icon'
        phosphor='CaretLeftIcon'
        remixicon='RiArrowLeftSLine'
      />
      {children}
    </Link>
  )
}

interface PageTab {
  badge?: ReactNode
  href: string
  title: string
}

function PageTabs({
  className,
  items,
  label = 'Sections',
  pathname,
}: {
  className?: string
  items: PageTab[]
  label?: string
  pathname: string
}) {
  return (
    <nav aria-label={label} className={cn('border-b', className)}>
      <div className='-mb-px flex gap-1 overflow-x-auto [scrollbar-width:none]'>
        {items.map((item) => {
          const active = item.href === pathname
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              data-active={active || undefined}
              className='text-muted-foreground hover:text-foreground data-active:border-foreground data-active:text-foreground focus-visible:ring-ring/50 flex shrink-0 items-center gap-1.5 rounded-t-md border-b-2 border-transparent px-3 py-2.5 text-sm font-medium whitespace-nowrap outline-none focus-visible:ring-[3px]'
            >
              {item.title}
              {item.badge !== undefined && (
                <span className='text-muted-foreground font-normal tabular-nums'>
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

interface ActionsMenuItem {
  icon?: ReactNode
  label: string
  onSelect: () => void
  variant?: 'default' | 'destructive'
}

function ActionsMenu({
  disabled = false,
  items,
  label = 'More actions',
}: {
  disabled?: boolean
  items: ActionsMenuItem[]
  /** @default 'More actions' */
  label?: string
}) {
  const firstDestructive = items.findIndex((item) => item.variant === 'destructive')
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        render={<Button variant='outline' size='icon' aria-label={label} />}
      >
        <IconPlaceholder
          lucide='EllipsisIcon'
          tabler='IconDots'
          hugeicons='MoreHorizontalCircle01Icon'
          phosphor='DotsThreeIcon'
          remixicon='RiMoreLine'
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-auto min-w-44'>
        {items.map((item, index) => (
          <Fragment key={item.label}>
            {index === firstDestructive && index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem variant={item.variant} onClick={item.onSelect}>
              {item.icon}
              {item.label}
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export {
  ActionsMenu,
  BackLink,
  PageHeader,
  PageHeaderActions,
  PageHeaderFacts,
  PageHeaderHeading,
  PageHeaderRow,
  PageTabs,
}

export type { ActionsMenuItem, PageHeaderFact, PageHeaderHeadingProps, PageTab }
