'use client'

import {
  CommandMenu,
  type CommandMenuGroup,
  CommandMenuTrigger,
  useCommandMenuShortcut,
} from '@/registry/components/dashboardblocks/command-menu'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type ReactNode, useCallback, useState } from 'react'

interface CommandMenu1Props {
  /** Opens the menu with ⌘ or Ctrl and this key. */
  shortcutKey?: string
  onAction?: (id: string) => void
  onNavigate?: (href: string) => void
}

const exampleProps: CommandMenu1Props = { shortcutKey: '/' }

const pages: CommandMenuGroup = {
  heading: 'Pages',
  items: [
    {
      href: '/',
      icon: (
        <IconPlaceholder
          lucide='LayoutDashboardIcon'
          tabler='IconDashboard'
          hugeicons='DashboardSquare01Icon'
          phosphor='SquaresFourIcon'
          remixicon='RiDashboardLine'
        />
      ),
      id: 'page-overview',
      keywords: ['home', 'dashboard'],
      label: 'Overview',
    },
    {
      href: '/orders',
      icon: (
        <IconPlaceholder
          lucide='ShoppingCartIcon'
          tabler='IconShoppingCart'
          hugeicons='ShoppingCart01Icon'
          phosphor='ShoppingCartIcon'
          remixicon='RiShoppingCartLine'
        />
      ),
      id: 'page-orders',
      keywords: ['sales', 'purchases'],
      label: 'Orders',
    },
    {
      href: '/customers',
      icon: (
        <IconPlaceholder
          lucide='UsersIcon'
          tabler='IconUsers'
          hugeicons='UserGroupIcon'
          phosphor='UsersIcon'
          remixicon='RiTeamLine'
        />
      ),
      id: 'page-customers',
      keywords: ['people', 'contacts'],
      label: 'Customers',
    },
    {
      href: '/settings/billing',
      icon: (
        <IconPlaceholder
          lucide='CreditCardIcon'
          tabler='IconCreditCard'
          hugeicons='CreditCardIcon'
          phosphor='CreditCardIcon'
          remixicon='RiBankCardLine'
        />
      ),
      id: 'page-billing',
      keywords: ['invoices', 'plan', 'payment'],
      label: 'Billing',
    },
  ],
}

const actions: { icon: ReactNode; id: string; label: string; shortcut?: string }[] = [
  {
    icon: (
      <IconPlaceholder
        lucide='PlusIcon'
        tabler='IconPlus'
        hugeicons='PlusSignIcon'
        phosphor='PlusIcon'
        remixicon='RiAddLine'
      />
    ),
    id: 'new-order',
    label: 'Create order',
    shortcut: '⌘N',
  },
  {
    icon: (
      <IconPlaceholder
        lucide='UserPlusIcon'
        tabler='IconUserPlus'
        hugeicons='UserAdd01Icon'
        phosphor='UserPlusIcon'
        remixicon='RiUserAddLine'
      />
    ),
    id: 'invite',
    label: 'Invite a teammate',
  },
  {
    icon: (
      <IconPlaceholder
        lucide='DownloadIcon'
        tabler='IconDownload'
        hugeicons='Download01Icon'
        phosphor='DownloadIcon'
        remixicon='RiDownloadLine'
      />
    ),
    id: 'export-customers',
    label: 'Export customers',
  },
]

const CommandMenu1 = (props: CommandMenu1Props) => {
  const [lastCommand, setLastCommand] = useState<string | null>(null)
  const {
    onAction = (id: string) =>
      setLastCommand(actions.find((action) => action.id === id)?.label ?? id),
    onNavigate = (href: string) => setLastCommand(`Go to ${href}`),
    shortcutKey = 'k',
  } = props
  const [open, setOpen] = useState(false)
  const openMenu = useCallback(() => setOpen(true), [])
  useCommandMenuShortcut(openMenu, shortcutKey)

  const groups: CommandMenuGroup[] = [
    pages,
    {
      heading: 'Actions',
      items: actions.map((action) => ({
        ...action,
        onSelect: () => onAction(action.id),
      })),
    },
  ]

  return (
    <div className='flex flex-col items-center gap-3'>
      <CommandMenuTrigger
        onClick={openMenu}
        placeholder='Search or run a command…'
        shortcut={`⌘${shortcutKey.toUpperCase()}`}
      />
      <p role='status' className='text-muted-foreground min-h-5 text-sm'>
        {lastCommand && `Ran: ${lastCommand}`}
      </p>
      <CommandMenu
        open={open}
        onOpenChange={setOpen}
        groups={groups}
        onNavigate={onNavigate}
        placeholder='Search pages and actions…'
      />
    </div>
  )
}

export { CommandMenu1, exampleProps as commandMenu1ExampleProps, type CommandMenu1Props }
