'use strict'

// local dependencies
const emailValidator = require('../utils/email-validator')
// Constants
const NUMBERS_ONLY = new RegExp('^[0-9]+$')

const errorMessages = {
  required: 'This field cannot be blank',
  validEmail: 'Please use a valid email address',
  checked: 'Please choose an option',
  sortCode: 'Sort code must contain 6 digits',
  accountNumber: 'Account number must contain 6-8 digits'
}

// Exports
exports.isNotEmpty = value => {
  return {
    valid: value.trim() !== '',
    message: errorMessages.required
  }
}

exports.isChecked = field => {
  return {
    valid: field && (field.checked === true)
  }
}

exports.isValidEmail = value => {
  return {
    valid: emailValidator(value),
    message: errorMessages.validEmail
  }
}

exports.isSortCode = value => {
  return {
    valid: /^[ -]*(?:[0-9][ -]*){6}$/.test(value),
    message: errorMessages.sortCode
  }
}

exports.isAccountNumber = value => {
  const trimmedAccountNumber = value.replace(/\s/g, '')
  return {
    valid: NUMBERS_ONLY.test(trimmedAccountNumber) && (trimmedAccountNumber.length >= 6 && trimmedAccountNumber.length <= 8),
    message: errorMessages.accountNumber
  }
}
