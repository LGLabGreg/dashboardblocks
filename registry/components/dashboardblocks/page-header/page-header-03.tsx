'use client'

import {
  ActionsMenu,
  BackLink,
  PageHeader,
  PageHeaderActions,
  PageHeaderHeading,
  PageHeaderMeta,
  PageHeaderRow,
} from '@/registry/components/dashboardblocks/page-header'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface PageHeader3Props {
  back: { href: string; label: string }
  customer: {
    email: string
    initials: string
    location: string
    name: string
    orders: number
    since: string
    status: string
  }
  onArchive?: () => void
  onDelete?: () => void
  onDuplicate?: () => void
  onEdit?: () => void
  onMessage?: () => void
}

const exampleProps: PageHeader3Props = {
  back: { href: '#', label: 'Customers' },
  customer: {
    email: 'jonas@northwind.io',
    initials: 'JW',
    location: 'Berlin, Germany',
    name: 'Jonas Weber',
    orders: 12,
    since: 'Customer since Mar 2024',
    status: 'Active',
  },
}

const PageHeader3 = (props: PageHeader3Props) => {
  const {
    back,
    customer,
    onArchive = () => {},
    onDelete = () => {},
    onDuplicate = () => {},
    onEdit = () => {},
    onMessage = () => {},
  } = props

  return (
    <PageHeader>
      <BackLink href={back.href}>{back.label}</BackLink>
      <PageHeaderRow>
        <PageHeaderHeading
          title={customer.name}
          description={customer.email}
          badge={<Badge variant='secondary'>{customer.status}</Badge>}
          media={
            <Avatar className='size-12'>
              <AvatarFallback>{customer.initials}</AvatarFallback>
            </Avatar>
          }
        />
        <PageHeaderActions>
          <Button variant='outline' onClick={onMessage}>
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
          <Button onClick={onEdit}>
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
      <PageHeaderMeta
        items={[
          {
            icon: (
              <IconPlaceholder
                lucide='MapPinIcon'
                tabler='IconMapPin'
                hugeicons='Location01Icon'
                phosphor='MapPinIcon'
                remixicon='RiMapPinLine'
              />
            ),
            label: customer.location,
          },
          {
            icon: (
              <IconPlaceholder
                lucide='CalendarIcon'
                tabler='IconCalendar'
                hugeicons='CalendarIcon'
                phosphor='CalendarBlankIcon'
                remixicon='RiCalendarLine'
              />
            ),
            label: customer.since,
          },
          {
            icon: (
              <IconPlaceholder
                lucide='ShoppingBagIcon'
                tabler='IconShoppingBag'
                hugeicons='ShoppingBag01Icon'
                phosphor='ShoppingBagIcon'
                remixicon='RiShoppingBag3Line'
              />
            ),
            label: `${customer.orders} orders`,
          },
        ]}
      />
    </PageHeader>
  )
}

export { PageHeader3, exampleProps as pageHeader3ExampleProps, type PageHeader3Props }
