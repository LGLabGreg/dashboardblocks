'use client'

import {
  PageHeader,
  PageHeaderActions,
  PageHeaderHeading,
  PageHeaderRow,
} from '@/registry/components/dashboardblocks/page-header'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

interface PageHeader4Props {
  count: number
  description: string
  onCreate?: () => void
  onSearch?: (query: string) => void
  title: string
}

const countFormatter = new Intl.NumberFormat('en-US')

const exampleProps: PageHeader4Props = {
  count: 2_481,
  description: 'People who bought from any of your stores.',
  title: 'Customers',
}

const PageHeader4 = (props: PageHeader4Props) => {
  const { count, description, onCreate = () => {}, onSearch = () => {}, title } = props
  const [query, setQuery] = useState('')

  return (
    <PageHeader>
      <PageHeaderRow className='@2xl/page-header:items-center'>
        <PageHeaderHeading
          title={title}
          description={description}
          badge={
            <Badge variant='outline' className='tabular-nums'>
              {countFormatter.format(count)}
            </Badge>
          }
        />
        <PageHeaderActions className='@2xl/page-header:flex-nowrap'>
          <InputGroup className='min-w-0 flex-1 @2xl/page-header:w-64 @2xl/page-header:flex-none'>
            <InputGroupAddon>
              <IconPlaceholder
                lucide='SearchIcon'
                tabler='IconSearch'
                hugeicons='SearchIcon'
                phosphor='MagnifyingGlassIcon'
                remixicon='RiSearchLine'
              />
            </InputGroupAddon>
            <InputGroupInput
              type='search'
              aria-label={`Search ${title.toLowerCase()}`}
              placeholder={`Search ${title.toLowerCase()}…`}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                onSearch(event.target.value)
              }}
            />
          </InputGroup>
          <Button onClick={onCreate}>
            <IconPlaceholder
              lucide='PlusIcon'
              tabler='IconPlus'
              hugeicons='PlusSignIcon'
              phosphor='PlusIcon'
              remixicon='RiAddLine'
              data-icon='inline-start'
            />
            New customer
          </Button>
        </PageHeaderActions>
      </PageHeaderRow>
    </PageHeader>
  )
}

export { PageHeader4, exampleProps as pageHeader4ExampleProps, type PageHeader4Props }
