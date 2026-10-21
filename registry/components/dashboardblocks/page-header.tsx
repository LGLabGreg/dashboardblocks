'use client'

import { Link } from '@/registry/components/dashboardblocks/link'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { Fragment, type ReactNode, useEffect, useRef, useState } from 'react'

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
      <TabLinks items={items} pathname={pathname} />
    </nav>
  )
}

interface TabLinksProps {
  className?: string
  /** @default the tab whose href is the pathname */
  isActive?: (href: string) => boolean
  items: PageTab[]
  pathname: string
}

function TabLinks({ className, isActive, items, pathname }: TabLinksProps) {
  const active = (href: string) => (isActive ? isActive(href) : href === pathname)
  const activeHref = items.find((item) => active(item.href))?.href
  const [rail, hiddenHrefs] = useHiddenRailItems<HTMLDivElement>(activeHref, items)
  const hidden = items.filter((item) => hiddenHrefs.includes(item.href))

  return (
    <div
      ref={rail}
      className={cn('relative -mb-px flex min-w-0 gap-1 overflow-hidden', className)}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.href === pathname ? 'page' : undefined}
          data-active={active(item.href) || undefined}
          data-rail='item'
          data-rail-id={item.href}
          className={cn(
            'text-muted-foreground hover:text-foreground data-active:border-foreground data-active:text-foreground focus-visible:ring-ring/50 flex shrink-0 items-center gap-1.5 rounded-t-md border-b-2 border-transparent px-3 py-2.5 text-sm font-medium whitespace-nowrap outline-none focus-visible:ring-[3px]',
            hiddenHrefs.includes(item.href) && 'invisible absolute',
          )}
        >
          {item.title}
          {item.badge !== undefined && (
            <span className='text-muted-foreground font-normal tabular-nums'>
              {item.badge}
            </span>
          )}
        </Link>
      ))}
      {hidden.length > 0 && (
        <div data-rail='more' className='flex shrink-0 items-center'>
          <ActionsMenu
            items={hidden.map((item) => ({
              badge: item.badge,
              href: item.href,
              label: item.title,
            }))}
          >
            More ({hidden.length})
          </ActionsMenu>
        </div>
      )}
    </div>
  )
}

const RAIL_MORE_WIDTH = 96

/**
 * The ids of a rail's items that don't fit beside its More menu, keeping the
 * active one shown. Each item has `data-rail='item'` and a `data-rail-id`;
 * what always shows has `data-rail='fixed'`, and the menu `data-rail='more'`.
 */
function getHiddenRailItems(rail: HTMLElement, activeId: string | undefined) {
  const gap = Number.parseFloat(getComputedStyle(rail).columnGap) || 0
  const parts = (kind: string) => [
    ...rail.querySelectorAll<HTMLElement>(`:scope > [data-rail='${kind}']`),
  ]
  const items = parts('item').map((item) => ({
    id: item.dataset.railId ?? '',
    width: item.offsetWidth,
  }))
  const fixed = parts('fixed').reduce((sum, item) => sum + item.offsetWidth + gap, 0)
  const ordered = [
    ...items.filter((item) => item.id === activeId),
    ...items.filter((item) => item.id !== activeId),
  ]
  const hiddenIn = (room: number) => {
    let used = fixed
    const shown = new Set<string>()
    for (const item of ordered) {
      if (used + item.width > room) break
      used += item.width + gap
      shown.add(item.id)
    }
    return items.filter((item) => !shown.has(item.id)).map((item) => item.id)
  }
  if (hiddenIn(rail.clientWidth).length === 0) return []
  const more = parts('more')[0]?.offsetWidth ?? RAIL_MORE_WIDTH
  return hiddenIn(rail.clientWidth - more - gap)
}

/** Measures the rail on every resize and when `items` change; see `getHiddenRailItems`. */
function useHiddenRailItems<T extends HTMLElement>(
  activeId: string | undefined,
  items: unknown,
) {
  const rail = useRef<T>(null)
  const [hidden, setHidden] = useState<string[]>([])
  useEffect(() => {
    const element = rail.current
    if (!element) return
    const observer = new ResizeObserver(() => {
      const next = getHiddenRailItems(element, activeId)
      setHidden((current) => (current.join('\n') === next.join('\n') ? current : next))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [activeId, items])
  return [rail, hidden] as const
}

interface ActionsMenuItem {
  /** Shown after the label, such as a count. */
  badge?: ReactNode
  /** Makes the item a link. */
  href?: string
  icon?: ReactNode
  label: string
  onSelect?: () => void
  variant?: 'default' | 'destructive'
}

function ActionsMenu({
  children,
  disabled = false,
  items,
  label = 'More actions',
}: {
  /** A text trigger, such as "More (3)", in place of the icon button. */
  children?: ReactNode
  disabled?: boolean
  items: ActionsMenuItem[]
  /** Names the icon button. @default 'More actions' */
  label?: string
}) {
  const firstDestructive = items.findIndex((item) => item.variant === 'destructive')
  return (
    <DropdownMenu>
      {children ? (
        <DropdownMenuTrigger
          disabled={disabled}
          render={<Button variant='ghost' size='sm' />}
        >
          {children}
        </DropdownMenuTrigger>
      ) : (
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
      )}
      <DropdownMenuContent align='end' className='w-auto min-w-44'>
        {items.map((item, index) => (
          <Fragment key={item.label}>
            {index === firstDestructive && index > 0 && <DropdownMenuSeparator />}
            {item.href ? (
              <DropdownMenuItem
                variant={item.variant}
                render={<Link href={item.href} />}
                onClick={item.onSelect}
              >
                <ActionsMenuItemContent item={item} />
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem variant={item.variant} onClick={item.onSelect}>
                <ActionsMenuItemContent item={item} />
              </DropdownMenuItem>
            )}
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ActionsMenuItemContent({ item }: { item: ActionsMenuItem }) {
  return (
    <>
      {item.icon}
      {item.label}
      {item.badge !== undefined && (
        <span className='text-muted-foreground ms-auto ps-4 tabular-nums'>
          {item.badge}
        </span>
      )}
    </>
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
  TabLinks,
  getHiddenRailItems,
  useHiddenRailItems,
}

export type {
  ActionsMenuItem,
  PageHeaderFact,
  PageHeaderHeadingProps,
  PageTab,
  TabLinksProps,
}
