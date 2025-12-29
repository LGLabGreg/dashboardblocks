export const IS_PRODUCTION = process.env.VERCEL_ENV === 'production'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL

const REGISTRY_BASE_URL =
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
  description: 'Beautifully designed dashboard blocks.',
  keywords: [
    'Next.js',
    'React',
    'Tailwind CSS',
    'Components',
    'shadcn',
    'Dashboard',
    'Blocks',
    'Dashboard Blocks',
    'Dashboard Blocks UI',
    'Dashboard Blocks Components',
    'Dashboard Blocks Examples',
    'Dashboard Blocks Documentation',
    'Dashboard Blocks API',
    'Dashboard Blocks SDK',
    'Dashboard Blocks Library',
  ],
  creator: 'LGLab',
  ogImage: `${APP_URL}/opengraph-image.png`,
}
