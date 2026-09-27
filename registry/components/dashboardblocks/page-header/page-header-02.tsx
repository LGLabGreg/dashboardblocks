'use client'

import {
  PageHeader,
  PageHeaderActions,
  PageHeaderHeading,
  PageHeaderRow,
  type PageTab,
  PageTabs,
} from '@/registry/components/dashboardblocks/page-header'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface PageHeader2Props {
  description: string
  onInvite?: () => void
  /** The current path, used to mark the active tab. */
  pathname: string
  status: string
  tabs: PageTab[]
  title: string
}

const exampleProps: PageHeader2Props = {
  description: 'Storefront, checkout and fulfilment for the EU region.',
  pathname: '/projects/acme-store',
  status: 'Live',
  tabs: [
    { href: '/projects/acme-store', title: 'Overview' },
    { badge: 12, href: '/projects/acme-store/orders', title: 'Orders' },
    { href: '/projects/acme-store/customers', title: 'Customers' },
    { badge: 3, href: '/projects/acme-store/issues', title: 'Issues' },
    { href: '/projects/acme-store/settings', title: 'Settings' },
  ],
  title: 'Acme Store',
}

const PageHeader2 = (props: PageHeader2Props) => {
  const { description, onInvite = () => {}, pathname, status, tabs, title } = props

  return (
    <PageHeader>
      <PageHeaderRow>
        <PageHeaderHeading
          title={title}
          description={description}
          badge={<Badge variant='secondary'>{status}</Badge>}
        />
        <PageHeaderActions>
          <Button variant='outline' onClick={onInvite}>
            <IconPlaceholder
              lucide='UserPlusIcon'
              tabler='IconUserPlus'
              hugeicons='UserAdd01Icon'
              phosphor='UserPlusIcon'
              remixicon='RiUserAddLine'
              data-icon='inline-start'
            />
            Invite
          </Button>
        </PageHeaderActions>
      </PageHeaderRow>
      <PageTabs items={tabs} pathname={pathname} />
    </PageHeader>
  )
}

export { PageHeader2, exampleProps as pageHeader2ExampleProps, type PageHeader2Props }
