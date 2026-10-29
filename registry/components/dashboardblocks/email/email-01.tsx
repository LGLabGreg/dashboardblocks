import {
  type EmailBrand,
  EmailFooter,
  EmailLayout,
  EmailPanel,
  EmailPanelNote,
  EmailPanelValue,
  EmailSection,
  EmailText,
  EmailTitle,
} from '@/registry/components/dashboardblocks/email'
import { formatDate, joinDetails } from '@/registry/lib/dashboardblocks/format'

interface SignInRequest {
  at: Date
  /** `Chrome on macOS` */
  device: string
  email: string
  /** `London, United Kingdom` */
  location: string
}

interface Email1Props {
  brand: EmailBrand
  code: string
  expiresInMinutes: number
  /** A postal address for the footer. */
  address?: string
  /** Who asked for the code, so someone who didn't can tell. */
  request?: SignInRequest
  /** The time zone `request.at` is written in. @default 'UTC' */
  timeZone?: string
}

const exampleProps: Email1Props = {
  address: '548 Market St, San Francisco',
  brand: {
    logo: 'https://www.dashboardblocks.com/images/logo-01.png',
    name: 'Acme Analytics',
  },
  code: '482913',
  expiresInMinutes: 10,
  request: {
    at: new Date(Date.UTC(2026, 9, 29, 9, 42)),
    device: 'Chrome on macOS',
    email: 'ana@northwind.com',
    location: 'London, United Kingdom',
  },
  timeZone: 'Europe/London',
}

const email1Subject = ({ brand, code }: Email1Props) =>
  `${code} is your ${brand.name} sign-in code`

const Email1 = ({
  address,
  brand,
  code,
  expiresInMinutes,
  request,
  timeZone = 'UTC',
}: Email1Props) => (
  <EmailLayout
    brand={brand}
    preview={`Enter it on the sign-in page. It works for ${expiresInMinutes} minutes.`}
    footer={<EmailFooter>{joinDetails(brand.name, address)}</EmailFooter>}
  >
    <EmailTitle description='Enter it on the sign-in page to continue.'>
      Your sign-in code
    </EmailTitle>
    <EmailPanel label='Sign-in code'>
      <EmailPanelValue>
        <span className='tracking-[0.18em]'>{code}</span>
      </EmailPanelValue>
      <EmailPanelNote>It works for {expiresInMinutes} minutes.</EmailPanelNote>
    </EmailPanel>
    <EmailSection title='Didn’t ask for it?'>
      <EmailText>
        {request
          ? `Someone asked to sign in as ${request.email} from ${request.device} in ${request.location} at ${formatDate(request.at, 'time-zone', timeZone)}. `
          : null}
        You can ignore this email: nobody can sign in without the code.
      </EmailText>
    </EmailSection>
  </EmailLayout>
)

Email1.PreviewProps = exampleProps

export default Email1
export {
  Email1,
  email1Subject,
  exampleProps as email1ExampleProps,
  type Email1Props,
  type SignInRequest,
}
