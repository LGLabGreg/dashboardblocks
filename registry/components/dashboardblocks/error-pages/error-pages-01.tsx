'use client'

import { ErrorPageLayout } from '@/registry/components/dashboardblocks/error-pages'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type FormEvent, type ReactNode, useId, useState } from 'react'

import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ErrorPageLink {
  description: string
  href: string
  icon: ReactNode
  title: string
}

interface ErrorPages1Props {
  brand?: ReactNode
  homeHref: string
  links: ErrorPageLink[]
  onSearch?: (query: string) => void
  path?: string
}

const exampleProps: ErrorPages1Props = {
  brand: (
    <>
      <span className='bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md [&_svg]:size-4'>
        <IconPlaceholder
          lucide='BlocksIcon'
          tabler='IconCube'
          hugeicons='CubeIcon'
          phosphor='CubeIcon'
          remixicon='RiBox3Line'
        />
      </span>
      Acme Analytics
    </>
  ),
  homeHref: '#',
  links: [
    {
      description: 'Every dashboard in the workspace',
      href: '#',
      icon: (
        <IconPlaceholder
          lucide='LayoutDashboardIcon'
          tabler='IconLayoutDashboard'
          hugeicons='DashboardSquare01Icon'
          phosphor='SquaresFourIcon'
          remixicon='RiDashboardLine'
        />
      ),
      title: 'Dashboards',
    },
    {
      description: 'Scheduled and saved reports',
      href: '#',
      icon: (
        <IconPlaceholder
          lucide='FileTextIcon'
          tabler='IconFileText'
          hugeicons='File01Icon'
          phosphor='FileTextIcon'
          remixicon='RiFileTextLine'
        />
      ),
      title: 'Reports',
    },
    {
      description: 'Guides and answers',
      href: '#',
      icon: (
        <IconPlaceholder
          lucide='LifeBuoyIcon'
          tabler='IconLifebuoy'
          hugeicons='HelpCircleIcon'
          phosphor='LifebuoyIcon'
          remixicon='RiLifebuoyLine'
        />
      ),
      title: 'Help center',
    },
  ],
  onSearch: () => {},
  path: '/dashboards/revenue-overveiw',
}

const ErrorPages1 = ({ brand, homeHref, links, onSearch, path }: ErrorPages1Props) => {
  const id = useId()
  const [query, setQuery] = useState('')

  const search = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (query.trim()) onSearch?.(query.trim())
  }

  return (
    <ErrorPageLayout
      brand={brand}
      code='404'
      title='Page not found'
      description={
        path ? (
          <>
            Nothing lives at{' '}
            <code className='text-foreground font-mono text-sm break-all'>{path}</code>.
            It may have moved, or the link has a typo.
          </>
        ) : (
          'The page may have moved, or the link has a typo.'
        )
      }
    >
      {onSearch && (
        <form method='post' role='search' onSubmit={search} className='flex gap-2'>
          <label htmlFor={`${id}-search`} className='sr-only'>
            Search dashboards and reports
          </label>
          <Input
            id={`${id}-search`}
            type='search'
            placeholder='Search'
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Button type='submit' variant='outline'>
            Search
          </Button>
        </form>
      )}
      <ul className='flex flex-col divide-y border-y'>
        {links.map((link) => (
          <li key={link.title}>
            <a
              href={link.href}
              className='hover:bg-muted focus-visible:ring-ring/50 -mx-2 flex items-center gap-3 rounded-md px-2 py-2.5 outline-none focus-visible:ring-3 focus-visible:ring-inset'
            >
              <span aria-hidden className='text-muted-foreground shrink-0 [&_svg]:size-4'>
                {link.icon}
              </span>
              <span className='flex min-w-0 flex-1 flex-col'>
                <span className='text-sm font-medium'>{link.title}</span>
                <span className='text-muted-foreground truncate text-xs'>
                  {link.description}
                </span>
              </span>
              <IconPlaceholder
                lucide='ChevronRightIcon'
                tabler='IconChevronRight'
                hugeicons='ArrowRight01Icon'
                phosphor='CaretRightIcon'
                remixicon='RiArrowRightSLine'
                aria-hidden
                className='text-muted-foreground size-4 shrink-0'
              />
            </a>
          </li>
        ))}
      </ul>
      <div className='flex flex-wrap gap-2'>
        <a href={homeHref} className={buttonVariants()}>
          Go to dashboards
        </a>
        <Button variant='ghost' onClick={() => window.history.back()}>
          Go back
        </Button>
      </div>
    </ErrorPageLayout>
  )
}

export {
  ErrorPages1,
  exampleProps as errorPages1ExampleProps,
  type ErrorPageLink,
  type ErrorPages1Props,
}
