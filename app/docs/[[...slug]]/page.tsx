import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page'
import { createRelativeLink } from 'fumadocs-ui/mdx'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getMDXComponents } from '@/components/mdx/mdx-components'
import { PageActions } from '@/components/page-actions'

import { siteConfig } from '@/lib/config'
import { getPageImage, getPageMarkdownUrl, source } from '@/lib/source'

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()

  const MDX = page.data.body

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <div className='flex flex-wrap items-center justify-between gap-x-6 gap-y-3'>
        <DocsTitle>{page.data.title}</DocsTitle>
        <PageActions
          markdownUrl={getPageMarkdownUrl(page).url}
          pageUrl={`${siteConfig.url}${page.url}`}
          githubUrl={`https://github.com/LGLabGreg/dashboardblocks/blob/main/content/docs/${page.path}`}
        />
      </div>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  )
}

export async function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata(
  props: PageProps<'/docs/[[...slug]]'>,
): Promise<Metadata> {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()

  const image = getPageImage(page).url

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: { canonical: page.url },
    openGraph: {
      type: 'article',
      url: page.url,
      siteName: siteConfig.name,
      title: page.data.title,
      description: page.data.description,
      images: { url: image, width: 1200, height: 630 },
    },
    twitter: {
      card: 'summary_large_image',
      title: page.data.title,
      description: page.data.description,
      images: image,
    },
  }
}
