import {
  type EmailBrand,
  EmailFooter,
  EmailLayout,
  EmailPanel,
  EmailPanelButton,
  EmailPanelNote,
  EmailPanelTitle,
  EmailSection,
  EmailText,
  EmailTitle,
} from '@/registry/components/dashboardblocks/email'
import {
  formatDate,
  formatNumber,
  joinDetails,
} from '@/registry/lib/dashboardblocks/format'

interface Email2Props {
  acceptUrl: string
  brand: EmailBrand
  /** The address the invite was sent to: only it can accept. */
  email: string
  expiresAt: Date
  inviter: { email: string; name: string }
  role: string
  workspace: { members: number; name: string }
  /** A postal address for the footer. */
  address?: string
  /** The time zone `expiresAt` is written in. @default 'UTC' */
  timeZone?: string
}

const exampleProps: Email2Props = {
  acceptUrl: 'https://app.acme.com/invites/accept',
  address: '548 Market St, San Francisco',
  brand: {
    logo: 'https://www.dashboardblocks.com/images/logo-01.png',
    name: 'Acme Analytics',
  },
  email: 'ana@northwind.com',
  expiresAt: new Date(Date.UTC(2026, 10, 5, 9, 42)),
  inviter: { email: 'maya@northwind.com', name: 'Maya Patel' },
  role: 'Editor',
  timeZone: 'Europe/London',
  workspace: { members: 24, name: 'Northwind Finance' },
}

const article = (word: string) => (/^[aeiou]/i.test(word) ? 'an' : 'a')

const email2Subject = ({ inviter, workspace }: Email2Props) =>
  `${inviter.name} invited you to ${workspace.name}`

const Email2 = ({
  acceptUrl,
  address,
  brand,
  email,
  expiresAt,
  inviter,
  role,
  timeZone = 'UTC',
  workspace,
}: Email2Props) => (
  <EmailLayout
    brand={brand}
    preview={`${inviter.name} invited you to join as ${article(role)} ${role}.`}
    footer={<EmailFooter>{joinDetails(brand.name, address)}</EmailFooter>}
  >
    <EmailTitle
      description={`${inviter.name} (${inviter.email}) invited you to work with the team as ${article(role)} ${role}.`}
    >
      Join {workspace.name} on {brand.name}
    </EmailTitle>
    <EmailPanel label='Workspace'>
      <EmailPanelTitle>{workspace.name}</EmailPanelTitle>
      <EmailPanelNote>
        {formatNumber(workspace.members)} {workspace.members === 1 ? 'member' : 'members'}
      </EmailPanelNote>
      <EmailPanelButton href={acceptUrl}>Accept invite</EmailPanelButton>
    </EmailPanel>
    <EmailSection>
      <EmailText>
        The invite works until {formatDate(expiresAt, 'day', timeZone)}, and only for{' '}
        {email}. Not expecting it? You can ignore this email and nothing will change.
      </EmailText>
    </EmailSection>
  </EmailLayout>
)

Email2.PreviewProps = exampleProps

export default Email2
export { Email2, email2Subject, exampleProps as email2ExampleProps, type Email2Props }
