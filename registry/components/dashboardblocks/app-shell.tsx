'use client'

import { isPlainClick, Link } from '@/registry/components/dashboardblocks/link'
import { TabLinks } from '@/registry/components/dashboardblocks/page-header'
import {
  StatusLabel,
  type StatusTone,
} from '@/registry/components/dashboardblocks/status-label'
import { renderTag } from '@/registry/components/dashboardblocks/tag'
import { UsageBar } from '@/registry/components/dashboardblocks/usage-meter'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatNumber, formatPercent } from '@/registry/lib/dashboardblocks/format'
import {
  Fragment,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

import { cn } from '@/lib/utils'

interface NavLink {
  badge?: ReactNode
  href: string
  /** Shown before the title. */
  icon?: ReactNode
  title: string
}

interface NavItem {
  badge?: ReactNode
  /** Leave out when the item only groups `items`. */
  href?: string
  icon: ReactNode
  items?: NavLink[]
  /** Makes the item a button that does something, such as opening search, in place of a link. */
  onSelect?: () => void
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

  if (!item.href && item.onSelect) {
    const { onSelect } = item
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip={railTooltip(item.title)}
          onClick={() => {
            closeMobile()
            onSelect()
          }}
        >
          {item.icon}
          <span>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
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
        {item.badge !== undefined && (
          <SidebarMenuBadge>{renderTag(item.badge)}</SidebarMenuBadge>
        )}
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
                  <span className='ml-auto flex'>{renderTag(child.badge)}</span>
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
                  <span className='flex size-6 shrink-0 items-center justify-center rounded-md border [&_svg]:size-3.5'>
                    {workspace.logo}
                  </span>
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

type AppTheme = 'dark' | 'light' | 'system'

interface ThemeChoice {
  onValueChange: (theme: AppTheme) => void
  /** `system` follows the device's setting. */
  value: AppTheme
}

interface UserMenuProps {
  links: UserMenuLink[]
  onSignOut: () => void
  /** Adds a Light, Dark and System choice, such as `useTheme()` from next-themes. */
  theme?: ThemeChoice
  user: AppUser
}

const themes: { icon: ReactNode; label: string; value: AppTheme }[] = [
  {
    icon: (
      <IconPlaceholder
        lucide='SunIcon'
        tabler='IconSun'
        hugeicons='Sun03Icon'
        phosphor='SunIcon'
        remixicon='RiSunLine'
        className='size-3.5'
      />
    ),
    label: 'Light',
    value: 'light',
  },
  {
    icon: (
      <IconPlaceholder
        lucide='MoonIcon'
        tabler='IconMoon'
        hugeicons='Moon02Icon'
        phosphor='MoonIcon'
        remixicon='RiMoonLine'
        className='size-3.5'
      />
    ),
    label: 'Dark',
    value: 'dark',
  },
  {
    icon: (
      <IconPlaceholder
        lucide='MonitorIcon'
        tabler='IconDeviceDesktop'
        hugeicons='ComputerIcon'
        phosphor='MonitorIcon'
        remixicon='RiComputerLine'
        className='size-3.5'
      />
    ),
    label: 'System',
    value: 'system',
  },
]

function themeIndex(value: AppTheme) {
  return Math.max(
    0,
    themes.findIndex((theme) => theme.value === value),
  )
}

function pickedTheme(target: EventTarget | null, value: AppTheme) {
  const picked =
    target instanceof Element
      ? target.closest<HTMLElement>('[data-app-theme]')?.dataset.appTheme
      : undefined
  return (
    themes.find((theme) => theme.value === picked)?.value ??
    themes[(themeIndex(value) + 1) % themes.length].value
  )
}

const themeMotion = { duration: 500, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' }

function themeIconStyle(index: number, position: number) {
  return {
    opacity: position === index ? 1 : 0,
    rotate: `${(index - position) * 120}deg`,
    scale: position === index ? 1 : 0.5,
  }
}

function ThemeSwitch({ value }: { value: AppTheme }) {
  const index = themeIndex(value)
  const thumbRef = useRef<HTMLSpanElement>(null)
  const shown = useRef(index)

  // next-themes' `disableTransitionOnChange` turns off every CSS transition while the
  // theme changes, so the switch moves with the Web Animations API instead.
  useLayoutEffect(() => {
    const from = shown.current
    shown.current = index
    const thumb = thumbRef.current
    if (from === index || !thumb) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    thumb.animate(
      {
        transform: [`translateX(${from * 100}%)`, `translateX(${index * 100}%)`],
      },
      themeMotion,
    )
    Array.from(thumb.children).forEach((icon, position) => {
      const start = themeIconStyle(from, position)
      const end = themeIconStyle(index, position)
      icon.animate(
        {
          opacity: [start.opacity, end.opacity],
          rotate: [start.rotate, end.rotate],
          scale: [start.scale, end.scale],
        },
        themeMotion,
      )
    })
  }, [index])

  return (
    <span
      aria-hidden
      className='bg-muted relative ml-auto grid grid-cols-3 rounded-md p-0.5'
    >
      {themes.map((theme) => (
        <span
          key={theme.value}
          data-app-theme={theme.value}
          className='text-muted-foreground flex h-6 w-7 items-center justify-center'
        >
          {theme.icon}
        </span>
      ))}
      <span
        ref={thumbRef}
        data-app-theme={value}
        className='bg-background text-foreground dark:ring-input absolute inset-y-0.5 left-0.5 w-7 rounded-sm shadow-sm dark:ring-1'
        style={{ transform: `translateX(${index * 100}%)` }}
      >
        {themes.map((theme, position) => (
          <span
            key={theme.value}
            className='absolute inset-0 flex items-center justify-center'
            style={themeIconStyle(index, position)}
          >
            {theme.icon}
          </span>
        ))}
      </span>
    </span>
  )
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
  theme,
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
      {theme && (
        <>
          <DropdownMenuGroup>
            <DropdownMenuItem
              closeOnClick={false}
              onClick={(event) =>
                theme.onValueChange(pickedTheme(event.target, theme.value))
              }
            >
              <IconPlaceholder
                lucide='SunMoonIcon'
                tabler='IconSunMoon'
                hugeicons='ContrastIcon'
                phosphor='CircleHalfIcon'
                remixicon='RiContrast2Line'
              />
              Theme
              <span className='sr-only'>: {themes[themeIndex(theme.value)].label}</span>
              <ThemeSwitch value={theme.value} />
            </DropdownMenuItem>
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
            aria-label={`${getInitials(props.user.name)}, account: ${props.user.name}`}
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
  /** @default 'Search' */
  placeholder?: string
  /** Below this width the field shrinks to its icon: `lg` for a bar that also holds tabs. @default 'sm' */
  collapseBelow?: 'lg' | 'sm'
  /** `secondary` fills the field instead of outlining it, for a bar on a tinted canvas where an outlined field stands out. @default 'outline' */
  variant?: 'outline' | 'secondary'
}

/** Calls `onPress` on ⌘ or Ctrl with the letter `key`, unless the page already used the key. */
function useShortcut(key: string | undefined, onPress: () => void) {
  useEffect(() => {
    if (!key) return
    const letter = key.toLowerCase()
    const onKeyDown = (event: KeyboardEvent) => {
      // Chrome's autofill sends keydown events without a key.
      if (event.defaultPrevented || event.key?.toLowerCase() !== letter) return
      if (!(event.metaKey || event.ctrlKey)) return
      event.preventDefault()
      onPress()
    }
    window.addEventListener('keydown', onKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true })
  }, [key, onPress])
}

const searchCollapsed = {
  lg: {
    button: 'max-lg:aspect-square max-lg:px-0 lg:w-56 lg:justify-start',
    key: 'max-lg:hidden',
    label: 'max-lg:sr-only',
  },
  sm: {
    button: 'max-sm:aspect-square max-sm:px-0 sm:w-56 sm:justify-start',
    key: 'max-sm:hidden',
    label: 'max-sm:sr-only',
  },
}

function SearchButton({
  className,
  collapseBelow = 'sm',
  onOpen,
  placeholder = 'Search',
  variant = 'outline',
}: SearchButtonProps) {
  useShortcut('k', onOpen)
  const collapsed = searchCollapsed[collapseBelow]

  return (
    <Button
      variant={variant}
      size='sm'
      onClick={onOpen}
      aria-keyshortcuts='Meta+K Control+K'
      className={cn(collapsed.button, className)}
    >
      <IconPlaceholder
        lucide='SearchIcon'
        tabler='IconSearch'
        hugeicons='SearchIcon'
        phosphor='MagnifyingGlassIcon'
        remixicon='RiSearchLine'
      />
      <span className={cn('text-muted-foreground font-normal', collapsed.label)}>
        {placeholder}
      </span>
      <Kbd aria-hidden className={cn('ml-auto', collapsed.key)}>
        ⌘K
      </Kbd>
    </Button>
  )
}

interface AppPanelProps {
  /** The panel's content, such as a Copilot Panel, which fills its height. */
  children: ReactNode
  /** Names the panel for screen readers, such as `Ask AI`. */
  label: string
  onOpenChange: (open: boolean) => void
  open: boolean
}

const DOCKED_QUERY = '(min-width: 80rem)'

function subscribeToDocked(onChange: () => void) {
  const query = window.matchMedia(DOCKED_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

/** Whether the screen is wide enough for the page, the sidebar and a panel side by side. */
function useDockedPanel() {
  return useSyncExternalStore(
    subscribeToDocked,
    () => window.matchMedia(DOCKED_QUERY).matches,
    () => false,
  )
}

/** The panel's composer when it has one, else its first field or button. */
function panelFocusTarget(root: HTMLElement | null) {
  return (
    root?.querySelector<HTMLElement>('textarea') ??
    root?.querySelector<HTMLElement>('input, button:not([disabled])') ??
    null
  )
}

/** A panel beside the page on a wide screen, and a sheet over it on a smaller one. Put it after `SidebarInset`. */
function AppPanel({ children, label, onOpenChange, open }: AppPanelProps) {
  const docked = useDockedPanel()
  const panelRef = useRef<HTMLElement>(null)
  const sheetFocus = useRef<HTMLElement | null>(null)
  const returnTo = useRef<HTMLElement | null>(null)
  const focused = useRef(false)
  const frameRef = useRef<HTMLDivElement>(null)
  // A docked panel stays while it slides out, and the page narrows and widens with it.
  const [present, setPresent] = useState(open)
  const [shown, setShown] = useState(open)
  if (open && !present) setPresent(true)
  if (!open && shown) setShown(false)

  useEffect(() => {
    if (!open || shown) return
    const frame = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(frame)
  }, [open, shown])

  useEffect(() => {
    const frame = frameRef.current
    if (open || !present) return
    let current = true
    Promise.all(
      (frame?.getAnimations() ?? []).map((animation) => animation.finished),
    ).then(
      () => {
        if (current) setPresent(false)
      },
      () => {},
    )
    return () => {
      current = false
    }
  }, [open, present])

  useEffect(() => {
    if (!docked || open === focused.current) return
    focused.current = open
    if (open) {
      returnTo.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
      panelFocusTarget(panelRef.current)?.focus()
    } else if (returnTo.current?.isConnected) {
      returnTo.current.focus()
    }
  }, [docked, open])

  if (docked) {
    if (!open && !present) return null
    return (
      <div
        ref={frameRef}
        data-state={shown ? 'open' : 'closed'}
        inert={!open}
        className='sticky top-0 h-svh w-96 shrink-0 overflow-clip transition-[width] duration-300 ease-[cubic-bezier(0.2,0,0,1)] data-[state=closed]:w-0 motion-reduce:transition-none'
      >
        <aside
          ref={panelRef}
          aria-label={label}
          className='bg-background flex h-full w-96 flex-col border-l'
        >
          {children}
        </aside>
      </div>
    )
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        ref={(node) => {
          sheetFocus.current = panelFocusTarget(node)
        }}
        aria-label={label}
        showCloseButton={false}
        className='w-full sm:max-w-md'
        initialFocus={sheetFocus}
        onClick={(event) => {
          const link =
            event.target instanceof Element ? event.target.closest('a[href]') : null
          if (link && isPlainClick(event) && link.getAttribute('target') !== '_blank') {
            onOpenChange(false)
          }
        }}
      >
        {children}
      </SheetContent>
    </Sheet>
  )
}

interface PanelButtonProps {
  className?: string
  /** Leave out for a button with only its label. */
  icon?: ReactNode
  /** Such as `Ask AI`. */
  label: string
  onOpenChange: (open: boolean) => void
  open: boolean
  /** A letter that opens and closes the panel with ⌘ or Ctrl, such as `i`. */
  shortcut?: string
}

/** The header button that opens and closes an `AppPanel`. */
function PanelButton({
  className,
  icon,
  label,
  onOpenChange,
  open,
  shortcut,
}: PanelButtonProps) {
  useShortcut(shortcut, () => onOpenChange(!open))

  const key = shortcut?.toUpperCase()
  return (
    <Button
      variant='outline'
      aria-expanded={open}
      aria-keyshortcuts={key ? `Meta+${key} Control+${key}` : undefined}
      onClick={() => onOpenChange(!open)}
      className={cn(icon && 'max-lg:aspect-square max-lg:px-0', className)}
    >
      {icon}
      <span className={cn(icon && 'max-lg:sr-only')}>{label}</span>
      {key && (
        <Kbd aria-hidden className='max-lg:hidden'>
          ⌘{key}
        </Kbd>
      )}
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
  /** A line under the count, such as when the allowance resets. */
  note?: ReactNode
  /** What the allowance counts, such as `messages`. Leave it out to show only the share used. */
  unit?: string
  title: string
  used: number
}

function usageTone(percent: number): StatusTone {
  if (percent >= 90) return 'bad'
  if (percent >= 75) return 'warning'
  return 'neutral'
}

function PlanUsage({ action, limit, note, title, unit, used }: PlanUsageProps) {
  const closeMobile = useCloseMobileSidebar()
  const percent = limit > 0 ? Math.min(100, (used / limit) * 100) : 0
  const usedLabel = `${formatPercent(percent / 100, { maximumFractionDigits: 0 })} used`
  return (
    <div className='flex flex-col gap-2.5 border-t px-2 pt-3 pb-1 text-sm group-data-[collapsible=icon]:hidden'>
      <div className='flex items-baseline justify-between gap-2'>
        <span className='truncate font-medium'>{title}</span>
        <StatusLabel
          variant='text'
          tone={usageTone(percent)}
          className='shrink-0 text-xs tabular-nums'
        >
          {usedLabel}
        </StatusLabel>
      </div>
      <UsageBar critical={90} limit={limit} size='sm' used={used} warning={75} />
      {(unit || note) && (
        <div className='text-muted-foreground flex flex-col gap-0.5 text-xs text-pretty'>
          {unit && (
            <p>
              <span className='text-foreground tabular-nums'>{formatNumber(used)}</span>{' '}
              of <span className='tabular-nums'>{formatNumber(limit)}</span> {unit}
            </p>
          )}
          {note && <p>{note}</p>}
        </div>
      )}
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

interface SidebarLayoutProps {
  /** The bar over the page, after the button that opens the sidebar: a title and the page's actions. */
  bar?: ReactNode
  /** The sidebar's head, beside the button that closes it, such as the product's name. */
  brand: ReactNode
  children: ReactNode
  /** Under the links, scrolling inside the sidebar, such as a list of chats. */
  content?: ReactNode
  /** The sidebar's foot, such as plan usage and the user menu. */
  footer?: ReactNode
  /** Links and actions at the top of the sidebar, which stay in view while the content scrolls. */
  nav?: NavItem[]
  pathname: string
}

/** A sidebar whose head, links and foot stay in view around content that scrolls, beside the page and its bar. */
function SidebarLayout({
  bar,
  brand,
  children,
  content,
  footer,
  nav,
  pathname,
}: SidebarLayoutProps) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarLayoutHead brand={brand} nav={nav} pathname={pathname} />
        <SidebarContent>{content}</SidebarContent>
        {footer && <SidebarFooter>{footer}</SidebarFooter>}
      </Sidebar>
      <SidebarInset className='min-w-0'>
        <SidebarLayoutBar>{bar}</SidebarLayoutBar>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}

function SidebarLayoutHead({
  brand,
  nav,
  pathname,
}: Pick<SidebarLayoutProps, 'brand' | 'nav' | 'pathname'>) {
  return (
    <SidebarHeader>
      <div className='flex h-10 items-center justify-between gap-2 ps-2'>
        {brand}
        <SidebarTrigger className='max-md:hidden' />
      </div>
      {nav && (
        <TooltipProvider>
          <SidebarMenu>
            {nav.map((item) => (
              <AppNavItem key={item.title} item={item} pathname={pathname} />
            ))}
          </SidebarMenu>
        </TooltipProvider>
      )}
    </SidebarHeader>
  )
}

function SidebarLayoutBar({ children }: { children: ReactNode }) {
  const { state } = useSidebar()
  return (
    <AppHeader className='border-b-0'>
      <SidebarTrigger className={cn('-ml-1', state === 'expanded' && 'md:hidden')} />
      {children}
    </AppHeader>
  )
}

interface TopNavProps {
  className?: string
  items: NavLink[]
  pathname: string
  /** `pill` fills the open link, for links that sit inside a bar. @default 'line' */
  variant?: 'line' | 'pill'
}

function TopNav({ className, items, pathname, variant }: TopNavProps) {
  return (
    <nav aria-label='Main' className={cn('min-w-0 flex-1', className)}>
      <TabLinks
        items={items}
        pathname={pathname}
        isActive={(href) => isActiveHref(href, pathname)}
        variant={variant}
      />
    </nav>
  )
}

interface MobileNavProps {
  className?: string
  items: NavLink[]
  pathname: string
  /** The sheet's heading, such as the app's brand. */
  title: ReactNode
}

/** A menu button that opens the app's pages in a sheet, for a phone, where `TopNav` has no room. */
function MobileNav({ className, items, pathname, title }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        variant='secondary'
        size='icon-sm'
        aria-label='Open menu'
        aria-expanded={open}
        className={className}
        onClick={() => setOpen(true)}
      >
        <IconPlaceholder
          lucide='MenuIcon'
          tabler='IconMenu2'
          hugeicons='Menu01Icon'
          phosphor='ListIcon'
          remixicon='RiMenuLine'
        />
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side='left'>
          <SheetHeader>
            <SheetTitle className='flex items-center gap-2'>{title}</SheetTitle>
          </SheetHeader>
          <nav
            aria-label='Main'
            className='min-h-0 flex-1 overflow-y-auto px-2 pb-4 [scrollbar-width:thin]'
          >
            <MobileNavLinks
              items={items}
              onNavigate={() => setOpen(false)}
              pathname={pathname}
            />
          </nav>
        </SheetContent>
      </Sheet>
    </>
  )
}

function MobileNavLinks({
  items,
  onNavigate,
  pathname,
}: Pick<MobileNavProps, 'items' | 'pathname'> & { onNavigate: () => void }) {
  return (
    <ul className='flex flex-col gap-0.5'>
      {items.map((item) => {
        const active = isActiveHref(item.href, pathname)
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? 'page' : undefined}
              data-active={active || undefined}
              onClick={(event) => {
                if (isPlainClick(event)) onNavigate()
              }}
              className='text-muted-foreground hover:bg-foreground/5 hover:text-foreground data-active:bg-foreground/10 data-active:text-foreground focus-visible:ring-ring/50 flex h-11 items-center gap-4 rounded-md px-4 text-sm font-medium outline-none focus-visible:ring-3 [&_svg]:size-4 [&_svg]:shrink-0'
            >
              {item.icon}
              <span className='min-w-0 flex-1 truncate'>{item.title}</span>
              {item.badge !== undefined && renderTag(item.badge)}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export {
  AppBrand,
  AppPanel,
  AppBreadcrumbs,
  AppHeader,
  AppNav,
  BrandMark,
  getInitials,
  isActiveHref,
  MobileNav,
  NotificationsButton,
  PanelButton,
  PlanUsage,
  SearchButton,
  SidebarLayout,
  SidebarUserMenu,
  TopNav,
  useDockedPanel,
  UserMenu,
  WorkspaceSwitcher,
}

export type {
  AppBrandProps,
  AppTheme,
  AppPanelProps,
  AppHeaderProps,
  AppNavProps,
  AppUser,
  Crumb,
  MobileNavProps,
  NavItem,
  NavLink,
  NavSection,
  NotificationsButtonProps,
  PanelButtonProps,
  PlanUsageProps,
  SearchButtonProps,
  SidebarLayoutProps,
  ThemeChoice,
  TopNavProps,
  UserMenuLink,
  UserMenuProps,
  Workspace,
  WorkspaceSwitcherProps,
}
