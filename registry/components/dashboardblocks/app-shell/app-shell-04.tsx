'use client'

import {
  type AppUser,
  BrandMark,
  type NavLink,
  NotificationsButton,
  SearchButton,
  TopNav,
  UserMenu,
  type UserMenuLink,
} from '@/registry/components/dashboardblocks/app-shell'
import { Link } from '@/registry/components/dashboardblocks/link'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import type { ReactNode } from 'react'

interface AppShell4Props {
  children?: ReactNode
  links: NavLink[]
  notificationCount: number
  onNotificationsClick?: () => void
  onSearch?: () => void
  onSignOut?: () => void
  pathname: string
  title: string
  user: AppUser
  userLinks: UserMenuLink[]
}

const exampleProps: AppShell4Props = {
  links: [
    { href: '/', title: 'Overview' },
    { href: '/deployments', title: 'Deployments' },
    { badge: 2, href: '/incidents', title: 'Incidents' },
    { href: '/logs', title: 'Logs' },
    { href: '/usage', title: 'Usage' },
    { href: '/settings', title: 'Settings' },
  ],
  notificationCount: 2,
  pathname: '/deployments',
  title: 'Deployments',
  user: { email: 'kai@orbit.sh', name: 'Kai Tanaka' },
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
}

const AppShell4 = (props: AppShell4Props) => {
  const {
    children,
    links,
    notificationCount,
    onNotificationsClick = () => {},
    onSearch = () => {},
    onSignOut = () => {},
    pathname,
    title,
    user,
    userLinks,
  } = props

  return (
    <div className='flex min-h-svh w-full flex-col'>
      <header className='bg-background sticky top-0 z-10 border-b'>
        <div className='flex h-14 items-center gap-2 px-4 md:px-6'>
          <Link href='/' className='flex items-center gap-2 text-sm font-medium'>
            <BrandMark>
              <IconPlaceholder
                lucide='BlocksIcon'
                tabler='IconCube'
                hugeicons='CubeIcon'
                phosphor='CubeIcon'
                remixicon='RiBox3Line'
              />
            </BrandMark>
            <span className='max-sm:sr-only'>Orbit</span>
          </Link>
          <div className='ml-auto flex items-center gap-2'>
            <SearchButton onOpen={onSearch} />
            <NotificationsButton
              count={notificationCount}
              onClick={onNotificationsClick}
            />
            <UserMenu links={userLinks} onSignOut={onSignOut} user={user} />
          </div>
        </div>
        <TopNav className='px-2 md:px-4' items={links} pathname={pathname} />
      </header>
      <main className='flex flex-1 flex-col gap-4 p-4 md:p-6'>
        <h1 className='text-xl font-semibold tracking-tight'>{title}</h1>
        {children ?? <PagePlaceholder />}
      </main>
    </div>
  )
}

function PagePlaceholder() {
  return (
    <>
      <div className='grid auto-rows-min gap-4 md:grid-cols-3'>
        <div className='bg-muted/50 h-28 rounded-xl' />
        <div className='bg-muted/50 h-28 rounded-xl' />
        <div className='bg-muted/50 h-28 rounded-xl' />
      </div>
      <div className='bg-muted/50 min-h-64 flex-1 rounded-xl' />
    </>
  )
}

export { AppShell4, exampleProps as appShell4ExampleProps, type AppShell4Props }
