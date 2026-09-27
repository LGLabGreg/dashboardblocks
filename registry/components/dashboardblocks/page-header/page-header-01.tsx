'use client'

import {
  PageHeader,
  PageHeaderActions,
  PageHeaderHeading,
  PageHeaderRow,
} from '@/registry/components/dashboardblocks/page-header'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import { Button } from '@/components/ui/button'

interface PageHeader1Props {
  description: string
  onCreate?: () => void
  onExport?: () => void
  title: string
}

const exampleProps: PageHeader1Props = {
  description: 'Every order across your stores, newest first.',
  title: 'Orders',
}

const PageHeader1 = (props: PageHeader1Props) => {
  const { description, onCreate = () => {}, onExport = () => {}, title } = props

  return (
    <PageHeader>
      <PageHeaderRow>
        <PageHeaderHeading title={title} description={description} />
        <PageHeaderActions>
          <Button variant='outline' onClick={onExport}>
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
  )
}

export { PageHeader1, exampleProps as pageHeader1ExampleProps, type PageHeader1Props }
