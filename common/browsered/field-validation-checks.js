'use strict'

// local dependencies
const emailValidator = require('../utils/email-validator')
// Constants
const NUMBERS_ONLY = new RegExp('^[0-9]+$')

// Exports
exports.isEmpty = value => value.trim() === ''

exports.isChecked = field => field && (field.checked === true)

exports.isValidEmail = value => emailValidator(value)

exports.isSortCode = value => /^[ -]*(?:[0-9][ -]*){6}$/.test(value)

exports.isAccountNumber = value => {
  const trimmedAccountNumber = value.replace(/\s/g, '')
  return NUMBERS_ONLY.test(trimmedAccountNumber) && (trimmedAccountNumber.length >= 6 && trimmedAccountNumber.length <= 8)
}
