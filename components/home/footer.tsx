import Link from 'next/link'

import { Logo } from '@/components/logo'
import { VersionBadge } from '@/components/version-badge'

import { siteConfig } from '@/lib/config'

const GITHUB = 'https://github.com/LGLabGreg/dashboardblocks'

const columns = [
  {
    title: 'Docs',
    links: [
      { label: 'Introduction', href: '/docs' },
      { label: 'Compatibility', href: '/docs/compatibility' },
      { label: 'Example dashboards', href: '/docs/examples/store' },
    ],
  },
  {
    title: 'Blocks',
    links: [
      { label: 'KPI', href: '/docs/components/kpi' },
      { label: 'Chart Panel', href: '/docs/components/chart-panel' },
      { label: 'Data Table', href: '/docs/components/data-table' },
      { label: 'All families', href: '/#all-blocks' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'GitHub', href: GITHUB },
      { label: 'Changelog', href: `${GITHUB}/blob/main/CHANGELOG.md` },
      { label: 'llms.txt', href: '/llms.txt' },
      { label: 'llms-full.txt', href: '/llms-full.txt' },
    ],
  },
]

export function Footer() {
  return (
    <footer className='w-full border-t'>
      <div className='mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-3 lg:grid-cols-[2fr_1fr_1fr_1fr]'>
        <div className='sm:col-span-3 lg:col-span-1'>
          <Link href='/' className='inline-flex' aria-label={siteConfig.name}>
            <Logo />
          </Link>
          <p className='text-muted-foreground mt-3 max-w-xs text-sm text-pretty'>
            Open-source dashboard blocks for shadcn/ui. Install with the CLI and own the
            code.
          </p>
        </div>
        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className='text-sm font-medium'>{column.title}</h2>
            <ul className='mt-3 flex flex-col gap-2 text-sm'>
              {column.links.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith('https://') ? (
                    <a
                      href={link.href}
                      target='_blank'
                      rel='noreferrer'
                      className='text-muted-foreground hover:text-foreground transition-colors'
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className='text-muted-foreground hover:text-foreground transition-colors'
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className='mx-auto max-w-6xl px-4'>
        <div className='text-muted-foreground flex items-center justify-between gap-4 border-t py-6 text-xs'>
          <p>Built by {siteConfig.creator}. Released under the MIT license.</p>
          <VersionBadge />
        </div>
      </div>
    </footer>
  )
}
