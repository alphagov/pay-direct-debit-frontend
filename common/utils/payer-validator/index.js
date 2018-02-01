'use strict'

// local dependencies
const fieldValidationChecks = require('../../browsered/field-validation-checks')

module.exports = (payer) => {
  const errors = []

  if (fieldValidationChecks.isEmpty(payer.accountHolderName) === true) {
    errors.push({
      id: 'account-holder-name',
      label: 'Name on the account'
    })
  }

  if (fieldValidationChecks.isSortCode(payer.sortCode) === false) {
    errors.push({
      id: 'sort-code',
      label: 'Sort code'
    })
  }

  if (fieldValidationChecks.isAccountNumber(payer.accountNumber) === false) {
    errors.push({
      id: 'account-number',
      label: 'Account number'
    })
  }

  if (payer.requiresAuthorisation === true) {
    errors.push({
      id: 'requires-authorisation',
      label: 'Are you allowed to authorise Direct Debits on this account?'
    })
  }

  if (fieldValidationChecks.isEmpty(payer.country) === true) {
    errors.push({
      id: 'country-code',
      label: 'Country'
    })
  }

  if (fieldValidationChecks.isEmpty(payer.addressLine1) === true) {
    errors.push({
      id: 'address-line1',
      label: 'Building and street'
    })
  }

  if (fieldValidationChecks.isEmpty(payer.city) === true) {
    errors.push({
      id: 'city',
      label: 'Town or city'
    })
  }

  if (fieldValidationChecks.isEmpty(payer.postcode) === true) {
    errors.push({
      id: 'postcode',
      label: 'Postcode'
    })
  }

  if (fieldValidationChecks.isValidEmail(payer.email) === false) {
    errors.push({
      id: 'email',
      label: 'Email address'
    })
  }

  return errors
}
