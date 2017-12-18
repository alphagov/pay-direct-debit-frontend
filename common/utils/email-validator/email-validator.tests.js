'use strict'

// npm dependencies
const expect = require('chai').expect

// Local dependencies
const emailValidator = require('./index')

describe('emailValidator util', function () {
  it('should succeed on valid user@example.com email', function () {
    const emailToValidate = 'user@example.com'
    expect(emailValidator(emailToValidate)).to.equal(true)
  })

  it('should fail when the email is blank', function () {
    const emailToValidate = ''
    expect(emailValidator(emailToValidate)).to.equal(false)
  })

  it('should fail when the email is "@"', function () {
    const emailToValidate = '@'
    expect(emailValidator(emailToValidate)).to.equal(false)
  })

  it('should fail when the email is ".com"', function () {
    const emailToValidate = '.com'
    expect(emailValidator(emailToValidate)).to.equal(false)
  })

  it('should fail when the email is "example.com"', function () {
    const emailToValidate = 'example.com'
    expect(emailValidator(emailToValidate)).to.equal(false)
  })

  it('should fail when the email is "sub-domain.example.com"', function () {
    const emailToValidate = 'sub-domain.example.com'
    expect(emailValidator(emailToValidate)).to.equal(false)
  })

  it('should fail when the email is "@com"', function () {
    const emailToValidate = '@com'
    expect(emailValidator(emailToValidate)).to.equal(false)
  })

  it('should fail when the email is "@example.com"', function () {
    const emailToValidate = '@example.com'
    expect(emailValidator(emailToValidate)).to.equal(false)
  })

  it('should fail when the email is "@sub-domain.example.com"', function () {
    const emailToValidate = '@sub-domain.example.com'
    expect(emailValidator(emailToValidate)).to.equal(false)
  })

  it('should fail when the email is "user@example"', function () {
    const emailToValidate = 'user@example'
    expect(emailValidator(emailToValidate)).to.equal(false)
  })

  it('should fail when the email is "user@@example.com"', function () {
    const emailToValidate = 'user@@example.com'
    expect(emailValidator(emailToValidate)).to.equal(false)
  })
})
