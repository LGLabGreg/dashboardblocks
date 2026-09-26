import { createMDX } from 'fumadocs-mdx/next'

const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  reactCompiler: true,
  async redirects() {
    return [
      { source: '/examples', destination: '/docs#examples', permanent: true },
      { source: '/examples/:slug', destination: '/docs/examples/:slug', permanent: true },
      { source: '/docs/examples', destination: '/docs#examples', permanent: true },
    ]
  },
}

export default withMDX(config)
