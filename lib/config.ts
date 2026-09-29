export const IS_PRODUCTION = process.env.VERCEL_ENV === 'production'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://dashboardblocks.com'

export const REGISTRY_BASE_URL =
  process.env.REGISTRY_BASE_URL ??
  (process.env.NODE_ENV === 'production'
    ? 'https://dashboardblocks.com'
    : 'http://localhost:3000')

export function registryUrl(componentName: string): string {
  return `${REGISTRY_BASE_URL}/r/${componentName}.json`
}

export const siteConfig = {
  name: 'Dashboardblocks',
  url: APP_URL,
  title: 'Dashboardblocks – Dashboard blocks for shadcn/ui and React',
  description:
    'Open-source dashboard blocks for shadcn/ui: KPI cards, charts, data tables, usage meters and activity feeds. Install with the shadcn CLI and own the code.',
  keywords: [
    'shadcn',
    'shadcn/ui',
    'shadcn blocks',
    'shadcn dashboard',
    'dashboard blocks',
    'dashboard components',
    'dashboard template',
    'admin dashboard',
    'React',
    'Next.js',
    'Tailwind CSS',
    'Base UI',
    'Radix UI',
    'React Aria',
    'KPI cards',
    'charts',
    'data table',
  ],
  creator: 'LGLab',
  ogImage: '/og/image.png',
}
