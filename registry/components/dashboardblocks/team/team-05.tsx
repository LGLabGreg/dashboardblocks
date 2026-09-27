'use client'

import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { Fragment, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

import { cn } from '@/lib/utils'

interface PermissionRole {
  id: string
  /** Has every permission and can't be edited, like a workspace owner. */
  locked?: boolean
  members: number
  name: string
}

interface Permission {
  description?: string
  id: string
  label: string
  /** Another permission this one needs. Granting this grants it, and revoking it revokes this. */
  requires?: string
}

interface PermissionGroup {
  id: string
  label: string
  permissions: Permission[]
}

/** `grants[roleId]` lists the permission ids that role has. */
type PermissionGrants = Record<string, string[]>

interface Team5Props {
  description: string
  grants: PermissionGrants
  groups: PermissionGroup[]
  onSave?: (grants: PermissionGrants) => void
  roles: PermissionRole[]
  title: string
}

const exampleProps: Team5Props = {
  description: 'Choose what each role can do. Changes apply to everyone with the role.',
  grants: {
    admin: [
      'dashboards.view',
      'dashboards.edit',
      'dashboards.delete',
      'dashboards.share',
      'data.view',
      'data.connect',
      'data.export',
      'members.view',
      'members.invite',
      'members.roles',
      'billing.view',
    ],
    analyst: [
      'dashboards.view',
      'dashboards.edit',
      'dashboards.share',
      'data.view',
      'data.export',
      'members.view',
    ],
    member: ['dashboards.view', 'dashboards.edit', 'data.view', 'members.view'],
    viewer: ['dashboards.view'],
  },
  groups: [
    {
      id: 'dashboards',
      label: 'Dashboards',
      permissions: [
        { id: 'dashboards.view', label: 'View dashboards' },
        {
          id: 'dashboards.edit',
          label: 'Create and edit',
          requires: 'dashboards.view',
        },
        { id: 'dashboards.delete', label: 'Delete', requires: 'dashboards.edit' },
        {
          description: 'Invite people and create public links',
          id: 'dashboards.share',
          label: 'Share',
          requires: 'dashboards.view',
        },
      ],
    },
    {
      id: 'data',
      label: 'Data',
      permissions: [
        { id: 'data.view', label: 'View data sources' },
        {
          description: 'Add, edit and remove connections',
          id: 'data.connect',
          label: 'Manage connections',
          requires: 'data.view',
        },
        { id: 'data.export', label: 'Export to CSV', requires: 'data.view' },
      ],
    },
    {
      id: 'members',
      label: 'Members',
      permissions: [
        { id: 'members.view', label: 'View members' },
        { id: 'members.invite', label: 'Invite and remove', requires: 'members.view' },
        { id: 'members.roles', label: 'Change roles', requires: 'members.invite' },
      ],
    },
    {
      id: 'billing',
      label: 'Billing',
      permissions: [
        { description: 'Plan, usage and invoices', id: 'billing.view', label: 'View' },
        {
          id: 'billing.manage',
          label: 'Change plan and payment',
          requires: 'billing.view',
        },
      ],
    },
  ],
  roles: [
    { id: 'owner', locked: true, members: 1, name: 'Owner' },
    { id: 'admin', members: 2, name: 'Admin' },
    { id: 'analyst', members: 4, name: 'Analyst' },
    { id: 'member', members: 12, name: 'Member' },
    { id: 'viewer', members: 7, name: 'Viewer' },
  ],
  title: 'Roles and permissions',
}

/** Adds a permission and everything it needs. */
function grant(granted: Set<string>, id: string, byId: Map<string, Permission>) {
  for (let next: string | undefined = id; next && !granted.has(next);) {
    granted.add(next)
    next = byId.get(next)?.requires
  }
}

/** Removes a permission and everything that needs it. */
function revoke(granted: Set<string>, id: string, all: Permission[]) {
  granted.delete(id)
  for (const permission of all) {
    if (permission.requires === id && granted.has(permission.id))
      revoke(granted, permission.id, all)
  }
}

const Team5 = (props: Team5Props) => {
  const { description, groups, onSave, roles, title } = props
  const [saved, setSaved] = useState(props.grants)
  const [grants, setGrants] = useState(props.grants)

  const all = groups.flatMap((group) => group.permissions)
  const byId = new Map(all.map((permission) => [permission.id, permission]))
  const editable = roles.filter((role) => !role.locked)

  const has = (source: PermissionGrants, roleId: string, permissionId: string) =>
    source[roleId]?.includes(permissionId) ?? false

  const changes = editable.reduce(
    (count, role) =>
      count +
      all.filter(
        (permission) =>
          has(grants, role.id, permission.id) !== has(saved, role.id, permission.id),
      ).length,
    0,
  )

  const toggle = (roleId: string, permissionId: string, on: boolean) => {
    setGrants((current) => {
      const granted = new Set(current[roleId] ?? [])
      if (on) grant(granted, permissionId, byId)
      else revoke(granted, permissionId, all)
      return { ...current, [roleId]: all.map((p) => p.id).filter((p) => granted.has(p)) }
    })
  }

  return (
    <Card className='gap-0 pb-0'>
      <CardHeader className='border-b pb-6'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='overflow-x-auto px-0'>
        <table className='w-full text-sm'>
          <caption className='sr-only'>{title}</caption>
          <thead>
            <tr className='border-b'>
              <th
                scope='col'
                className='bg-card sticky left-0 z-10 min-w-40 px-6 py-3 text-left font-medium'
              >
                <span className='sr-only'>Permission</span>
              </th>
              {roles.map((role) => (
                <th
                  key={role.id}
                  scope='col'
                  className='min-w-20 px-2 py-3 text-center font-medium last:pr-6'
                >
                  <div className='flex flex-col items-center gap-0.5'>
                    {role.name}
                    <span className='text-muted-foreground inline-flex items-center gap-1 text-xs font-normal whitespace-nowrap tabular-nums [&_svg]:size-3'>
                      {role.locked && (
                        <IconPlaceholder
                          lucide='LockIcon'
                          tabler='IconLock'
                          hugeicons='SquareLock02Icon'
                          phosphor='LockIcon'
                          remixicon='RiLockLine'
                          aria-hidden
                        />
                      )}
                      {role.members} {role.members === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <Fragment key={group.id}>
                <tr className='bg-muted/50 border-b'>
                  <th
                    scope='colgroup'
                    colSpan={roles.length + 1}
                    className='text-muted-foreground px-6 py-2 text-left text-xs font-medium'
                  >
                    <span className='sticky left-6'>{group.label}</span>
                  </th>
                </tr>
                {group.permissions.map((permission) => (
                  <tr key={permission.id} className='border-b last:border-b-0'>
                    <th
                      scope='row'
                      className='bg-card sticky left-0 z-10 px-6 py-3 text-left font-normal'
                    >
                      <span className='block font-medium'>{permission.label}</span>
                      {permission.description && (
                        <span className='text-muted-foreground block text-xs'>
                          {permission.description}
                        </span>
                      )}
                    </th>
                    {roles.map((role) => {
                      const on = role.locked || has(grants, role.id, permission.id)
                      const changed =
                        !role.locked && on !== has(saved, role.id, permission.id)
                      return (
                        <td
                          key={role.id}
                          className={cn(
                            'px-2 py-3 text-center last:pr-6',
                            changed && 'bg-primary/5',
                          )}
                        >
                          <span className='inline-flex'>
                            <Checkbox
                              aria-label={`${role.name}: ${group.label}, ${permission.label}`}
                              checked={on}
                              disabled={role.locked}
                              onCheckedChange={(next) =>
                                toggle(role.id, permission.id, next)
                              }
                            />
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </CardContent>
      <CardFooter className='flex flex-wrap items-center justify-end gap-2 border-t py-4'>
        <p role='status' className='text-muted-foreground mr-auto text-sm'>
          {changes > 0
            ? `${changes} unsaved ${changes === 1 ? 'change' : 'changes'}`
            : roles.some((role) => role.locked)
              ? `${roles
                  .filter((role) => role.locked)
                  .map((role) => role.name)
                  .join(' and ')} can do everything.`
              : ''}
        </p>
        <Button variant='ghost' disabled={changes === 0} onClick={() => setGrants(saved)}>
          Discard
        </Button>
        <Button
          disabled={changes === 0}
          onClick={() => {
            setSaved(grants)
            onSave?.(grants)
          }}
        >
          Save changes
        </Button>
      </CardFooter>
    </Card>
  )
}

export {
  Team5,
  exampleProps as team5ExampleProps,
  type Permission,
  type PermissionGrants,
  type PermissionGroup,
  type PermissionRole,
  type Team5Props,
}
