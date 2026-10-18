'use client'

import {
  AppBreadcrumbs,
  AppHeader,
  AppNav,
  type AppUser,
  type Crumb,
  type NavSection,
  NotificationsButton,
  PlanUsage,
  type PlanUsageProps,
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

import { cn } from '@/lib/utils'

interface AppShell3Props {
  breadcrumbs: Crumb[]
  children?: ReactNode
  notificationCount: number
  onCreateWorkspace?: () => void
  onNotificationsClick?: () => void
  onSearch?: () => void
  onSignOut?: () => void
  pathname: string
  sections: NavSection[]
  usage: PlanUsageProps
  user: AppUser
  userLinks: UserMenuLink[]
  workspaces: Workspace[]
}

const exampleProps: AppShell3Props = {
  breadcrumbs: [{ href: '#', label: 'Monitoring' }, { label: 'Events' }],
  notificationCount: 0,
  pathname: '/events',
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
          badge: '1.2k',
          href: '/events',
          icon: (
            <IconPlaceholder
              lucide='ActivityIcon'
              tabler='IconActivity'
              hugeicons='ActivityIcon'
              phosphor='ActivityIcon'
              remixicon='RiPulseLine'
            />
          ),
          title: 'Events',
        },
        {
          href: '/alerts',
          icon: (
            <IconPlaceholder
              lucide='BellRingIcon'
              tabler='IconBellRinging'
              hugeicons='NotificationSquareIcon'
              phosphor='BellRingingIcon'
              remixicon='RiNotification3Line'
            />
          ),
          title: 'Alerts',
        },
      ],
      label: 'Monitoring',
    },
    {
      items: [
        {
          href: '/sources',
          icon: (
            <IconPlaceholder
              lucide='DatabaseIcon'
              tabler='IconDatabase'
              hugeicons='Database01Icon'
              phosphor='DatabaseIcon'
              remixicon='RiDatabase2Line'
            />
          ),
          title: 'Sources',
        },
        {
          href: '/destinations',
          icon: (
            <IconPlaceholder
              lucide='SendIcon'
              tabler='IconSend'
              hugeicons='SentIcon'
              phosphor='PaperPlaneTiltIcon'
              remixicon='RiSendPlaneLine'
            />
          ),
          title: 'Destinations',
        },
        {
          href: '/settings',
          icon: (
            <IconPlaceholder
              lucide='Settings2Icon'
              tabler='IconSettings'
              hugeicons='Settings05Icon'
              phosphor='GearIcon'
              remixicon='RiSettingsLine'
            />
          ),
          title: 'Settings',
        },
      ],
      label: 'Configure',
    },
  ],
  usage: {
    action: { href: '/billing', label: 'Upgrade' },
    limit: 10_000,
    title: 'Free plan',
    unit: 'events',
    used: 8_420,
  },
  user: {
    avatar: '/images/avatar-02.webp',
    email: 'priya@relay.dev',
    name: 'Priya Nair',
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
      id: 'relay',
      logo: (
        <IconPlaceholder
          lucide='ZapIcon'
          tabler='IconBolt'
          hugeicons='FlashIcon'
          phosphor='LightningIcon'
          remixicon='RiFlashlightLine'
        />
      ),
      name: 'Relay',
      plan: 'Production',
    },
    {
      id: 'relay-staging',
      logo: (
        <IconPlaceholder
          lucide='TerminalSquareIcon'
          tabler='IconTerminal2'
          hugeicons='ComputerTerminalIcon'
          phosphor='TerminalIcon'
          remixicon='RiTerminalBoxLine'
        />
      ),
      name: 'Relay',
      plan: 'Staging',
    },
  ],
}

const AppShell3 = (props: AppShell3Props) => {
  const {
    breadcrumbs,
    children,
    notificationCount,
    onCreateWorkspace = () => {},
    onNotificationsClick = () => {},
    onSearch = () => {},
    onSignOut = () => {},
    pathname,
    sections,
    usage,
    user,
    userLinks,
    workspaces,
  } = props
  const [workspace, setWorkspace] = useState(workspaces[0]?.id ?? '')

  return (
    <SidebarProvider>
      <Sidebar variant='inset'>
        <SidebarHeader>
          <WorkspaceSwitcher
            onCreate={onCreateWorkspace}
            onValueChange={setWorkspace}
            value={workspace}
            workspaces={workspaces}
          />
        </SidebarHeader>
        <SidebarContent>
          <AppNav pathname={pathname} sections={sections} />
        </SidebarContent>
        <SidebarFooter>
          <PlanUsage {...usage} />
          <SidebarUserMenu links={userLinks} onSignOut={onSignOut} user={user} />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className='min-w-0'>
        <AppHeader className='md:rounded-t-xl'>
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

const PLACEHOLDER_EVENTS = ['w-1/2', 'w-2/5', 'w-3/5', 'w-1/3', 'w-1/2', 'w-2/5', 'w-1/4']

function PagePlaceholder() {
  return (
    <div className='flex flex-1 flex-col gap-8'>
      <div className='flex flex-col gap-2'>
        <div className='bg-muted h-7 w-40 rounded-md' />
        <div className='bg-muted/60 h-4 w-80 max-w-full rounded-md' />
      </div>
      <div className='flex flex-col border-t'>
        {PLACEHOLDER_EVENTS.map((width, index) => (
          <div key={index} className='flex items-start gap-3 border-b py-3.5'>
            <div className='bg-muted mt-1 size-2 shrink-0 rounded-full' />
            <div className='flex min-w-0 flex-1 flex-col gap-2'>
              <div className={cn('bg-muted h-3.5 rounded-sm', width)} />
              <div className='bg-muted/60 h-3 w-24 rounded-sm' />
            </div>
            <div className='bg-muted/60 h-3 w-12 shrink-0 rounded-sm' />
          </div>
        ))}
      </div>
    </div>
  )
}

export { AppShell3, exampleProps as appShell3ExampleProps, type AppShell3Props }
