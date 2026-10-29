import { emailConfig, emailTheme } from '@/registry/lib/dashboardblocks/email-theme'
import type { ReactElement, ReactNode } from 'react'
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
  render,
} from 'react-email'

interface EmailBrand {
  name: string
  /** An absolute https URL to a square PNG or JPEG, at least 40px: mail apps don't show SVG. */
  logo?: string
}

function EmailLayout({
  brand,
  children,
  footer,
  preview,
}: {
  brand: EmailBrand
  children: ReactNode
  footer: ReactNode
  /** The line inbox lists show after the subject. */
  preview: string
}) {
  return (
    <Html lang='en' dir='ltr'>
      <Tailwind config={emailConfig} theme={emailTheme}>
        <Head>
          <meta name='color-scheme' content='light' />
          <meta name='supported-color-schemes' content='light' />
        </Head>
        <Body className='bg-background m-0 font-sans'>
          <Preview>{preview}</Preview>
          <Container className='max-w-[520px] px-6 pt-10 pb-12'>
            <Section>
              <Row>
                {brand.logo ? (
                  <Column className='w-5 align-middle'>
                    <Img src={brand.logo} width='20' height='20' alt='' />
                  </Column>
                ) : (
                  <Column className='bg-primary h-5 w-5 rounded' />
                )}
                <Column className='w-2' />
                <Column className='align-middle'>
                  <Text className='text-foreground m-0 text-base font-semibold tracking-tight'>
                    {brand.name}
                  </Text>
                </Column>
              </Row>
            </Section>
            {children}
            <Section className='mt-10'>{footer}</Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

function EmailTitle({
  children,
  description,
}: {
  children: ReactNode
  description: ReactNode
}) {
  return (
    <Section className='mt-9'>
      <Heading
        as='h1'
        className='text-foreground m-0 text-2xl font-semibold tracking-tight'
      >
        {children}
      </Heading>
      <Text className='text-muted-foreground m-0 mt-1 text-base'>{description}</Text>
    </Section>
  )
}

function EmailPanel({ children, label }: { children: ReactNode; label: string }) {
  return (
    <Section className='bg-panel mt-6 rounded-xl'>
      <Section className='px-6 pt-5 pb-6'>
        <Text className='text-panel-muted-foreground m-0 text-sm'>{label}</Text>
        {children}
      </Section>
    </Section>
  )
}

function EmailPanelValue({ children, unit }: { children: ReactNode; unit?: ReactNode }) {
  return (
    <Text
      dir='ltr'
      className='text-panel-foreground m-0 mt-2 text-5xl font-light tracking-tight tabular-nums'
    >
      {children}
      {unit ? <span className='text-panel-muted-foreground text-2xl'>{unit}</span> : null}
    </Text>
  )
}

/** A name on the panel, where the email is about a thing rather than a number: a workspace, a first step. */
function EmailPanelTitle({ children }: { children: ReactNode }) {
  return (
    <Text className='text-panel-foreground m-0 mt-2 text-2xl font-light tracking-tight'>
      {children}
    </Text>
  )
}

/** A money value from `formatCurrency`, with its cents smaller: `$588` then `.00`. */
function EmailPanelMoney({ children }: { children: string }) {
  const decimal = children.search(/\.\d+$/)
  if (decimal === -1) return <EmailPanelValue>{children}</EmailPanelValue>
  return (
    <EmailPanelValue unit={children.slice(decimal)}>
      {children.slice(0, decimal)}
    </EmailPanelValue>
  )
}

/** A bar of how much of a limit is used, drawn as table cells, which every mail app lays out. */
function EmailPanelMeter({
  label,
  value,
}: {
  /** What the bar shows, for screen readers: `85% of 10M events used`. */
  label: string
  /** The share used, from 0 to 1. */
  value: number
}) {
  const used = Math.round(Math.min(1, Math.max(0, value)) * 100)
  const cell = (width: number) => ({
    fontSize: '1px',
    lineHeight: '8px',
    width: `${width}%`,
  })
  return (
    <Section className='mt-4' aria-label={label} role='img' data-email-chart=''>
      <Row>
        {used > 0 ? (
          <Column
            className={`bg-chart-2 h-2 ${used < 100 ? 'rounded-l-sm' : 'rounded-sm'}`}
            style={cell(used)}
          >
            {'\u00a0'}
          </Column>
        ) : null}
        {used < 100 ? (
          <Column
            className={`bg-panel-muted h-2 ${used > 0 ? 'rounded-r-sm' : 'rounded-sm'}`}
            style={cell(100 - used)}
          >
            {'\u00a0'}
          </Column>
        ) : null}
      </Row>
    </Section>
  )
}

function EmailPanelNote({ children }: { children: ReactNode }) {
  return <Text className='text-panel-muted-foreground m-0 mt-2 text-sm'>{children}</Text>
}

function EmailPanelButton({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Button
      href={href}
      className='bg-panel-primary text-panel-primary-foreground border-panel-primary mt-5 box-border rounded-md border border-solid px-2.5 py-[9px] text-sm leading-5 font-medium'
    >
      <span className='leading-5'>{children}</span>
    </Button>
  )
}

function EmailSection({ children, title }: { children: ReactNode; title?: ReactNode }) {
  return (
    <Section className='border-border mt-8 border-0 border-t border-solid pt-5'>
      {title ? (
        <Heading as='h2' className='text-foreground m-0 mb-1 text-sm font-semibold'>
          {title}
        </Heading>
      ) : null}
      {children}
    </Section>
  )
}

function EmailText({ children }: { children: ReactNode }) {
  return <Text className='text-muted-foreground m-0 text-sm'>{children}</Text>
}

function EmailLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Link href={href} className='text-foreground underline'>
      {children}
    </Link>
  )
}

