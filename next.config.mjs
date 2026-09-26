import { createMDX } from 'fumadocs-mdx/next'

const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  reactCompiler: true,
  async rewrites() {
    return [
      // `"@dashboardblocks": "https://dashboardblocks.com/r/{style}/{name}.json"` in
      // components.json resolves each block for the project's component library.
      {
        source: '/r/:base(base|radix|aria)-:style/:name.json',
        destination: '/r/:base/:name.json',
      },
      // Styles from before the base-* and radix-* names are built on Radix UI.
      {
        source: '/r/:style(new-york|default)/:name.json',
        destination: '/r/radix/:name.json',
      },
    ]
  },
  async redirects() {
    return [
      { source: '/examples', destination: '/docs#dashboards', permanent: true },
      { source: '/examples/:slug', destination: '/docs/examples/:slug', permanent: true },
      { source: '/docs/examples', destination: '/docs#dashboards', permanent: true },
    ]
  },
}

export default withMDX(config)
