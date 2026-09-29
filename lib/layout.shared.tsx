import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'

import { Customizer } from '@/components/customizer/customizer'
import { Logo } from '@/components/logo'

/** The docs pin the customizer in the sidebar banner instead of the links. */
export function baseOptions({
  customizer = true,
}: { customizer?: boolean } = {}): BaseLayoutProps {
  return {
    githubUrl: 'https://github.com/LGLabGreg/dashboardblocks',
    links: customizer
      ? [{ type: 'custom', secondary: true, children: <Customizer /> }]
      : [],
    nav: {
      title: <Logo />,
    },
  }
}
