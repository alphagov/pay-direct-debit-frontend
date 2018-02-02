'use strict'

// local dependencies
const emailValidator = require('../utils/email-validator')
// Constants
const NUMBERS_ONLY = new RegExp('^[0-9]+$')

const isEmpty = value => {
  return value.trim() === ''
}

const isChecked = field => {
  return field && (field.checked === true)
}

const isValidEmail = function (value) {
  return emailValidator(value)
}

const isSortCode = value => {
  return /^\s?(\d{2}\s?-?\s?){2}\d{2}\s?$/.test(value)
}

const isAccountNumber = value => {
  const trimmedAccountNumber = value.replace(/\s/g, '')
  return NUMBERS_ONLY.test(trimmedAccountNumber) && (trimmedAccountNumber.length >= 6 && trimmedAccountNumber.length <= 8)
}

module.exports = {
  isEmpty,
  isChecked,
  isSortCode,
  isAccountNumber,
  isValidEmail
}