interface EmailRow {
  label: ReactNode
  detail?: ReactNode
  value: ReactNode
}

function EmailRows({
  rows,
  total,
}: {
  rows: EmailRow[]
  total?: Omit<EmailRow, 'detail'>
}) {
  return (
    <Section>
      {rows.map((row, index) => (
        <Row
          key={index}
          data-email-rows=''
          className={
            index === 0 ? undefined : 'border-border border-0 border-t border-solid'
          }
        >
          <Column className='py-2.5 align-top'>
            <Text className='text-foreground m-0 text-sm'>{row.label}</Text>
            {row.detail ? (
              <Text className='text-muted-foreground m-0 text-sm'>{row.detail}</Text>
            ) : null}
          </Column>
          <Column className='text-foreground py-2.5 pl-4 text-right align-top text-sm whitespace-nowrap tabular-nums'>
            {row.value}
          </Column>
        </Row>
      ))}
      {total ? (
        <Row
          data-email-rows=''
          className='border-foreground border-0 border-t border-solid'
        >
          <Column className='text-foreground py-2.5 text-sm font-semibold'>
            {total.label}
          </Column>
          <Column className='text-foreground py-2.5 pl-4 text-right text-sm font-semibold whitespace-nowrap tabular-nums'>
            {total.value}
          </Column>
        </Row>
      ) : null}
    </Section>
  )
}

function EmailFooter({ children }: { children: ReactNode }) {
  return <Text className='text-muted-foreground m-0 text-xs'>{children}</Text>
}

/** The HTML and the plain-text copy to send with it. A chart marked `data-email-chart` stays out of the plain text, which says its numbers in words. */
async function renderEmail(email: ReactElement) {
  const [html, text] = await Promise.all([
    render(email),
    render(email, {
      plainText: true,
      htmlToTextOptions: {
        selectors: [
          { selector: 'h1', options: { uppercase: false } },
          { selector: 'h2', options: { uppercase: false } },
          { selector: '[data-email-chart]', format: 'skip' },
          {
            selector: 'table[data-email-rows]',
            format: 'dataTable',
            options: { uppercaseHeaderCells: false },
          },
        ],
      },
    }),
  ])
  return { html, text }
}

export {
  EmailFooter,
  EmailLayout,
  EmailLink,
  EmailPanel,
  EmailPanelButton,
  EmailPanelMeter,
  EmailPanelMoney,
  EmailPanelNote,
  EmailPanelTitle,
  EmailPanelValue,
  EmailRows,
  EmailSection,
  EmailText,
  EmailTitle,
  renderEmail,
}
export type { EmailBrand, EmailRow }
