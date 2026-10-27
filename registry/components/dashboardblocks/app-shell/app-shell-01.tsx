'use client'

import {
  AppBreadcrumbs,
  AppHeader,
  AppNav,
  AppPanel,
  type AppUser,
  type Crumb,
  type NavSection,
  NotificationsButton,
  PanelButton,
  type PanelButtonProps,
  SearchButton,
  SidebarUserMenu,
  type ThemeChoice,
  type UserMenuLink,
  type Workspace,
  WorkspaceSwitcher,
} from '@/registry/components/dashboardblocks/app-shell'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type ReactNode, useState } from 'react'

import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

import { cn } from '@/lib/utils'

interface AppShell1Props {
  /** Shown across the top of every page, under the header, such as a notice that something needs fixing. */
  banner?: ReactNode
  breadcrumbs: Crumb[]
  children?: ReactNode
  /** Leave out to hide the notifications button. */
  notificationCount?: number
  /** Adds "New workspace…" to the workspace switcher. */
  onCreateWorkspace?: () => void
  onNotificationsClick?: () => void
  onSearch?: () => void
  onSignOut?: () => void
  /** Opens another workspace. Leave out to switch in the shell only. */
  onWorkspaceChange?: (id: string) => void
  /** A panel beside the page, such as a copilot, opened from a button in the header: docked on a wide screen, a sheet on a smaller one. */
  panel?: AppShell1Panel
  pathname: string
  /** @default 'Search…' */
  searchPlaceholder?: string
  /** Pinned to the bottom of the sidebar, above the user menu, such as Help and Settings. */
  secondarySections?: NavSection[]
  sections: NavSection[]
  /** Adds a Light, Dark and System choice to the user menu, such as `useTheme()` from next-themes. */
  theme?: ThemeChoice
  user: AppUser
  userLinks: UserMenuLink[]
  /** The workspace that's open. Leave out to start on the first. */
  workspaceId?: string
  workspaces: Workspace[]
}

interface AppShell1Panel extends Omit<PanelButtonProps, 'className'> {
  /** The panel's content, which fills its height. Its own close button calls `onOpenChange(false)`. */
  children: ReactNode
}

const exampleProps: AppShell1Props = {
  breadcrumbs: [{ href: '#', label: 'Store' }, { label: 'Orders' }],
  notificationCount: 3,
  pathname: '/orders',
  sections: [
    {
      items: [
        {
          href: '/',
          icon: (
            <IconPlaceholder
              lucide='LayoutDashboardIcon'
              tabler='IconDashboard'
              hugeicons='DashboardSquare01Icon'
              phosphor='SquaresFourIcon'
              remixicon='RiDashboardLine'
            />
          ),
          title: 'Overview',
        },
        {
          href: '/analytics',
          icon: (
            <IconPlaceholder
              lucide='ChartLineIcon'
              tabler='IconChartLine'
              hugeicons='ChartIcon'
              phosphor='ChartLineIcon'
              remixicon='RiLineChartLine'
            />
          ),
          title: 'Analytics',
        },
        {
          href: '/reports',
          icon: (
            <IconPlaceholder
              lucide='FileChartColumnIcon'
              tabler='IconReport'
              hugeicons='Analytics01Icon'
              phosphor='FileTextIcon'
              remixicon='RiFileChartLine'
            />
          ),
          title: 'Reports',
        },
      ],
    },
    {
      items: [
        {
          badge: 12,
          href: '/orders',
          icon: (
            <IconPlaceholder
              lucide='ShoppingCartIcon'
              tabler='IconShoppingCart'
              hugeicons='ShoppingCart01Icon'
              phosphor='ShoppingCartIcon'
              remixicon='RiShoppingCartLine'
            />
          ),
          title: 'Orders',
        },
        {
          href: '/products',
          icon: (
            <IconPlaceholder
              lucide='PackageIcon'
              tabler='IconPackage'
              hugeicons='PackageIcon'
              phosphor='PackageIcon'
              remixicon='RiBox3Line'
            />
          ),
          title: 'Products',
        },
        {
          href: '/customers',
          icon: (
            <IconPlaceholder
              lucide='UsersIcon'
              tabler='IconUsers'
              hugeicons='UserGroupIcon'
              phosphor='UsersIcon'
              remixicon='RiTeamLine'
            />
          ),
          title: 'Customers',
        },
        {
          badge: 'New',
          href: '/discounts',
          icon: (
            <IconPlaceholder
              lucide='TagIcon'
              tabler='IconTag'
              hugeicons='Tag01Icon'
              phosphor='TagIcon'
              remixicon='RiPriceTag3Line'
            />
          ),
          title: 'Discounts',
        },
      ],
      label: 'Store',
    },
  ],
  user: {
    avatar: '/images/avatar-05.webp',
    email: 'amara@acme.com',
    name: 'Amara Okafor',
  },
  userLinks: [
    {
      href: '/account',
      icon: (
        <IconPlaceholder
          lucide='CircleUserRoundIcon'
          tabler='IconUserCircle'
          hugeicons='UserCircle02Icon'
          phosphor='UserCircleIcon'
          remixicon='RiUserLine'
        />
      ),
      label: 'Account',
    },
    {
      href: '/billing',
      icon: (
        <IconPlaceholder
          lucide='CreditCardIcon'
          tabler='IconCreditCard'
          hugeicons='CreditCardIcon'
          phosphor='CreditCardIcon'
          remixicon='RiBankCardLine'
        />
      ),
      label: 'Billing',
    },
  ],
  workspaces: [
    {
      id: 'acme',
      logo: (
        <IconPlaceholder
          lucide='GalleryVerticalEndIcon'
          tabler='IconLayoutRows'
          hugeicons='LayoutBottomIcon'
          phosphor='RowsIcon'
          remixicon='RiGalleryLine'
        />
      ),
      name: 'Acme Store',
      plan: 'Pro plan',
    },
    {
      id: 'outlet',
      logo: (
        <IconPlaceholder
          lucide='AudioLinesIcon'
          tabler='IconWaveSine'
          hugeicons='AudioWave01Icon'
          phosphor='WaveformIcon'
          remixicon='RiPulseLine'
        />
      ),
      name: 'Acme Outlet',
      plan: 'Starter plan',
    },
  ],
}

