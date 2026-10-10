'use client'

import { Link } from '@/registry/components/dashboardblocks/link'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { Fragment, type ReactNode, useEffect, useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Kbd } from '@/components/ui/kbd'
import { Progress } from '@/components/ui/progress'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

import { cn } from '@/lib/utils'

interface NavLink {
  badge?: ReactNode
  href: string
  title: string
}

interface NavItem {
  badge?: ReactNode
  /** Leave out when the item only groups `items`. */
  href?: string
  icon: ReactNode
  items?: NavLink[]
  title: string
}

interface NavSection {
  items: NavItem[]
  label?: string
}

function useCloseMobileSidebar() {
  const { isMobile, setOpenMobile } = useSidebar()
  return () => {
    if (isMobile) setOpenMobile(false)
  }
}

function isActiveHref(href: string, pathname: string) {
  if (href === pathname) return true
  return href !== '/' && pathname.startsWith(`${href.replace(/\/$/, '')}/`)
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

interface AppNavProps {
  className?: string
  pathname: string
  sections: NavSection[]
}

function AppNav({ className, pathname, sections }: AppNavProps) {
  return (
    <TooltipProvider>
      {sections.map((section, index) => (
        <SidebarGroup key={section.label ?? index} className={className}>
          {section.label && <SidebarGroupLabel>{section.label}</SidebarGroupLabel>}
          <SidebarMenu>
            {section.items.map((item) => (
              <AppNavItem key={item.title} item={item} pathname={pathname} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </TooltipProvider>
  )
}

function useRailTooltip() {
  const { isMobile } = useSidebar()
  return (label: string) => (isMobile ? undefined : label)
}

function AppNavItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const { setOpen, state } = useSidebar()
  const closeMobile = useCloseMobileSidebar()
  const railTooltip = useRailTooltip()
  const childActive =
    item.items?.some((child) => isActiveHref(child.href, pathname)) ?? false
  const [expanded, setExpanded] = useState(childActive)
  const [wasChildActive, setWasChildActive] = useState(childActive)
  if (childActive !== wasChildActive) {
    setWasChildActive(childActive)
    if (childActive) setExpanded(true)
  }

  if (!item.items?.length) {
    const active = item.href !== undefined && isActiveHref(item.href, pathname)
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={active}
          tooltip={railTooltip(item.title)}
          render={
            <Link
              href={item.href}
              aria-current={item.href === pathname ? 'page' : undefined}
              onClick={closeMobile}
            />
          }
        >
          {item.icon}
          <span>{item.title}</span>
        </SidebarMenuButton>
        {item.badge !== undefined && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible
      open={expanded}
      onOpenChange={setExpanded}
      className='group/collapsible'
      render={<SidebarMenuItem />}
    >
      <CollapsibleTrigger
        render={
          <SidebarMenuButton
            tooltip={railTooltip(item.title)}
            onClick={() => state === 'collapsed' && setOpen(true)}
          />
        }
      >
        {item.icon}
        <span>{item.title}</span>
        <IconPlaceholder
          lucide='ChevronRightIcon'
          tabler='IconChevronRight'
          hugeicons='ArrowRight01Icon'
          phosphor='CaretRightIcon'
          remixicon='RiArrowRightSLine'
          className='ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90'
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {item.items.map((child) => (
            <SidebarMenuSubItem key={child.href}>
              <SidebarMenuSubButton
                render={<Link href={child.href} onClick={closeMobile} />}
                isActive={isActiveHref(child.href, pathname)}
                aria-current={child.href === pathname ? 'page' : undefined}
              >
                <span>{child.title}</span>
                {child.badge !== undefined && (
                  <span className='text-muted-foreground ml-auto text-xs tabular-nums'>
                    {child.badge}
                  </span>
                )}
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  )
}

interface AppBrandProps {
  description?: ReactNode
  href: string
  logo: ReactNode
  name: string
}

function AppBrand({ description, href, logo, name }: AppBrandProps) {
  const closeMobile = useCloseMobileSidebar()
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size='lg' render={<Link href={href} onClick={closeMobile} />}>
          <BrandMark>{logo}</BrandMark>
          <span className='grid flex-1 text-left text-sm leading-tight'>
            <span className='truncate font-medium'>{name}</span>
            {description && <span className='truncate text-xs'>{description}</span>}
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function BrandMark({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4',
        className,
      )}
    >
      {children}
    </span>
  )
}

interface Workspace {
  id: string
  logo: ReactNode
  name: string
  plan?: string
}

interface WorkspaceSwitcherProps {
  /** Adds a "New workspace…" item. */
  onCreate?: () => void
  onValueChange: (id: string) => void
  value: string
  workspaces: Workspace[]
}

function WorkspaceSwitcher({
  onCreate,
  onValueChange,
  value,
  workspaces,
}: WorkspaceSwitcherProps) {
  const { isMobile } = useSidebar()
  const current = workspaces.find((workspace) => workspace.id === value) ?? workspaces[0]
  if (!current) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<SidebarMenuButton size='lg' className='aria-expanded:bg-muted' />}
          >
            <BrandMark>{current.logo}</BrandMark>
            <span className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-medium'>{current.name}</span>
              {current.plan && <span className='truncate text-xs'>{current.plan}</span>}
            </span>
            <IconPlaceholder
              lucide='ChevronsUpDownIcon'
              tabler='IconSelector'
              hugeicons='UnfoldMoreIcon'
              phosphor='CaretUpDownIcon'
              remixicon='RiArrowUpDownLine'
              className='ml-auto'
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='min-w-56'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
              {workspaces.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.id}
                  onClick={() => onValueChange(workspace.id)}
                >
                  <BrandMark className='size-6 rounded-md [&_svg]:size-3.5'>
                    {workspace.logo}
                  </BrandMark>
                  {workspace.name}
                  {workspace.id === current.id && (
                    <>
                      <span className='sr-only'>(current)</span>
                      <IconPlaceholder
                        lucide='CheckIcon'
                        tabler='IconCheck'
                        hugeicons='Tick02Icon'
                        phosphor='CheckIcon'
                        remixicon='RiCheckLine'
                        className='ml-auto'
                      />
                    </>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            {onCreate && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onCreate}>
                  <IconPlaceholder
                    lucide='PlusIcon'
                    tabler='IconPlus'
                    hugeicons='PlusSignIcon'
                    phosphor='PlusIcon'
                    remixicon='RiAddLine'
                  />
                  New workspace…
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

interface AppUser {
  avatar?: string
  email: string
  name: string
}

interface UserMenuLink {
  href: string
  icon: ReactNode
  label: string
}

interface UserMenuProps {
  links: UserMenuLink[]
  onSignOut: () => void
  user: AppUser
}

function UserAvatar({ className, user }: { className?: string; user: AppUser }) {
  return (
    <Avatar className={className}>
      {user.avatar && <AvatarImage src={user.avatar} alt='' />}
      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
    </Avatar>
  )
}

function UserSummary({ user }: { user: AppUser }) {
  return (
    <span className='grid flex-1 text-left text-sm leading-tight'>
      <span className='truncate font-medium'>{user.name}</span>
      <span className='truncate text-xs'>{user.email}</span>
    </span>
  )
}

function UserMenuItems({
  links,
  onNavigate,
  onSignOut,
  user,
}: UserMenuProps & { onNavigate?: () => void }) {
  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuLabel className='flex items-center gap-2 font-normal'>
          <UserAvatar user={user} />
          <UserSummary user={user} />
        </DropdownMenuLabel>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      {links.length > 0 && (
        <>
          <DropdownMenuGroup>
            {links.map((link) => (
              <DropdownMenuItem
                key={link.href}
                render={<Link href={link.href} onClick={onNavigate} />}
              >
                {link.icon}
                {link.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
        </>
      )}
      <DropdownMenuItem onClick={onSignOut}>
        <IconPlaceholder
          lucide='LogOutIcon'
          tabler='IconLogout'
          hugeicons='Logout01Icon'
          phosphor='SignOutIcon'
          remixicon='RiLogoutBoxLine'
        />
        Sign out
      </DropdownMenuItem>
    </>
  )
}

function SidebarUserMenu(props: UserMenuProps) {
  const { isMobile } = useSidebar()
  const closeMobile = useCloseMobileSidebar()
  const railTooltip = useRailTooltip()
  return (
    <TooltipProvider>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size='lg'
                  tooltip={railTooltip(props.user.name)}
                  className='aria-expanded:bg-muted'
                />
              }
            >
              <UserAvatar user={props.user} />
              <UserSummary user={props.user} />
              <IconPlaceholder
                lucide='ChevronsUpDownIcon'
                tabler='IconSelector'
                hugeicons='UnfoldMoreIcon'
                phosphor='CaretUpDownIcon'
                remixicon='RiArrowUpDownLine'
                className='ml-auto'
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='min-w-56'
              align='end'
              side={isMobile ? 'bottom' : 'right'}
            >
              <UserMenuItems {...props} onNavigate={closeMobile} />
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </TooltipProvider>
  )
}

function UserMenu(props: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant='ghost'
            size='icon'
            className='rounded-full'
            aria-label={`Account: ${props.user.name}`}
          />
        }
      >
        <UserAvatar user={props.user} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className='min-w-56' align='end'>
        <UserMenuItems {...props} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface AppHeaderProps {
  children: ReactNode
  className?: string
}

function AppHeader({ children, className }: AppHeaderProps) {
  return (
    <header
      className={cn(
        'bg-background sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b px-4',
        className,
      )}
    >
      {children}
    </header>
  )
}

interface Crumb {
  /** Leave out for the current page. */
  href?: string
  label: string
}

function AppBreadcrumbs({ className, items }: { className?: string; items: Crumb[] }) {
  return (
    <Breadcrumb className={cn('min-w-0', className)}>
      <BreadcrumbList className='flex-nowrap'>
        {items.map((item, index) => {
          const last = index === items.length - 1
          return (
            <Fragment key={`${item.label}-${index}`}>
              <BreadcrumbItem
                className={cn(
                  'min-w-0',
                  last ? 'max-w-full shrink-0' : 'hidden md:inline-flex',
                )}
              >
                {last ? (
                  <BreadcrumbPage className='truncate'>{item.label}</BreadcrumbPage>
                ) : item.href ? (
                  <BreadcrumbLink
                    className='truncate'
                    title={item.label}
                    render={<Link href={item.href} />}
                  >
                    {item.label}
                  </BreadcrumbLink>
                ) : (
                  <span className='truncate' title={item.label}>
                    {item.label}
                  </span>
                )}
              </BreadcrumbItem>
              {!last && <BreadcrumbSeparator className='hidden md:inline-flex' />}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

interface SearchButtonProps {
  className?: string
  onOpen: () => void
  /** @default 'Search…' */
  placeholder?: string
}

function SearchButton({ className, onOpen, placeholder = 'Search…' }: SearchButtonProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Chrome's autofill sends keydown events without a key.
      if (event.key?.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        onOpen()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onOpen])

  return (
    <Button
      variant='outline'
      onClick={onOpen}
      aria-label={placeholder}
      aria-keyshortcuts='Meta+K Control+K'
      className={cn(
        'max-sm:aspect-square max-sm:px-0 sm:w-56 sm:justify-start',
        className,
      )}
    >
      <IconPlaceholder
        lucide='SearchIcon'
        tabler='IconSearch'
        hugeicons='SearchIcon'
        phosphor='MagnifyingGlassIcon'
        remixicon='RiSearchLine'
      />
      <span className='max-sm:sr-only'>{placeholder}</span>
      <Kbd className='ml-auto max-sm:hidden'>⌘K</Kbd>
    </Button>
  )
}

interface NotificationsButtonProps {
  className?: string
  count: number
  onClick: () => void
}

function NotificationsButton({ className, count, onClick }: NotificationsButtonProps) {
  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={onClick}
      aria-label={count > 0 ? `Notifications, ${count} unread` : 'Notifications'}
      className={cn('relative', className)}
    >
      <IconPlaceholder
        lucide='BellIcon'
        tabler='IconBell'
        hugeicons='NotificationIcon'
        phosphor='BellIcon'
        remixicon='RiNotificationLine'
      />
      {count > 0 && (
        <span className='bg-primary ring-background absolute top-1.5 right-1.5 size-2 rounded-full ring-2' />
      )}
    </Button>
  )
}

interface PlanUsageProps {
  action?: { href: string; label: string }
  limit: number
  unit: string
  title: string
  used: number
}

const countFormatter = new Intl.NumberFormat('en-US')

function PlanUsage({ action, limit, title, unit, used }: PlanUsageProps) {
  const closeMobile = useCloseMobileSidebar()
  const percent = limit > 0 ? Math.min(100, (used / limit) * 100) : 0
  return (
    <div className='bg-background flex flex-col gap-3 rounded-lg border p-3 text-sm group-data-[collapsible=icon]:hidden'>
      <div className='flex flex-col gap-1'>
        <span className='font-medium'>{title}</span>
        <span className='text-muted-foreground text-xs'>
          {countFormatter.format(used)} of {countFormatter.format(limit)} {unit}
        </span>
      </div>
      <Progress value={percent} aria-label={`${title}: ${Math.round(percent)}% used`} />
      {action && (
        <Link
          href={action.href}
          onClick={closeMobile}
          className={buttonVariants({ size: 'sm' })}
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}

interface TopNavProps {
  className?: string
  items: NavLink[]
  pathname: string
}

function TopNav({ className, items, pathname }: TopNavProps) {
  return (
    <nav
      aria-label='Main'
      className={cn(
        '-mb-px flex gap-1 overflow-x-auto [scrollbar-width:none]',
        className,
      )}
    >
      {items.map((item) => {
        const active = isActiveHref(item.href, pathname)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={item.href === pathname ? 'page' : undefined}
            data-active={active || undefined}
            className='text-muted-foreground hover:text-foreground data-active:border-foreground data-active:text-foreground focus-visible:ring-ring/50 flex shrink-0 items-center gap-1.5 rounded-t-md border-b-2 border-transparent px-3 py-2.5 text-sm font-medium whitespace-nowrap outline-none focus-visible:ring-[3px]'
          >
            {item.title}
            {item.badge !== undefined && (
              <span className='bg-muted text-foreground rounded-full px-1.5 text-xs tabular-nums'>
                {item.badge}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export {
  AppBrand,
  AppBreadcrumbs,
  AppHeader,
  AppNav,
  BrandMark,
  getInitials,
  isActiveHref,
  NotificationsButton,
  PlanUsage,
  SearchButton,
  SidebarUserMenu,
  TopNav,
  UserMenu,
  WorkspaceSwitcher,
}

export type {
  AppBrandProps,
  AppHeaderProps,
  AppNavProps,
  AppUser,
  Crumb,
  NavItem,
  NavLink,
  NavSection,
  NotificationsButtonProps,
  PlanUsageProps,
  SearchButtonProps,
  TopNavProps,
  UserMenuLink,
  UserMenuProps,
  Workspace,
  WorkspaceSwitcherProps,
}
