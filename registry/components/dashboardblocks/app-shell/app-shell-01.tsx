'use client'

import {
  AppBreadcrumbs,
  AppHeader,
  AppNav,
  type AppUser,
  type Crumb,
  type NavSection,
  NotificationsButton,
  SearchButton,
  SidebarUserMenu,
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

interface AppShell1Props {
  breadcrumbs: Crumb[]
  children?: ReactNode
  notificationCount: number
  onNotificationsClick?: () => void
  onSearch?: () => void
  onSignOut?: () => void
  pathname: string
  sections: NavSection[]
  user: AppUser
  userLinks: UserMenuLink[]
  workspaces: Workspace[]
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
  user: { email: 'amara@acme.com', name: 'Amara Okafor' },
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
    breadcrumbs,
    children,
    notificationCount,
    onNotificationsClick = () => {},
    onSearch = () => {},
    onSignOut = () => {},
    pathname,
    sections,
    user,
    userLinks,
    workspaces,
  } = props
  const [workspace, setWorkspace] = useState(workspaces[0]?.id ?? '')

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <WorkspaceSwitcher
            onValueChange={setWorkspace}
            value={workspace}
            workspaces={workspaces}
          />
        </SidebarHeader>
        <SidebarContent>
          <AppNav pathname={pathname} sections={sections} />
        </SidebarContent>
        <SidebarFooter>
          <SidebarUserMenu links={userLinks} onSignOut={onSignOut} user={user} />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AppHeader>
          <SidebarTrigger className='-ml-1' />
          <Separator
            orientation='vertical'
            className='mr-2 data-vertical:h-4 data-vertical:self-auto'
          />
          <AppBreadcrumbs items={breadcrumbs} />
          <div className='ml-auto flex items-center gap-2'>
            <SearchButton onOpen={onSearch} />
            <NotificationsButton
              count={notificationCount}
              onClick={onNotificationsClick}
            />
          </div>
        </AppHeader>
        <div className='flex flex-1 flex-col gap-4 p-4 md:p-6'>
          {children ?? <PagePlaceholder />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function PagePlaceholder() {
  return (
    <>
      <div className='grid auto-rows-min gap-4 md:grid-cols-3'>
        <div className='bg-muted/50 aspect-video rounded-xl' />
        <div className='bg-muted/50 aspect-video rounded-xl' />
        <div className='bg-muted/50 aspect-video rounded-xl' />
      </div>
      <div className='bg-muted/50 min-h-64 flex-1 rounded-xl' />
    </>
  )
}

export { AppShell1, exampleProps as appShell1ExampleProps, type AppShell1Props }
