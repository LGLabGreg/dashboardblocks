import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'

import { Customizer } from '@/components/customizer/customizer'
import { Logo } from '@/components/logo'

export function baseOptions(): BaseLayoutProps {
  return {
    githubUrl: 'https://github.com/LGLabGreg/dashboardblocks',
    links: [{ type: 'custom', secondary: true, children: <Customizer /> }],
    nav: {
      title: <Logo />,
    },
  }
}
