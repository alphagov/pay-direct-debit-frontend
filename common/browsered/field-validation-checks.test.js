'use strict'

// NPM dependencies
const {expect} = require('chai')

// Local dependencies
const {isSortCode, isAccountNumber} = require('./field-validation-checks')

describe('field validation checks', () => {
  describe('isSortCode', () => {
    it('should return an error message if its a invalid sort code', () => {
      expect(isSortCode('12-3-45')).to.equal(`Sort codes must contain 6 digits`)
      expect(isSortCode('12-34-567')).to.equal(`Sort codes must contain 6 digits`)
      expect(isSortCode('12-3a-56')).to.equal(`Sort codes must contain 6 digits`)
    })

    it('should return false if it is a valid sort code', () => {
      expect(isSortCode('12-34-56')).to.equal(false)
      expect(isSortCode('12 34 56')).to.equal(false)
      expect(isSortCode('123456')).to.equal(false)
      expect(isSortCode('01-23-45')).to.equal(false)
      expect(isSortCode(' 123456 ')).to.equal(false)
    })
  })
})

describe('field validation checks', () => {
  describe('isAccountNumber', () => {
    it('should return an error message if its a invalid account number', () => {
      expect(isAccountNumber('12345')).to.equal(`Account numbers must contain 6-8 digits`)
      expect(isAccountNumber('123456789')).to.equal(`Account numbers must contain 6-8 digits`)
      expect(isAccountNumber('1234a56789')).to.equal(`Account numbers must contain 6-8 digits`)
    })

    it('should return false if it is a valid account number', () => {
      expect(isAccountNumber('12-34-56-78')).to.equal(false)
      expect(isAccountNumber('12 34 56 78')).to.equal(false)
      expect(isAccountNumber('12345678')).to.equal(false)
      expect(isAccountNumber('01234567')).to.equal(false)
      expect(isAccountNumber(' 12345678 ')).to.equal(false)
    })
  })
})
