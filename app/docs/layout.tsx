import { DocsLayout } from 'fumadocs-ui/layouts/docs'

import { Customizer } from '@/components/customizer/customizer'
import {
  SidebarTreeFolder,
  SidebarTreeItem,
  SidebarTreeSeparator,
} from '@/components/sidebar-tree'
import { VersionBadge } from '@/components/version-badge'

import { baseOptions } from '@/lib/layout.shared'
import { source } from '@/lib/source'

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout
      tree={source.pageTree}
      {...baseOptions({ customizer: false })}
      sidebar={{
        // Above the scrolling page list, so it stays in view. Without a key,
        // React warns about a missing key in fumadocs' Sidebar.
        banner: <Customizer key='customizer' className='w-full' />,
        components: {
          Item: SidebarTreeItem,
          Folder: SidebarTreeFolder,
          Separator: SidebarTreeSeparator,
        },
        footer: (
          <div
            key='footer'
            className='text-muted-foreground mt-3 flex items-center justify-between text-xs'
          >
            <VersionBadge />
            <a
              href='https://github.com/LGLabGreg/dashboardblocks/blob/main/CHANGELOG.md'
              target='_blank'
              rel='noreferrer'
              className='hover:text-foreground transition-colors'
            >
              Changelog
            </a>
          </div>
        ),
      }}
    >
      {children}
    </DocsLayout>
  )
}
