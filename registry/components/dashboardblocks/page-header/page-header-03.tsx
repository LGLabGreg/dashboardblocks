'use client'

import {
  BlockStateProvider,
  BlockStateText,
  type BlockStatus,
  Skeleton,
  SkeletonText,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  ActionsMenu,
  BackLink,
  PageHeader,
  PageHeaderActions,
  type PageHeaderFact,
  PageHeaderFacts,
  PageHeaderHeading,
  PageHeaderRow,
} from '@/registry/components/dashboardblocks/page-header'
import {
  StatusLabel,
  type StatusTone,
} from '@/registry/components/dashboardblocks/status-label'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatCurrency, joinDetails } from '@/registry/lib/dashboardblocks/format'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

type CustomerStatus = 'active' | 'at-risk' | 'churned'

const STATUS: Record<CustomerStatus, { label: string; tone: StatusTone }> = {
  active: { label: 'Active', tone: 'good' },
  'at-risk': { label: 'At risk', tone: 'warning' },
  churned: { label: 'Churned', tone: 'neutral' },
}

interface Customer {
  avatar?: string
  email: string
  initials: string
  lastOrder: { id: string; total: number; when: string }
  location: string
  name: string
  orders: number
  since: string
  /** Lifetime spend, in dollars. */
  spent: number
  status: CustomerStatus
}

interface PageHeader3Props {
  back: { href: string; label: string }
  /** Leave out to show the empty state. */
  customer?: Customer
  onArchive?: () => void
  onDelete?: () => void
  onDuplicate?: () => void
  onEdit?: () => void
  onMessage?: () => void
  status?: BlockStatus
}

const exampleProps: PageHeader3Props = {
  back: { href: '#', label: 'Customers' },
  customer: {
    avatar: '/images/avatar-07.webp',
    email: 'jonas@northwind.io',
    initials: 'JW',
    lastOrder: { id: '1042', total: 652.22, when: '3 days ago' },
    location: 'Berlin, Germany',
    name: 'Jonas Weber',
    orders: 12,
    since: 'Mar 2024',
    spent: 7_824,
    status: 'active',
  },
}

function customerFacts(customer: Customer): PageHeaderFact[] {
  return [
    {
      detail: `Across ${customer.orders} orders`,
      label: 'Lifetime value',
      value: formatCurrency(customer.spent),
    },
    {
      label: 'Average order',
      value: formatCurrency(customer.orders > 0 ? customer.spent / customer.orders : 0),
    },
    {
      detail: joinDetails(
        `#${customer.lastOrder.id}`,
        formatCurrency(customer.lastOrder.total, {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        }),
      ),
      label: 'Last order',
      value: customer.lastOrder.when,
    },
    { label: 'Customer since', value: customer.since },
  ]
}

const factValue = <SkeletonText className='w-20' />
const factDetail = <SkeletonText className='w-16' />

const LOADING_FACTS: PageHeaderFact[] = [
  { detail: factDetail, label: 'Lifetime value', value: factValue },
  { label: 'Average order', value: factValue },
  { detail: factDetail, label: 'Last order', value: factValue },
  { label: 'Customer since', value: factValue },
]

const PageHeader3 = (props: PageHeader3Props) => {
  const {
    back,
    customer,
    onArchive = () => {},
    onDelete = () => {},
    onDuplicate = () => {},
    onEdit = () => {},
    onMessage = () => {},
    status,
  } = props
  const state = getBlockState(status, customer)
  const ready = state ? undefined : customer
  const loading = state === 'loading'

  return (
    <BlockStateProvider state={state}>
      <PageHeader>
        <BackLink href={back.href}>{back.label}</BackLink>
        <PageHeaderRow className='@2xl/page-header:items-end'>
          <PageHeaderHeading
            title={ready ? ready.name : <BlockStateText variant='short' />}
            description={
              ready ? (
                joinDetails(ready.email, ready.location)
              ) : loading ? (
                <SkeletonText className='w-56 max-w-full' />
              ) : undefined
            }
            badge={
              ready && (
                <StatusLabel tone={STATUS[ready.status].tone}>
                  {STATUS[ready.status].label}
                </StatusLabel>
              )
            }
            media={
              ready ? (
                <Avatar className='size-12'>
                  {ready.avatar && <AvatarImage src={ready.avatar} alt='' />}
                  <AvatarFallback>{ready.initials}</AvatarFallback>
                </Avatar>
              ) : (
                loading && <Skeleton className='size-12 shrink-0 rounded-full' />
              )
            }
          />
          <PageHeaderActions>
            <Button variant='outline' disabled={!ready} onClick={onMessage}>
              <IconPlaceholder
                lucide='MailIcon'
                tabler='IconMail'
                hugeicons='MailIcon'
                phosphor='EnvelopeIcon'
                remixicon='RiMailLine'
                data-icon='inline-start'
              />
              Message
            </Button>
            <Button disabled={!ready} onClick={onEdit}>
              <IconPlaceholder
                lucide='PencilIcon'
                tabler='IconPencil'
                hugeicons='PencilEdit02Icon'
                phosphor='PencilSimpleIcon'
                remixicon='RiPencilLine'
                data-icon='inline-start'
              />
              Edit
            </Button>
            <ActionsMenu
              disabled={!ready}
              items={[
                {
                  icon: (
                    <IconPlaceholder
                      lucide='CopyIcon'
                      tabler='IconCopy'
                      hugeicons='Copy01Icon'
                      phosphor='CopyIcon'
                      remixicon='RiFileCopyLine'
                    />
                  ),
                  label: 'Duplicate',
                  onSelect: onDuplicate,
                },
                {
                  icon: (
                    <IconPlaceholder
                      lucide='ArchiveIcon'
                      tabler='IconArchive'
                      hugeicons='Archive01Icon'
                      phosphor='ArchiveIcon'
                      remixicon='RiArchiveLine'
                    />
                  ),
                  label: 'Archive',
                  onSelect: onArchive,
                },
                {
                  icon: (
                    <IconPlaceholder
                      lucide='Trash2Icon'
                      tabler='IconTrash'
                      hugeicons='Delete02Icon'
                      phosphor='TrashIcon'
                      remixicon='RiDeleteBinLine'
                    />
                  ),
                  label: 'Delete',
                  onSelect: onDelete,
                  variant: 'destructive',
                },
              ]}
            />
          </PageHeaderActions>
        </PageHeaderRow>
        {ready ? (
          <PageHeaderFacts items={customerFacts(ready)} />
        ) : (
          loading && <PageHeaderFacts items={LOADING_FACTS} />
        )}
      </PageHeader>
    </BlockStateProvider>
  )
}

export { PageHeader3, exampleProps as pageHeader3ExampleProps, type PageHeader3Props }
