import { createFromSource } from 'fumadocs-core/search/server'

import { source } from '@/lib/source'

// Built once into a static index that the search dialog downloads and queries in the browser.
export const revalidate = false

export const { staticGET: GET } = createFromSource(source, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: 'english',
})
