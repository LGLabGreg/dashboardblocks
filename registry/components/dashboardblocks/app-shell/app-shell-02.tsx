'use client'

import {
  AppBrand,
  AppBreadcrumbs,
  AppHeader,
  AppNav,
  type AppUser,
  type Crumb,
  type NavSection,
  SearchButton,
  SidebarUserMenu,
  type UserMenuLink,
} from '@/registry/components/dashboardblocks/app-shell'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'

interface AppShell2Props {
  breadcrumbs: Crumb[]
  /** The page. Leave out to show placeholders. */
  children?: ReactNode
  /** Start collapsed to icons. */
  defaultCollapsed?: boolean
  onCreate?: () => void
  onSearch?: () => void
  onSignOut?: () => void
  /** The current path, used to mark the active link and open its section. */
  pathname: string
  /** Pinned to the bottom of the sidebar, such as help and settings. */
  secondarySections: NavSection[]
  sections: NavSection[]
  user: AppUser
  userLinks: UserMenuLink[]
}

const exampleProps: AppShell2Props = {
  breadcrumbs: [{ href: '#', label: 'Reports' }, { label: 'Usage' }],
  pathname: '/reports/usage',
  secondarySections: [
    {
      items: [
        {
          href: '/help',
          icon: (
            <IconPlaceholder
              lucide='CircleHelpIcon'
              tabler='IconHelp'
              hugeicons='HelpCircleIcon'
              phosphor='QuestionIcon'
              remixicon='RiQuestionLine'
            />
          ),
          title: 'Help',
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
    },
  ],
  sections: [
    {
      items: [
        {
          href: '/',
          icon: (
            <IconPlaceholder
              lucide='HomeIcon'
              tabler='IconHome'
              hugeicons='HomeIcon'
              phosphor='HouseIcon'
              remixicon='RiHomeLine'
            />
          ),
          title: 'Home',
        },
        {
          badge: 4,
          href: '/inbox',
          icon: (
            <IconPlaceholder
              lucide='InboxIcon'
              tabler='IconInbox'
              hugeicons='InboxIcon'
              phosphor='TrayIcon'
              remixicon='RiInboxLine'
            />
          ),
          title: 'Inbox',
        },
        {
          icon: (
            <IconPlaceholder
              lucide='FolderIcon'
              tabler='IconFolder'
              hugeicons='Folder01Icon'
              phosphor='FolderIcon'
              remixicon='RiFolderLine'
            />
          ),
          items: [
            { href: '/projects', title: 'All projects' },
            { badge: 3, href: '/projects/active', title: 'Active' },
            { href: '/projects/archived', title: 'Archived' },
          ],
          title: 'Projects',
        },
        {
          icon: (
            <IconPlaceholder
              lucide='ChartBarIcon'
              tabler='IconChartBar'
              hugeicons='ChartHistogramIcon'
              phosphor='ChartBarIcon'
              remixicon='RiBarChartLine'
            />
          ),
          items: [
            { href: '/reports/revenue', title: 'Revenue' },
            { href: '/reports/usage', title: 'Usage' },
            { href: '/reports/exports', title: 'Exports' },
          ],
          title: 'Reports',
        },
        {
          href: '/team',
          icon: (
            <IconPlaceholder
              lucide='UsersIcon'
              tabler='IconUsers'
              hugeicons='UserGroupIcon'
              phosphor='UsersIcon'
              remixicon='RiTeamLine'
            />
          ),
          title: 'Team',
        },
      ],
    },
  ],
  user: { email: 'lena@northwind.io', name: 'Lena Fischer' },
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
      href: '/account/notifications',
      icon: (
        <IconPlaceholder
          lucide='BellIcon'
          tabler='IconBell'
          hugeicons='NotificationIcon'
          phosphor='BellIcon'
          remixicon='RiNotificationLine'
        />
      ),
      label: 'Notifications',
    },
  ],
}

const AppShell2 = (props: AppShell2Props) => {
  const {
    breadcrumbs,
    children,
    defaultCollapsed = false,
    onCreate = () => {},
    onSearch = () => {},
    onSignOut = () => {},
    pathname,
    secondarySections,
    sections,
    user,
    userLinks,
  } = props

  return (
    <SidebarProvider defaultOpen={!defaultCollapsed}>
      <Sidebar collapsible='icon'>
        <SidebarHeader>
          <AppBrand
            description='Analytics'
            href='/'
            logo={
              <IconPlaceholder
                lucide='CommandIcon'
                tabler='IconInnerShadowTop'
                hugeicons='CommandIcon'
                phosphor='CommandIcon'
                remixicon='RiCommandLine'
              />
            }
            name='Northwind'
          />
        </SidebarHeader>
        <SidebarContent>
          <AppNav pathname={pathname} sections={sections} />
          <AppNav className='mt-auto' pathname={pathname} sections={secondarySections} />
        </SidebarContent>
        <SidebarFooter>
          <SidebarUserMenu links={userLinks} onSignOut={onSignOut} user={user} />
        </SidebarFooter>
        <SidebarRail />
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
            <Button onClick={onCreate}>
              <IconPlaceholder
                lucide='PlusIcon'
                tabler='IconPlus'
                hugeicons='PlusSignIcon'
                phosphor='PlusIcon'
                remixicon='RiAddLine'
                data-icon='inline-start'
              />
              <span className='max-sm:sr-only'>New report</span>
            </Button>
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
      <div className='grid auto-rows-min gap-4 md:grid-cols-4'>
        <div className='bg-muted/50 h-28 rounded-xl' />
        <div className='bg-muted/50 h-28 rounded-xl' />
        <div className='bg-muted/50 h-28 rounded-xl' />
        <div className='bg-muted/50 h-28 rounded-xl' />
      </div>
      <div className='bg-muted/50 min-h-64 flex-1 rounded-xl' />
    </>
  )
}

export { AppShell2, exampleProps as appShell2ExampleProps, type AppShell2Props }
