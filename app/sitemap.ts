import type { MetadataRoute } from 'next'

import { siteConfig } from '@/lib/config'
import { source } from '@/lib/source'

const baseUrl = siteConfig.url

export default function sitemap(): MetadataRoute.Sitemap {
  const docs = source.getPages().map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: page.data.lastModified ?? new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ]

  return [...staticPages, ...docs]
}
