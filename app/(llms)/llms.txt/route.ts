import { source } from '@/lib/source'

export const revalidate = false

export async function GET() {
  const pages = source.getPages()

  // Group pages by their top-level section
  const sections = new Map<string, typeof pages>()

  for (const page of pages) {
    const section = page.slugs[0] || 'docs'
    if (!sections.has(section)) {
      sections.set(section, [])
    }
    sections.get(section)!.push(page)
  }

  const baseUrl = 'https://dashboardblocks.com'

  let content = `# Dashboard Blocks

> High-quality, individually installable dashboard components for the shadcn/ui ecosystem. Composable primitives that work alongside shadcn Card components.

Dashboard Blocks provides depth over breadth - exceptionally well-designed dashboard primitives that can be installed via \`npx shadcn add\`.

## Documentation

`

  for (const [, sectionPages] of sections) {
    for (const page of sectionPages) {
      const url = `${baseUrl}${page.url}`
      const description = page.data.description || page.data.title
      content += `- [${page.data.title}](${url}): ${description}\n`
    }
  }

  content += `
## Optional

- [GitHub](https://github.com/LGLabGreg/dashboardblocks): Source code and contributions
- [llms-full.txt](${baseUrl}/llms-full.txt): Complete documentation content
`

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
