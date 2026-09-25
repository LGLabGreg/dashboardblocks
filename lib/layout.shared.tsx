import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'

import { Logo } from '@/components/logo'

export function baseOptions(): BaseLayoutProps {
  return {
    githubUrl: 'https://github.com/LGLabGreg/dashboardblocks',
    nav: {
      title: <Logo />,
    },
  }
}
