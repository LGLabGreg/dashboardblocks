import {
  type EmailBrand,
  EmailFooter,
  EmailLayout,
  EmailLink,
  EmailPanel,
  EmailPanelMoney,
  EmailPanelNote,
  EmailRows,
  EmailSection,
  EmailText,
  EmailTitle,
} from '@/registry/components/dashboardblocks/email'
import {
  formatCurrency,
  formatDate,
  joinDetails,
} from '@/registry/lib/dashboardblocks/format'

interface ReceiptLine {
  amount: number
  label: string
  /** `5 seats, until Oct 29, 2027` */
  detail?: string
}

interface Email3Props {
  /** What was paid, tax included. */
  amount: number
  billingUrl: string
  brand: EmailBrand
  invoiceUrl: string
  /** Every charge, tax included, adding up to `amount`. */
  lines: ReceiptLine[]
  number: string
  paidAt: Date
  /** `Visa ending 4242` */
  paymentMethod: string
  plan: { name: string; renewsAt: Date }
  /** A postal address for the footer. */
  address?: string
  /** @default 'USD' */
  currency?: string
  /** The time zone dates are written in. @default 'UTC' */
  timeZone?: string
}

const exampleProps: Email3Props = {
  address: '548 Market St, San Francisco',
  amount: 588,
  billingUrl: 'https://app.acme.com/settings/billing',
  brand: {
    logo: 'https://www.dashboardblocks.com/images/logo-01.png',
    name: 'Acme Analytics',
  },
  invoiceUrl: 'https://app.acme.com/settings/billing/invoices/2026-0412',
  lines: [
    { amount: 490, detail: '5 seats, until Oct 29, 2027', label: 'Pro plan, yearly' },
    { amount: 98, label: 'VAT (20%)' },
  ],
  number: '2026-0412',
  paidAt: new Date(Date.UTC(2026, 9, 29, 9, 42)),
  paymentMethod: 'Visa ending 4242',
  plan: { name: 'Pro', renewsAt: new Date(Date.UTC(2027, 9, 29, 9, 42)) },
  timeZone: 'Europe/London',
}

const email3Subject = ({ amount, brand, currency }: Email3Props) =>
  `Your ${brand.name} receipt for ${formatCurrency(amount, { currency, precision: 'exact' })}`

const Email3 = ({
  address,
  amount,
  billingUrl,
  brand,
  currency = 'USD',
  invoiceUrl,
  lines,
  number,
  paidAt,
  paymentMethod,
  plan,
  timeZone = 'UTC',
}: Email3Props) => {
  const money = (value: number) => formatCurrency(value, { currency, precision: 'exact' })
  const paid = money(amount)
  return (
    <EmailLayout
      brand={brand}
      preview={`${paid} paid with ${paymentMethod}. Your invoice is ready to download.`}
      footer={<EmailFooter>{joinDetails(brand.name, address)}</EmailFooter>}
    >
      <EmailTitle
        description={`Thanks for your payment. Your ${plan.name} plan now runs until ${formatDate(plan.renewsAt, 'date', timeZone)}.`}
      >
        Receipt for your {plan.name} plan
      </EmailTitle>
      <EmailPanel label='Amount paid'>
        <EmailPanelMoney>{paid}</EmailPanelMoney>
        <EmailPanelNote>
          {joinDetails(formatDate(paidAt, 'date', timeZone), paymentMethod)}
        </EmailPanelNote>
      </EmailPanel>
      <EmailSection title={`Receipt #${number}`}>
        <EmailRows
          rows={lines.map((line) => ({
            detail: line.detail,
            label: line.label,
            value: money(line.amount),
          }))}
          total={{ label: 'Paid', value: paid }}
        />
      </EmailSection>
      <EmailSection>
        <EmailText>
          <EmailLink href={invoiceUrl}>Download the invoice (PDF)</EmailLink> or see every
          payment in <EmailLink href={billingUrl}>Billing</EmailLink>.
        </EmailText>
      </EmailSection>
    </EmailLayout>
  )
}

Email3.PreviewProps = exampleProps

export default Email3
export {
  Email3,
  email3Subject,
  exampleProps as email3ExampleProps,
  type Email3Props,
  type ReceiptLine,
}
