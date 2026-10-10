'use client'

import {
  type ConnectionStatus,
  ConnectionStatusLabel,
  CopyButton,
  SettingsRow,
} from '@/registry/components/dashboardblocks/settings'
import { type FormEvent, useId, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

interface SsoConnection {
  /** The identity provider's signing certificate, in PEM. */
  certificate: string
  issuer: string
  provider: string
  signInUrl: string
}

interface SsoDomain {
  domain: string
  id: string
  txtRecord: string
  verified: boolean
}

interface Security6Props {
  acsUrl: string
  connection: SsoConnection
  description: string
  domains: SsoDomain[]
  entityId: string
  enforced: boolean
  onEnforcedChange?: (enforced: boolean) => void
  onSave?: (connection: SsoConnection) => void
  onVerifyDomain?: (id: string) => boolean | Promise<boolean>
  providers: string[]
  status: ConnectionStatus
  title: string
}

const exampleProps: Security6Props = {
  acsUrl: 'https://app.acme.co/sso/saml/acs',
  connection: {
    certificate:
      '-----BEGIN CERTIFICATE-----\nMIIDpDCCAoygAwIBAgIGAY…\n-----END CERTIFICATE-----',
    issuer: 'http://www.okta.com/exk8f2m1q9ZrT4bH5d7',
    provider: 'Okta',
    signInUrl: 'https://acme.okta.com/app/acme_analytics/exk8f2m1q9/sso/saml',
  },
  description: 'Let people sign in with your company’s identity provider over SAML.',
  domains: [
    { domain: 'acme.co', id: 'd1', txtRecord: 'acme-verify=5f2c9a71e3', verified: true },
    {
      domain: 'acme.io',
      id: 'd2',
      txtRecord: 'acme-verify=b81d04c6fa',
      verified: false,
    },
  ],
  enforced: false,
  entityId: 'https://app.acme.co/sso/saml/metadata/ws_4f9a',
  providers: ['Okta', 'Microsoft Entra ID', 'Google Workspace', 'OneLogin', 'Other SAML'],
  status: 'connected',
  title: 'Single sign-on',
}

const Security6 = (props: Security6Props) => {
  const {
    acsUrl,
    description,
    entityId,
    onEnforcedChange,
    onSave,
    onVerifyDomain,
    providers,
    status,
    title,
  } = props
  const id = useId()
  const [saved, setSaved] = useState(props.connection)
  const [draft, setDraft] = useState(props.connection)
  const [domains, setDomains] = useState(props.domains)
  const [enforced, setEnforced] = useState(props.enforced)
  const [checking, setChecking] = useState<string | null>(null)
  const [notFound, setNotFound] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const dirty = (Object.keys(draft) as (keyof SsoConnection)[]).some(
    (key) => draft[key] !== saved[key],
  )
  const verified = domains.filter((domain) => domain.verified)
  const canEnforce = status === 'connected' && verified.length > 0

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!/^https:\/\//.test(draft.signInUrl.trim()))
      return setError('The sign-in URL must start with https://.')
    if (!draft.issuer.trim() || !draft.certificate.trim())
      return setError('Add the issuer and certificate from your identity provider.')
    const next = {
      ...draft,
      certificate: draft.certificate.trim(),
      issuer: draft.issuer.trim(),
      signInUrl: draft.signInUrl.trim(),
    }
    setError(null)
    setDraft(next)
    setSaved(next)
    onSave?.(next)
  }

  const verify = async (domain: SsoDomain) => {
    setChecking(domain.id)
    const ok = onVerifyDomain ? await onVerifyDomain(domain.id) : true
    setChecking(null)
    setNotFound(ok ? null : domain.id)
    if (ok) {
      setDomains((current) =>
        current.map((item) =>
          item.id === domain.id ? { ...item, verified: true } : item,
        ),
      )
    }
  }

  const field = (key: keyof SsoConnection, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }))

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <ConnectionStatusLabel status={status} />
        </CardAction>
      </CardHeader>
      <CardContent className='flex flex-col gap-6'>
        <section aria-labelledby={`${id}-sp`} className='flex flex-col gap-3'>
          <h3 id={`${id}-sp`} className='text-sm font-medium'>
            Add these to your identity provider
          </h3>
          {[
            { label: 'ACS URL', value: acsUrl },
            { label: 'Entity ID', value: entityId },
          ].map((item) => (
            <div key={item.label} className='flex flex-col gap-1'>
              <span className='text-muted-foreground text-xs'>{item.label}</span>
              <div className='bg-muted/50 flex items-center gap-1 rounded-md border py-1 pr-1 pl-3'>
                <code className='min-w-0 flex-1 truncate font-mono text-sm'>
                  {item.value}
                </code>
                <CopyButton label={`Copy ${item.label}`} value={item.value} />
              </div>
            </div>
          ))}
        </section>

        <form
          method='post'
          noValidate
          onSubmit={save}
          aria-labelledby={`${id}-idp`}
          className='flex flex-col gap-4 border-t pt-6'
        >
          <h3 id={`${id}-idp`} className='text-sm font-medium'>
            Your identity provider
          </h3>
          <div className='grid gap-4 @md:grid-cols-2'>
            <div className='flex flex-col gap-2'>
              <label htmlFor={`${id}-provider`} className='text-sm'>
                Provider
              </label>
              <NativeSelect
                id={`${id}-provider`}
                value={draft.provider}
                onChange={(event) => field('provider', event.target.value)}
                className='w-full'
              >
                {providers.map((provider) => (
                  <NativeSelectOption key={provider} value={provider}>
                    {provider}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <div className='flex flex-col gap-2'>
              <label htmlFor={`${id}-issuer`} className='text-sm'>
                Issuer
              </label>
              <Input
                id={`${id}-issuer`}
                spellCheck={false}
                value={draft.issuer}
                onChange={(event) => field('issuer', event.target.value)}
              />
            </div>
            <div className='flex flex-col gap-2 @md:col-span-2'>
              <label htmlFor={`${id}-url`} className='text-sm'>
                Sign-in URL
              </label>
              <Input
                id={`${id}-url`}
                type='url'
                spellCheck={false}
                value={draft.signInUrl}
                onChange={(event) => field('signInUrl', event.target.value)}
              />
            </div>
            <div className='flex flex-col gap-2 @md:col-span-2'>
              <label htmlFor={`${id}-certificate`} className='text-sm'>
                Certificate
              </label>
              <Textarea
                id={`${id}-certificate`}
                rows={4}
                spellCheck={false}
                value={draft.certificate}
                onChange={(event) => field('certificate', event.target.value)}
                className='font-mono text-xs'
              />
            </div>
          </div>
          {error && (
            <p role='alert' className='text-destructive text-sm'>
              {error}
            </p>
          )}
          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='ghost'
              disabled={!dirty}
              onClick={() => {
                setDraft(saved)
                setError(null)
              }}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={!dirty}>
              Save
            </Button>
          </div>
        </form>

        <section
          aria-labelledby={`${id}-domains`}
          className='flex flex-col gap-3 border-t pt-6'
        >
          <div className='flex flex-col gap-0.5'>
            <h3 id={`${id}-domains`} className='text-sm font-medium'>
              Domains
            </h3>
            <p className='text-muted-foreground text-sm'>
              People with an email at a verified domain sign in with SSO.
            </p>
          </div>
          <ul className='flex flex-col divide-y border-y'>
            {domains.map((domain) => (
              <li key={domain.id} className='flex flex-col gap-2 py-3'>
                <div className='flex items-center gap-3'>
                  <span className='min-w-0 flex-1 truncate text-sm font-medium'>
                    {domain.domain}
                  </span>
                  {domain.verified ? (
                    <ConnectionStatusLabel status='connected' label='Verified' />
                  ) : (
                    <>
                      <ConnectionStatusLabel status='paused' label='Not verified' />
                      <Button
                        variant='outline'
                        size='sm'
                        disabled={checking === domain.id}
                        aria-label={`Verify ${domain.domain}`}
                        onClick={() => void verify(domain)}
                      >
                        {checking === domain.id ? 'Checking…' : 'Verify'}
                      </Button>
                    </>
                  )}
                </div>
                {!domain.verified && (
                  <div className='flex flex-col gap-1'>
                    <span className='text-muted-foreground text-xs'>
                      Add this TXT record to {domain.domain}’s DNS, then verify.
                    </span>
                    <div className='bg-muted/50 flex items-center gap-1 rounded-md border py-1 pr-1 pl-3'>
                      <code className='min-w-0 flex-1 truncate font-mono text-sm'>
                        {domain.txtRecord}
                      </code>
                      <CopyButton
                        label={`Copy TXT record for ${domain.domain}`}
                        value={domain.txtRecord}
                      />
                    </div>
                    {notFound === domain.id && (
                      <p role='alert' className='text-destructive text-xs'>
                        We couldn’t find the record yet. DNS changes can take up to an
                        hour.
                      </p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>

        <SettingsRow
          id={`${id}-enforce`}
          label='Require SSO'
          description={
            canEnforce
              ? `Everyone at ${verified.map((domain) => domain.domain).join(', ')} must sign in with ${saved.provider}. Owners can still use a password.`
              : 'Connect your identity provider and verify a domain first.'
          }
        >
          <Switch
            aria-labelledby={`${id}-enforce`}
            aria-describedby={`${id}-enforce-description`}
            checked={enforced && canEnforce}
            disabled={!canEnforce}
            onCheckedChange={(next) => {
              setEnforced(next)
              onEnforcedChange?.(next)
            }}
          />
        </SettingsRow>
      </CardContent>
    </Card>
  )
}

export {
  Security6,
  exampleProps as security6ExampleProps,
  type Security6Props,
  type SsoConnection,
  type SsoDomain,
}
