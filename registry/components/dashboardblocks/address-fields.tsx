'use client'

import { CountryFlag } from '@/registry/components/dashboardblocks/country-flag'
import {
  OptionSelect,
  type SelectOption,
} from '@/registry/components/dashboardblocks/option-select'
import {
  countries as allCountries,
  getCountryName,
} from '@/registry/lib/dashboardblocks/countries'
import { useId } from 'react'

import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

/** The same shape as Stripe's `address`, with `postalCode` for `postal_code`. */
type Address = {
  city: string
  /** The ISO 3166-1 two-letter code, such as `GB`. */
  country: string
  line1: string
  line2: string
  postalCode: string
  /** A state, province or county: the code from the list where the country has one (`CA`, `NSW`), otherwise as typed. */
  state: string
}

type AddressField = keyof Address

interface AddressFormat {
  /** Postal code, prefecture and city before the street, as in Japan. */
  bigFirst?: boolean
  cityLabel: string
  /** Left out where the country has no postal codes. */
  postalCode?: {
    example?: string
    label: string
    pattern?: RegExp
    required: boolean
  }
  /** The postal code before the city on one line, as in most of Europe. */
  postalFirst?: boolean
  state?: {
    label: string
    options?: readonly SelectOption[]
    required: boolean
  }
}

const US_STATES: readonly SelectOption[] = [
  ['AL', 'Alabama'],
  ['AK', 'Alaska'],
  ['AS', 'American Samoa'],
  ['AZ', 'Arizona'],
  ['AR', 'Arkansas'],
  ['CA', 'California'],
  ['CO', 'Colorado'],
  ['CT', 'Connecticut'],
  ['DE', 'Delaware'],
  ['DC', 'District of Columbia'],
  ['FL', 'Florida'],
  ['GA', 'Georgia'],
  ['GU', 'Guam'],
  ['HI', 'Hawaii'],
  ['ID', 'Idaho'],
  ['IL', 'Illinois'],
  ['IN', 'Indiana'],
  ['IA', 'Iowa'],
  ['KS', 'Kansas'],
  ['KY', 'Kentucky'],
  ['LA', 'Louisiana'],
  ['ME', 'Maine'],
  ['MD', 'Maryland'],
  ['MA', 'Massachusetts'],
  ['MI', 'Michigan'],
  ['MN', 'Minnesota'],
  ['MS', 'Mississippi'],
  ['MO', 'Missouri'],
  ['MT', 'Montana'],
  ['NE', 'Nebraska'],
  ['NV', 'Nevada'],
  ['NH', 'New Hampshire'],
  ['NJ', 'New Jersey'],
  ['NM', 'New Mexico'],
  ['NY', 'New York'],
  ['NC', 'North Carolina'],
  ['ND', 'North Dakota'],
  ['MP', 'Northern Mariana Islands'],
  ['OH', 'Ohio'],
  ['OK', 'Oklahoma'],
  ['OR', 'Oregon'],
  ['PA', 'Pennsylvania'],
  ['PR', 'Puerto Rico'],
  ['RI', 'Rhode Island'],
  ['SC', 'South Carolina'],
  ['SD', 'South Dakota'],
  ['TN', 'Tennessee'],
  ['TX', 'Texas'],
  ['VI', 'U.S. Virgin Islands'],
  ['UT', 'Utah'],
  ['VT', 'Vermont'],
  ['VA', 'Virginia'],
  ['WA', 'Washington'],
  ['WV', 'West Virginia'],
  ['WI', 'Wisconsin'],
  ['WY', 'Wyoming'],
].map(([value, label]) => ({ label, value }))

const CA_PROVINCES: readonly SelectOption[] = [
  ['AB', 'Alberta'],
  ['BC', 'British Columbia'],
  ['MB', 'Manitoba'],
  ['NB', 'New Brunswick'],
  ['NL', 'Newfoundland and Labrador'],
  ['NT', 'Northwest Territories'],
  ['NS', 'Nova Scotia'],
  ['NU', 'Nunavut'],
  ['ON', 'Ontario'],
  ['PE', 'Prince Edward Island'],
  ['QC', 'Quebec'],
  ['SK', 'Saskatchewan'],
  ['YT', 'Yukon'],
].map(([value, label]) => ({ label, value }))

