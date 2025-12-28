import { activityFeedComponents } from '@/registry/components/dashboardblocks/activity-feed/index'
import { kpiComponents } from '@/registry/components/dashboardblocks/kpi/index'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { codeToHtml } from 'shiki'

import { ComponentPreviewHighlighted } from '@/components/component-preview-highlighted'

const exampleComponents = {
  ...kpiComponents,
  ...activityFeedComponents,
}

interface RegistryItem {
  name: string
  files: Array<{
    path: string
    content: string
    type: string
  }>
}

interface ComponentPreviewProps {
  /**
   * The name of the example in the registry (e.g., 'compact-kpi')
   */
  name: keyof typeof exampleComponents
  /**
   * Optional className for the preview container
   */
  className?: string
  /**
   * Optional className for the preview content wrapper
   */
  previewClassName?: string
}

async function getRegistryItem(name: string): Promise<RegistryItem | null> {
  try {
    const filePath = join(process.cwd(), 'public', 'r', `${name}.json`)
    const content = await readFile(filePath, 'utf-8')
    return JSON.parse(content) as RegistryItem
  } catch {
    return null
  }
}

function ExampleRenderer({ name }: { name: keyof typeof exampleComponents }) {
  const Component = exampleComponents[name]
  if (!Component) return null
  return <Component />
}

export async function ComponentPreview({
  name,
  className,
  previewClassName,
}: ComponentPreviewProps) {
  const registryItem = await getRegistryItem(name)

  if (!registryItem || !registryItem.files?.[0]?.content) {
    return (
      <div className='rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive'>
        Could not load registry item: {name}
      </div>
    )
  }

  if (!exampleComponents[name]) {
    return (
      <div className='rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive'>
        Could not find example component: {name}
      </div>
    )
  }

  const code = registryItem.files[0].content.replaceAll(
    'registry/components/',
    'components/',
  )

  const highlightedCode = await codeToHtml(code, {
    lang: 'tsx',
    themes: {
      light: 'github-light-default',
      dark: 'github-dark',
    },
  })

  return (
    <ComponentPreviewHighlighted
      name={name}
      code={code}
      highlightedCode={highlightedCode}
      className={className}
      previewClassName={previewClassName}
    >
      <ExampleRenderer name={name} />
    </ComponentPreviewHighlighted>
  )
}
