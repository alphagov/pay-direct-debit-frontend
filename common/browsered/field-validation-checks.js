'use strict'

// local dependencies
const emailValidator = require('../utils/email-validator')

// Constants
const NUMBERS_ONLY = new RegExp('^[0-9]+$')
const MAX_AMOUNT = 10000000

const validationErrors = {
  required: 'This is field cannot be blank',
  currency: 'Choose an amount in pounds and pence using digits and a decimal point. For example “10.50”',
  phoneNumber: 'Must be a 11 digit phone number',
  validEmail: 'Please use a valid email address',
  https: 'URL must begin with https://',
  belowMaxAmount: `Choose an amount under £${MAX_AMOUNT.toLocaleString()}`,
  sortCode: `Sort codes must contain 6 digits`,
  accountNumber: `Account numbers must contain 8-10 digits`
}

module.exports.isEmpty = function (value) {
  if (value === '') {
    return validationErrors.required
  } else {
    return false
  }
}

module.exports.isCurrency = function (value) {
  if (!/^([0-9]+)(?:\.([0-9]{2}))?$/.test(value)) {
    return validationErrors.currency
  } else {
    return false
  }
}

module.exports.isValidEmail = function (value) {
  if (!emailValidator(value)) {
    return validationErrors.validEmail
  } else {
    return false
  }
}

module.exports.isPhoneNumber = function (value) {
  const trimmedTelephoneNumber = value.replace(/\s/g, '')
  if (trimmedTelephoneNumber.length < 11 || !NUMBERS_ONLY.test(trimmedTelephoneNumber)) {
    return validationErrors.phoneNumber
  } else {
    return false
  }
}

module.exports.isHttps = function (value) {
  if (value.substr(0, 8) !== 'https://') {
    return validationErrors.https
  } else {
    return false
  }
}

module.exports.isBelowMaxAmount = value => {
  if (!module.exports.isCurrency(value) && parseFloat(value) >= MAX_AMOUNT) {
    return validationErrors.belowMaxAmount
  }
  return false
}

module.exports.isSortCode = value => {
  if (!/^\s?(\d{2}\s?-?){2}\d{2}\s?$/.test(value)) {
    return validationErrors.sortCode
  } else {
    return false
  }
}

module.exports.isAccountNumber = value => {
  if (!/^\s?(\d{2}\s?-?){3,4}\d{2}\s?$/.test(value)) {
    return validationErrors.accountNumber
  } else {
    return false
  }
}