const AU_STATES: readonly SelectOption[] = [
  ['ACT', 'Australian Capital Territory'],
  ['NSW', 'New South Wales'],
  ['NT', 'Northern Territory'],
  ['QLD', 'Queensland'],
  ['SA', 'South Australia'],
  ['TAS', 'Tasmania'],
  ['VIC', 'Victoria'],
  ['WA', 'Western Australia'],
].map(([value, label]) => ({ label, value }))

const NO_POSTAL_CODES = new Set(
  'AE AG AO AW BF BI BJ BO BS BW BZ CD CF CG CI CK CM DJ DM ER FJ GA GD GH GM GQ GY HK KI KM KN KP LY ML MO MR MW NR NU QA RW SB SC SL SR SS ST SY TD TG TK TL TO TT TV UG VU YE ZW'.split(
    ' ',
  ),
)

const POSTAL_FIRST = new Set(
  'AT BE BG CH CZ DE DK EE ES FI FR GR HR HU IS IT LI LT LU LV MC NL NO PL PT RO SE SI SK'.split(
    ' ',
  ),
)

const postalCodeFormat = (pattern?: RegExp, example?: string) => ({
  example,
  label: 'Postal code',
  pattern,
  required: true,
})

const FORMATS: Partial<Record<string, AddressFormat>> = {
  AU: {
    cityLabel: 'Suburb',
    postalCode: {
      example: '2000',
      label: 'Postcode',
      pattern: /^\d{4}$/,
      required: true,
    },
    state: { label: 'State', options: AU_STATES, required: true },
  },
  BR: {
    cityLabel: 'City',
    postalCode: {
      example: '01310-100',
      label: 'CEP',
      pattern: /^\d{5}-?\d{3}$/,
      required: true,
    },
    state: { label: 'State', required: true },
  },
  CA: {
    cityLabel: 'City',
    postalCode: postalCodeFormat(/^[A-Z]\d[A-Z] ?\d[A-Z]\d$/i, 'M5V 2T6'),
    state: { label: 'Province', options: CA_PROVINCES, required: true },
  },
  CN: {
    cityLabel: 'City',
    postalCode: postalCodeFormat(/^\d{6}$/, '100000'),
    state: { label: 'Province', required: true },
  },
  DE: {
    cityLabel: 'City',
    postalCode: postalCodeFormat(/^\d{5}$/, '10115'),
    postalFirst: true,
  },
  ES: {
    cityLabel: 'City',
    postalCode: postalCodeFormat(/^\d{5}$/, '28001'),
    postalFirst: true,
    state: { label: 'Province', required: false },
  },
  FR: {
    cityLabel: 'City',
    postalCode: postalCodeFormat(/^\d{5}$/, '75001'),
    postalFirst: true,
  },
  GB: {
    cityLabel: 'Town or city',
    postalCode: {
      example: 'SW1A 1AA',
      label: 'Postcode',
      pattern: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
      required: true,
    },
  },
  IE: {
    cityLabel: 'Town or city',
    postalCode: { label: 'Eircode', required: false },
    state: { label: 'County', required: false },
  },
  IN: {
    cityLabel: 'City',
    postalCode: {
      example: '560001',
      label: 'PIN code',
      pattern: /^\d{6}$/,
      required: true,
    },
    state: { label: 'State', required: true },
  },
  IT: {
    cityLabel: 'City',
    postalCode: postalCodeFormat(/^\d{5}$/, '00184'),
    postalFirst: true,
    state: { label: 'Province', required: false },
  },
  JP: {
    bigFirst: true,
    cityLabel: 'City',
    postalCode: postalCodeFormat(/^\d{3}-?\d{4}$/, '100-0001'),
    state: { label: 'Prefecture', required: true },
  },
  MX: {
    cityLabel: 'City',
    postalCode: postalCodeFormat(/^\d{5}$/, '06600'),
    state: { label: 'State', required: true },
  },
  NL: {
    cityLabel: 'City',
    postalCode: postalCodeFormat(/^\d{4} ?[A-Z]{2}$/i, '1012 JS'),
    postalFirst: true,
  },
  US: {
    cityLabel: 'City',
    postalCode: {
      example: '94107',
      label: 'ZIP code',
      pattern: /^\d{5}(-\d{4})?$/,
      required: true,
    },
    state: { label: 'State', options: US_STATES, required: true },
  },
}

