import { DocsLayout } from 'fumadocs-ui/layouts/docs'

import { VersionBadge } from '@/components/version-badge'

import { baseOptions } from '@/lib/layout.shared'
import { source } from '@/lib/source'

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout
      tree={source.pageTree}
      {...baseOptions({ customizerClassName: 'w-full' })}
      sidebar={{ footer: <VersionBadge className='mt-3 self-start' /> }}
    >
      {children}
    </DocsLayout>
  )
}
