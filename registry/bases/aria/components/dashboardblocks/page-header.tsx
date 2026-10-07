// Override of registry/components/dashboardblocks/page-header.tsx for React Aria
// source-hash: e4df895a3493

'use client'

import { Link } from '@/registry/components/dashboardblocks/link'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { Fragment, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { cn } from '@/lib/utils'

/** The top of a page: put a back link, the heading, actions, meta and tabs in it. */
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

/** The heading beside its actions on wide headers, above them on narrow ones. */
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
  /** Beside the title, such as a status badge or a count. */
  badge?: ReactNode
  className?: string
  description?: ReactNode
  /** Before the title, such as an avatar or a logo tile. */
  media?: ReactNode
  title: string
  /**
   * Lets a long title wrap onto more lines, such as a record's name, where
   * cutting it short would hide what the page is about.
   * @default false
   */
  wrap?: boolean
}

/** The page's title as its <h1>, with an optional badge, media and description. */
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
      <div className='flex min-w-0 flex-col gap-1'>
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

/** Buttons for the page, the main one last. They wrap on narrow headers. */
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

interface PageHeaderMetaItem {
  icon: ReactNode
  label: ReactNode
}

/** Facts about the page's subject in a row, each with an icon. */
function PageHeaderMeta({
  className,
  items,
}: {
  className?: string
  items: PageHeaderMetaItem[]
}) {
  return (
    <ul
      className={cn(
        'text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm [&_svg]:size-4 [&_svg]:shrink-0',
        className,
      )}
    >
      {items.map((item, index) => (
        <li key={index} className='flex items-center gap-1.5'>
          {item.icon}
          {item.label}
        </li>
      ))}
    </ul>
  )
}

/** A link back to the parent page, above the heading. */
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
  /** A count or short label after the title. */
  badge?: ReactNode
  href: string
  title: string
}

/** Links to the page's sections, under the heading. Scrolls sideways on small screens. */
function PageTabs({
  className,
  items,
  label = 'Sections',
  pathname,
}: {
  className?: string
  items: PageTab[]
  /** Names the navigation for screen readers. @default 'Sections' */
  label?: string
  /** The current path, used to mark the active tab. */
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
                <span className='bg-muted text-muted-foreground rounded-full px-1.5 text-xs tabular-nums'>
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
  /** Red, for actions like delete. Put these last. */
  variant?: 'default' | 'destructive'
}

/** A "More actions" button with a menu of the page's less common actions. */
function ActionsMenu({
  items,
  label = 'More actions',
}: {
  items: ActionsMenuItem[]
  /** @default 'More actions' */
  label?: string
}) {
  const firstDestructive = items.findIndex((item) => item.variant === 'destructive')
  return (
    <DropdownMenuTrigger>
      <Button variant='outline' size='icon' aria-label={label}>
        <IconPlaceholder
          lucide='EllipsisIcon'
          tabler='IconDots'
          hugeicons='MoreHorizontalCircle01Icon'
          phosphor='DotsThreeIcon'
          remixicon='RiMoreLine'
        />
      </Button>
      <DropdownMenu placement='bottom end' className='w-auto min-w-44'>
        {items.map((item, index) => (
          <Fragment key={item.label}>
            {index === firstDestructive && index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              variant={item.variant}
              textValue={item.label}
              onAction={item.onSelect}
            >
              {item.icon}
              {item.label}
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenu>
    </DropdownMenuTrigger>
  )
}

export {
  ActionsMenu,
  BackLink,
  PageHeader,
  PageHeaderActions,
  PageHeaderHeading,
  PageHeaderMeta,
  PageHeaderRow,
  PageTabs,
}

export type { ActionsMenuItem, PageHeaderHeadingProps, PageHeaderMetaItem, PageTab }
