'use client'

import {
  BlockStateProvider,
  BlockStateText,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderHeading,
  PageHeaderRow,
} from '@/registry/components/dashboardblocks/page-header'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import { Button } from '@/components/ui/button'

interface PageHeader1Props {
  /** Leave out to show the empty state. */
  description?: string
  onCreate?: () => void
  onExport?: () => void
  status?: BlockStatus
  title: string
}

const exampleProps: PageHeader1Props = {
  description: '1,284 orders this month, 38 of them waiting to ship.',
  title: 'Orders',
}

const PageHeader1 = (props: PageHeader1Props) => {
  const { description, onCreate = () => {}, onExport = () => {}, status, title } = props
  const state = getBlockState(status, description)

  return (
    <BlockStateProvider state={state}>
      <PageHeader className='border-b pb-4'>
        <PageHeaderRow className='@2xl/page-header:items-end'>
          <PageHeaderHeading
            title={title}
            description={state ? <BlockStateText /> : description}
          />
          <PageHeaderActions>
            <Button variant='outline' disabled={state !== undefined} onClick={onExport}>
              <IconPlaceholder
                lucide='DownloadIcon'
                tabler='IconDownload'
                hugeicons='Download01Icon'
                phosphor='DownloadIcon'
                remixicon='RiDownloadLine'
                data-icon='inline-start'
              />
              Export
            </Button>
            <Button onClick={onCreate}>
              <IconPlaceholder
                lucide='PlusIcon'
                tabler='IconPlus'
                hugeicons='PlusSignIcon'
                phosphor='PlusIcon'
                remixicon='RiAddLine'
                data-icon='inline-start'
              />
              New order
            </Button>
          </PageHeaderActions>
        </PageHeaderRow>
      </PageHeader>
    </BlockStateProvider>
  )
}

export { PageHeader1, exampleProps as pageHeader1ExampleProps, type PageHeader1Props }
