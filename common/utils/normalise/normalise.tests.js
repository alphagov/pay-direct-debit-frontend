'use strict'

// npm dependencies
const expect = require('chai').expect

// Local dependencies
const normalise = require('./index')

describe('normalise util', function () {
  it('should normalise sortCode with dashes', function () {
    const sortCode = normalise.sortCode('12-34-56')

    expect(sortCode).to.eql('123456')
  })

  it('should normalise sortCode with whitespace', function () {
    const sortCode = normalise.sortCode('12 34 56')

    expect(sortCode).to.eql('123456')
  })

  it('should normalise accountNumber with whitespace', function () {
    const accountNumber = normalise.accountNumber('12 34 56')

    expect(accountNumber).to.eql('123456')
  })

  it('should normalise false string to boolean', function () {
    const value = normalise.toBoolean('false')

    expect(value).to.eql(false)
  })

  it('should normalise true string to boolean', function () {
    const value = normalise.toBoolean('true')

    expect(value).to.eql(true)
  })

  it('should normalise empty string to boolean', function () {
    const value = normalise.toBoolean('')

    expect(value).to.eql(undefined)
  })

  it('should normalise whitespace string to boolean', function () {
    const value = normalise.toBoolean('  ')

    expect(value).to.eql(undefined)
  })

  it('should normalise numbers to boolean', function () {
    const value = normalise.toBoolean(0)

    expect(value).to.eql(undefined)
  })

  it('should normalise string to boolean', function () {
    const value = normalise.toBoolean('asd')

    expect(value).to.eql(undefined)
  })

  it('should normalise undefined to boolean', function () {
    const value = normalise.toBoolean(undefined)

    expect(value).to.eql(undefined)
  })

  it('should normalise null to boolean', function () {
    const value = normalise.toBoolean(null)

    expect(value).to.eql(undefined)
  })
})