/** Which fields the country's addresses have, what each is called, and which must be filled in. */
function getAddressFormat(country: string): AddressFormat {
  const code = country.toUpperCase()
  const known = FORMATS[code]
  if (known) return known
  if (NO_POSTAL_CODES.has(code)) return { cityLabel: 'City' }
  return {
    cityLabel: 'City',
    postalCode: { label: 'Postal code', required: false },
    postalFirst: POSTAL_FIRST.has(code),
  }
}

function getAddressRows(format: AddressFormat): AddressField[][] {
  const postal: AddressField[] = format.postalCode ? ['postalCode'] : []
  const state: AddressField[] = format.state ? ['state'] : []
  if (format.bigFirst) return [[...postal, ...state], ['city'], ['line1'], ['line2']]
  if (format.postalFirst) return [['line1'], ['line2'], [...postal, 'city', ...state]]
  return [['line1'], ['line2'], ['city', ...state, ...postal]]
}

function inSentence(label: string) {
  return /^[A-Z]{2}/.test(label) ? label : label.charAt(0).toLowerCase() + label.slice(1)
}

/** One sentence per field that's missing or doesn't look right for the country, as `useSimpleForm`'s `validate` returns. */
function validateAddress(address: Address): Partial<Record<AddressField, string>> {
  if (!address.country) return { country: 'Choose a country.' }
  const format = getAddressFormat(address.country)
  const errors: Partial<Record<AddressField, string>> = {}
  if (!address.line1.trim()) errors.line1 = 'Enter the street address.'
  if (!address.city.trim()) errors.city = `Enter the ${inSentence(format.cityLabel)}.`
  if (format.state?.required && !address.state.trim()) {
    errors.state = `${format.state.options ? 'Choose' : 'Enter'} the ${inSentence(format.state.label)}.`
  }
  const postal = format.postalCode
  const code = address.postalCode.trim()
  if (postal?.required && !code)
    errors.postalCode = `Enter the ${inSentence(postal.label)}.`
  else if (postal?.pattern && code && !postal.pattern.test(code)) {
    errors.postalCode = `Enter a ${inSentence(postal.label)} like ${postal.example}.`
  }
  return errors
}

const AUTOCOMPLETE: Record<AddressField, string> = {
  city: 'address-level2',
  country: 'country',
  line1: 'address-line1',
  line2: 'address-line2',
  postalCode: 'postal-code',
  state: 'address-level1',
}

/** The countries given, or every country, as `OptionSelect` options with their flags. */
function getCountryOptions(
  countries: readonly string[] = allCountries.map((country) => country.code),
): SelectOption[] {
  return countries.map((code) => ({
    icon: <CountryFlag code={code} />,
    label: getCountryName(code),
    value: code,
  }))
}

interface AddressFieldsProps {
  /** Two-letter codes of the countries to offer, in the order to list them. @default every country */
  countries?: readonly string[]
  disabled?: boolean
  errors?: Partial<Record<AddressField, string | undefined>>
  /** Each field's input id, such as `useSimpleForm`'s `getId`, so a refused submit can focus the field. */
  getId?: (field: AddressField) => string
  /** Called once per field that changes. A new country also clears a state or postal code it doesn't use. */
  onFieldChange: (field: AddressField, value: string) => void
  value: Address
}

