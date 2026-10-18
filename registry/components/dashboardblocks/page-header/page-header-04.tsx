'use client'

import {
  BlockStateProvider,
  BlockStateText,
  type BlockStatus,
  SkeletonText,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderHeading,
  PageHeaderRow,
} from '@/registry/components/dashboardblocks/page-header'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatNumber } from '@/registry/lib/dashboardblocks/format'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

interface PageHeader4Props {
  /** Leave out to show the empty state. */
  count?: number
  description?: string
  onCreate?: () => void
  onSearch?: (query: string) => void
  status?: BlockStatus
  title: string
}

const exampleProps: PageHeader4Props = {
  count: 2_481,
  description: '312 of them bought for the first time this month.',
  title: 'Customers',
}

const PageHeader4 = (props: PageHeader4Props) => {
  const {
    count,
    description,
    onCreate = () => {},
    onSearch = () => {},
    status,
    title,
  } = props
  const [query, setQuery] = useState('')
  const state = getBlockState(status, count)

  return (
    <BlockStateProvider state={state}>
      <PageHeader className='border-b pb-4'>
        <PageHeaderRow className='@2xl/page-header:items-end'>
          <PageHeaderHeading
            title={title}
            description={
              state === 'loading' ? (
                <SkeletonText className='w-56 max-w-full' />
              ) : (
                !state && description
              )
            }
            badge={
              <span className='text-muted-foreground text-2xl font-light tracking-tight tabular-nums'>
                {state || count === undefined ? (
                  <BlockStateText variant='short' />
                ) : (
                  formatNumber(count)
                )}
              </span>
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
                disabled={state !== undefined}
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
    </BlockStateProvider>
  )
}

export { PageHeader4, exampleProps as pageHeader4ExampleProps, type PageHeader4Props }