const AppShell1 = (props: AppShell1Props) => {
  const {
    banner,
    breadcrumbs,
    children,
    notificationCount,
    onCreateWorkspace,
    onNotificationsClick = () => {},
    onSearch = () => {},
    onSignOut = () => {},
    onWorkspaceChange,
    panel,
    pathname,
    searchPlaceholder,
    secondarySections,
    sections,
    theme,
    user,
    userLinks,
    workspaceId,
    workspaces,
  } = props
  const [chosen, setChosen] = useState(workspaces[0]?.id ?? '')

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <WorkspaceSwitcher
            onCreate={onCreateWorkspace}
            onValueChange={onWorkspaceChange ?? setChosen}
            value={workspaceId ?? chosen}
            workspaces={workspaces}
          />
        </SidebarHeader>
        <SidebarContent>
          <AppNav pathname={pathname} sections={sections} />
          {secondarySections && (
            <AppNav
              className='mt-auto'
              pathname={pathname}
              sections={secondarySections}
            />
          )}
        </SidebarContent>
        <SidebarFooter>
          <SidebarUserMenu
            links={userLinks}
            onSignOut={onSignOut}
            theme={theme}
            user={user}
          />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className='min-w-0'>
        <AppHeader>
          <SidebarTrigger className='-ml-1' />
          <Separator
            orientation='vertical'
            className='mr-2 data-vertical:h-4 data-vertical:self-auto'
          />
          <AppBreadcrumbs items={breadcrumbs} />
          <div className='ml-auto flex items-center gap-2'>
            {panel && (
              <PanelButton
                icon={panel.icon}
                label={panel.label}
                onOpenChange={panel.onOpenChange}
                open={panel.open}
                shortcut={panel.shortcut}
              />
            )}
            <SearchButton onOpen={onSearch} placeholder={searchPlaceholder} />
            {notificationCount !== undefined && (
              <NotificationsButton
                count={notificationCount}
                onClick={onNotificationsClick}
              />
            )}
          </div>
        </AppHeader>
        {banner}
        <div className='flex flex-1 flex-col gap-4 p-4 md:p-6'>
          {children ?? <PagePlaceholder />}
        </div>
      </SidebarInset>
      {panel && (
        <AppPanel label={panel.label} onOpenChange={panel.onOpenChange} open={panel.open}>
          {panel.children}
        </AppPanel>
      )}
    </SidebarProvider>
  )
}

const PLACEHOLDER_STATS = ['w-20', 'w-24', 'w-16']
const PLACEHOLDER_ROWS = ['w-2/5', 'w-1/3', 'w-1/2', 'w-1/4', 'w-2/5', 'w-1/3']

function PagePlaceholder() {
  return (
    <div className='flex flex-1 flex-col gap-8'>
      <div className='flex flex-col gap-2'>
        <div className='bg-muted h-7 w-40 rounded-md' />
        <div className='bg-muted/60 h-4 w-80 max-w-full rounded-md' />
      </div>
      <div className='grid gap-6 sm:grid-cols-3'>
        {PLACEHOLDER_STATS.map((width) => (
          <div key={width} className='flex flex-col gap-3 border-t pt-3'>
            <div className={cn('bg-muted/60 h-3.5 rounded-sm', width)} />
            <div className='bg-muted h-9 w-32 rounded-md' />
          </div>
        ))}
      </div>
      <div className='flex flex-col border-t'>
        {PLACEHOLDER_ROWS.map((width, index) => (
          <div key={index} className='flex items-center gap-4 border-b py-3.5'>
            <div className={cn('bg-muted/60 h-3.5 rounded-sm', width)} />
            <div className='bg-muted/60 ms-auto h-3.5 w-16 rounded-sm' />
          </div>
        ))}
      </div>
    </div>
  )
}

export {
  AppShell1,
  exampleProps as appShell1ExampleProps,
  type AppShell1Panel,
  type AppShell1Props,
}
