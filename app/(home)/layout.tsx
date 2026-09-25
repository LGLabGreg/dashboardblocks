import { HomeLayout } from 'fumadocs-ui/layouts/home'

import { baseOptions } from '@/lib/layout.shared'

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <HomeLayout
      {...baseOptions()}
      links={[
        { text: 'Blocks', url: '/docs' },
        { text: 'Examples', url: '/examples', active: 'nested-url' },
      ]}
      className='[&_nav]:bg-background'
    >
      {children}
    </HomeLayout>
  )
}
