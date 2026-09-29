import { DocsLayout } from 'fumadocs-ui/layouts/docs'

import { Customizer } from '@/components/customizer/customizer'
import { VersionBadge } from '@/components/version-badge'

import { baseOptions } from '@/lib/layout.shared'
import { source } from '@/lib/source'

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout
      tree={source.pageTree}
      {...baseOptions({ customizer: false })}
      sidebar={{
        // Above the scrolling page list, so it stays in view. Fumadocs renders
        // the banner in a list, hence the key.
        banner: <Customizer key='customizer' className='w-full' />,
        footer: <VersionBadge className='mt-3 self-start' />,
      }}
    >
      {children}
    </DocsLayout>
  )
}
