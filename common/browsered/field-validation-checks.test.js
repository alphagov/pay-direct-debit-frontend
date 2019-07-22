'use strict'

// NPM dependencies
const { expect } = require('chai')

// Local dependencies
const { isSortCode, isAccountNumber, isChecked, isNotEmpty, isValidEmail } = require('./field-validation-checks')

describe('field validation checks', () => {
  describe('isSortCode', () => {
    it('should be valid for a valid sort code', () => {
      expect(isSortCode('12-34-56').valid).to.equal(true)
      expect(isSortCode('12 34 56').valid).to.equal(true)
      expect(isSortCode('123456').valid).to.equal(true)
      expect(isSortCode('01-23-45').valid).to.equal(true)
      expect(isSortCode('01 23 45').valid).to.equal(true)
      expect(isSortCode('----0-1-2-3-4-5----').valid).to.equal(true)
      expect(isSortCode('    0  1 2   3 4 5   ').valid).to.equal(true)
      expect(isSortCode('-123456-').valid).to.equal(true)
      expect(isSortCode(' 123456 ').valid).to.equal(true)
    })

    it('should not be valid for an invalid sort code', () => {
      expect(isSortCode('12345').valid).to.equal(false)
      expect(isSortCode('1234567').valid).to.equal(false)
      expect(isSortCode('0234567').valid).to.equal(false)
      expect(isSortCode('-12345').valid).to.equal(false)
      expect(isSortCode('12345-').valid).to.equal(false)
      expect(isSortCode('12-3-45').valid).to.equal(false)
      expect(isSortCode('12-34-567').valid).to.equal(false)
      expect(isSortCode('12-3a-56').valid).to.equal(false)
      expect(isSortCode(' 12345').valid).to.equal(false)
      expect(isSortCode('12345 ').valid).to.equal(false)
      expect(isSortCode('12 3 45').valid).to.equal(false)
      expect(isSortCode('12 34 567').valid).to.equal(false)
      expect(isSortCode('12 3a 56').valid).to.equal(false)
      expect(isSortCode('123$@456').valid).to.equal(false)
    })
    it('should display an error message for an invalid sort code', () => {
      expect(isSortCode('invalid').message).to.equal('Enter a real sort code with 6 digits')
    })
  })
  describe('isNotEmpty', () => {
    it('should be valid for a non empty string', () => {
      expect(isNotEmpty('some').valid).to.equal(true)
    })
    it('should not be valid for an empty string', () => {
      expect(isNotEmpty('').valid).to.equal(false)
    })
    it('should display an error message for an empty string', () => {
      expect(isNotEmpty('invalid').message).to.equal('This field cannot be blank')
    })
  })
  describe('isValidEmail', () => {
    it('should be valid for an email', () => {
      expect(isValidEmail('thisisan@email.test').valid).to.equal(true)
    })
    it('should not be valid for an invalid email', () => {
      expect(isValidEmail('thisisnot@email').valid).to.equal(false)
    })
    it('should display an error message for an invalid email', () => {
      expect(isValidEmail('invalid').message).to.equal('Please use a valid email address')
    })
  })
  describe('isAccountNumber', () => {
    it('should be true for a valid account number', () => {
      expect(isAccountNumber('1234 5678').valid).to.equal(true)
      expect(isAccountNumber(' 1 2 3 4 5 6 7 8').valid).to.equal(true)
      expect(isAccountNumber('12 34 56 78').valid).to.equal(true)
      expect(isAccountNumber('12345678').valid).to.equal(true)
      expect(isAccountNumber('01234567').valid).to.equal(true)
      expect(isAccountNumber(' 12345678 ').valid).to.equal(true)
      expect(isAccountNumber('123456789').valid).to.equal(true)
      expect(isAccountNumber('1234567890').valid).to.equal(true)
    })

    it('should be false for an invalid account number', () => {
      expect(isAccountNumber('123-456').valid).to.equal(false)
      expect(isAccountNumber('1-2-3-4-5-6').valid).to.equal(false)
      expect(isAccountNumber('12-34-56').valid).to.equal(false)
      expect(isAccountNumber('123456').valid).to.equal(false)
      expect(isAccountNumber('12345678910').valid).to.equal(false)
      expect(isAccountNumber('1234a56789').valid).to.equal(false)
    })
    it('should display an error message for an invalid account number', () => {
      expect(isAccountNumber('invalid').message).to.equal('Enter a real account number between 8 and 10 digits long')
    })
  })
  describe('isChecked', () => {
    it('should be valid if the field is checked', () => {
      expect(isChecked({ checked: true }).valid).to.equal(true)
    })

    it('should not be valid if the field is not checked', () => {
      expect(isChecked({ checked: false }).valid).to.equal(false)
    })
  })
})
