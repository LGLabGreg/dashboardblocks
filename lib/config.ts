export const IS_PRODUCTION = process.env.VERCEL_ENV === 'production'

export const siteConfig = {
  name: 'Dashboardblocks',
  url: 'https://dashboardblocks.com',
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
  ogImage: `${process.env.NEXT_PUBLIC_APP_URL}/opengraph-image.png`,
}
