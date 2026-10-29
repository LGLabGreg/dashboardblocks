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
import { NavTag } from '@/registry/components/dashboardblocks/nav-tag'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface AppShell4Props {
  children?: ReactNode
  description?: string
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
  description: '18 deployments this week, 1 of them failed and rolled back.',
  links: [
    { href: '/', title: 'Overview' },
    { href: '/deployments', title: 'Deployments' },
    { badge: <NavTag tone='bad'>2</NavTag>, href: '/incidents', title: 'Incidents' },
    { href: '/logs', title: 'Logs' },
    { href: '/usage', title: 'Usage' },
    { href: '/settings', title: 'Settings' },
  ],
  notificationCount: 2,
  pathname: '/deployments',
  title: 'Deployments',
  user: { avatar: '/images/avatar-06.webp', email: 'kai@orbit.sh', name: 'Kai Tanaka' },
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
    description,
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
      <main className='flex flex-1 flex-col gap-6 p-4 md:p-6'>
        <div className='flex flex-col gap-0.5'>
          <h1 className='text-2xl font-semibold tracking-tight'>{title}</h1>
          {description && (
            <p className='text-muted-foreground text-sm text-pretty'>{description}</p>
          )}
        </div>
        {children ?? <PagePlaceholder />}
      </main>
    </div>
  )
}

const PLACEHOLDER_ROWS = ['w-1/3', 'w-2/5', 'w-1/4', 'w-1/3', 'w-2/5']

function PagePlaceholder() {
  return (
    <div className='flex flex-col border-t'>
      {PLACEHOLDER_ROWS.map((width, index) => (
        <div key={index} className='flex items-center gap-4 border-b py-3.5'>
          <div className='bg-muted size-2 shrink-0 rounded-full' />
          <div className={cn('bg-muted h-3.5 rounded-sm', width)} />
          <div className='bg-muted/60 ms-auto h-3.5 w-20 rounded-sm' />
        </div>
      ))}
    </div>
  )
}

export { AppShell4, exampleProps as appShell4ExampleProps, type AppShell4Props }