function AddressFields({
  countries,
  disabled,
  errors = {},
  getId,
  onFieldChange,
  value,
}: AddressFieldsProps) {
  const fallbackId = useId()
  const wide = '@md/field-group:col-span-2'
  const idOf = (field: AddressField) => getId?.(field) ?? `${fallbackId}-${field}`
  const format = getAddressFormat(value.country)
  const countryOptions = getCountryOptions(countries)

  function changeCountry(country: string) {
    const next = getAddressFormat(country)
    onFieldChange('country', country)
    const keepsState =
      next.state &&
      (next.state.options
        ? next.state.options.some((option) => option.value === value.state)
        : !format.state?.options)
    if (value.state && !keepsState) onFieldChange('state', '')
    if (value.postalCode && !next.postalCode) onFieldChange('postalCode', '')
  }

  function describe(field: AddressField) {
    return {
      'aria-describedby': errors[field] ? `${idOf(field)}-error` : undefined,
      'aria-invalid': errors[field] ? true : undefined,
      id: idOf(field),
      name: field,
    }
  }

  function input(field: AddressField, label: string, className?: string) {
    return (
      <Field
        key={field}
        data-invalid={errors[field] ? true : undefined}
        className={className}
      >
        <FieldLabel htmlFor={idOf(field)}>{label}</FieldLabel>
        <Input
          {...describe(field)}
          autoComplete={AUTOCOMPLETE[field]}
          disabled={disabled}
          value={value[field]}
          onChange={(event) => onFieldChange(field, event.target.value)}
        />
        <FieldError id={`${idOf(field)}-error`}>{errors[field]}</FieldError>
      </Field>
    )
  }

  function render(field: AddressField, row: AddressField[]) {
    if (field === 'line1') return input(field, 'Address')
    if (field === 'line2') return input(field, 'Apartment, suite or floor (optional)')
    if (field === 'city') {
      return input(field, format.cityLabel, row.length === 2 ? wide : undefined)
    }
    if (field === 'postalCode' && format.postalCode) {
      return input(
        field,
        format.postalCode.required
          ? format.postalCode.label
          : `${format.postalCode.label} (optional)`,
        row.length === 2 && !row.includes('city') && row.at(-1) === field
          ? wide
          : undefined,
      )
    }
    const state = format.state
    if (field !== 'state' || !state) return null
    const stateClass =
      row.length === 2 && !row.includes('city') && row.at(-1) === field ? wide : undefined
    if (!state.options) {
      return input(
        field,
        state.required ? state.label : `${state.label} (optional)`,
        stateClass,
      )
    }
    return (
      <Field
        key={field}
        data-invalid={errors[field] ? true : undefined}
        className={stateClass}
      >
        <FieldLabel htmlFor={idOf(field)}>{state.label}</FieldLabel>
        <OptionSelect
          {...describe(field)}
          disabled={disabled}
          options={state.options}
          placeholder={`Choose a ${inSentence(state.label)}`}
          value={value.state || null}
          onValueChange={(next) => onFieldChange('state', next)}
        />
        <FieldError id={`${idOf(field)}-error`}>{errors[field]}</FieldError>
      </Field>
    )
  }

  return (
    <FieldGroup data-slot='address-fields'>
      <Field data-invalid={errors.country ? true : undefined}>
        <FieldLabel htmlFor={idOf('country')}>Country</FieldLabel>
        <OptionSelect
          {...describe('country')}
          disabled={disabled}
          options={countryOptions}
          placeholder='Choose a country'
          value={value.country || null}
          onValueChange={changeCountry}
        />
        <FieldError id={`${idOf('country')}-error`}>{errors.country}</FieldError>
      </Field>
      {getAddressRows(format).map((row) =>
        row.length > 1 ? (
          <div key={row.join('-')} className='grid gap-4 @md/field-group:grid-cols-3'>
            {row.map((field) => render(field, row))}
          </div>
        ) : (
          render(row[0], row)
        ),
      )}
    </FieldGroup>
  )
}

export { AddressFields, getAddressFormat, getCountryOptions, validateAddress }
export type { Address, AddressField, AddressFieldsProps, AddressFormat }
