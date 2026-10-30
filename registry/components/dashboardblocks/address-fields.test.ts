import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { type Address, getAddressFormat, validateAddress } from './address-fields'

const address = (fields: Partial<Address>): Address => ({
  city: 'Springfield',
  country: 'US',
  line1: '1 Main Street',
  line2: '',
  postalCode: '12345',
  state: 'IL',
  ...fields,
})

describe('validateAddress', () => {
  it('accepts a whole US address, with or without ZIP+4', () => {
    assert.deepEqual(validateAddress(address({})), {})
    assert.deepEqual(validateAddress(address({ postalCode: '12345-6789' })), {})
  })

  it('names each missing field the way the country does', () => {
    assert.deepEqual(
      validateAddress(address({ city: ' ', line1: '', postalCode: '', state: '' })),
      {
        city: 'Enter the city.',
        line1: 'Enter the street address.',
        postalCode: 'Enter the ZIP code.',
        state: 'Choose the state.',
      },
    )
    assert.deepEqual(
      validateAddress(address({ city: '', country: 'GB', postalCode: '', state: '' })),
      { city: 'Enter the town or city.', postalCode: 'Enter the postcode.' },
    )
    assert.deepEqual(
      validateAddress(address({ city: '', country: 'AU', postalCode: '', state: '' })),
      {
        city: 'Enter the suburb.',
        postalCode: 'Enter the postcode.',
        state: 'Choose the state.',
      },
    )
    assert.deepEqual(
      validateAddress(address({ country: 'JP', postalCode: '', state: '' })),
      {
        postalCode: 'Enter the postal code.',
        state: 'Enter the prefecture.',
      },
    )
  })

  it('refuses a postal code that doesn’t look like the country’s, with an example', () => {
    assert.deepEqual(validateAddress(address({ postalCode: '1234' })), {
      postalCode: 'Enter a ZIP code like 94107.',
    })
    assert.deepEqual(
      validateAddress(address({ country: 'GB', postalCode: '12345', state: '' })),
      {
        postalCode: 'Enter a postcode like SW1A 1AA.',
      },
    )
    assert.deepEqual(
      validateAddress(address({ country: 'CA', postalCode: 'm5v2t6', state: 'ON' })),
      {},
    )
    assert.deepEqual(
      validateAddress(address({ country: 'GB', postalCode: 'sw1a 1aa', state: '' })),
      {},
    )
  })

  it('asks nothing a country’s addresses don’t have', () => {
    assert.deepEqual(
      validateAddress(address({ country: 'AE', postalCode: '', state: '' })),
      {},
    )
    assert.deepEqual(
      validateAddress(address({ country: 'IE', postalCode: '', state: '' })),
      {},
    )
    assert.deepEqual(
      validateAddress(address({ country: 'BE', postalCode: '', state: '' })),
      {},
    )
  })

  it('asks for the country first', () => {
    assert.deepEqual(validateAddress(address({ country: '' })), {
      country: 'Choose a country.',
    })
  })
})

describe('getAddressFormat', () => {
  it('puts the postal code before the city in most of Europe, and after it elsewhere', () => {
    assert.equal(getAddressFormat('DE').postalFirst, true)
    assert.equal(getAddressFormat('se').postalFirst, true)
    assert.equal(getAddressFormat('US').postalFirst, undefined)
    assert.equal(getAddressFormat('BR').postalFirst, undefined)
  })

  it('has no postal code where the country has none', () => {
    assert.equal(getAddressFormat('HK').postalCode, undefined)
    assert.equal(getAddressFormat('AE').postalCode, undefined)
    assert.equal(getAddressFormat('FR').postalCode?.required, true)
  })
})
