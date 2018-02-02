'use strict'

// NPM dependencies
const {expect} = require('chai')

// Local dependencies
const {isSortCode, isAccountNumber, isChecked} = require('./field-validation-checks')

describe('field validation checks', () => {
  describe('isSortCode', () => {
    it('should return an error message if its a invalid sort code', () => {
      expect(isSortCode('12-3-45')).to.equal(false)
      expect(isSortCode('12-34-567')).to.equal(false)
      expect(isSortCode('12-3a-56')).to.equal(false)
    })

    it('should return true if it is a valid sort code', () => {
      expect(isSortCode('12-34-56')).to.equal(true)
      expect(isSortCode('12 34 56')).to.equal(true)
      expect(isSortCode('123456')).to.equal(true)
      expect(isSortCode('01-23-45')).to.equal(true)
      expect(isSortCode(' 123456 ')).to.equal(true)
    })
  })
})

describe('field validation checks', () => {
  describe('isAccountNumber', () => {
    it('should return an error message if its a invalid account number', () => {
      expect(isAccountNumber('123-456')).to.equal(false)
      expect(isAccountNumber('1-2-3-4-5-6')).to.equal(false)
      expect(isAccountNumber('12-34-56')).to.equal(false)
      expect(isAccountNumber('12345')).to.equal(false)
      expect(isAccountNumber('123456789')).to.equal(false)
      expect(isAccountNumber('1234a56789')).to.equal(false)
    })

    it('should return true if it is a valid account number', () => {
      expect(isAccountNumber('123 456')).to.equal(true)
      expect(isAccountNumber(' 1 2 3 4 5 6 ')).to.equal(true)
      expect(isAccountNumber('12 34 56 78')).to.equal(true)
      expect(isAccountNumber('12345678')).to.equal(true)
      expect(isAccountNumber('01234567')).to.equal(true)
      expect(isAccountNumber(' 12345678 ')).to.equal(true)
    })
  })
})

describe('field validation checks', () => {
  describe('isChecked', () => {
    it('should return an error message if the field is not checked', () => {
      expect(isChecked({checked: false})).to.equal(false)
    })

    it('should return true if the field is checked', () => {
      expect(isChecked({checked: true})).to.equal(true)
    })
  })
})
