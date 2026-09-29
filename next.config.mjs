import { createMDX } from 'fumadocs-mdx/next'

const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  reactCompiler: true,
  // Plain static files: Vercel serves them without touching the ISR cache.
  // Rewrites and redirects live in vercel.json.
  output: 'export',
}

export default withMDX(config)
