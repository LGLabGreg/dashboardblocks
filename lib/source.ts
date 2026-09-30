import { type InferPageType, loader } from 'fumadocs-core/source'
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons'
import { docs } from 'fumadocs-mdx:collections/server'

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
})

export function getPageImage(page: InferPageType<typeof source>) {
  const segments = [...page.slugs, 'image.png']

  return {
    segments,
    url: `/og/docs/${segments.join('/')}`,
  }
}

/** Where a page's Markdown is served, for the page actions and AI tools. */
export function getPageMarkdownUrl(page: InferPageType<typeof source>) {
  const segments = [...page.slugs, 'content.md']

  return {
    segments,
    url: `/llms.mdx/docs/${segments.join('/')}`,
  }
}

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText('processed')
  // Previews mean nothing outside the site, so each becomes its install command.
  const body = processed.replace(
    /<(?:ComponentPreview|ExampleDashboard)\s+name="([^"]+)"[^>]*\/>/g,
    (_, name: string) =>
      `\`\`\`bash\nnpx shadcn@latest add @dashboardblocks/${name}\n\`\`\``,
  )

  const description = page.data.description ? `\n\n> ${page.data.description}` : ''

  return `# ${page.data.title}${description}

${body.trim()}
`
}
