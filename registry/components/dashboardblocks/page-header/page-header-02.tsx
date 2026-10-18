'use client'

import {
  BlockStateProvider,
  BlockStateText,
  type BlockState,
  type BlockStatus,
  SkeletonText,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderHeading,
  PageHeaderRow,
  type PageTab,
  PageTabs,
} from '@/registry/components/dashboardblocks/page-header'
import {
  StatusLabel,
  type StatusTone,
} from '@/registry/components/dashboardblocks/status-label'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import { Button } from '@/components/ui/button'

type ProjectStatus = 'draft' | 'live' | 'paused'

const STATUS: Record<ProjectStatus, { label: string; tone: StatusTone }> = {
  draft: { label: 'Draft', tone: 'neutral' },
  live: { label: 'Live', tone: 'good' },
  paused: { label: 'Paused', tone: 'warning' },
}

interface PageHeader2Props {
  /** Leave out to show the empty state. */
  description?: string
  onInvite?: () => void
  pathname: string
  projectStatus?: ProjectStatus
  status?: BlockStatus
  tabs: PageTab[]
  title: string
}

const exampleProps: PageHeader2Props = {
  description:
    'Storefront, checkout and fulfilment for the EU region, with 12 orders to ship and 3 open issues.',
  pathname: '/projects/acme-store',
  projectStatus: 'live',
  tabs: [
    { href: '/projects/acme-store', title: 'Overview' },
    { badge: 12, href: '/projects/acme-store/orders', title: 'Orders' },
    { href: '/projects/acme-store/customers', title: 'Customers' },
    { badge: 3, href: '/projects/acme-store/issues', title: 'Issues' },
    { href: '/projects/acme-store/settings', title: 'Settings' },
  ],
  title: 'Acme Store',
}

function tabBadge(tab: PageTab, state: BlockState) {
  if (tab.badge === undefined || state !== 'loading') return undefined
  return <SkeletonText className='w-4' />
}

const PageHeader2 = (props: PageHeader2Props) => {
  const {
    description,
    onInvite = () => {},
    pathname,
    projectStatus,
    status,
    tabs,
    title,
  } = props
  const state = getBlockState(status, description)

  return (
    <BlockStateProvider state={state}>
      <PageHeader>
        <PageHeaderRow className='@2xl/page-header:items-end'>
          <PageHeaderHeading
            title={title}
            description={state ? <BlockStateText /> : description}
            badge={
              state === 'loading' ? (
                <SkeletonText className='w-10' />
              ) : (
                !state &&
                projectStatus && (
                  <StatusLabel tone={STATUS[projectStatus].tone}>
                    {STATUS[projectStatus].label}
                  </StatusLabel>
                )
              )
            }
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
        <PageTabs
          items={
            state ? tabs.map((tab) => ({ ...tab, badge: tabBadge(tab, state) })) : tabs
          }
          pathname={pathname}
        />
      </PageHeader>
    </BlockStateProvider>
  )
}

export { PageHeader2, exampleProps as pageHeader2ExampleProps, type PageHeader2Props }
